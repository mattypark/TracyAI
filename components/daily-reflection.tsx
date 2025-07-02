"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function DailyReflection() {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 bg-gray-50 rounded-3xl p-5 border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Today's Reflection</h2>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="text-sm">
          {expanded ? "Show Less" : "Show More"}
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-gray-700">
          "Today was pretty good. I went to workout in the afternoon, studied for about 2 hours, then went out with
          friends to a new steak house. Woke up around 9 AM, but was on my phone a bit too much."
        </p>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-3 border-t border-gray-200 mt-3"
          >
            <h3 className="font-medium mb-2">AI Summary</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start">
                <div className="bg-gray-200 rounded-full p-1 mr-2 mt-0.5">
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
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p>9:00 AM - Woke up</p>
              </div>
              <div className="flex items-start">
                <div className="bg-gray-200 rounded-full p-1 mr-2 mt-0.5">
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
                  >
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                    <line x1="6" x2="6" y1="1" y2="4" />
                    <line x1="10" x2="10" y1="1" y2="4" />
                    <line x1="14" x2="14" y1="1" y2="4" />
                  </svg>
                </div>
                <p>Afternoon - Workout session</p>
              </div>
              <div className="flex items-start">
                <div className="bg-gray-200 rounded-full p-1 mr-2 mt-0.5">
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
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <p>Late Afternoon - Studied for 2 hours</p>
              </div>
              <div className="flex items-start">
                <div className="bg-gray-200 rounded-full p-1 mr-2 mt-0.5">
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
                  >
                    <path d="M17 9V5a3 3 0 0 0-6 0v4" />
                    <path d="M2 11h20" />
                    <path d="M8 9h8" />
                    <path d="M19 9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2" />
                  </svg>
                </div>
                <p>Evening - Dinner with friends at a new steak house</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mr-2">
            <span className="text-xs font-medium">8</span>
          </div>
          <span className="text-sm font-medium">Productivity Score</span>
        </div>
        <Button variant="outline" size="sm" className="text-xs bg-transparent">
          Edit
        </Button>
      </div>
    </motion.div>
  )
}
