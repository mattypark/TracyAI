"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { X, Clock, MapPin, Users, Link as LinkIcon, Calendar, Bell } from "lucide-react"

interface GoogleCalendarModalProps {
  selectedDate: Date
  onClose: () => void
}

interface EventFlag {
  id: string
  name: string
  color: string
}

const defaultColors = [
  { name: "Red", value: "#EF4444", class: "bg-red-500" },
  { name: "Blue", value: "#3B82F6", class: "bg-blue-500" },
  { name: "Green", value: "#10B981", class: "bg-green-500" },
  { name: "Yellow", value: "#F59E0B", class: "bg-yellow-500" },
  { name: "Purple", value: "#8B5CF6", class: "bg-purple-500" },
  { name: "Orange", value: "#F97316", class: "bg-orange-500" },
  { name: "Pink", value: "#EC4899", class: "bg-pink-500" },
  { name: "Indigo", value: "#6366F1", class: "bg-indigo-500" },
]

// Default flags that work immediately without database
const DEFAULT_FLAGS = [
  { id: "default-work", name: "Work", color: "#3B82F6" },
  { id: "default-personal", name: "Personal", color: "#10B981" },
  { id: "default-health", name: "Health", color: "#EF4444" },
  { id: "default-social", name: "Social", color: "#8B5CF6" },
]

export function GoogleCalendarModal({ selectedDate, onClose }: GoogleCalendarModalProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [userFlags, setUserFlags] = useState<EventFlag[]>(DEFAULT_FLAGS)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    date: selectedDate.toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    allDay: false,
    description: "",
    location: "",
    guests: "",
    meetingLink: "",
    flagId: "",
    flagColor: "#3B82F6",
    notification: "10",
    repeat: "never",
    visibility: "default",
  })

  useEffect(() => {
    // Just use default flags - no database calls
    setUserFlags(DEFAULT_FLAGS)
    
    // Set default times
    const now = new Date()
    const startTime = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour duration
    
    setFormData(prev => ({
      ...prev,
      startTime: startTime.toTimeString().slice(0, 5),
      endTime: endTime.toTimeString().slice(0, 5),
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    try {
      let startDateTime, endDateTime

      if (formData.allDay) {
        // For all-day events, use the date only
        const date = new Date(formData.date)
        startDateTime = new Date(date.setHours(0, 0, 0, 0))
        endDateTime = new Date(date.setHours(23, 59, 59, 999))
      } else {
        if (!formData.startTime || !formData.endTime) {
          console.log("Using default times for event")
          const now = new Date()
          const defaultStart = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
          const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000) // 1 hour duration
          startDateTime = new Date(`${formData.date}T${defaultStart.toTimeString().slice(0, 5)}`)
          endDateTime = new Date(`${formData.date}T${defaultEnd.toTimeString().slice(0, 5)}`)
        } else {
          startDateTime = new Date(`${formData.date}T${formData.startTime}`)
          endDateTime = new Date(`${formData.date}T${formData.endTime}`)
        }
      }

      // Use the new calendar events API
      const { apiPost } = await import('@/lib/api-client')
      const response = await apiPost('/api/calendar/events', {
        title: formData.title.trim(),
        description: formData.description || "",
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location: formData.location || "",
        attendees: formData.guests || "",
        meetingLink: formData.meetingLink || "",
        allDay: formData.allDay,
        flag: userFlags.find(f => f.id === formData.flagId)?.name || "personal",
        flagColor: userFlags.find(f => f.id === formData.flagId)?.color || "#3B82F6",
        reminderMinutes: parseInt(formData.notification) || 10,
        visibility: formData.visibility
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create event')
      }

      const result = await response.json()
      console.log("Event created successfully:", result)
      
      // Trigger a custom event to refresh the calendar view
      window.dispatchEvent(new CustomEvent('calendarEventCreated'))
      
      onClose()
    } catch (error) {
      console.error("Error creating event:", error)
      // Show error to user
      alert(`Error creating event: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full ${showMoreOptions ? "max-w-2xl" : "max-w-md"} bg-white dark:bg-gray-900 rounded-lg shadow-xl transition-all duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateHeader(selectedDate)}
                </span>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Title */}
              <div>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Add title"
                  className="text-lg font-medium border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400 bg-transparent"
                  required
                />
              </div>

              {/* Date and Time */}
              <div className="flex items-center space-x-4">
                <Clock className="w-4 h-4 text-gray-500" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="border-0 px-0 focus-visible:ring-0 bg-transparent"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="border-0 px-0 focus-visible:ring-0 bg-transparent"
                    />
                  </div>
                  
                  {!formData.allDay && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                        className="border-0 px-0 focus-visible:ring-0 w-20 bg-transparent"
                      />
                      <span className="text-gray-500">–</span>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                        className="border-0 px-0 focus-visible:ring-0 w-20 bg-transparent"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.allDay}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allDay: checked }))}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">All day</span>
                  </div>
                </div>
              </div>

              {showMoreOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Add Google Meet */}
                  <div className="flex items-center space-x-4">
                    <LinkIcon className="w-4 h-4 text-gray-500" />
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 px-0"
                      onClick={() => setFormData(prev => ({ 
                        ...prev, 
                        meetingLink: "https://meet.google.com/new" 
                      }))}
                    >
                      Add Google Meet video conferencing
                    </Button>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-4 h-4 text-gray-500 mt-2" />
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Add location"
                      className="border-0 px-0 focus-visible:ring-0 bg-transparent"
                    />
                  </div>

                  {/* Guests */}
                  <div className="flex items-start space-x-4">
                    <Users className="w-4 h-4 text-gray-500 mt-2" />
                    <Input
                      value={formData.guests}
                      onChange={(e) => setFormData(prev => ({ ...prev, guests: e.target.value }))}
                      placeholder="Add guests"
                      className="border-0 px-0 focus-visible:ring-0 bg-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div className="flex items-start space-x-4">
                    <div className="w-4 h-4 mt-2" />
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Add description"
                      className="border-0 px-0 focus-visible:ring-0 resize-none bg-transparent"
                      rows={3}
                    />
                  </div>

                  {/* Calendar/Flag Selection */}
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium">Calendar</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {userFlags.map((flag) => (
                          <button
                            key={flag.id}
                            type="button"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              flagId: flag.id, 
                              flagColor: flag.color 
                            }))}
                            className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${
                              formData.flagId === flag.id
                                ? "border-gray-900 dark:border-gray-100 bg-gray-100 dark:bg-gray-800"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: flag.color }}
                            />
                            <span>{flag.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="flex items-center space-x-4">
                    <Bell className="w-4 h-4 text-gray-500" />
                    <select
                      value={formData.notification}
                      onChange={(e) => setFormData(prev => ({ ...prev, notification: e.target.value }))}
                      className="border-0 bg-transparent focus:outline-none text-sm"
                    >
                      <option value="0">At time of event</option>
                      <option value="10">10 minutes before</option>
                      <option value="30">30 minutes before</option>
                      <option value="60">1 hour before</option>
                      <option value="1440">1 day before</option>
                    </select>
                  </div>

                  {/* Visibility */}
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4" />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Visibility:</span>
                      <select
                        value={formData.visibility}
                        onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
                        className="border-0 bg-transparent focus:outline-none text-sm"
                      >
                        <option value="default">Default visibility</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {showMoreOptions ? "Fewer options" : "More options"}
                </Button>
                
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.title.trim()}
                    className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 border-0"
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 