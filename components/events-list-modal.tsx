"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Clock, MapPin, Users, Edit, Trash2 } from "lucide-react"

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

interface EventsListModalProps {
  date: Date
  events: CalendarEvent[]
  onClose: () => void
  onEventClick: (event: CalendarEvent, clickEvent: React.MouseEvent) => void
  onEditEvent: (event: CalendarEvent) => void
  onDeleteEvent: (eventId: string) => void
}

export function EventsListModal({ 
  date, 
  events, 
  onClose, 
  onEventClick, 
  onEditEvent, 
  onDeleteEvent 
}: EventsListModalProps) {
  const formatTime = (timeString: string, allDay: boolean) => {
    if (allDay) return "All day"
    
    const time = new Date(timeString)
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDateRange = (startTime: string, endTime: string, allDay: boolean) => {
    if (allDay) return "All day"
    
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    const startStr = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    const endStr = end.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    return `${startStr} - ${endStr}`
  }

  const getFlagColorClass = (color: string) => {
    // If it's already a hex color, return it directly
    if (color.startsWith('#')) {
      return null // We'll use inline styles instead
    }
    
    // Fallback for old color names
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

  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => {
    if (a.all_day && !b.all_day) return -1
    if (!a.all_day && b.all_day) return 1
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  })

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Events List */}
          <div className="overflow-y-auto max-h-[60vh]">
            {sortedEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={(e) => onEventClick(event, e)}
              >
                <div className="flex items-start space-x-3">
                  {/* Event Color Indicator */}
                  <div 
                    className="w-3 h-3 rounded-full mt-1"
                    style={{ 
                      backgroundColor: event.flag_color.startsWith('#') ? event.flag_color : (getFlagColorClass(event.flag_color) || '#1a73e8')
                    }}
                  ></div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Event Title */}
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {event.title}
                    </h3>
                    
                    {/* Event Time */}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{formatDateRange(event.start_time, event.end_time, event.all_day || false)}</span>
                    </div>
                    
                    {/* Event Location */}
                    {event.location && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    
                    {/* Event Attendees */}
                    {event.attendees && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Users className="w-3 h-3 mr-1" />
                        <span className="truncate">{event.attendees}</span>
                      </div>
                    )}
                    
                    {/* Calendar Name */}
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {event.flag_name || 'Personal'}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditEvent(event)
                      }}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('Are you sure you want to delete this event?')) {
                          onDeleteEvent(event.id)
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 