import { NextRequest, NextResponse } from 'next/server'
import { updateEvent, deleteEvent as deleteGoogleEvent } from '@/lib/googleCalendar'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// PUT - Update an existing event
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const eventData = await request.json()
    const eventId = id
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Get authenticated user
    let user = null
    const authorization = request.headers.get('Authorization')
    
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
      if (!userError && authUser) {
        user = authUser
      }
    }
    
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
    
    // Use admin client for database operations
    const adminSupabase = createClient(
      "https://wyzllktxgkmfkbhgyhsf.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5emxsa3R4Z2ttZmtiaGd5aHNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDYxMTExOSwiZXhwIjoyMDY2MTg3MTE5fQ.EW7Mxk3ETm9tH-cZw9F_wV0vMY6BDwo9jY6hcpMDL84"
    )
    
    // First, get the existing event to check if it's a Google event
    const { data: existingEvent } = await adminSupabase
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()
    
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    
    // Try to update in Google Calendar if it's a Google event
    if (existingEvent.google_event_id) {
      try {
        const { data: tokenData } = await supabase
          .from('google_tokens')
          .select('tokens')
          .eq('user_id', user.id)
          .eq('service', 'calendar')
          .single()
        
        if (tokenData?.tokens) {
          await updateEvent(tokenData.tokens, existingEvent.google_event_id, eventData)
        }
      } catch (googleError) {
        console.log('Failed to update Google Calendar event:', googleError)
      }
    }
    
    // Update in local database
    const eventToUpdate = {
      title: eventData.title,
      description: eventData.description || '',
      start_time: eventData.startTime,
      end_time: eventData.endTime,
      all_day: eventData.allDay || false,
      location: eventData.location || '',
      attendees: eventData.attendees || '',
      flag: eventData.flag || 'personal',
      flag_color: eventData.flagColor || '#3B82F6',
      updated_at: new Date().toISOString()
    }
    
    const { data: updatedEvent, error: updateError } = await adminSupabase
      .from('calendar_events')
      .update(eventToUpdate)
      .eq('id', eventId)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating event:', updateError)
      return NextResponse.json(
        { error: 'Failed to update event: ' + updateError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an event
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params
    const eventId = id
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Get authenticated user
    let user = null
    const authorization = request.headers.get('Authorization')
    
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
      if (!userError && authUser) {
        user = authUser
      }
    }
    
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
    
    // Use admin client for database operations
    const adminSupabase = createClient(
      "https://wyzllktxgkmfkbhgyhsf.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5emxsa3R4Z2ttZmtiaGd5aHNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDYxMTExOSwiZXhwIjoyMDY2MTg3MTE5fQ.EW7Mxk3ETm9tH-cZw9F_wV0vMY6BDwo9jY6hcpMDL84"
    )
    
    // First, get the existing event to check if it's a Google event
    const { data: existingEvent } = await adminSupabase
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()
    
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    
    // Try to delete from Google Calendar if it's a Google event
    if (existingEvent.google_event_id) {
      try {
        const { data: tokenData } = await supabase
          .from('google_tokens')
          .select('tokens')
          .eq('user_id', user.id)
          .eq('service', 'calendar')
          .single()
        
        if (tokenData?.tokens) {
          // Use the google_calendar_id from the event to delete from the correct calendar
          const calendarId = existingEvent.google_calendar_id || 'primary'
          await deleteGoogleEvent(tokenData.tokens, existingEvent.google_event_id, calendarId)
          console.log(`Deleted event ${existingEvent.google_event_id} from calendar ${calendarId}`)
        }
      } catch (googleError) {
        console.error('Failed to delete Google Calendar event:', googleError)
        // Don't fail the whole operation if Google Calendar delete fails
        // User can manually delete from Google Calendar
      }
    }
    
    // Delete from local database
    const { error: deleteError } = await adminSupabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id)
    
    if (deleteError) {
      console.error('Error deleting event:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete event: ' + deleteError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
} 