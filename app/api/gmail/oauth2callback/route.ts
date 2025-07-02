import { NextRequest, NextResponse } from 'next/server'
import { getGmailOAuthClient } from '@/lib/gmail'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=no_code`)
    }
    
    // Exchange code for tokens
    const oauth2Client = getGmailOAuthClient()
    const { tokens } = await oauth2Client.getToken(code)
    
    // Get user from cookies - try different cookie names
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value || 
                       cookieStore.get('supabase-auth-token')?.value ||
                       cookieStore.get('sb:token')?.value
    
    if (!accessToken) {
      console.error('No access token found in cookies')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth?error=not_authenticated`)
    }
    
    // Create Supabase client and get user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)
    
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth?error=user_not_found`)
    }
    
    // Save tokens to database
    const { error: insertError } = await supabase
      .from('google_tokens')
      .upsert({
        user_id: user.id,
        tokens: tokens,
        service: 'gmail',
        updated_at: new Date().toISOString()
      })
    
    if (insertError) {
      console.error('Error saving tokens:', insertError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=save_failed`)
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?success=gmail_connected`)
  } catch (error) {
    console.error('Gmail OAuth callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/profile?error=oauth_failed`)
  }
} 