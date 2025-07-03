import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { listEvents, getCalendarList } from '@/lib/googleCalendar'

// Google Calendar color mapping to match Google's official colors
const GOOGLE_CALENDAR_COLORS: { [key: string]: string } = {
  '1': '#a4bdfc', // Lavender
  '2': '#7ae7bf', // Sage  
  '3': '#dbadff', // Grape
  '4': '#ff887c', // Flamingo
  '5': '#fbd75b', // Banana
  '6': '#ffb878', // Tangerine
  '7': '#46d6db', // Peacock
  '8': '#e1e1e1', // Graphite
  '9': '#5484ed', // Blueberry
  '10': '#51b749', // Basil
  '11': '#dc2127', // Tomato
  'default': '#1a73e8' // Default Blue
}

const getCalendarColor = (calendar: any): string => {
  // Use colorId first if available
  if (calendar.colorId && GOOGLE_CALENDAR_COLORS[calendar.colorId]) {
    return GOOGLE_CALENDAR_COLORS[calendar.colorId]
  }
  
  // Fallback to backgroundColor if available
  if (calendar.backgroundColor) {
    return calendar.backgroundColor
  }
  
  // Default color
  return GOOGLE_CALENDAR_COLORS.default
}

async function ensureCalendarsTable(supabase: any) {
  // Check if table exists by trying to select from it
  const { error: checkError } = await supabase
    .from('calendars')
    .select('id')
    .limit(1)

  if (checkError && checkError.code === '42P01') {
    // Table does not exist
    console.log('"calendars" table not found. Calendar metadata will not be synced.')
    console.log('To sync calendar metadata, please create the table using create-calendars-table-manual.sql')
    return false
  } else if (checkError) {
    console.error('Error checking for "calendars" table:', checkError)
    return false
  }
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role for admin access
    const supabase = createClient(
      "https://wyzllktxgkmfkbhgyhsf.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5emxsa3R4Z2ttZmtiaGd5aHNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDYxMTExOSwiZXhwIjoyMDY2MTg3MTE5fQ.EW7Mxk3ETm9tH-cZw9F_wV0vMY6BDwo9jY6hcpMDL84"
    )
    
    // Ensure the calendars table exists before proceeding
    const hasCalendarsTable = await ensureCalendarsTable(supabase)
    
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
    const lastSyncTime = tokens.last_sync ? new Date(tokens.last_sync) : null
    
    // Get all user's calendars
    const calendars = await getCalendarList(tokens)
    console.log(`Found ${calendars.length} calendars for user ${user.id}`)
    
    // First, sync calendar metadata (only if table exists)
    const calendarSyncResults = []
    
    if (hasCalendarsTable) {
      console.log('Syncing calendar metadata...')
      
      for (const calendar of calendars) {
        if (!calendar.id) continue
        
        try {
          const calendarColor = getCalendarColor(calendar)
          
          const calendarData = {
            user_id: user.id,
            google_calendar_id: calendar.id,
            name: calendar.summary || 'Untitled Calendar',
            description: calendar.description || '',
            color: calendarColor,
            background_color: calendar.backgroundColor || calendarColor,
            foreground_color: calendar.foregroundColor || '#000000',
            is_primary: calendar.primary || false,
            access_role: calendar.accessRole || 'reader',
            timezone: calendar.timeZone || 'UTC',
            summary: calendar.summary || '',
            location: calendar.location || '',
            is_visible: true,
            is_selected: true,
            source: 'google'
          }
          
          // Upsert calendar (insert or update if exists)
          const { error: calendarError } = await supabase
            .from('calendars')
            .upsert(calendarData, { 
              onConflict: 'user_id,google_calendar_id',
              ignoreDuplicates: false 
            })
          
          if (calendarError) {
            console.error(`Error upserting calendar ${calendar.summary}:`, calendarError)
            calendarSyncResults.push({
              calendar: calendar.summary,
              success: false,
              error: calendarError.message
            })
          } else {
            console.log(`Successfully synced calendar: ${calendar.summary}`)
            calendarSyncResults.push({
              calendar: calendar.summary,
              success: true,
              color: calendarColor
            })
          }
        } catch (error) {
          console.error(`Error syncing calendar metadata for ${calendar.summary}:`, error)
          calendarSyncResults.push({
            calendar: calendar.summary,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      }
    } else {
      console.log('Skipping calendar metadata sync - calendars table does not exist')
    }
    
    let totalEventsSynced = 0;
    const syncResults = [];
    
    // Sync events from each calendar
    for (const calendar of calendars) {
      if (!calendar.id) continue;
      
      try {
        console.log(`Syncing calendar: ${calendar.summary} (${calendar.id})`);
        
        // Get events from this calendar (6 months forward and 3 months back)
        const now = new Date();
        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - 3);
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 6);
        
        // If we have a last sync time, only get events updated since then
        const updatedMin = lastSyncTime ? lastSyncTime.toISOString() : undefined;
        
        // Get events from Google Calendar with proper options
        const events = await listEvents(tokens, calendar.id, 250, { updatedMin });
        console.log(`Found ${events.length} events in calendar ${calendar.summary}`);
        
        if (events.length === 0) {
          // No events to sync for this calendar
          syncResults.push({
            calendar: calendar.summary,
            success: true,
            eventCount: 0,
            message: 'No new or updated events'
          });
          continue;
        }
        
        // Transform events for database
        const transformedEvents = events.map(event => {
          // Handle date/time formatting
          let startTime, endTime, allDay = false;
          
          if (event.start?.date) {
            // All-day event
            startTime = event.start.date + 'T00:00:00';
            endTime = event.end?.date + 'T23:59:59';
            allDay = true;
          } else if (event.start?.dateTime) {
            // Timed event
            startTime = event.start.dateTime;
            endTime = event.end?.dateTime || startTime;
            allDay = false;
          } else {
            // Fallback
            startTime = new Date().toISOString();
            endTime = new Date().toISOString();
            allDay = false;
          }
          
          // Get the proper calendar color
          const calendarColor = getCalendarColor(calendar);
          
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
            flag_color: calendarColor,
            created_at: event.created || new Date().toISOString(),
            updated_at: event.updated || new Date().toISOString()
          };
        });
        
        // Batch insert/update events
        if (transformedEvents.length > 0) {
          // For each event, upsert (update or insert)
          const { error: upsertError } = await supabase
            .from('calendar_events')
            .upsert(transformedEvents, {
              onConflict: 'user_id,google_event_id',
              ignoreDuplicates: false
            });
          
          if (upsertError) {
            console.error(`Error upserting events for calendar ${calendar.summary}:`, upsertError);
            syncResults.push({
              calendar: calendar.summary,
              success: false,
              error: upsertError.message,
              eventCount: 0
            });
          } else {
            totalEventsSynced += transformedEvents.length;
            syncResults.push({
              calendar: calendar.summary,
              success: true,
              eventCount: transformedEvents.length
            });
            console.log(`Successfully synced ${transformedEvents.length} events from ${calendar.summary}`);
          }
        } else {
          syncResults.push({
            calendar: calendar.summary,
            success: true,
            eventCount: 0
          });
        }
        
      } catch (calendarError) {
        console.error(`Error syncing calendar ${calendar.summary}:`, calendarError);
        syncResults.push({
          calendar: calendar.summary,
          success: false,
          error: calendarError instanceof Error ? calendarError.message : String(calendarError),
          eventCount: 0
        });
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
      .eq('service', 'calendar');
    
    console.log(`Sync completed. Total events synced: ${totalEventsSynced}`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${calendars.length} calendars and ${totalEventsSynced} events`,
      totalEvents: totalEventsSynced,
      calendarsCount: calendars.length,
      calendarsSync: calendarSyncResults,
      eventsSync: syncResults
    });
    
  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendar events', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 