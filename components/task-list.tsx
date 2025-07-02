"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"

export function TaskList() {
  // Sample tasks
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete project proposal",
      description: "Finish the draft and send for review",
      dueDate: "Today, 5:00 PM",
      priority: "high",
      completed: false,
      category: "Work",
    },
    {
      id: 2,
      title: "Call Dr. Smith for appointment",
      description: "Annual checkup scheduling",
      dueDate: "Tomorrow, 10:00 AM",
      priority: "medium",
      completed: false,
      category: "Personal",
    },
    {
      id: 3,
      title: "Gym session - Leg day",
      description: "Focus on squats and deadlifts",
      dueDate: "Tomorrow, 6:00 PM",
      priority: "medium",
      completed: false,
      category: "Health",
    },
    {
      id: 4,
      title: "Review quarterly goals",
      description: "Prepare for the quarterly review meeting",
      dueDate: "Friday, 2:00 PM",
      priority: "high",
      completed: true,
      category: "Work",
    },
    {
      id: 5,
      title: "Buy groceries",
      description: "Get items for the week",
      dueDate: "Saturday, 11:00 AM",
      priority: "low",
      completed: false,
      category: "Personal",
    },
  ])

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Work":
        return "bg-blue-100 text-blue-800"
      case "Personal":
        return "bg-purple-100 text-purple-800"
      case "Health":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      {tasks.map((task, index) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className={`p-4 bg-white rounded-xl border border-gray-100 shadow-sm ${task.completed ? "opacity-60" : ""}`}
        >
          <div className="flex items-start">
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => toggleTaskCompletion(task.id)}
              className="mt-1"
            />
            <div className="ml-3 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <label
                  htmlFor={`task-${task.id}`}
                  className={`font-medium ${task.completed ? "line-through text-gray-400" : ""}`}
                >
                  {task.title}
                </label>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
                  {task.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{task.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {task.dueDate}
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-600 p-1">
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
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
