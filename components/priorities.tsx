"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

interface UserPreferences {
  priorities: string
  goals: string[]
}

export function Priorities() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("user_preferences")
          .select("priorities, goals")
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching preferences:", error)
        } else if (data) {
          setPreferences(data)
        }
      } catch (error) {
        console.error("Unexpected error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [user])

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Priorities</CardTitle>
          <Target className="h-4 w-4 ml-auto text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preferences || (!preferences.priorities && (!preferences.goals || preferences.goals.length === 0))) {
    return (
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Priorities</CardTitle>
          <Target className="h-4 w-4 ml-auto text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 mb-4">
            <Plus className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-4">
            No priorities set yet. Complete your personalization to see your priorities here.
          </p>
          <Button variant="outline" size="sm" onClick={() => (window.location.href = "/profile")}>
            Set Priorities
          </Button>
        </CardContent>
      </Card>
    )
  }

  const priorityItems = preferences.priorities
    ? preferences.priorities
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
    : []

  const goalLabels: Record<string, string> = {
    productivity: "Productivity",
    wellness: "Mental Wellness",
    organization: "Organization",
    habits: "Better Habits",
    work_life_balance: "Work-Life Balance",
    creativity: "Creativity",
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Your Priorities</CardTitle>
        <Target className="h-4 w-4 ml-auto text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {preferences.priorities && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Daily Focus</h4>
            <div className="space-y-2">
              {priorityItems.slice(0, 3).map((priority, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2"
                >
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{priority}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {preferences.goals && preferences.goals.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2">Goals</h4>
            <div className="flex flex-wrap gap-1">
              {preferences.goals.slice(0, 4).map((goal, index) => (
                <motion.div
                  key={goal}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Badge variant="secondary" className="text-xs">
                    {goalLabels[goal] || goal}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
