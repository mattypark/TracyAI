"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"

export function TaskCategories() {
  const [activeCategory, setActiveCategory] = useState("all")

  const categories = [
    { id: "all", name: "All", count: 12 },
    { id: "today", name: "Today", count: 5 },
    { id: "upcoming", name: "Upcoming", count: 7 },
    { id: "completed", name: "Completed", count: 23 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 space-x-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`border border-gray-100 cursor-pointer flex-shrink-0 transition-all ${
              activeCategory === category.id ? "bg-black text-white" : "bg-white hover:bg-gray-50"
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            <CardContent className="p-3 flex items-center space-x-2">
              <span className="font-medium">{category.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  activeCategory === category.id ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                {category.count}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
