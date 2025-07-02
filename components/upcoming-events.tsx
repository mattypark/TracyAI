"use client"

import { motion } from "framer-motion"

export function UpcomingEvents() {
  // Sample events
  const events = [
    {
      id: 1,
      title: "Team Meeting",
      date: "Today",
      time: "10:00 AM - 11:30 AM",
      location: "Conference Room B",
      color: "border-blue-200",
    },
    {
      id: 2,
      title: "Lunch with Sarah",
      date: "Today",
      time: "12:30 PM - 1:30 PM",
      location: "Cafe Bistro",
      color: "border-green-200",
    },
    {
      id: 3,
      title: "Project Review",
      date: "Tomorrow",
      time: "2:00 PM - 3:00 PM",
      location: "Virtual Meeting",
      color: "border-purple-200",
    },
    {
      id: 4,
      title: "Dentist Appointment",
      date: "Jun 28",
      time: "9:00 AM - 10:00 AM",
      location: "Dental Clinic",
      color: "border-red-200",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Upcoming Events</h2>
        <button className="text-sm text-gray-500">View All</button>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 bg-white rounded-xl border-l-4 ${event.color} shadow-sm`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{event.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {event.date} • {event.time}
                </p>
                <p className="text-xs text-gray-500 mt-1 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-1"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {event.location}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
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
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
