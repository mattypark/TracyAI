import { NextRequest, NextResponse } from 'next/server'
import { listEmails } from '@/lib/gmail'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get the current user from Supabase
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('sb-access-token')
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(authCookie.value)
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    // Get Google tokens from database
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('tokens')
      .eq('user_id', user.id)
      .eq('service', 'gmail')
      .single()
    
    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 })
    }
    
    // Fetch emails from Gmail
    const emails = await listEmails(tokenData.tokens)
    
    return NextResponse.json({ emails })
  } catch (error) {
    console.error('Gmail emails fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
} 