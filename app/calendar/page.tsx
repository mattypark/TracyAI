"use client"

import { useState, useEffect, useRef } from "react"
import { CalendarView } from "@/components/calendar-view"
import { GoogleCalendarModal } from "@/components/google-calendar-modal"
import { CalendarSettings } from "@/components/calendar-settings"
import { MobileNavigation } from "@/components/mobile-navigation"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, ChevronLeft, ChevronRight, Settings, Search, Plus, ChevronDown, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

type ViewType = 'day' | 'week' | 'month' | 'year'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<ViewType>('month')
  const [showSettings, setShowSettings] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [calendars, setCalendars] = useState<any[]>([])
  const [loadingCalendars, setLoadingCalendars] = useState(true)
  const router = useRouter()
  const { user, loading } = useAuth()
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleCloseModal = () => {
    setSelectedDate(null)
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const navigatePrevious = () => {
    const newDate = new Date(currentDate)
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() - 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1)
        break
      case 'year':
        newDate.setFullYear(newDate.getFullYear() - 1)
        break
    }
    setCurrentDate(newDate)
  }

  const navigateNext = () => {
    const newDate = new Date(currentDate)
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1)
        break
      case 'week':
        newDate.setDate(newDate.getDate() + 7)
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1)
        break
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + 1)
        break
    }
    setCurrentDate(newDate)
  }

  const formatDateRange = () => {
    switch (currentView) {
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      case 'week':
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          const weekRange = startOfWeek.toLocaleDateString('en-US', { month: 'long' }) + ' ' + startOfWeek.getDate() + ' – ' + endOfWeek.getDate() + ', ' + startOfWeek.getFullYear()
          return weekRange
        } else {
          const weekRange = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' – ' + endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + startOfWeek.getFullYear()
          return weekRange
        }
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'year':
        return currentDate.getFullYear().toString()
      default:
        return ''
    }
  }

  const loadCalendars = async () => {
    try {
      setLoadingCalendars(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/calendars', {
        headers: {
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCalendars(data.calendars || [])
      } else {
        console.error('Failed to load calendars:', response.statusText)
        setCalendars([])
      }
    } catch (error) {
      console.error('Error loading calendars:', error)
      setCalendars([])
    } finally {
      setLoadingCalendars(false)
    }
  }

  const toggleCalendarVisibility = async (calendarId: string, isVisible: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/calendars', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        },
        body: JSON.stringify({
          calendarId,
          updates: { is_visible: isVisible }
        })
      })
      
      if (response.ok) {
        setCalendars(prev => prev.map(cal => 
          cal.id === calendarId ? { ...cal, is_visible: isVisible } : cal
        ))
      }
    } catch (error) {
      console.error('Error updating calendar visibility:', error)
    }
  }

  const syncGoogleCalendar = async () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }
    if (isSyncing) return
    
    setIsSyncing(true)
    setSyncStatus('syncing')
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : ''
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setSyncStatus('success')
        const message = 'Successfully synced ' + result.calendarsCount + ' calendars and ' + result.totalEvents + ' events'
        toast({
          title: "Calendar Synced",
          description: message,
        })
        loadCalendars()
        // Reload the calendar view to show new events
        // Notify components that events have been refreshed without
        // triggering another sync cycle
        window.dispatchEvent(new Event('calendarEventsSynced'))
      } else {
        const errorData = await response.json()
        setSyncStatus('error')
        toast({
          title: "Sync Failed",
          description: errorData.error || "Failed to sync Google Calendar",
          variant: "destructive"
        })
      }
    } catch (error) {
      setSyncStatus('error')
      console.error('Sync error:', error)
      toast({
        title: "Sync Error",
        description: "Network error while syncing calendar",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncStatus('idle'), 5000)
    }
  }

  // Throttle sync requests to avoid rapid repeated syncing
  const queueSync = () => {
    if (isSyncing || syncTimeoutRef.current) return
    syncTimeoutRef.current = setTimeout(() => {
      syncTimeoutRef.current = null
      syncGoogleCalendar()
    }, 500)
  }

  const clearTableErrorAndRetry = () => {
    toast({
      title: "Retrying Sync",
      description: "Attempting to sync again...",
    })
    syncGoogleCalendar()
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && !loading) {
      // Only load calendars - NO automatic sync
      loadCalendars()
      
      // Only sync when explicit events are triggered by user actions
      const handleEventCreated = () => {
        console.log("Event created, queueing sync...")
        queueSync()
      }

      const handleEventUpdated = () => {
        console.log("Event updated, queueing sync...")
        queueSync()
      }

      const handleEventDeleted = () => {
        console.log("Event deleted, queueing sync...")
        queueSync()
      }
      
      // Set up event listeners for specific user actions only
      window.addEventListener('calendarEventCreated', handleEventCreated)
      window.addEventListener('calendarEventUpdated', handleEventUpdated)
      window.addEventListener('calendarEventDeleted', handleEventDeleted)
      
      return () => {
        // Clean up listeners
        window.removeEventListener('calendarEventCreated', handleEventCreated)
        window.removeEventListener('calendarEventUpdated', handleEventUpdated)
        window.removeEventListener('calendarEventDeleted', handleEventDeleted)
      }
    }
  }, [user, loading])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      
      switch (event.key.toLowerCase()) {
        case 'm':
          setCurrentView('month')
          break
        case 'w':
          setCurrentView('week')
          break
        case 'd':
          setCurrentView('day')
          break
        case 'y':
          setCurrentView('year')
          break
        case 't':
          // 't' for today
          setCurrentDate(new Date())
          break
        case 'j':
        case 'arrowleft':
          // Navigate previous
          navigatePrevious()
          break
        case 'k':
        case 'arrowright':
          // Navigate next
          navigateNext()
          break
        default:
          return
      }
      event.preventDefault()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentView, currentDate])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-xl font-medium text-gray-900 dark:text-white">Calendar</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={navigatePrevious} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={navigateNext} className="h-8 w-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={goToToday} className="px-3">
                Today
              </Button>
            </div>
            
            <h2 className="text-xl font-normal text-gray-700 dark:text-gray-300">
              {formatDateRange()}
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="px-3 border-blue-500 text-blue-600 hover:bg-blue-50"
              onClick={syncGoogleCalendar}
              disabled={isSyncing}
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : syncStatus === 'success' ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
              ) : syncStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {syncStatus === 'syncing' ? 'Syncing...' : 'Manual Sync'}
            </Button>
            
            <Button variant="ghost" size="sm" className="px-3">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="px-3">
                  {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCurrentView('day')}>
                  Day <span className="ml-auto text-xs text-gray-500">D</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView('week')}>
                  Week <span className="ml-auto text-xs text-gray-500">W</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView('month')}>
                  Month <span className="ml-auto text-xs text-gray-500">M</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentView('year')}>
                  Year <span className="ml-auto text-xs text-gray-500">Y</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        <div className="hidden lg:flex w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-col">
          <div className="p-4">
            <Button 
              onClick={() => setSelectedDate(new Date())} 
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-3" />
              Create
            </Button>
          </div>

          {/* Mini Calendar - Fixed section */}
          <div className="px-4 pb-6">
            <div className="bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={navigatePrevious} className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={navigateNext} className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              {/* Compact mini calendar grid */}
              <div className="grid grid-cols-7 gap-0 text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-gray-500 py-1 font-medium text-xs">
                    {day}
                  </div>
                ))}
                {/* Mini calendar days */}
                {(() => {
                  const year = currentDate.getFullYear()
                  const month = currentDate.getMonth()
                  const firstDay = new Date(year, month, 1).getDay()
                  const daysInMonth = new Date(year, month + 1, 0).getDate()
                  const prevMonth = new Date(year, month, 0)
                  const daysInPrevMonth = prevMonth.getDate()
                  
                  const days = []
                  
                  // Previous month days
                  for (let i = firstDay - 1; i >= 0; i--) {
                    const date = new Date(year, month - 1, daysInPrevMonth - i)
                    days.push({ date, isCurrentMonth: false })
                  }
                  
                  // Current month days
                  for (let i = 1; i <= daysInMonth; i++) {
                    const date = new Date(year, month, i)
                    days.push({ date, isCurrentMonth: true })
                  }
                  
                  // Next month days to fill the grid
                  const remainingDays = 35 - days.length
                  for (let i = 1; i <= remainingDays; i++) {
                    const date = new Date(year, month + 1, i)
                    days.push({ date, isCurrentMonth: false })
                  }
                  
                  return days.map((day, i) => {
                    const isToday = day.date.toDateString() === new Date().toDateString()
                    const isSelected = day.date.toDateString() === currentDate.toDateString()
                    
                    return (
                      <button
                        key={i}
                        className={`text-center py-1 text-xs rounded-full w-6 h-6 mx-auto flex items-center justify-center ${
                          isToday
                            ? 'bg-blue-600 text-white'
                            : isSelected
                            ? 'bg-gray-200 dark:bg-gray-700'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        } ${
                          day.isCurrentMonth
                            ? 'text-gray-900 dark:text-gray-100'
                            : 'text-gray-400 dark:text-gray-600'
                        }`}
                        onClick={() => setCurrentDate(day.date)}
                      >
                        {day.date.getDate()}
                      </button>
                    )
                  })
                })()}
              </div>
            </div>
          </div>

          {/* Scrollable Calendar List */}
          <div className="px-4 overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 300px)" }}>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search for people"
                className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">My calendars</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-1">
                {loadingCalendars ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Loading calendars...</div>
                ) : calendars.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No calendars found. Try syncing your Google Calendar.</div>
                ) : (
                  calendars.map((calendar) => (
                    <div
                      key={calendar.id}
                      className="flex items-center py-1.5 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer"
                      onClick={() => toggleCalendarVisibility(calendar.id, !calendar.is_visible)}
                    >
                      <input
                        type="checkbox"
                        checked={calendar.is_visible}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleCalendarVisibility(calendar.id, e.target.checked)
                        }}
                        className="h-3.5 w-3.5 rounded border-2"
                        style={{ 
                          borderColor: calendar.color,
                          backgroundColor: calendar.is_visible ? calendar.color : 'transparent',
                          accentColor: calendar.color
                        }}
                      />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {calendar.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Other calendars</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
          <CalendarView 
            currentDate={currentDate}
            currentView={currentView}
            onDateClick={handleDateClick}
            onDateChange={setCurrentDate}
            calendars={calendars}
          />
        </div>
      </div>

      {selectedDate && <GoogleCalendarModal selectedDate={selectedDate} onClose={handleCloseModal} />}
      {showSettings && <CalendarSettings onClose={handleCloseSettings} />}
      <MobileNavigation />
    </div>
  )
} 