"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FunctionalActionButtons } from "@/components/functional-action-buttons"

export function EmptyJournal() {
  const [hasCreatedEntry, setHasCreatedEntry] = useState(false)
  
  useEffect(() => {
    // Check if the user has created entries before
    if (typeof window !== 'undefined') {
      const hasEntry = localStorage.getItem('hasCreatedEntry') === 'true'
      setHasCreatedEntry(hasEntry)
      
      // Check if we need to refresh once
      const needsRefresh = sessionStorage.getItem('needsRefresh') === 'true'
      if (needsRefresh) {
        // Clear the flag so we don't refresh again
        sessionStorage.removeItem('needsRefresh')
      }
    }
  }, [])
  
  // If the user has created entries before, don't show the empty state
  if (hasCreatedEntry) {
    return null
  }

  return (
    <div className="flex-1 flex flex-col px-4">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex items-center justify-center"
      >
        <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900 w-full max-w-md">
          <CardContent className="text-center py-12">
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
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Start Your Journal</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Share your thoughts, experiences, and reflections. Tracy will help you organize and understand your
              journey.
            </p>
            <div className="space-y-3">
              <FunctionalActionButtons variant="journal">
                <Button className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
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
                    className="mr-2"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                  Record Voice Entry
                </Button>
              </FunctionalActionButtons>
              <FunctionalActionButtons variant="journal">
                <Button variant="outline" className="w-full bg-transparent dark:border-gray-700 dark:text-gray-300">
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
                    className="mr-2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Write Text Entry
                </Button>
              </FunctionalActionButtons>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Journal Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="pb-4"
      >
        <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Journaling Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 dark:text-purple-400">💭</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1 dark:text-white">Be authentic</h4>
                  <p className="text-gray-500 dark:text-gray-400">Write honestly about your experiences and feelings</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 dark:text-orange-400">🎯</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1 dark:text-white">Daily reflection</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Regular entries help track your growth and patterns
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
