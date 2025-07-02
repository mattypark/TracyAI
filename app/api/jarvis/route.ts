import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { supabase } from '@/lib/supabase'
import { listEvents, createEvent } from '@/lib/googleCalendar'
import { listEmails, sendEmail } from '@/lib/gmail'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()
    
    // Get user from Supabase
    const cookieStore = await cookies()
    const authCookie = cookieStore.get('sb-access-token')
    
    if (!authCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(authCookie.value)
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }
    
    // Load conversation history
    const { data: history } = await supabase
      .from('conversations')
      .select('role, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(20)
    
    // Get user context
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Check if user has Google services connected
    const { data: googleTokens } = await supabase
      .from('google_tokens')
      .select('service, tokens')
      .eq('user_id', user.id)
    
    const hasCalendar = googleTokens?.some(token => token.service === 'calendar')
    const hasGmail = googleTokens?.some(token => token.service === 'gmail')
    
    // Determine if this is a calendar or email command
    const isCalendarCommand = /(?:schedule|calendar|event|meeting|appointment|remind|tomorrow|today|next week)/i.test(message)
    const isEmailCommand = /(?:email|mail|send|compose|check.*email|unread)/i.test(message)
    
    let contextData = ''
    let actionTaken = ''
    
    // Handle calendar commands
    if (isCalendarCommand && hasCalendar) {
      try {
        const calendarTokens = googleTokens?.find(token => token.service === 'calendar')?.tokens
        
        if (message.toLowerCase().includes('schedule') || message.toLowerCase().includes('create')) {
          // This is a calendar creation request - we'll let the AI handle the parsing
          contextData += '\n\nCALENDAR: User has Google Calendar connected and can create events.'
        } else {
          // Fetch upcoming events
          const events = await listEvents(calendarTokens, 10)
          const eventSummary = events.map(event => ({
            title: event.summary,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date
          })).slice(0, 5)
          
          contextData += `\n\nUPCOMING CALENDAR EVENTS:\n${JSON.stringify(eventSummary, null, 2)}`
        }
      } catch (error) {
        console.error('Calendar error:', error)
        contextData += '\n\nCALENDAR: Error accessing calendar data.'
      }
    }
    
    // Handle email commands
    if (isEmailCommand && hasGmail) {
      try {
        const gmailTokens = googleTokens?.find(token => token.service === 'gmail')?.tokens
        
        if (message.toLowerCase().includes('send') || message.toLowerCase().includes('compose')) {
          contextData += '\n\nEMAIL: User has Gmail connected and can send emails.'
        } else {
          // Fetch recent emails
          const emails = await listEmails(gmailTokens, 5)
          const emailSummary = emails.map(email => ({
            from: email.from,
            subject: email.subject,
            snippet: email.snippet
          }))
          
          contextData += `\n\nRECENT UNREAD EMAILS:\n${JSON.stringify(emailSummary, null, 2)}`
        }
      } catch (error) {
        console.error('Email error:', error)
        contextData += '\n\nEMAIL: Error accessing email data.'
      }
    }
    
    // Build messages for AI
    const messages = [
      ...(history || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ]
    
    const systemPrompt = `You are Tracy AI, the user's personal assistant like Jarvis from Iron Man. You have access to their Google Calendar and Gmail.

USER PROFILE:
${JSON.stringify(userProfile, null, 2)}

CONNECTED SERVICES:
- Google Calendar: ${hasCalendar ? 'Connected' : 'Not connected'}
- Gmail: ${hasGmail ? 'Connected' : 'Not connected'}

${contextData}

INSTRUCTIONS:
1. Be conversational, helpful, and personalized like Jarvis
2. Use the user's name and reference their data when relevant
3. For calendar requests, provide specific details about events
4. For email requests, summarize important emails
5. If asked to create events or send emails, provide clear confirmation of what you would do
6. Maintain a cool, intelligent, and slightly witty tone like Jarvis
7. Always be concise but informative

IMPORTANT: You can view calendar events and emails, but you cannot actually create events or send emails yet. If asked to do so, explain what you would do and ask for confirmation.`
    
    // Generate AI response
    const result = await generateText({
      model: openai('gpt-4o'),
      system: systemPrompt,
      messages,
      temperature: 0.7,
    })
    
    // Save conversation to database
    await supabase.from('conversations').insert([
      { user_id: user.id, role: 'user', content: message },
      { user_id: user.id, role: 'assistant', content: result.text }
    ])
    
    return NextResponse.json({ 
      reply: result.text,
      hasCalendar,
      hasGmail,
      actionTaken
    })
    
  } catch (error) {
    console.error('Jarvis API error:', error)
    return NextResponse.json(
      { error: 'I apologize, but I encountered an error. Please try again.' },
      { status: 500 }
    )
  }
} 