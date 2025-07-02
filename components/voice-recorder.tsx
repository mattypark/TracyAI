"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setRecordingTime(0)
      // Start timer
      const timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed bottom-20 right-4 z-40">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-lg mb-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                <span className="text-sm font-medium dark:text-white">Recording</span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{formatTime(recordingTime)}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Tell Tracy about your day...</p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex-1 bg-transparent dark:border-gray-700 dark:text-gray-300"
                onClick={() => setIsRecording(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="text-xs flex-1 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
                onClick={() => setIsRecording(false)}
              >
                Save
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleRecording}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
          isRecording
            ? "bg-red-500 text-white"
            : "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
        }`}
      >
        {isRecording ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="4" height="16" x="6" y="4" rx="1" />
            <rect width="4" height="16" x="14" y="4" rx="1" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        )}
      </motion.button>
    </div>
  )
}
