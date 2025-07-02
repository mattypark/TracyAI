"use client"

import { motion } from "framer-motion"
import { Checkbox } from "@/components/ui/checkbox"

export function UpcomingTasks() {
  // Sample tasks
  const tasks = [
    {
      id: 1,
      title: "Complete project proposal",
      time: "Today, 5:00 PM",
      completed: false,
    },
    {
      id: 2,
      title: "Call Dr. Smith for appointment",
      time: "Tomorrow, 10:00 AM",
      completed: false,
    },
    {
      id: 3,
      title: "Gym session - Leg day",
      time: "Tomorrow, 6:00 PM",
      completed: false,
    },
    {
      id: 4,
      title: "Review quarterly goals",
      time: "Friday, 2:00 PM",
      completed: true,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Upcoming Tasks</h2>
        <button className="text-sm text-gray-500">View All</button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100"
          >
            <Checkbox id={`task-${task.id}`} checked={task.completed} className="mt-1" />
            <div className="ml-3 flex-1">
              <label
                htmlFor={`task-${task.id}`}
                className={`font-medium ${task.completed ? "line-through text-gray-400" : ""}`}
              >
                {task.title}
              </label>
              <p className="text-xs text-gray-500 mt-1">{task.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
