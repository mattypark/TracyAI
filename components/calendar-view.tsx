"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EventDetailsPopup } from "./event-details-popup"
import { EventEditModal } from "./event-edit-modal"
import { EventsListModal } from "./events-list-modal"

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
  const [eventsListModal, setEventsListModal] = useState<{ date: Date; events: CalendarEvent[] } | null>(null)

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

  const formatEventTime = (startTime: string, endTime: string, allDay: boolean) => {
    if (allDay) return "All day"
    
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    const startStr = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    // If same day and less than 24 hours, show end time
    if (end.getTime() - start.getTime() < 24 * 60 * 60 * 1000) {
      const endStr = end.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
      return `${startStr} - ${endStr}`
    }
    
    return startStr
  }

  const showEventsListModal = (date: Date, events: CalendarEvent[]) => {
    setEventsListModal({ date, events })
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
    // If it's already a hex color, return it directly for inline styles
    if (color.startsWith('#')) {
      return color
    }
    
    // Fallback for old color names - return hex colors
    const colorMap: { [key: string]: string } = {
      red: "#dc2127",
      blue: "#1a73e8",
      green: "#51b749",
      yellow: "#fbd75b",
      purple: "#dbadff",
      orange: "#ffb878",
      pink: "#ff887c",
      indigo: "#5484ed",
    }
    return colorMap[color] || "#1a73e8"
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
              className="py-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days - Fixed height grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-0">
          {days.map((day, index) => (
            <div
              key={index}
              className={`border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0 p-1 min-h-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                day.date ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
              }`}
              onClick={() => day.date && onDateClick(day.date)}
            >
              {day.date && (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-start mb-1">
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

                  {/* Events - Limited to prevent overflow */}
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {day.events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate`}
                        style={{ 
                          backgroundColor: getFlagColorClass(event.flag_color) + '40', // Add transparency
                          borderLeft: `3px solid ${getFlagColorClass(event.flag_color)}`,
                          color: '#333'
                        }}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="flex items-center gap-1">
                          <span className="truncate font-medium">{event.title}</span>
                        </div>
                        {!event.all_day && (
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {new Date(event.start_time).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <button
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation()
                          showEventsListModal(day.date, day.events)
                        }}
                      >
                        +{day.events.length - 2} more
                      </button>
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

    // Helper function to calculate event position and height
    const getEventStyle = (event: CalendarEvent) => {
      const start = new Date(event.start_time)
      const end = new Date(event.end_time)
      
      const startHour = start.getHours() + start.getMinutes() / 60
      const endHour = end.getHours() + end.getMinutes() / 60
      
      const top = startHour * 48 // 48px per hour
      const height = Math.max((endHour - startHour) * 48, 20) // Minimum height of 20px
      
      return {
        top: `${top}px`,
        height: `${height}px`,
        minHeight: '20px'
      }
    }

    // Group overlapping events
    const getEventColumns = (dayEvents: CalendarEvent[]) => {
      const sortedEvents = [...dayEvents].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
      
      const columns: CalendarEvent[][] = []
      
      sortedEvents.forEach(event => {
        let placed = false
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i]
          const lastEvent = column[column.length - 1]
          const lastEventEnd = new Date(lastEvent.end_time).getTime()
          const eventStart = new Date(event.start_time).getTime()
          
          if (eventStart >= lastEventEnd) {
            column.push(event)
            placed = true
            break
          }
        }
        
        if (!placed) {
          columns.push([event])
        }
      })
      
      return columns
    }

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
          <div className="relative">
            <div className="grid grid-cols-8" style={{ height: `${24 * 48}px` }}>
              {/* Time labels */}
              <div className="w-16">
                {hours.map((hour) => (
                  <div key={hour} className="h-12 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 pr-2 text-right">
                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDate(day).filter(event => !event.all_day)
                const allDayEvents = getEventsForDate(day).filter(event => event.all_day)
                const eventColumns = getEventColumns(dayEvents)
                
                return (
                  <div key={dayIndex} className="border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative">
                    {/* Hour lines */}
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-12 border-b border-gray-200 dark:border-gray-700"
                      />
                    ))}
                    
                    {/* All-day events at the top */}
                    {allDayEvents.length > 0 && (
                      <div className="absolute top-0 left-0 right-0 bg-blue-100 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-800 p-1 z-20">
                        {allDayEvents.map(event => (
                          <div
                            key={event.id}
                            className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate cursor-pointer hover:opacity-80"
                            onClick={(e) => handleEventClick(event, e)}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Timed events */}
                    {eventColumns.map((column, columnIndex) => {
                      const columnWidth = 100 / eventColumns.length
                      const leftOffset = columnIndex * columnWidth
                      
                      return column.map(event => {
                        const style = getEventStyle(event)
                        
                        return (
                          <div
                            key={event.id}
                            className="absolute cursor-pointer hover:opacity-90 rounded p-1 text-xs overflow-hidden z-10"
                            style={{
                              ...style,
                              left: `${leftOffset}%`,
                              width: `${columnWidth - 1}%`,
                              backgroundColor: getFlagColorClass(event.flag_color),
                              color: '#ffffff',
                              borderLeft: `2px solid ${getFlagColorClass(event.flag_color)}`
                            }}
                            onClick={(e) => handleEventClick(event, e)}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-[10px] opacity-90">
                              {new Date(event.start_time).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </div>
                          </div>
                        )
                      })
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Day View Component
  const DayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i)
    const dayEvents = getEventsForDate(currentDate).filter(event => !event.all_day)
    const allDayEvents = getEventsForDate(currentDate).filter(event => event.all_day)

    // Helper function to calculate event position and height
    const getEventStyle = (event: CalendarEvent) => {
      const start = new Date(event.start_time)
      const end = new Date(event.end_time)
      
      const startHour = start.getHours() + start.getMinutes() / 60
      const endHour = end.getHours() + end.getMinutes() / 60
      
      const top = startHour * 48 // 48px per hour
      const height = Math.max((endHour - startHour) * 48, 20) // Minimum height of 20px
      
      return {
        top: `${top}px`,
        height: `${height}px`,
        minHeight: '20px'
      }
    }

    // Group overlapping events
    const getEventColumns = (events: CalendarEvent[]) => {
      const sortedEvents = [...events].sort((a, b) => 
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
      
      const columns: CalendarEvent[][] = []
      
      sortedEvents.forEach(event => {
        let placed = false
        for (let i = 0; i < columns.length; i++) {
          const column = columns[i]
          const lastEvent = column[column.length - 1]
          const lastEventEnd = new Date(lastEvent.end_time).getTime()
          const eventStart = new Date(event.start_time).getTime()
          
          if (eventStart >= lastEventEnd) {
            column.push(event)
            placed = true
            break
          }
        }
        
        if (!placed) {
          columns.push([event])
        }
      })
      
      return columns
    }

    const eventColumns = getEventColumns(dayEvents)

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
                <div key={hour} className="h-12 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 pr-2 text-right">
                  {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                </div>
              ))}
            </div>

            {/* Day column */}
            <div className="flex-1 border-r border-gray-200 dark:border-gray-700 relative" style={{ height: `${24 * 48}px` }}>
              {/* Hour lines */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-12 border-b border-gray-200 dark:border-gray-700"
                />
              ))}
              
              {/* All-day events at the top */}
              {allDayEvents.length > 0 && (
                <div className="absolute top-0 left-0 right-0 bg-blue-100 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-800 p-2 z-20">
                  {allDayEvents.map(event => (
                    <div
                      key={event.id}
                      className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1 cursor-pointer hover:opacity-80"
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Timed events */}
              {eventColumns.map((column, columnIndex) => {
                const columnWidth = 100 / eventColumns.length
                const leftOffset = columnIndex * columnWidth
                
                return column.map(event => {
                  const style = getEventStyle(event)
                  
                  return (
                    <div
                      key={event.id}
                      className="absolute cursor-pointer hover:opacity-90 rounded p-2 overflow-hidden z-10"
                      style={{
                        ...style,
                        left: `${leftOffset}%`,
                        width: `${columnWidth - 1}%`,
                        backgroundColor: getFlagColorClass(event.flag_color),
                        color: '#ffffff',
                        borderLeft: `3px solid ${getFlagColorClass(event.flag_color)}`
                      }}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      <div className="font-medium text-sm mb-1">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {formatEventTime(event.start_time, event.end_time, false)}
                      </div>
                      {event.location && (
                        <div className="text-xs opacity-75 truncate mt-1">
                          📍 {event.location}
                        </div>
                      )}
                    </div>
                  )
                })
              })}
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

      {/* Events List Modal */}
      {eventsListModal && (
        <EventsListModal
          date={eventsListModal.date}
          events={eventsListModal.events}
          onClose={() => setEventsListModal(null)}
          onEventClick={handleEventClick}
          onEditEvent={(event) => {
            setEventsListModal(null)
            handleEditEvent(event)
          }}
          onDeleteEvent={(eventId) => {
            handleDeleteEvent(eventId)
            setEventsListModal(null)
          }}
        />
      )}
    </>
  )
}
