'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Mail, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface GoogleSyncButtonsProps {
  className?: string
}

export function GoogleSyncButtons({ className }: GoogleSyncButtonsProps) {
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [gmailConnected, setGmailConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnectionStatus()
    
    // Check for error query parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')
      const success = urlParams.get('success')
      const message = urlParams.get('message')
      
      if (error === 'oauth_not_configured') {
        setError('Google OAuth credentials not configured. Please follow the setup guide in GOOGLE_CALENDAR_SETUP_GUIDE.md')
      } else if (error === 'calendar_auth_failed') {
        setError('Calendar authentication failed. Please check your Google Cloud Console setup.')
      } else if (error === 'gmail_auth_failed') {
        setError('Gmail authentication failed. Please check your Google Cloud Console setup.')
      } else if (error === 'database_setup_required') {
        setError('Database setup required. Please run the SQL migration as described in GOOGLE_CALENDAR_SETUP_GUIDE.md')
      } else if (error === 'not_authenticated') {
        setError('Please log in to connect your Google services.')
      } else if (success === 'calendar_connected') {
        // Clear any existing errors and refresh
        setError(null)
        checkConnectionStatus()
        
        // Trigger automatic sync after successful connection
        setTimeout(async () => {
          try {
            const response = await fetch('/api/calendar/sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              const result = await response.json()
              console.log('Auto-sync completed:', result)
              // Show success message with sync results
              setError(null)
              if (typeof window !== 'undefined') {
                window.location.href = '/calendar?synced=true&events=' + result.totalEvents
              }
            } else {
              console.error('Auto-sync failed:', await response.text())
            }
          } catch (syncError) {
            console.error('Error during auto-sync:', syncError)
          }
        }, 1000) // Wait 1 second before syncing
        
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname)
      } else if (success === 'gmail_connected') {
        // Clear any existing errors and refresh
        setError(null)
        checkConnectionStatus()
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    }
  }, [])

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        setLoading(false)
        return
      }

      const { data: tokens, error: tokensError } = await supabase
        .from('google_tokens')
        .select('service')
        .eq('user_id', user.id)

      if (tokensError) {
        console.error('Error checking connection status:', tokensError)
        // If table doesn't exist, show setup message instead of error
        if (tokensError.message?.includes('does not exist') || tokensError.code === '42P01') {
          setError('Database setup required. Please follow the setup guide in GOOGLE_CALENDAR_SETUP_GUIDE.md')
        } else {
          setError('Failed to check connection status: ' + tokensError.message)
        }
      } else {
        const services = tokens?.map(token => token.service) || []
        setCalendarConnected(services.includes('calendar'))
        setGmailConnected(services.includes('gmail'))
      }
    } catch (error) {
      console.error('Error checking connection status:', error)
      setError('Failed to check connection status')
    } finally {
      setLoading(false)
    }
  }

  const handleCalendarSync = async () => {
    try {
      const { apiGet } = await import('@/lib/api-client')
      const response = await apiGet('/api/calendar/auth')
      
      if (!response.ok) {
        console.error('Failed to get auth URL:', response.statusText)
        setError('Failed to initiate Google Calendar connection')
        return
      }
      
      const data = await response.json()
      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        setError('Failed to get authentication URL')
      }
    } catch (error) {
      console.error('Error initiating calendar sync:', error)
      setError('Failed to connect to Google Calendar')
    }
  }

  const handleGmailSync = () => {
    window.location.href = '/api/gmail/auth'
  }

  const disconnectService = async (service: 'calendar' | 'gmail') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('User not authenticated')
        return
      }

      const { error } = await supabase
        .from('google_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('service', service)

      if (error) {
        console.error(`Error disconnecting ${service}:`, error)
        setError(`Failed to disconnect ${service}`)
      } else {
        if (service === 'calendar') {
          setCalendarConnected(false)
        } else {
          setGmailConnected(false)
        }
      }
    } catch (error) {
      console.error(`Error disconnecting ${service}:`, error)
      setError(`Failed to disconnect ${service}`)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Google Services</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading connection status...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Google Services Integration
          <Badge variant="secondary" className="text-xs">
            Enhanced AI Features
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your Google services to enable Tracy to help with calendar events and emails
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex flex-col gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600 font-medium">Setup Required</p>
            </div>
            <p className="text-sm text-red-600">{error}</p>
            {(error.includes('Database setup required') || error.includes('Google OAuth') || error.includes('setup guide')) && (
              <div className="text-xs text-red-500 mt-1">
                <p>📋 <strong>Setup Required:</strong></p>
                <p className="mt-1">Please follow the complete setup guide in:</p>
                <p className="font-mono bg-red-100 px-2 py-1 rounded mt-1">
                  GOOGLE_CALENDAR_SETUP_GUIDE.md
                </p>
                <p className="mt-1">This guide will walk you through:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Creating the database table</li>
                  <li>Setting up Google OAuth credentials</li>
                  <li>Configuring environment variables</li>
                  <li>Testing the integration</li>
                </ul>
              </div>
            )}
          </div>
        )}
        
        {/* Google Calendar */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium">Google Calendar</h3>
              <p className="text-sm text-muted-foreground">
                View and create calendar events through Tracy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {calendarConnected ? (
              <>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectService('calendar')}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={handleCalendarSync} size="sm">
                Connect Calendar
              </Button>
            )}
          </div>
        </div>

        {/* Gmail */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-medium">Gmail</h3>
              <p className="text-sm text-muted-foreground">
                Check and send emails through Tracy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {gmailConnected ? (
              <>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnectService('gmail')}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={handleGmailSync} size="sm">
                Connect Gmail
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Example commands once connected:</strong>
          </p>
          <ul className="text-sm text-blue-700 mt-1 space-y-1">
            <li>• "What's on my calendar today?"</li>
            <li>• "Schedule a meeting tomorrow at 3 PM"</li>
            <li>• "Check my recent emails"</li>
            <li>• "Do I have any unread messages?"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
} 