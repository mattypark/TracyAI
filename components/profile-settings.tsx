"use client"

import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"

export function ProfileSettings() {
  const settings = [
    {
      id: "notifications",
      title: "Notifications",
      description: "Receive daily reminders and updates",
      enabled: true,
    },
    {
      id: "darkMode",
      title: "Dark Mode",
      description: "Switch between light and dark themes",
      enabled: false,
    },
    {
      id: "dataSync",
      title: "Data Sync",
      description: "Sync your data across devices",
      enabled: true,
    },
    {
      id: "voiceAssistant",
      title: "Voice Assistant",
      description: "Enable voice commands and responses",
      enabled: true,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-8"
    >
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <Card className="border border-gray-100">
        <CardContent className="p-0">
          {settings.map((setting, index) => (
            <div
              key={setting.id}
              className={`flex items-center justify-between p-4 ${
                index < settings.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <div>
                <h3 className="font-medium">{setting.title}</h3>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
              <Switch id={setting.id} checked={setting.enabled} />
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
