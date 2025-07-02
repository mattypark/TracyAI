"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function ContactInformation() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [contactData, setContactData] = useState({
    email: "",
    phone: "",
    whatsapp: "",
    preferredContact: "",
  })
  const [verificationStatus, setVerificationStatus] = useState({
    email: false,
    phone: false,
    whatsapp: false,
  })

  const handleChange = (field: string, value: string) => {
    setContactData({ ...contactData, [field]: value })
  }

  const handleVerify = (type: "email" | "phone" | "whatsapp") => {
    // Simulate verification process
    setTimeout(() => {
      setVerificationStatus({ ...verificationStatus, [type]: true })
    }, 1000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mb-8"
    >
      <Card className="border border-gray-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Contact Information</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-sm">
              {isExpanded ? "Hide" : "Manage"}
            </Button>
          </div>
          <p className="text-sm text-gray-500">Connect your communication channels for seamless AI assistance</p>
        </CardHeader>
        {isExpanded && (
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                Email Address
                {verificationStatus.email && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">
                    Verified
                  </Badge>
                )}
              </label>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerify("email")}
                  disabled={!contactData.email || verificationStatus.email}
                  className="bg-transparent"
                >
                  {verificationStatus.email ? "Verified" : "Verify"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">For calendar invites, meeting reminders, and email summaries</p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                Phone Number
                {verificationStatus.phone && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">
                    Verified
                  </Badge>
                )}
              </label>
              <div className="flex space-x-2">
                <Input
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerify("phone")}
                  disabled={!contactData.phone || verificationStatus.phone}
                  className="bg-transparent"
                >
                  {verificationStatus.phone ? "Verified" : "Verify"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">For SMS reminders, calls, and text-based assistance</p>
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                WhatsApp Number
                {verificationStatus.whatsapp && (
                  <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">
                    Verified
                  </Badge>
                )}
              </label>
              <div className="flex space-x-2">
                <Input
                  type="tel"
                  value={contactData.whatsapp}
                  onChange={(e) => handleChange("whatsapp", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVerify("whatsapp")}
                  disabled={!contactData.whatsapp || verificationStatus.whatsapp}
                  className="bg-transparent"
                >
                  {verificationStatus.whatsapp ? "Verified" : "Verify"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">For WhatsApp messages and voice notes</p>
            </div>

            {/* Communication Preferences */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Contact Method</label>
              <div className="grid grid-cols-2 gap-2">
                {["Email", "SMS", "WhatsApp", "App Only"].map((method) => (
                  <Button
                    key={method}
                    variant={contactData.preferredContact === method ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleChange("preferredContact", method)}
                    className={contactData.preferredContact === method ? "bg-black text-white" : "bg-transparent"}
                  >
                    {method}
                  </Button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Coming Soon</h4>
                <p className="text-xs text-blue-700">
                  Cross-platform messaging, calendar integration, and voice calls with Tracy AI
                </p>
              </div>
            </div>

            <Button className="w-full bg-black hover:bg-gray-800 text-white">Save Contact Information</Button>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}
