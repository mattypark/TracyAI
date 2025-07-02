"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth/auth-provider"
import { useTheme } from "next-themes"
import { supabase } from "@/lib/supabase"
import type { User } from "@/lib/supabase"
import { GoogleSyncButtons } from "@/components/google-sync-buttons"

interface UserSettings {
  notifications: boolean
  darkMode: boolean
  dataSync: boolean
  voiceAssistant: boolean
}

export function ProfileContent() {
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")
  const [settings, setSettings] = useState<UserSettings>({
    notifications: true,
    darkMode: false,
    dataSync: true,
    voiceAssistant: true,
  })
  const [usernameChangeDate, setUsernameChangeDate] = useState<string | null>(null)
  const [canChangeUsername, setCanChangeUsername] = useState(true)
  const [newFieldName, setNewFieldName] = useState<string>("")
  const [newFieldValue, setNewFieldValue] = useState<string>("")

  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  useEffect(() => {
    // Sync dark mode setting with theme
    setSettings((prev) => ({ ...prev, darkMode: theme === "dark" }))
  }, [theme])

  const fetchUserData = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (error) throw error
      setUserData(data)
      setProfileImageUrl(data.avatar_url || "")
      setEditData({
        full_name: data.full_name || "",
        username: data.username || "",
        preferences: data.preferences || {},
      })

      // Check username change cooldown
      const lastUsernameChange = data.preferences?.last_username_change
      if (lastUsernameChange) {
        const changeDate = new Date(lastUsernameChange)
        const now = new Date()
        const daysDiff = Math.floor((now.getTime() - changeDate.getTime()) / (1000 * 60 * 60 * 24))
        setUsernameChangeDate(lastUsernameChange)
        setCanChangeUsername(daysDiff >= 7)
      }

      // Load user settings
      const userSettings = data.preferences?.settings || {}
      setSettings({
        notifications: userSettings.notifications ?? true,
        darkMode: theme === "dark",
        dataSync: userSettings.dataSync ?? true,
        voiceAssistant: userSettings.voiceAssistant ?? true,
      })
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (setting: keyof UserSettings, value: boolean) => {
    if (!user) return

    const newSettings = { ...settings, [setting]: value }
    setSettings(newSettings)

    if (setting === "darkMode") {
      setTheme(value ? "dark" : "light")
    }

    try {
      const updatedPreferences = {
        ...userData?.preferences,
        settings: newSettings,
      }

      await supabase.from("users").update({ preferences: updatedPreferences }).eq("id", user.id)
    } catch (error) {
      console.error("Error updating settings:", error)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const url = URL.createObjectURL(file)
      setProfileImageUrl(url)
    }
  }

  const uploadProfileImage = async (): Promise<string | null> => {
    if (!profileImage || !user) return null

    try {
      const fileExt = profileImage.name.split(".").pop()
      const fileName = `${user.id}/profile.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, profileImage, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)

      return data.publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      return null
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      let avatarUrl = userData?.avatar_url

      // 1️⃣ Upload avatar if the user selected a new image
      if (profileImage) {
        const uploadedUrl = await uploadProfileImage()
        if (uploadedUrl) avatarUrl = uploadedUrl
      }

      // 2️⃣ Build preferences (add username-change timestamp if needed)
      let updatedPreferences = editData.preferences
      if (editData.username !== userData?.username) {
        if (!canChangeUsername) {
          alert("You can only change your username once every 7 days.")
          return
        }
        updatedPreferences = {
          ...updatedPreferences,
          last_username_change: new Date().toISOString(),
        }
      }

      // 3️⃣ Compose the initial update payload (includes username)
      const basePayload: Record<string, unknown> = {
        full_name: editData.full_name,
        preferences: updatedPreferences,
        avatar_url: avatarUrl,
      }

      const payloadWithUsername = {
        ...basePayload,
        username: editData.username
          .toString()
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, ""),
      }

      // 4️⃣ First attempt – include username
      let { error } = await supabase.from("users").update(payloadWithUsername).eq("id", user.id)

      // 5️⃣ If Supabase complains that the username column doesn't exist, retry without it
      if (error && /username.+column.+schema cache/i.test(error.message)) {
        console.warn(
          "Supabase users table has no username column yet – retrying without it. " +
            "Run `scripts/add-username-column.sql` when you're ready.",
        )
        ;({ error } = await supabase.from("users").update(basePayload).eq("id", user.id))
      }

      if (error) throw error

      await fetchUserData()
      setIsEditing(false)
      setProfileImage(null)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/auth")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      // Delete user data
      await supabase.from("users").delete().eq("id", user.id)

      // Delete auth user
      await supabase.auth.admin.deleteUser(user.id)

      router.push("/auth")
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const handleAddNewField = async () => {
    if (!user || !newFieldName || !newFieldValue) return

    try {
      // Create a copy of the current preferences or initialize a new object if undefined
      const currentPreferences = userData?.preferences || {};
      
      // Add the new field
      const updatedPreferences = {
        ...currentPreferences,
        [newFieldName]: newFieldValue,
      };

      // Update in Supabase
      await supabase.from("users").update({ preferences: updatedPreferences }).eq("id", user.id)

      // Update local state
      setEditData({
        ...editData,
        preferences: updatedPreferences
      });

      await fetchUserData()
      setNewFieldName("")
      setNewFieldValue("")
    } catch (error) {
      console.error("Error adding new personalization field:", error)
    }
  }

  const handleSavePersonalization = async () => {
    if (!user) return

    try {
      // Save the edited preferences from the form
      await supabase.from("users").update({ 
        preferences: editData.preferences 
      }).eq("id", user.id)

      await fetchUserData()
      setIsEditing(false)
      setNewFieldName("")
      setNewFieldValue("")
    } catch (error) {
      console.error("Error saving personalization:", error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading profile...</p>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Profile not found</p>
      </div>
    )
  }

  const daysUntilUsernameChange = usernameChangeDate
    ? Math.max(
        0,
        7 - Math.floor((new Date().getTime() - new Date(usernameChangeDate).getTime()) / (1000 * 60 * 60 * 24)),
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="text-center py-8">
            <div className="relative w-24 h-24 rounded-full mx-auto mb-4">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
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
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-black dark:bg-white text-white dark:text-black rounded-full p-2 cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                </label>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  placeholder="Full Name"
                  className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
                <div>
                  <Input
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    placeholder="Username"
                    disabled={!canChangeUsername}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                  {!canChangeUsername && (
                    <p className="text-xs text-red-500 mt-1">
                      You can change your username in {daysUntilUsernameChange} days
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-1 dark:text-white">{userData.full_name || "User"}</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">@{userData.username || "username"}</p>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="rounded-full bg-transparent dark:border-gray-700 dark:text-gray-300 mr-2"
            >
              {isEditing ? "Save" : "Edit Profile"}
            </Button>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="rounded-full bg-transparent dark:border-gray-700 dark:text-gray-300"
              >
                Cancel
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                id: "notifications",
                title: "Notifications",
                description: "Receive daily reminders and updates",
                value: settings.notifications,
              },
              {
                id: "darkMode",
                title: "Dark Mode",
                description: "Switch between light and dark themes",
                value: settings.darkMode,
              },
              {
                id: "dataSync",
                title: "Data Sync",
                description: "Sync your data across devices",
                value: settings.dataSync,
              },
              {
                id: "voiceAssistant",
                title: "Voice Assistant",
                description: "Enable voice commands and responses",
                value: settings.voiceAssistant,
              },
            ].map((setting) => (
              <div key={setting.id} className="flex items-center justify-between py-2">
                <div>
                  <h3 className="font-medium dark:text-white">{setting.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                </div>
                <Switch
                  checked={setting.value}
                  onCheckedChange={(checked) => handleSettingChange(setting.id as keyof UserSettings, checked)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Google Services Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GoogleSyncButtons />
      </motion.div>

      {/* Profile Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Your Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Journal Entries", value: 0 },
                { label: "Tasks Completed", value: 0 },
                { label: "Days Active", value: 1 },
                { label: "Productivity Score", value: "N/A" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-2xl font-bold dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personalization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg dark:text-white">Personalization</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-full bg-transparent dark:border-gray-700 dark:text-gray-300"
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                {Object.entries(userData?.preferences || {})
                  .filter(([key]) => key !== "settings" && key !== "last_username_change")
                  .map(([key, value]) => (
                    <div key={key}>
                      <label className="text-sm font-medium dark:text-white capitalize">{key.replace(/_/g, " ")}</label>
                      {typeof value === "string" && value.length > 50 ? (
                        <Textarea
                          value={editData.preferences?.[key] || value}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              preferences: { ...(editData.preferences || {}), [key]: e.target.value },
                            })
                          }
                          className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          rows={3}
                        />
                      ) : (
                        <Input
                          value={editData.preferences?.[key] || value}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              preferences: { ...(editData.preferences || {}), [key]: e.target.value },
                            })
                          }
                          className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                
                {/* Add new personalization field */}
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-medium dark:text-white mb-3">Add New Personalization Field</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs font-medium dark:text-gray-300">Field Name</label>
                      <Input
                        value={newFieldName || ""}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="e.g., favorite_music, hobby, learning_style"
                        className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium dark:text-gray-300">Field Value</label>
                      <Textarea
                        value={newFieldValue || ""}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        placeholder="Enter value..."
                        className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={handleAddNewField}
                      disabled={!newFieldName || !newFieldValue}
                      className="mt-2"
                      variant="outline"
                    >
                      Add Field
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <Button
                    onClick={handleSavePersonalization}
                    className="bg-black dark:bg-white text-white dark:text-black"
                  >
                    Save Changes
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {Object.entries(userData?.preferences || {}).filter(
                  ([key]) => key !== "settings" && key !== "last_username_change",
                ).length > 0 ? (
                  Object.entries(userData?.preferences || {})
                    .filter(([key]) => key !== "settings" && key !== "last_username_change")
                    .map(([key, value]) => (
                      <div key={key} className="border-b border-gray-100 dark:border-gray-800 pb-2">
                        <p className="text-sm font-medium dark:text-white capitalize">{key.replace(/_/g, " ")}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {typeof value === "string" ? value : JSON.stringify(value)}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No personalization data available. Complete your onboarding to see your preferences here.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full bg-transparent dark:border-gray-700 dark:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" x2="9" y1="12" y2="12" />
              </svg>
              Log Out
            </Button>

            {showDeleteConfirm ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1 bg-transparent dark:border-gray-700 dark:text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteAccount} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" x2="10" y1="11" y2="17" />
                  <line x1="14" x2="14" y1="11" y2="17" />
                </svg>
                Delete Account
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
