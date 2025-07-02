import { NextRequest, NextResponse } from 'next/server'
import { generateGmailAuthUrl } from '@/lib/gmail'

export async function GET(request: NextRequest) {
  try {
    const authUrl = generateGmailAuthUrl()
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Gmail auth error:', error)
    
    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes('OAuth credentials not configured')) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?error=oauth_not_configured`)
    }
    
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile?error=gmail_auth_failed`)
  }
} 