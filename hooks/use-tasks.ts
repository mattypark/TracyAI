"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/supabase"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/tasks")
      if (!response.ok) throw new Error("Failed to fetch tasks")

      const { tasks } = await response.json()
      setTasks(tasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) throw new Error("Failed to create task")

      const { task } = await response.json()
      setTasks((prev) => [task, ...prev])
      return task
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })

      if (!response.ok) throw new Error("Failed to update task")

      setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      throw err
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    refetch: fetchTasks,
  }
}
