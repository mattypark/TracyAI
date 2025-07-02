"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CalendarEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  flag_color: string
  flag_name: string
  location?: string
  guests?: string
}

export function UpcomingEventsSidebar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUpcomingEvents()
  }, [])

  const loadUpcomingEvents = async () => {
    try {
      // Load actual upcoming events from database
      const { db } = await import("@/lib/database")
      const upcomingEvents = await db.getUpcomingEvents(7) // Get events for next 7 days
      
      // Transform the data to match our interface
      const transformedEvents: CalendarEvent[] = upcomingEvents.map(event => ({
        id: event.id,
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
        flag_color: event.flag_color || 'blue',
        flag_name: event.flag_name || 'Event'
      }))
      
      setEvents(transformedEvents)
    } catch (error) {
      console.error("Error loading upcoming events:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Events</h2>

        {events.length === 0 ? (
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">No events yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start organizing your schedule by adding your first event
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getFlagColorClass(event.flag_color)} mt-1.5`}></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{event.title}</h3>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{formatDate(event.start_time)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>
                              {formatTime(event.start_time)} - {formatTime(event.end_time)}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                          {event.guests && (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Users className="w-4 h-4 mr-2" />
                              <span className="truncate">{event.guests}</span>
                            </div>
                          )}
                        </div>
                        {event.flag_name && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                              {event.flag_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
