"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function WeeklyOverview() {
  // Sample data for the week
  const weekData = [
    { day: "Mon", score: 8, activities: ["Gym", "Work", "Reading"] },
    { day: "Tue", score: 7, activities: ["Work", "Meeting", "Cooking"] },
    { day: "Wed", score: 9, activities: ["Gym", "Work", "Project"] },
    { day: "Thu", score: 6, activities: ["Work", "Doctor", "Rest"] },
    { day: "Fri", score: 8, activities: ["Gym", "Work", "Friends"] },
    { day: "Sat", score: 9, activities: ["Hiking", "Reading", "Movie"] },
    { day: "Sun", score: 7, activities: ["Family", "Rest", "Planning"] },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Weekly Overview</h2>
        <button className="text-sm text-gray-500">View All</button>
      </div>

      <div className="overflow-x-auto pb-2 -mx-4 px-4">
        <div className="flex space-x-3" style={{ minWidth: "600px" }}>
          {weekData.map((day, index) => (
            <Card key={day.day} className={`flex-1 border border-gray-100 ${index === 4 ? "bg-gray-50" : ""}`}>
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm">{day.day}</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="mb-2">
                  <span className="text-xl font-bold">{day.score}</span>
                  <span className="text-xs text-gray-500 ml-1">/10</span>
                </div>
                <div className="space-y-1">
                  {day.activities.map((activity, i) => (
                    <div key={i} className="text-xs py-1 px-2 bg-gray-100 rounded-full inline-block mr-1 mb-1">
                      {activity}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
