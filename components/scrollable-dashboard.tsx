"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FreshDashboard } from "@/components/fresh-dashboard"
import { useJournal } from "@/hooks/use-journal"
import { useTasks } from "@/hooks/use-tasks"
import { useStats } from "@/hooks/use-stats"
import { EnhancedAIAssistant } from "@/components/enhanced-ai-assistant"

export function ScrollableDashboard() {
  const { entries, loading: journalLoading } = useJournal()
  const { tasks, loading: tasksLoading } = useTasks()
  const { stats, loading: statsLoading } = useStats()
  
  // Client-side state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
    
    // Scroll to top when dashboard loads
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
    
    // Set hasCreatedEntry in localStorage if we have entries or tasks
    if (entries.length > 0 || tasks.length > 0) {
      localStorage.setItem('hasCreatedEntry', 'true')
    }
    
    // Check if this is the first load after creating an entry
    const needsRefresh = sessionStorage.getItem('needsRefresh') === 'true'
    if (needsRefresh) {
      // Clear the flag so we don't refresh again
      sessionStorage.removeItem('needsRefresh')
    }
  }, [entries.length, tasks.length])

  // Show loading state until client-side rendering is ready
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Show fresh dashboard if user has no data
  const isNewUser = false // Always show main dashboard instead of welcome screen
  
  // Check localStorage to override the new user state if we've previously created entries
  const hasCreatedEntry = typeof window !== 'undefined' && localStorage.getItem('hasCreatedEntry') === 'true'
  
  if (isNewUser && !hasCreatedEntry) {
    return <FreshDashboard />
  }

  // Rest of the existing dashboard code...
  const productivityStats = {
    weeklyAverage: stats.weeklyAverage || 0,
    monthlyAverage: stats.monthlyAverage || 0,
    streak: stats.streak || 0,
  }

  const todaysTasks = tasks.filter((task) => !task.completed).slice(0, 3)
  
  // Define type for reminders
  type Reminder = {
    id: string;
    title: string;
    time: string;
    date: string;
  }
  
  // Empty array with proper type
  const reminders: Reminder[] = []

  const weekData = [
    { day: "Mon", score: 8 },
    { day: "Tue", score: 7 },
    { day: "Wed", score: 9 },
    { day: "Thu", score: 6 },
    { day: "Fri", score: 8 },
    { day: "Sat", score: 9 },
    { day: "Sun", score: 7 },
  ]

  const priorities = [
    { id: 1, title: "Hit the gym everyday", progress: 5, total: 7 },
    { id: 2, title: "Read for 30 minutes", progress: 3, total: 7 },
    { id: 3, title: "Limit screen time", progress: 2, total: 7 },
  ]

  return (
    <div className="flex h-screen">
      {/* Main Dashboard Content - Left Side */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4" data-scroll-container>
        {/* Today's Reflection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg dark:text-white">Today's Reflection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entries.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {entries[0]?.summary || entries[0]?.content?.slice(0, 200) + "..."}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mr-2">
                        <span className="text-sm font-medium">{entries[0]?.productivity_score || 5}</span>
                      </div>
                      <span className="text-sm dark:text-gray-300">Productivity Score</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-transparent dark:border-gray-700 dark:text-gray-300"
                    >
                      Edit
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No reflection yet today. Start by recording your thoughts!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Productivity Stats */}
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
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold dark:text-white">{productivityStats.weeklyAverage}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold dark:text-white">{productivityStats.monthlyAverage}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">This Month</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold dark:text-white">{productivityStats.streak}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Overview */}
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
              <div className="flex justify-between items-end h-20">
                {weekData.map((day) => (
                  <div key={day.day} className="flex flex-col items-center">
                    <div
                      className="bg-gray-200 dark:bg-gray-700 rounded-t w-6 mb-2"
                      style={{ height: `${(day.score / 10) * 60}px` }}
                    ></div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{day.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* To-dos and Reminders */}
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
              <CardContent className="space-y-3">
                {todaysTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <Checkbox id={`task-${task.id}`} checked={task.completed} />
                    <div className="flex-1">
                      <label htmlFor={`task-${task.id}`} className="text-sm font-medium dark:text-gray-300">
                        {task.title}
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {task.due_date ? new Date(task.due_date).toLocaleString() : "No due date"}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="text-sm mt-3 dark:text-gray-300 dark:hover:bg-gray-800">
                  Add Task +
                </Button>
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
              <CardContent className="space-y-3">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mr-3"></div>
                      <div>
                        <p className="text-sm font-medium dark:text-gray-300">{reminder.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{reminder.time}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500">{reminder.date}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Priorities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg dark:text-white">Your Priorities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {priorities.map((priority) => (
                <div key={priority.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-gray-300">{priority.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {priority.progress}/{priority.total} days
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-white rounded-full"
                      style={{
                        width: `${(priority.progress / priority.total) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* AI Assistant - Mobile Only */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:hidden"
        >
          <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg dark:text-white">AI Assistant</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <EnhancedAIAssistant />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chat Section - Right Side (Hidden on Mobile) */}
      <div className="hidden lg:block w-80 border-l border-gray-100 dark:border-gray-800">
        <div className="pt-4 px-4">
          <EnhancedAIAssistant />
        </div>
      </div>
    </div>
  )
}
