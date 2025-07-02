"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FunctionalActionButtons } from "@/components/functional-action-buttons"

export function FreshDashboard() {
  // Client-side state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Show loading state until client-side rendering is ready
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex h-screen">
      {/* Main Dashboard Content */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-8"
        >
          <h2 className="text-3xl font-bold mb-4 dark:text-white">Welcome to Tracy AI! 🎉</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You're all set up! Start by recording your first journal entry or adding a task.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <FunctionalActionButtons variant="journal">
              <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                Record First Entry
              </Button>
            </FunctionalActionButtons>
            <FunctionalActionButtons variant="task">
              <Button variant="outline" className="bg-transparent dark:border-gray-700 dark:text-gray-300">
                Add Your First Task
              </Button>
            </FunctionalActionButtons>
          </div>
        </motion.div>

        {/* Empty State Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Productivity Stats - Empty */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg dark:text-white">Productivity Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Your productivity stats will appear here after your first journal entry
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Overview - Empty */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg dark:text-white">Weekly Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                      <line x1="16" x2="16" y1="2" y2="6" />
                      <line x1="8" x2="8" y1="2" y2="6" />
                      <line x1="3" x2="21" y1="10" y2="10" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Your weekly activity overview will show here
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* To-dos and Reminders - Empty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg dark:text-white">To-dos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="m9 13 2 2 4-4" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                    No tasks yet. Add your first task to get started!
                  </p>
                  <Button variant="ghost" size="sm" className="text-sm dark:text-gray-300 dark:hover:bg-gray-800">
                    Add Task +
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg dark:text-white">Reminders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Your reminders will appear here</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Getting Started Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg dark:text-white">Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FunctionalActionButtons variant="journal">
                  <div className="text-center cursor-pointer">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">🎤</span>
                    </div>
                    <h3 className="font-medium mb-2 dark:text-white">Record Your Day</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Use the voice recorder to tell Tracy about your day
                    </p>
                  </div>
                </FunctionalActionButtons>

                <FunctionalActionButtons variant="task">
                  <div className="text-center cursor-pointer">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">✅</span>
                    </div>
                    <h3 className="font-medium mb-2 dark:text-white">Add Tasks</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Create tasks and reminders to stay organized
                    </p>
                  </div>
                </FunctionalActionButtons>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="font-medium mb-2 dark:text-white">Track Progress</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Watch your productivity stats grow over time
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
