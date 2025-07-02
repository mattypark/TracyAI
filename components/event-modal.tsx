"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/database"

interface EventModalProps {
  selectedDate: Date
  onClose: () => void
}

const eventFlags = [
  { name: "Work", color: "blue" },
  { name: "Personal", color: "green" },
  { name: "Health", color: "red" },
  { name: "Social", color: "purple" },
  { name: "Family", color: "orange" },
  { name: "Education", color: "indigo" },
  { name: "Travel", color: "pink" },
  { name: "Finance", color: "yellow" },
]

export function EventModal({ selectedDate, onClose }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    flagName: "",
    flagColor: "",
    guests: "",
    location: "",
    link: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.startTime || !formData.endTime) return

    setLoading(true)
    try {
      const startDateTime = new Date(`${selectedDate.toISOString().split("T")[0]}T${formData.startTime}`)
      const endDateTime = new Date(`${selectedDate.toISOString().split("T")[0]}T${formData.endTime}`)

      await db.createCalendarEvent({
        title: formData.title,
        description: formData.description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        flag_name: formData.flagName,
        flag_color: formData.flagColor,
        guests: formData.guests,
        location: formData.location,
        link: formData.link,
      })

      onClose()
      
      // Trigger a custom event to refresh the calendar view
      window.dispatchEvent(new CustomEvent('calendarEventCreated'))
    } catch (error) {
      console.error("Error creating event:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFlagSelect = (flagName: string) => {
    const flag = eventFlags.find((f) => f.name === flagName)
    if (flag) {
      setFormData((prev) => ({
        ...prev,
        flagName: flag.name,
        flagColor: flag.color,
      }))
    }
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
          className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Add Event -{" "}
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Event Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Start Time *</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">End Time *</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Flag/Category</label>
                  <Select value={formData.flagName} onValueChange={handleFlagSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventFlags.map((flag) => (
                        <SelectItem key={flag.name} value={flag.name}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full bg-${flag.color}-500`}></div>
                            <span>{flag.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Add event description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Add location"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Guests</label>
                  <Input
                    value={formData.guests}
                    onChange={(e) => setFormData((prev) => ({ ...prev, guests: e.target.value }))}
                    placeholder="Add guest emails (comma separated)"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Meeting Link</label>
                  <Input
                    value={formData.link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                    placeholder="Add Zoom, Meet, or other link"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !formData.title || !formData.startTime || !formData.endTime}
                    className="flex-1 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
                  >
                    {loading ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
