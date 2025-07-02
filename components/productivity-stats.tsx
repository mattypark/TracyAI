"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ProductivityStats() {
  // Sample data
  const weeklyAverage = 7.8
  const monthlyAverage = 7.2
  const streak = 5

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8"
    >
      <h2 className="text-xl font-bold mb-4">Productivity Stats</h2>
      <div className="grid grid-cols-3 gap-3">
        <Card className="border border-gray-100">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs text-gray-500">This Week</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold">{weeklyAverage}</div>
            <div className="text-xs text-gray-500">Average</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs text-gray-500">This Month</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold">{monthlyAverage}</div>
            <div className="text-xs text-gray-500">Average</div>
          </CardContent>
        </Card>
        <Card className="border border-gray-100">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-xs text-gray-500">Streak</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-2xl font-bold">{streak}</div>
            <div className="text-xs text-gray-500">Days</div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
