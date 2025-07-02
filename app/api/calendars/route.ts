import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

async function ensureCalendarsTable(supabase: any) {
  // Check if table exists by trying to select from it
  const { error: checkError } = await supabase
    .from('calendars')
    .select('id')
    .limit(1)

  if (checkError && checkError.code === '42P01') {
    // Table does not exist, so create it
    console.log('/api/calendars: "calendars" table not found. A sync is required to create it.')
    // In this read-only endpoint, we don't create the table. 
    // We just return an empty array, assuming a sync will happen soon.
    return false
  } else if (checkError) {
    console.error('Error checking for "calendars" table:', checkError)
    throw new Error('Database error while checking for calendars table.')
  }
  
  return true
}

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createClient(
      "https://wyzllktxgkmfkbhgyhsf.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5emxsa3R4Z2ttZmtiaGd5aHNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDYxMTExOSwiZXhwIjoyMDY2MTg3MTE5fQ.EW7Mxk3ETm9tH-cZw9F_wV0vMY6BDwo9jY6hcpMDL84"
    )
    
    // Get user authentication
    const authorization = request.headers.get('Authorization')
    let user = null
    
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
      if (!userError && authUser) {
        user = authUser
      }
    }
    
    // Fallback to cookies
    if (!user) {
      const cookieStore = await cookies()
      const accessToken = cookieStore.get('sb-access-token')?.value
      
      if (accessToken) {
        const { data: { user: cookieUser }, error: userError } = await supabase.auth.getUser(accessToken)
        if (!userError && cookieUser) {
          user = cookieUser
        }
      }
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Ensure the calendars table exists before proceeding
    const tableExists = await ensureCalendarsTable(supabase)
    if (!tableExists) {
      return NextResponse.json({ calendars: [] })
    }
    
    // Fetch user's calendars
    const { data: calendars, error } = await supabase
      .from('calendars')
      .select('*')
      .eq('user_id', user.id)
      .order('is_primary', { ascending: false })
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching calendars:', error)
      return NextResponse.json({ error: 'Failed to fetch calendars' }, { status: 500 })
    }
    
    return NextResponse.json({ calendars: calendars || [] })
    
  } catch (error) {
    console.error('Calendars API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendars', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { calendarId, updates } = await request.json()
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get user authentication
    const authorization = request.headers.get('Authorization')
    let user = null
    
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
      if (!userError && authUser) {
        user = authUser
      }
    }
    
    // Fallback to cookies
    if (!user) {
      const cookieStore = await cookies()
      const accessToken = cookieStore.get('sb-access-token')?.value
      
      if (accessToken) {
        const { data: { user: cookieUser }, error: userError } = await supabase.auth.getUser(accessToken)
        if (!userError && cookieUser) {
          user = cookieUser
        }
      }
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    // Update calendar
    const { error } = await supabase
      .from('calendars')
      .update(updates)
      .eq('id', calendarId)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error updating calendar:', error)
      return NextResponse.json({ error: 'Failed to update calendar' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Calendar update API error:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 