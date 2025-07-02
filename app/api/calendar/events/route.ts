import { NextRequest, NextResponse } from 'next/server'
import { listEvents, createEvent, formatEventForUI } from '@/lib/googleCalendar'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// GET - Fetch events from both Google Calendar and local database
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try to get user from Authorization header first, then cookies
    let user = null
    const authorization = request.headers.get('Authorization')
    
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
      if (!userError && authUser) {
        user = authUser
      }
    }
    
    // Fallback to cookies if no Authorization header or it failed
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
    
    let events = []
    
    // Try to get events from Google Calendar
    try {
      const { data: tokenData } = await supabase
        .from('google_tokens')
        .select('tokens')
        .eq('user_id', user.id)
        .eq('service', 'calendar')
        .single()
      
      if (tokenData?.tokens) {
        const googleEvents = await listEvents(tokenData.tokens)
        const formattedGoogleEvents = googleEvents.map(formatEventForUI)
        events.push(...formattedGoogleEvents)
      }
    } catch (googleError) {
      console.log('Google Calendar not connected or error fetching:', googleError)
    }
    
    // Also get local events from database
    try {
      const { data: localEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true })
      
      if (localEvents) {
        events.push(...localEvents)
      }
    } catch (localError) {
      console.log('Error fetching local events:', localError)
    }
    
    // Remove duplicates and sort by date
    const uniqueEvents = events.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id || e.google_event_id === event.google_event_id)
    )
    
    uniqueEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    
    return NextResponse.json({ events: uniqueEvents })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST - Create a new event
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json()
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try to get user from Authorization header first, then cookies
    let user = null
    const authorization = request.headers.get('Authorization')
    
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser(token)
      if (!userError && authUser) {
        user = authUser
      }
    }
    
    // Fallback to cookies if no Authorization header or it failed
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
    
    let createdEvent = null
    
    // Try to create in Google Calendar first
    try {
      const { data: tokenData } = await supabase
        .from('google_tokens')
        .select('tokens')
        .eq('user_id', user.id)
        .eq('service', 'calendar')
        .single()
      
      if (tokenData?.tokens) {
        const googleEvent = await createEvent(tokenData.tokens, eventData)
        createdEvent = formatEventForUI(googleEvent)
        
        // Also store in local database for backup
        await supabase
          .from('calendar_events')
          .insert({
            ...createdEvent,
            user_id: user.id,
            google_event_id: googleEvent.id,
            google_calendar_id: 'primary'
          })
      }
    } catch (googleError) {
      console.log('Google Calendar not connected, creating local event only:', googleError)
    }
    
    // If Google Calendar creation failed or not connected, create local event
    if (!createdEvent) {
      console.log('User ID for event creation:', user.id)
      console.log('User object:', { id: user.id, email: user.email })
      
      // Use a simpler approach - reference auth.users directly
      const eventToInsert = {
        user_id: user.id, // This should be the UUID from auth.users
        title: eventData.title,
        description: eventData.description || '',
        start_time: eventData.startTime,
        end_time: eventData.endTime,
        all_day: eventData.allDay || false,
        location: eventData.location || '',
        attendees: eventData.attendees || '',
        flag: eventData.flag || 'personal',
        flag_color: '#3B82F6',
        source: 'local',
        status: 'confirmed'
      }
      
      console.log('Creating local event with data:', eventToInsert)

      // Use the service role key for this operation to bypass RLS temporarily
      const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: localEvent, error: localError } = await adminSupabase
        .from('calendar_events')
        .insert(eventToInsert)
        .select()
        .single()
      
      if (localError) {
        console.error('Error creating local event:', localError)
        console.error('Error details:', {
          code: localError.code,
          message: localError.message,
          details: localError.details,
          hint: localError.hint
        })
        
        // Try with the regular client as fallback
        console.log('Trying with regular client as fallback...')
        const { data: fallbackEvent, error: fallbackError } = await supabase
          .from('calendar_events')
          .insert(eventToInsert)
          .select()
          .single()
        
        if (fallbackError) {
          console.error('Fallback also failed:', fallbackError)
          return NextResponse.json(
            { error: 'Failed to create event: ' + fallbackError.message },
            { status: 500 }
          )
        }
        
        console.log('Fallback successful:', fallbackEvent)
        createdEvent = fallbackEvent
      } else {
        console.log('Event created successfully:', localEvent)
        createdEvent = localEvent
      }
    }
    
    return NextResponse.json({ event: createdEvent })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
} 