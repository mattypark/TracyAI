import { google } from 'googleapis'

// Google Calendar API configuration
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]

// OAuth 2.0 client setup
function getOAuthClient(tokens?: any) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/oauth2callback`
  )

  if (tokens) {
    oauth2Client.setCredentials(tokens)
  }

  return oauth2Client
}

// Generate OAuth URL for authentication
export function getAuthUrl() {
  const oauth2Client = getOAuthClient()
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  })
}

// Exchange authorization code for tokens
export async function getTokens(code: string) {
  try {
    const oauth2Client = getOAuthClient()
    const { tokens } = await oauth2Client.getToken(code)
    return tokens
  } catch (error) {
    console.error('Error getting tokens:', error)
    throw error
  }
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string) {
  try {
    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({ refresh_token: refreshToken })
    
    const { credentials } = await oauth2Client.refreshAccessToken()
    return credentials
  } catch (error) {
    console.error('Error refreshing token:', error)
    throw error
  }
}

// Get list of user's calendars
export async function getCalendarList(tokens: any) {
  try {
    const auth = getOAuthClient(tokens)
    const calendar = google.calendar({ version: 'v3', auth })
    
    const response = await calendar.calendarList.list()
    return response.data.items || []
  } catch (error) {
    console.error('Error fetching calendar list:', error)
    throw error
  }
}

// Get events from a specific calendar
export async function listEvents(tokens: any, calendarId = 'primary', maxResults = 250) {
  try {
    const auth = getOAuthClient(tokens)
    const calendar = google.calendar({ version: 'v3', auth })
    
    const now = new Date()
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 6) // Get 6 months of events
    
    const response = await calendar.events.list({
      calendarId,
      timeMin: now.toISOString(),
      timeMax: futureDate.toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    })
    
    return response.data.items || []
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    throw error
  }
}

// Create a new event
export async function createEvent(tokens: any, eventData: any, calendarId = 'primary') {
  try {
    const auth = getOAuthClient(tokens)
    const calendar = google.calendar({ version: 'v3', auth })
    
    // Format event data for Google Calendar API
    const googleEvent = {
      summary: eventData.title,
      description: eventData.description || '',
      location: eventData.location || '',
      start: eventData.allDay ? 
        { date: eventData.startDate } : 
        { 
          dateTime: eventData.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
      end: eventData.allDay ? 
        { date: eventData.endDate } : 
        { 
          dateTime: eventData.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
      attendees: eventData.attendees || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: parseInt(eventData.reminderMinutes) || 10 }
        ]
      },
      visibility: eventData.visibility || 'default',
      conferenceData: eventData.meetingLink ? {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      } : undefined
    }
    
    const response = await calendar.events.insert({
      calendarId,
      requestBody: googleEvent,
      conferenceDataVersion: eventData.meetingLink ? 1 : 0
    })
    
    return response.data
  } catch (error) {
    console.error('Error creating calendar event:', error)
    throw error
  }
}

// Update an existing event
export async function updateEvent(tokens: any, eventId: string, eventData: any, calendarId = 'primary') {
  try {
    const auth = getOAuthClient(tokens)
    const calendar = google.calendar({ version: 'v3', auth })
    
    const googleEvent = {
      summary: eventData.title,
      description: eventData.description || '',
      location: eventData.location || '',
      start: eventData.allDay ? 
        { date: eventData.startDate } : 
        { 
          dateTime: eventData.startTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
      end: eventData.allDay ? 
        { date: eventData.endDate } : 
        { 
          dateTime: eventData.endTime,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
      attendees: eventData.attendees || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: parseInt(eventData.reminderMinutes) || 10 }
        ]
      },
      visibility: eventData.visibility || 'default'
    }
    
    const response = await calendar.events.update({
      calendarId,
      eventId,
      requestBody: googleEvent
    })
    
    return response.data
  } catch (error) {
    console.error('Error updating calendar event:', error)
    throw error
  }
}

// Delete an event
export async function deleteEvent(tokens: any, eventId: string, calendarId = 'primary') {
  try {
    const auth = getOAuthClient(tokens)
    const calendar = google.calendar({ version: 'v3', auth })
    
    await calendar.events.delete({
      calendarId,
      eventId
    })
    
    return true
  } catch (error) {
    console.error('Error deleting calendar event:', error)
    throw error
  }
}

// Watch for calendar changes (webhooks)
export async function watchCalendar(tokens: any, calendarId = 'primary', webhookUrl: string) {
  try {
    const auth = getOAuthClient(tokens)
    const calendar = google.calendar({ version: 'v3', auth })
    
    const response = await calendar.events.watch({
      calendarId,
      requestBody: {
        id: `calendar-watch-${Date.now()}`,
        type: 'web_hook',
        address: webhookUrl,
        token: `verify-token-${Date.now()}`
      }
    })
    
    return response.data
  } catch (error) {
    console.error('Error setting up calendar watch:', error)
    throw error
  }
}

// Get calendar colors
export async function getCalendarColors(tokens: any) {
  try {
    const auth = getOAuthClient(tokens)
    const calendar = google.calendar({ version: 'v3', auth })
    
    const response = await calendar.colors.get()
    return response.data
  } catch (error) {
    console.error('Error fetching calendar colors:', error)
    throw error
  }
}

// Sync events with local database
export async function syncEventsWithDatabase(tokens: any, userId: string) {
  try {
    // Get all user's calendars
    const calendars = await getCalendarList(tokens)
    
    // Get all events from all calendars
    const allEvents = []
    for (const cal of calendars) {
      if (cal.id) {
        const events = await listEvents(tokens, cal.id)
        const eventsWithCalendar = events.map(event => ({
          ...event,
          calendarId: cal.id,
          calendarName: cal.summary,
          calendarColor: cal.backgroundColor
        }))
        allEvents.push(...eventsWithCalendar)
      }
    }
    
    // Transform Google Calendar events to our format
    const transformedEvents = allEvents.map(event => ({
      google_event_id: event.id,
      google_calendar_id: event.calendarId,
      user_id: userId,
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      start_time: event.start?.dateTime || event.start?.date,
      end_time: event.end?.dateTime || event.end?.date,
      all_day: !event.start?.dateTime, // If no dateTime, it's all day
      location: event.location || '',
      attendees: event.attendees?.map(a => a.email).join(', ') || '',
      calendar_name: event.calendarName,
      calendar_color: event.calendarColor || '#3B82F6',
      created_at: event.created,
      updated_at: event.updated,
      status: event.status || 'confirmed'
    }))
    
    return transformedEvents
  } catch (error) {
    console.error('Error syncing events with database:', error)
    throw error
  }
}

// Helper function to format events for the UI
export function formatEventForUI(googleEvent: any) {
  return {
    id: googleEvent.id,
    title: googleEvent.summary || 'Untitled Event',
    description: googleEvent.description || '',
    start_time: googleEvent.start?.dateTime || googleEvent.start?.date,
    end_time: googleEvent.end?.dateTime || googleEvent.end?.date,
    all_day: !googleEvent.start?.dateTime,
    location: googleEvent.location || '',
    attendees: googleEvent.attendees?.map((a: any) => a.email).join(', ') || '',
    calendar_id: googleEvent.calendarId || 'primary',
    status: googleEvent.status || 'confirmed',
    created_at: googleEvent.created,
    updated_at: googleEvent.updated
  }
} 