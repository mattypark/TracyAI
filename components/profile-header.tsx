"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

export function ProfileHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-1">Alex Johnson</h2>
      <p className="text-gray-500 mb-4">@alexjohnson</p>
      <Button variant="outline" size="sm" className="rounded-full bg-transparent">
        Edit Profile
      </Button>
    </motion.div>
  )
}
