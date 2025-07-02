"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EnhancedAIAssistant } from "@/components/enhanced-ai-assistant"
import { audioService } from "@/lib/audio"

interface AIAssistantHeaderProps {
  currentPage: string
}

export function AIAssistantHeader({ currentPage }: AIAssistantHeaderProps) {
  const [isListening, setIsListening] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [showFullAssistant, setShowFullAssistant] = useState(false)

  const handleVoiceToggle = async () => {
    if (isListening) {
      try {
        const audioBlob = await audioService.stopRecording()
        const transcription = await audioService.transcribeAudio(audioBlob)

        if (transcription) {
          setInputValue(transcription)
          setShowChat(true)
        }
        setIsListening(false)
      } catch (error) {
        console.error("Voice recording error:", error)
        setIsListening(false)
      }
    } else {
      try {
        await audioService.startRecording()
        setIsListening(true)
      } catch (error) {
        console.error("Failed to start recording:", error)
      }
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    // Open full assistant with the message
    setShowFullAssistant(true)
    setInputValue("")
    setShowChat(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <div className="relative">
      {/* AI Assistant Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleVoiceToggle}
        className={`h-9 w-9 ${isListening ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400" : ""}`}
      >
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
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
          {isListening && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />}
        </div>
        <span className="sr-only">AI Assistant</span>
      </Button>

      {/* Quick Voice Input Dropdown */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold dark:text-white">Voice Command</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-red-600 dark:text-red-400">Listening...</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Try saying: "Add task call dentist", "Schedule meeting tomorrow at 10am", or "Create journal entry"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input Dropdown */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 right-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold dark:text-white">Tracy AI</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="h-8 w-8 p-0">
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

              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Tracy anything..."
                  className="flex-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="sm"
                  className="bg-black dark:bg-white text-white dark:text-black"
                >
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
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </Button>
              </div>

              <div className="mt-3">
                <Button
                  onClick={() => setShowFullAssistant(true)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs bg-transparent dark:border-gray-700 dark:text-gray-300"
                >
                  Open Full Assistant
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Assistant Modal */}
      <AnimatePresence>
        {showFullAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
            onClick={() => setShowFullAssistant(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-900 rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold dark:text-white">Tracy AI Assistant</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowFullAssistant(false)} className="h-9 w-9">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
              <div className="h-[calc(80vh-73px)]">
                <EnhancedAIAssistant isFullPage={true} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
