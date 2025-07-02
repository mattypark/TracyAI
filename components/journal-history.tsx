"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function JournalHistory() {
  const [activeMonth, setActiveMonth] = useState("June")

  // Sample journal entries
  const journalEntries = [
    {
      id: 1,
      date: "June 25, 2025",
      summary: "Productive day with gym session and project work",
      score: 8,
    },
    {
      id: 2,
      date: "June 24, 2025",
      summary: "Meetings all day, felt a bit overwhelmed",
      score: 6,
    },
    {
      id: 3,
      date: "June 22, 2025",
      summary: "Weekend hike and family dinner",
      score: 9,
    },
    {
      id: 4,
      date: "June 20, 2025",
      summary: "Completed quarterly report ahead of schedule",
      score: 8,
    },
  ]

  const months = ["June", "May", "April", "March", "February", "January"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Journal History</h2>
        <div className="relative">
          <select
            value={activeMonth}
            onChange={(e) => setActiveMonth(e.target.value)}
            className="appearance-none bg-gray-50 border border-gray-100 rounded-lg py-1 pl-3 pr-8 text-sm"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
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
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {journalEntries.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="p-4 bg-gray-50 rounded-xl border border-gray-100"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{entry.date}</p>
                <p className="font-medium">{entry.summary}</p>
              </div>
              <div className="bg-white rounded-full h-8 w-8 flex items-center justify-center border border-gray-100">
                <span className="text-sm font-medium">{entry.score}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Button variant="outline" size="sm">
          View All Entries
        </Button>
      </div>
    </motion.div>
  )
}
