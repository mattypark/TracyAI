"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FunctionalActionButtons } from "@/components/functional-action-buttons"

export function EmptyTasks() {
  return (
    <div className="space-y-6">
      {/* Task Categories */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-3">
          {["All", "Today", "Upcoming", "Completed"].map((category, index) => (
            <Card
              key={category}
              className={`border border-gray-100 dark:border-gray-800 dark:bg-gray-900 cursor-pointer flex-shrink-0 transition-all ${
                index === 0
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <CardContent className="p-3 flex items-center space-x-2">
                <span className="font-medium">{category}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    index === 0 ? "bg-white/20 dark:bg-black/20" : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  0
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-gray-400"
              >
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="m9 13 2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">No tasks yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Start organizing your life by adding your first task
            </p>
            <FunctionalActionButtons variant="task">
              <Button className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200">
                Add Your First Task
              </Button>
            </FunctionalActionButtons>
          </CardContent>
        </Card>
      </motion.div>

      {/* Getting Started Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Task Management Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400">📝</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1 dark:text-white">Break down big goals</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Split large projects into smaller, manageable tasks
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 dark:text-green-400">⏰</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1 dark:text-white">Set due dates</h4>
                  <p className="text-gray-500 dark:text-gray-400">Add deadlines to stay on track and prioritize</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
