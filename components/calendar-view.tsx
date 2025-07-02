"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EventDetailsPopup } from "./event-details-popup"
import { EventEditModal } from "./event-edit-modal"

interface CalendarEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  flag_color: string
  flag_name: string
  all_day?: boolean
  description: string
  location: string
  source: string
  attendees?: string
  meetingLink?: string
}

interface CalendarViewProps {
  currentDate: Date
  currentView: 'day' | 'week' | 'month' | 'year'
  onDateClick: (date: Date) => void
  onDateChange: Dispatch<SetStateAction<Date>>
}

export function CalendarView({ currentDate, currentView, onDateClick, onDateChange }: CalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    loadEvents()
  }, [currentDate, currentView])

  useEffect(() => {
    // Listen for calendar event creation to refresh the view
    const handleEventCreated = () => {
      loadEvents()
    }

    window.addEventListener('calendarEventCreated', handleEventCreated)
    
    return () => {
      window.removeEventListener('calendarEventCreated', handleEventCreated)
    }
  }, [])

  const loadEvents = async () => {
    try {
      // Load events from the new API that includes both Google and local events
      const { apiGet } = await import('@/lib/api-client')
      const response = await apiGet('/api/calendar/events')
      
      if (!response.ok) {
        console.error('Failed to fetch events:', response.statusText)
        setEvents([])
        return
      }
      
      const data = await response.json()
      
      // Transform the data to match our interface
      const transformedEvents: CalendarEvent[] = (data.events || []).map((event: any) => ({
        id: event.id || event.google_event_id,
        title: event.title || event.summary || 'Untitled Event',
        start_time: event.start_time,
        end_time: event.end_time,
        flag_color: event.calendar_color || event.flag_color || 'blue',
        flag_name: event.calendar_name || event.flag_name || 'Event',
        all_day: event.all_day || false,
        description: event.description || '',
        location: event.location || '',
        source: event.source || 'local',
        attendees: event.attendees || '',
        meetingLink: event.meetingLink || ''
      }))
      
      setEvents(transformedEvents)
    } catch (error) {
      console.error("Error loading events:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleEventClick = (event: CalendarEvent, clickEvent: React.MouseEvent) => {
    clickEvent.stopPropagation()
    setSelectedEvent(event)
    setPopupPosition({ 
      x: clickEvent.clientX, 
      y: clickEvent.clientY 
    })
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(null)
    setEditingEvent(event)
  }

  const handleSaveEvent = async (eventData: any) => {
    try {
      const { apiPut } = await import('@/lib/api-client')
      await apiPut(`/api/calendar/events/${eventData.id}`, eventData)
      setEditingEvent(null)
      loadEvents() // Refresh the events
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { apiDelete } = await import('@/lib/api-client')
      await apiDelete(`/api/calendar/events/${eventId}`)
      loadEvents() // Refresh the events
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const getFlagColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      pink: "bg-pink-500",
      indigo: "bg-indigo-500",
    }
    return colorMap[color] || "bg-gray-500"
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Month View Component
  const MonthView = () => {
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear()
      const month = date.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDayOfMonth = new Date(year, month, 1).getDay()

      const days = []

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push({ day: "", date: null, events: [] })
      }

      // Add days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month, i)
        const dayEvents = getEventsForDate(currentDate)
        days.push({
          day: i,
          date: currentDate,
          events: dayEvents,
        })
      }

      return days
    }

    const days = getDaysInMonth(currentDate)
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <div className="h-full flex flex-col">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {weekdays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {days.map((day, index) => (
            <div
              key={index}
              className={`border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0 p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                day.date ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
              }`}
              onClick={() => day.date && onDateClick(day.date)}
            >
              {day.date && (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-sm font-medium ${
                        isToday(day.date)
                          ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          : "text-gray-900 dark:text-gray-100"
                      }`}
                    >
                      {day.day}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {day.events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`flex items-center space-x-1 text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${
                          event.all_day ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-800'
                        }`}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className={`w-2 h-2 rounded-full ${getFlagColorClass(event.flag_color)}`}></div>
                        <span className="truncate font-medium">{event.title}</span>
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Week View Component
  const WeekView = () => {
    const getWeekDays = () => {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      
      const days = []
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek)
        day.setDate(startOfWeek.getDate() + i)
        days.push(day)
      }
      return days
    }

    const weekDays = getWeekDays()
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="h-full flex flex-col">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
          <div className="w-16"></div> {/* Time column header */}
          {weekDays.map((day, index) => (
            <div key={index} className="py-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-medium ${
                isToday(day) ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 auto-rows-fr min-h-[1200px]">
            {/* Time labels */}
            <div className="w-16">
              {hours.map((hour) => (
                <div key={hour} className="h-12 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 pr-2 text-right flex items-start pt-1">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      const clickedTime = new Date(day)
                      clickedTime.setHours(hour, 0, 0, 0)
                      onDateClick(clickedTime)
                    }}
                  >
                    {/* Events would be positioned here */}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Day View Component
  const DayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayEvents = getEventsForDate(currentDate)

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div className={`text-2xl font-medium ${
              isToday(currentDate) ? 'bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto' : 'text-gray-900 dark:text-gray-100'
            }`}>
              {currentDate.getDate()}
            </div>
          </div>
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-auto">
          <div className="flex">
            {/* Time labels */}
            <div className="w-16">
              {hours.map((hour) => (
                <div key={hour} className="h-12 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 pr-2 text-right flex items-start pt-1">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day column */}
            <div className="flex-1 border-r border-gray-200 dark:border-gray-700">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-12 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors relative"
                  onClick={() => {
                    const clickedTime = new Date(currentDate)
                    clickedTime.setHours(hour, 0, 0, 0)
                    onDateClick(clickedTime)
                  }}
                >
                  {/* Events would be positioned here */}
                  {dayEvents
                    .filter(event => new Date(event.start_time).getHours() === hour)
                    .map(event => (
                      <div
                        key={event.id}
                        className={`absolute left-1 right-1 top-1 bottom-1 rounded p-1 text-xs font-medium cursor-pointer hover:opacity-80 ${
                          event.all_day ? 'bg-blue-100 dark:bg-blue-900' : 'bg-green-100 dark:bg-green-900'
                        }`}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${getFlagColorClass(event.flag_color)}`}></div>
                          <span className="truncate">{event.title}</span>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Year View Component
  const YearView = () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentDate.getFullYear(), i, 1)
      return date
    })

    const getMonthDays = (monthDate: Date) => {
      const year = monthDate.getFullYear()
      const month = monthDate.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      const firstDayOfMonth = new Date(year, month, 1).getDay()

      const days = []
      
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null)
      }

      // Add days of the month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i))
      }

      return days
    }

    return (
      <div className="h-full overflow-auto p-4">
        <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
          {months.map((month, monthIndex) => {
            const monthDays = getMonthDays(month)
            const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

            return (
              <div key={monthIndex} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="text-center mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {month.toLocaleDateString('en-US', { month: 'long' })}
                  </h3>
                </div>

                {/* Mini month grid */}
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {weekdays.map((day) => (
                    <div key={day} className="text-center text-gray-500 dark:text-gray-400 py-1 font-medium">
                      {day}
                    </div>
                  ))}

                  {monthDays.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`text-center py-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
                        day
                          ? isToday(day)
                            ? 'bg-blue-600 text-white rounded-full'
                            : 'text-gray-900 dark:text-gray-100'
                          : ''
                      }`}
                      onClick={() => day && onDateClick(day)}
                    >
                      {day ? day.getDate() : ''}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="h-full bg-white dark:bg-gray-900"
      >
        {currentView === 'month' && <MonthView />}
        {currentView === 'week' && <WeekView />}
        {currentView === 'day' && <DayView />}
        {currentView === 'year' && <YearView />}
      </motion.div>

      {/* Event Details Popup */}
      {selectedEvent && (
        <EventDetailsPopup
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          position={popupPosition}
        />
      )}

      {/* Event Edit Modal */}
      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={handleSaveEvent}
        />
      )}
    </>
  )
}
