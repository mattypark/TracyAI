import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { listEvents, getCalendarList } from '@/lib/googleCalendar'

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role for admin access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Get user authentication
    const authorization = request.headers.get('Authorization')
    const userIdHeader = request.headers.get('X-User-ID')
    let user = null
    
    console.log('Sync request - Auth header:', !!authorization, 'User ID header:', userIdHeader)
    
    // If we have a user ID header (from OAuth callback), use that
    if (userIdHeader) {
      console.log('Using user ID from header:', userIdHeader)
      user = { id: userIdHeader }
    } else if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
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
        const { data: { user: cookieUser }, error: userError } = await supabase.auth.getUser(accessToken)
        if (!userError && cookieUser) {
          user = cookieUser
          console.log('Found user via cookie:', user.id)
        }
      }
    }

    // Final fallback: get the most recent user with Google tokens
    if (!user) {
      console.log('No user from auth methods, trying to find user with Google tokens...')
      const { data: tokenUsers, error: tokenUsersError } = await supabase
        .from('google_tokens')
        .select('user_id')
        .eq('service', 'calendar')
        .order('updated_at', { ascending: false })
        .limit(1)
      
      if (!tokenUsersError && tokenUsers && tokenUsers.length > 0) {
        user = { id: tokenUsers[0].user_id }
        console.log('Using most recent user with Google tokens:', user.id)
      }
    }
    
    if (!user) {
      console.error('No authenticated user found after all methods')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('Proceeding with sync for user:', user.id)
    
    // Get stored Google tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_tokens')
      .select('tokens')
      .eq('user_id', user.id)
      .eq('service', 'calendar')
      .single()
    
    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Google Calendar not connected' }, { status: 400 })
    }
    
    const tokens = tokenData.tokens
    
    // Get all user's calendars
    const calendars = await getCalendarList(tokens)
    console.log(`Found ${calendars.length} calendars for user ${user.id}`)
    
    let totalEventsSynced = 0
    const syncResults = []
    
    // Sync events from each calendar
    for (const calendar of calendars) {
      if (!calendar.id) continue
      
      try {
        console.log(`Syncing calendar: ${calendar.summary} (${calendar.id})`)
        
        // Get events from this calendar (6 months forward and 3 months back)
        const now = new Date()
        const pastDate = new Date()
        pastDate.setMonth(pastDate.getMonth() - 3)
        const futureDate = new Date()
        futureDate.setMonth(futureDate.getMonth() + 6)
        
        const events = await listEvents(tokens, calendar.id, 250)
        console.log(`Found ${events.length} events in calendar ${calendar.summary}`)
        
        // Transform events for database
        const transformedEvents = events.map(event => {
          // Handle date/time formatting
          let startTime, endTime, allDay = false
          
          if (event.start?.date) {
            // All-day event
            startTime = event.start.date + 'T00:00:00'
            endTime = event.end?.date + 'T23:59:59'
            allDay = true
          } else if (event.start?.dateTime) {
            // Timed event
            startTime = event.start.dateTime
            endTime = event.end?.dateTime || startTime
            allDay = false
          } else {
            // Fallback
            startTime = new Date().toISOString()
            endTime = new Date().toISOString()
            allDay = false
          }
          
          // Create event object with the correct column names from the database
          return {
            user_id: user.id,
            google_event_id: event.id,
            google_calendar_id: calendar.id,
            title: event.summary || 'Untitled Event',
            description: event.description || '',
            start_time: startTime,
            end_time: endTime,
            all_day: allDay,
            location: event.location || '',
            attendees: event.attendees?.map(a => a.email).join(', ') || '',
            status: event.status || 'confirmed',
            source: 'google',
            flag: calendar.summary || 'Google Calendar',
            flag_color: calendar.backgroundColor || '#1a73e8',
            created_at: event.created || new Date().toISOString(),
            updated_at: event.updated || new Date().toISOString()
          }
        })
        
        // Batch insert/update events
        if (transformedEvents.length > 0) {
          // First, delete existing events from this calendar to avoid duplicates
          await supabase
            .from('calendar_events')
            .delete()
            .eq('user_id', user.id)
            .eq('google_calendar_id', calendar.id)
          
          // Insert new events
          const { error: insertError } = await supabase
            .from('calendar_events')
            .insert(transformedEvents)
          
          if (insertError) {
            console.error(`Error inserting events for calendar ${calendar.summary}:`, insertError)
            syncResults.push({
              calendar: calendar.summary,
              success: false,
              error: insertError.message,
              eventCount: 0
            })
          } else {
            totalEventsSynced += transformedEvents.length
            syncResults.push({
              calendar: calendar.summary,
              success: true,
              eventCount: transformedEvents.length
            })
            console.log(`Successfully synced ${transformedEvents.length} events from ${calendar.summary}`)
          }
        } else {
          syncResults.push({
            calendar: calendar.summary,
            success: true,
            eventCount: 0
          })
        }
        
      } catch (calendarError) {
        console.error(`Error syncing calendar ${calendar.summary}:`, calendarError)
        syncResults.push({
          calendar: calendar.summary,
          success: false,
          error: calendarError instanceof Error ? calendarError.message : String(calendarError),
          eventCount: 0
        })
      }
    }
    
    // Update last sync time
    await supabase
      .from('google_tokens')
      .update({ 
        updated_at: new Date().toISOString(),
        tokens: { ...tokens, last_sync: new Date().toISOString() }
      })
      .eq('user_id', user.id)
      .eq('service', 'calendar')
    
    console.log(`Sync completed. Total events synced: ${totalEventsSynced}`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${totalEventsSynced} events from ${calendars.length} calendars`,
      totalEvents: totalEventsSynced,
      calendarsCount: calendars.length,
      syncResults: syncResults
    })
    
  } catch (error) {
    console.error('Calendar sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync calendar events', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
} 