"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { MobileNavigation } from "@/components/mobile-navigation"
import { EmptyJournal } from "@/components/empty-journal"
import { JournalEntries } from "@/components/journal-entries"
import { useJournal } from "@/hooks/use-journal"
import { FunctionalActionButtons } from "@/components/functional-action-buttons"
import { Button } from "@/components/ui/button"

export default function JournalPage() {
  const { user, loading: authLoading } = useAuth()
  const { entries, loading: entriesLoading, refetch } = useJournal()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Check if we need to do a one-time refresh
    if (typeof window !== 'undefined') {
      const needsRefresh = sessionStorage.getItem('needsRefresh') === 'true'
      if (needsRefresh) {
        // Clear the flag so we don't refresh again
        sessionStorage.removeItem('needsRefresh')
        // Use router.refresh() instead of window.location.reload()
        router.refresh()
      }
    }
  }, [router])

  // Separate effect for refetching entries (only runs once)
  useEffect(() => {
    if (isClient) {
      // Call refetch without including it in dependencies to avoid infinite loop
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]) // Only depends on isClient, not refetch

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  if (authLoading || !isClient) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const hasEntries = entries && entries.length > 0

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Journal</h1>
        <div className="flex items-center space-x-2">
          <FunctionalActionButtons variant="journal">
            <Button size="sm" className="bg-black dark:bg-white text-white dark:text-black">
              New Entry
            </Button>
          </FunctionalActionButtons>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <span className="sr-only">Settings</span>
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
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 pb-20 h-screen flex flex-col">
        {entriesLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading journal entries...</p>
            </div>
          </div>
        ) : hasEntries ? (
          <JournalEntries entries={entries} />
        ) : (
          <EmptyJournal />
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </main>
  )
}
