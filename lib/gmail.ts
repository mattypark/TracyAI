import { google } from 'googleapis'

export function getGmailOAuthClient(tokens?: any) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env.local file.')
  }
  
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL not configured. Please set it in your .env.local file.')
  }
  
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${appUrl}/api/gmail/oauth2callback`
  )
  
  if (tokens) {
    oauth2Client.setCredentials(tokens)
  }
  
  return oauth2Client
}

export async function listEmails(tokens: any, maxResults = 20) {
  try {
    const auth = getGmailOAuthClient(tokens)
    const gmail = google.gmail({ version: 'v1', auth })
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: 'is:unread' // Get unread emails by default
    })
    
    const messages = response.data.messages || []
    
    // Get detailed information for each message
    const detailedMessages = await Promise.all(
      messages.map(async (message) => {
        const details = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'metadata',
          metadataHeaders: ['Subject', 'From', 'Date']
        })
        
        const headers = details.data.payload?.headers || []
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
        const date = headers.find(h => h.name === 'Date')?.value || ''
        
        return {
          id: message.id,
          subject,
          from,
          date,
          snippet: details.data.snippet || ''
        }
      })
    )
    
    return detailedMessages
  } catch (error) {
    console.error('Error fetching emails:', error)
    throw error
  }
}

export async function sendEmail(tokens: any, to: string, subject: string, body: string) {
  try {
    const auth = getGmailOAuthClient(tokens)
    const gmail = google.gmail({ version: 'v1', auth })
    
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      body
    ].join('\n')
    
    const encodedMessage = Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
    
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    })
    
    return response.data
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export function generateGmailAuthUrl() {
  const oauth2Client = getGmailOAuthClient()
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.compose'
    ],
    prompt: 'consent'
  })
} 