"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export function ProfileStats() {
  // Sample stats
  const stats = [
    { label: "Reflections", value: 124 },
    { label: "Avg. Score", value: 7.8 },
    { label: "Streak", value: "5 days" },
    { label: "Tasks", value: "85% done" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-8"
    >
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <Card key={index} className="border border-gray-100">
            <CardContent className="p-4 text-center">
              <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
