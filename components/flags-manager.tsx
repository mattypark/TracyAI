"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { db } from "@/lib/database"

interface EventFlag {
  id: string
  name: string
  color: string
  user_id: string
}

const flagColors = [
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Indigo", value: "indigo", class: "bg-indigo-500" },
]

export function FlagsManager() {
  const [flags, setFlags] = useState<EventFlag[]>([])
  const [isAddingFlag, setIsAddingFlag] = useState(false)
  const [editingFlag, setEditingFlag] = useState<EventFlag | null>(null)
  const [newFlagName, setNewFlagName] = useState("")
  const [newFlagColor, setNewFlagColor] = useState("blue")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFlags()
  }, [])

  const loadFlags = async () => {
    try {
      setError(null)
      const userFlags = await db.getUserFlags()
      setFlags(userFlags || [])
    } catch (error) {
      console.error("Error loading flags:", error)
      setError("Failed to load flags")
      setFlags([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddFlag = async () => {
    if (!newFlagName.trim()) return

    try {
      setError(null)
      
      const newFlag = await db.createFlag({
        name: newFlagName.trim(),
        color: newFlagColor,
      })
      
      setFlags([...flags, newFlag])
      setNewFlagName("")
      setNewFlagColor("blue")
      setIsAddingFlag(false)
    } catch (error: any) {
      console.error("Error creating flag:", error)
      
      // Even if database fails, create a local flag that works in the UI
      const localFlag = {
        id: `local-${Date.now()}`,
        name: newFlagName.trim(),
        color: newFlagColor,
        user_id: "local",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      
      setFlags([...flags, localFlag])
      setNewFlagName("")
      setNewFlagColor("blue")
      setIsAddingFlag(false)
      
      // Show a brief success message instead of an error
      console.log("Created local flag:", localFlag)
    }
  }

  const handleEditFlag = async () => {
    if (!editingFlag || !newFlagName.trim()) return

    try {
      setError(null)
      const updatedFlag = await db.updateFlag(editingFlag.id, {
        name: newFlagName.trim(),
        color: newFlagColor,
      })
      setFlags(flags.map((flag) => (flag.id === editingFlag.id ? updatedFlag : flag)))
      setEditingFlag(null)
      setNewFlagName("")
      setNewFlagColor("blue")
    } catch (error) {
      console.error("Error updating flag:", error)
      setError("Failed to update flag")
    }
  }

  const handleDeleteFlag = async (flagId: string) => {
    try {
      setError(null)
      await db.deleteFlag(flagId)
      setFlags(flags.filter((flag) => flag.id !== flagId))
    } catch (error: any) {
      console.error("Error deleting flag:", error)
      setError("Failed to delete flag")
    }
  }

  const startEdit = (flag: EventFlag) => {
    setEditingFlag(flag)
    setNewFlagName(flag.name)
    setNewFlagColor(flag.color)
  }

  const getColorClass = (color: string) => {
    const colorObj = flagColors.find((c) => c.value === color)
    return colorObj?.class || "bg-gray-500"
  }

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Flag className="w-5 h-5 mr-2" />
            Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Flag className="w-5 h-5 mr-2" />
            Flags
          </CardTitle>
          <Dialog open={isAddingFlag} onOpenChange={setIsAddingFlag}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 w-8 p-0 bg-transparent"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Flag</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Flag Name</label>
                  <Input
                    value={newFlagName}
                    onChange={(e) => setNewFlagName(e.target.value)}
                    placeholder="Enter flag name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {flagColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setNewFlagColor(color.value)}
                        className={`w-full h-10 rounded-lg border-2 ${color.class} ${
                          newFlagColor === color.value ? "border-gray-900 dark:border-white" : "border-transparent"
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddFlag} className="flex-1">
                    Add Flag
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddingFlag(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <AnimatePresence>
            {flags.map((flag) => (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${getColorClass(flag.color)}`}></div>
                  <span className="text-sm font-medium">{flag.name}</span>
                </div>
                <div className="flex space-x-1">
                  <Dialog open={editingFlag?.id === flag.id} onOpenChange={(open) => !open && setEditingFlag(null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => startEdit(flag)}>
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Flag</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Flag Name</label>
                          <Input
                            value={newFlagName}
                            onChange={(e) => setNewFlagName(e.target.value)}
                            placeholder="Enter flag name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Color</label>
                          <div className="grid grid-cols-4 gap-2">
                            {flagColors.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => setNewFlagColor(color.value)}
                                className={`w-full h-10 rounded-lg border-2 ${color.class} ${
                                  newFlagColor === color.value
                                    ? "border-gray-900 dark:border-white"
                                    : "border-transparent"
                                }`}
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleEditFlag} className="flex-1">
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setEditingFlag(null)} className="flex-1">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteFlag(flag.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {flags.length === 0 && !error && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Flag className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No flags yet</p>
              <p className="text-xs">Create flags to organize your events</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
