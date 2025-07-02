"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { MobileNavigation } from "@/components/mobile-navigation"
import { ScrollableDashboard } from "@/components/scrollable-dashboard"
import { VoiceRecorder } from "@/components/voice-recorder"
import { DarkModeToggle } from "@/components/dark-mode-toggle"
import { AIAssistantHeader } from "@/components/ai-assistant-header"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Force scroll to top when page loads - multiple methods for reliability
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      
      // Also ensure any scrollable containers are reset
      const scrollableElements = document.querySelectorAll('[data-scroll-container]')
      scrollableElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.scrollTop = 0
        }
      })
    }
    
    // Immediate scroll
    scrollToTop()
    
    // Delayed scroll to ensure it takes effect after render
    const timeoutId = setTimeout(scrollToTop, 0)
    const timeoutId2 = setTimeout(scrollToTop, 100)
    
    return () => {
      clearTimeout(timeoutId)
      clearTimeout(timeoutId2)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to auth
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <AIAssistantHeader currentPage="Dashboard" />
          <DarkModeToggle />
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <span className="sr-only">Notifications</span>
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
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </button>
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="sr-only">Profile</span>
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="pt-16 pb-20">
        <ScrollableDashboard />
      </div>

      {/* Voice Recorder Button */}
      <VoiceRecorder />

      {/* Mobile Navigation */}
      <MobileNavigation />
    </main>
  )
}
