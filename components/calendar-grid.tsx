"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CalendarEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  flag_color: string
  flag_name: string
}

interface CalendarGridProps {
  onDateClick: (date: Date) => void
}

export function CalendarGrid({ onDateClick }: CalendarGridProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [currentMonth])

  const loadEvents = async () => {
    try {
      // Load actual events from database
      const { db } = await import("@/lib/database")
      const loadedEvents = await db.getCalendarEvents()
      
      // Transform the data to match our interface
      const transformedEvents: CalendarEvent[] = loadedEvents.map(event => ({
        id: event.id,
        title: event.title,
        start_time: event.start_time,
        end_time: event.end_time,
        flag_color: event.flag_color || 'blue',
        flag_name: event.flag_name || 'Event'
      }))
      
      setEvents(transformedEvents)
    } catch (error) {
      console.error("Error loading events:", error)
      setEvents([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

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

  const days = getDaysInMonth(currentMonth)
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{formatMonth(currentMonth)}</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="h-10 w-10 bg-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(new Date())} className="px-4">
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="h-10 w-10 bg-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1 border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {weekdays.map((day) => (
              <div
                key={day}
                className="py-4 text-center text-sm font-semibold text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
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
                            ? "bg-black dark:bg-white text-white dark:text-black rounded-full w-6 h-6 flex items-center justify-center"
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
                          className="flex items-center space-x-1 text-xs p-1 rounded truncate"
                          style={{ backgroundColor: `${getFlagColorClass(event.flag_color).replace("bg-", "")}20` }}
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
      </Card>
    </motion.div>
  )
}
