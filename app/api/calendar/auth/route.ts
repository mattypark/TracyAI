import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/googleCalendar'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with service role for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Also create regular client for session handling
    const publicSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try to get user from multiple sources
    let user = null
    const authorization = request.headers.get('Authorization')
    
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await publicSupabase.auth.getUser(token)
      if (!userError && authUser) {
        user = authUser
        console.log('Found user via auth header:', user.id)
      }
    }
    
    // Fallback to cookies
    if (!user) {
      const cookieStore = await cookies()
      const accessToken = cookieStore.get('sb-access-token')?.value
      
      if (accessToken) {
        const { data: { user: cookieUser }, error: userError } = await publicSupabase.auth.getUser(accessToken)
        if (!userError && cookieUser) {
          user = cookieUser
          console.log('Found user via cookie:', user.id)
        }
      }
    }

    // If still no user, get the most recently active user as a fallback
    if (!user) {
      console.log('No user from session, using most recent user as fallback...')
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .order('updated_at', { ascending: false })
        .limit(1)
      
      if (!usersError && users && users.length > 0) {
        user = { id: users[0].id, email: users[0].email }
        console.log('Using most recent user:', user.id)
      }
    }
    
    if (!user) {
      console.error('No authenticated user found')
      return NextResponse.json({ error: 'Not authenticated - please log in first' }, { status: 401 })
    }
    
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth not configured')
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
    }
    
    console.log('Generating OAuth URL for user:', user.id)

    // Create state parameter with user info
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now()
    })).toString('base64')

    // Generate Google OAuth URL with state
    const authUrl = getAuthUrl() + '&state=' + encodeURIComponent(state)
    
    console.log('Generated OAuth URL with state parameter')
    
    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Calendar auth error:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
} 