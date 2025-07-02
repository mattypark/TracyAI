"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { MobileNavigation } from "@/components/mobile-navigation"
import { EmptyTasks } from "@/components/empty-tasks"

export default function TasksPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
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

  if (!user) return null

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 text-black dark:text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Tasks</h1>
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <span className="sr-only">Add Task</span>
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
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <div className="pt-16 pb-20 px-4 max-w-screen-md mx-auto">
        <EmptyTasks />
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </main>
  )
}
