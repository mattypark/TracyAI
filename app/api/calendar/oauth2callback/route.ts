import { NextRequest, NextResponse } from 'next/server'
import { getTokens } from '@/lib/googleCalendar'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const state = searchParams.get('state')
    
    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/profile?error=calendar_auth_failed', request.url))
    }
    
    if (!code) {
      return NextResponse.redirect(new URL('/profile?error=calendar_auth_failed', request.url))
    }

    // Create Supabase client with service role for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('OAuth callback received code:', code.substring(0, 20) + '...')
    console.log('State parameter:', state)

    // If we have a state parameter, it should contain the user ID
    let userId = null
    if (state) {
      try {
        // Decode the state parameter which should contain user info
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        userId = stateData.userId
        console.log('Extracted user ID from state:', userId)
      } catch (stateError) {
        console.error('Error parsing state parameter:', stateError)
      }
    }

    // If no user ID from state, try to find the most recent user
    if (!userId) {
      console.log('No user ID from state, attempting to find authenticated user...')
      
      // Get the most recently active user (this is a fallback)
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .order('updated_at', { ascending: false })
        .limit(1)
      
      if (usersError || !users || users.length === 0) {
        console.error('No users found or error:', usersError)
        return NextResponse.redirect(new URL('/profile?error=no_user_found&info=please_login_and_try_again', request.url))
      }
      
      userId = users[0].id
      console.log('Using most recent user ID:', userId)
    }

    if (!userId) {
      console.error('No user ID available')
      return NextResponse.redirect(new URL('/profile?error=no_user_found&info=please_login_and_try_again', request.url))
    }

    console.log('Processing OAuth for user:', userId)

    // Exchange code for tokens
    console.log('Exchanging code for tokens...')
    const tokens = await getTokens(code)
    console.log('Got tokens:', { 
      hasAccessToken: !!tokens.access_token, 
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: (tokens as any).expires_in
    })

    // Ensure google_tokens table exists
    console.log('Ensuring google_tokens table exists...')
    try {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS google_tokens (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          service TEXT NOT NULL,
          tokens JSONB NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, service)
        );
        
        ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can manage their own tokens" ON google_tokens;
        CREATE POLICY "Users can manage their own tokens" ON google_tokens
        FOR ALL USING (auth.uid() = user_id);
      `
      
      await supabase.rpc('exec', { sql: createTableQuery })
      console.log('Table creation/update completed')
    } catch (tableError) {
      console.error('Error ensuring table exists:', tableError)
      // Continue anyway - table might already exist
    }

    // Store tokens in database using service role
    console.log('Storing tokens in database...')
    const { error: dbError } = await supabase
      .from('google_tokens')
      .upsert({
        user_id: userId,
        service: 'calendar',
        tokens: tokens,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Error storing tokens:', dbError)
      return NextResponse.redirect(new URL('/profile?error=token_storage_failed&success=calendar_connected', request.url))
    }

    console.log('Tokens stored successfully!')

    // Trigger initial sync
    console.log('Triggering initial calendar sync...')
    try {
      // Determine the correct app URL based on the request
      const protocol = request.headers.get('x-forwarded-proto') || 'http'
      const host = request.headers.get('host') || 'localhost:3000'
      const appUrl = `${protocol}://${host}`
      
      console.log('Using app URL for sync:', appUrl)
      
      const syncResponse = await fetch(`${appUrl}/api/calendar/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId // Pass user ID in header for sync
        }
      })
      
      if (syncResponse.ok) {
        const syncResult = await syncResponse.json()
        console.log('Initial sync completed:', syncResult)
        return NextResponse.redirect(new URL(`/calendar?success=calendar_connected&synced=${syncResult.totalEvents}&calendars=${syncResult.calendarsCount}`, request.url))
      } else {
        console.error('Initial sync failed:', await syncResponse.text())
        return NextResponse.redirect(new URL('/profile?success=calendar_connected&sync=failed', request.url))
      }
    } catch (syncError) {
      console.error('Error during initial sync:', syncError)
      // Even if sync fails, the connection was successful
      return NextResponse.redirect(new URL('/profile?success=calendar_connected&sync=failed&message=Connection successful but sync failed', request.url))
    }

  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/profile?error=calendar_auth_failed&details=' + encodeURIComponent(error instanceof Error ? error.message : String(error)), request.url))
  }
} 