"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { CalendarView } from "@/components/calendar-view"
import { GoogleCalendarModal } from "@/components/google-calendar-modal"
import { CalendarSettings } from "@/components/calendar-settings"
import { MobileNavigation } from "@/components/mobile-navigation"
import { EnhancedAIAssistant } from "@/components/enhanced-ai-assistant"
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

type ViewType = 'day' | 'week' | 'month' | 'year'

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [currentView, setCurrentView] = useState<ViewType>('month')
  const [showSettings, setShowSettings] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const router = useRouter()
  const { user, loading } = useAuth()

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

  // Sync Google Calendar
  const syncGoogleCalendar = async () => {
    if (isSyncing) return
    
    setIsSyncing(true)
    setSyncStatus('syncing')
    
    try {
      console.log('Starting manual calendar sync...')
      
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Sync response status:', response.status)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Sync result:', result)
        setSyncStatus('success')
        setLastSyncTime(new Date())
        toast({
          title: "Calendar Synced",
          description: `Successfully synced ${result.totalEvents} events from ${result.calendarsCount} calendars`,
        })
        
        // Refresh the page to show new events
        window.location.reload()
      } else {
        const errorData = await response.json()
        console.error('Sync failed:', errorData)
        setSyncStatus('error')
        toast({
          title: "Sync Failed",
          description: errorData.error || "Failed to sync Google Calendar",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
      toast({
        title: "Sync Error",
        description: "Network error while syncing calendar",
        variant: "destructive"
      })
    } finally {
      setIsSyncing(false)
      // Reset status after 5 seconds
      setTimeout(() => setSyncStatus('idle'), 5000)
    }
  }

  // Navigation functions
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

  // Keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return // Don't handle shortcuts when typing in inputs
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
        goToToday()
        break
      case 'arrowleft':
        navigatePrevious()
        break
      case 'arrowright':
        navigateNext()
        break
      case 'c':
        if (event.ctrlKey || event.metaKey) return // Don't interfere with copy
        setSelectedDate(new Date())
        break
    }
  }, [currentView, currentDate])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

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
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'long' })} ${startOfWeek.getDate()} – ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`
        } else {
          return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${startOfWeek.getFullYear()}`
        }
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'year':
        return currentDate.getFullYear().toString()
      default:
        return ''
    }
  }

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
      {/* Single Header - Google Calendar Style */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left section */}
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

          {/* Right section */}
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-3"
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
              {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Calendar'}
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

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleOpenSettings}>
              <Settings className="w-4 h-4" />
            </Button>

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
        {/* Left Sidebar - Google Calendar Style */}
        <div className="hidden lg:flex w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex-col">
          {/* Create Button */}
          <div className="p-4">
            <Button 
              onClick={() => setSelectedDate(new Date())} 
              className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5 mr-3" />
              Create
            </Button>
          </div>

          {/* Mini Calendar */}
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
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6)
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth()
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isSelected = date.toDateString() === currentDate.toDateString()
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentDate(date)}
                      className={`
                        text-xs h-6 w-6 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                        ${!isCurrentMonth ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-gray-100'}
                        ${isToday ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                        ${isSelected && !isToday ? 'bg-gray-200 dark:bg-gray-700' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search for people"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Scrollable calendar lists */}
          <div className="flex-1 overflow-y-auto">
            {/* My Calendars */}
            <div className="px-4 pb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">My calendars</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3 h-3 rounded text-blue-600" />
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Personal</span>
                </div>
                <div className="flex items-center space-x-3 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3 h-3 rounded text-green-600" />
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Work</span>
                </div>
                <div className="flex items-center space-x-3 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3 h-3 rounded text-red-600" />
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Health</span>
                </div>
                <div className="flex items-center space-x-3 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3 h-3 rounded text-purple-600" />
                  <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Social</span>
                </div>
              </div>
            </div>

            {/* Other Calendars */}
            <div className="px-4 pb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Other calendars</h3>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3 h-3 rounded text-green-600" />
                  <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Holidays in United States</span>
                </div>
                <div className="flex items-center space-x-3 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input type="checkbox" className="w-3 h-3 rounded text-orange-600" />
                  <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">Birthdays</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar Content */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          <CalendarView 
            currentDate={currentDate}
            currentView={currentView}
            onDateClick={handleDateClick}
            onDateChange={setCurrentDate}
          />
        </div>
      </div>

      {/* Event Modal */}
      {selectedDate && <GoogleCalendarModal selectedDate={selectedDate} onClose={handleCloseModal} />}

      {/* Settings Modal */}
      {showSettings && <CalendarSettings onClose={handleCloseSettings} />}

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* AI Assistant */}
      <EnhancedAIAssistant />

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-2 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
        Press M/W/D/Y to switch views, T for today, ← → to navigate
      </div>
    </div>
  )
}
