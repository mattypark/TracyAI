"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Link as LinkIcon, 
  Printer, 
  Copy, 
  Share2, 
  Globe, 
  Settings, 
  Trash2, 
  Edit,
  MoreHorizontal,
  X
} from "lucide-react"

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

interface EventDetailsPopupProps {
  event: CalendarEvent
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onDelete: (eventId: string) => void
  position: { x: number; y: number }
}

export function EventDetailsPopup({ event, onClose, onEdit, onDelete, position }: EventDetailsPopupProps) {
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
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

  const handleDuplicate = async () => {
    try {
      const { apiPost } = await import('@/lib/api-client')
      const duplicatedEvent = {
        title: `${event.title} (Copy)`,
        description: event.description,
        startTime: event.start_time,
        endTime: event.end_time,
        location: event.location,
        attendees: event.attendees || '',
        allDay: event.all_day || false,
        flag: event.flag_name,
      }

      await apiPost('/api/calendar/events', duplicatedEvent)
      window.dispatchEvent(new CustomEvent('calendarEventCreated'))
      onClose()
    } catch (error) {
      console.error('Error duplicating event:', error)
    }
  }

  const handlePrint = () => {
    const printContent = `
      <h2>${event.title}</h2>
      <p><strong>Date:</strong> ${formatDate(event.start_time)}</p>
      <p><strong>Time:</strong> ${event.all_day ? 'All day' : `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}</p>
      ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
      ${event.description ? `<p><strong>Description:</strong> ${event.description}</p>` : ''}
      ${event.attendees ? `<p><strong>Attendees:</strong> ${event.attendees}</p>` : ''}
    `
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print Event - ${event.title}</title></head>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            ${printContent}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const handleCopyToCalendar = (calendarName: string) => {
    // This would copy the event to a different calendar
    console.log(`Copying event to ${calendarName}`)
    // Implementation would depend on available calendars
  }

  const handlePublishEvent = () => {
    // This would make the event public/shareable
    console.log('Publishing event')
    // Implementation for making event public
  }

  const handleChangeOwner = () => {
    // This would allow changing the event owner
    console.log('Changing event owner')
    // Implementation for ownership transfer
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `${event.title} - ${formatDate(event.start_time)} at ${formatTime(event.start_time)}`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      const shareText = `${event.title} - ${formatDate(event.start_time)} at ${formatTime(event.start_time)}`
      navigator.clipboard.writeText(shareText)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-w-sm"
          style={{
            left: Math.min(position.x, window.innerWidth - 320),
            top: Math.min(position.y, window.innerHeight - 400),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0">
            {/* Header */}
            <div className="flex items-start justify-between p-4 pb-2">
              <div className="flex items-start space-x-3 flex-1">
                <div className={`w-4 h-4 rounded-full ${getFlagColorClass(event.flag_color)} mt-1 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {event.all_day ? 'All day' : `${formatTime(event.start_time)} - ${formatTime(event.end_time)}`}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(event.start_time)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Event Details */}
            <div className="px-4 pb-2 space-y-2">
              {event.location && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              )}
              
              {event.attendees && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees}</span>
                </div>
              )}

              {event.meetingLink && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <LinkIcon className="w-4 h-4" />
                  <a href={event.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Join meeting
                  </a>
                </div>
              )}

              {event.description && (
                <div className="text-sm text-gray-600 dark:text-gray-400 pt-2">
                  <p>{event.description}</p>
                </div>
              )}
            </div>

            <Separator className="my-2" />

            {/* Action Buttons */}
            <div className="px-4 pb-4">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8"
                  onClick={() => onEdit(event)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8"
                  onClick={handlePrint}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8"
                  onClick={handleDuplicate}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>

                {/* More Options */}
                {showMoreOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => handleCopyToCalendar('Personal')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Copy to Personal
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => handleCopyToCalendar('Work')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Copy to Work
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={() => handleCopyToCalendar('Family')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Copy to Family
                    </Button>
                    
                    <Separator className="my-1" />
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={handlePublishEvent}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Publish event
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={handlePublishEvent}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Publish this instance of the event
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8"
                      onClick={handleChangeOwner}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Change owner
                    </Button>
                    
                    <Separator className="my-1" />
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-8 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this event?')) {
                          onDelete(event.id)
                          onClose()
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 