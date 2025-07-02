"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"

interface OnboardingData {
  full_name: string
  username: string
  age: string
  location: string
  daily_goals: string
  daily_priorities: string
  interests: string
  usage_context: string
  wake_time: string
  sleep_time: string
  reminder_preference: string
  tone_preference: string
  response_style: string
  music_preferences: string
  visual_preferences: string
}

const questions = [
  {
    id: "full_name",
    title: "What's your full name?",
    subtitle: "First and last name preferred (e.g., Matthew Park)",
    type: "input",
    placeholder: "e.g., Matthew Park",
    required: true,
  },
  {
    id: "username",
    title: "Choose your username/handle",
    subtitle: "This will be your unique @handle (e.g., @matthewpark)",
    type: "input",
    placeholder: "e.g., matthewpark",
    required: true,
  },
  {
    id: "age",
    title: "Can you tell me your age?",
    subtitle: "This helps me personalize your experience (optional)",
    type: "input",
    placeholder: "e.g., 25",
  },
  {
    id: "location",
    title: "Where are you located?",
    subtitle: "City, Country - helps with time zones and local suggestions",
    type: "input",
    placeholder: "e.g., San Francisco, CA",
  },
  {
    id: "daily_goals",
    title: "What are you hoping to achieve daily?",
    subtitle: "Your main goals and aspirations",
    type: "textarea",
    placeholder: "e.g., Be more productive, exercise regularly, learn new skills, maintain work-life balance...",
  },
  {
    id: "daily_priorities",
    title: "What are your main priorities on a day-to-day basis?",
    subtitle: "The most important things you focus on each day",
    type: "textarea",
    placeholder: "e.g., Work projects, family time, health and fitness, learning, personal development...",
  },
  {
    id: "interests",
    title: "What topics are you most interested in?",
    subtitle: "Your hobbies, passions, and areas of focus",
    type: "textarea",
    placeholder: "e.g., Technology, fitness, cooking, reading, music, travel, entrepreneurship...",
  },
  {
    id: "usage_context",
    title: "Is this for school, work, or personal use?",
    subtitle: "How you plan to use Tracy",
    type: "input",
    placeholder: "e.g., Personal development, Work productivity, School/Studies, Health & wellness...",
  },
  {
    id: "wake_time",
    title: "What time do you usually wake up?",
    subtitle: "Helps me schedule reminders and suggestions",
    type: "time",
    placeholder: "07:00",
  },
  {
    id: "sleep_time",
    title: "What time do you usually go to sleep?",
    subtitle: "For better scheduling and wellness tracking",
    type: "time",
    placeholder: "23:00",
  },
  {
    id: "reminder_preference",
    title: "How would you like to receive reminders?",
    subtitle: "Your preferred notification method",
    type: "input",
    placeholder: "e.g., App notifications, Email, SMS, WhatsApp, Multiple methods...",
  },
  {
    id: "tone_preference",
    title: "Do you prefer formal or casual language?",
    subtitle: "How I should communicate with you",
    type: "input",
    placeholder: "e.g., Very casual, Casual, Professional, Formal...",
  },
  {
    id: "response_style",
    title: "Would you like brief answers or detailed explanations?",
    subtitle: "Response length preference",
    type: "input",
    placeholder: "e.g., Brief and concise, Moderate detail, Detailed explanations...",
  },
  {
    id: "music_preferences",
    title: "What kind of music or media do you enjoy?",
    subtitle: "For mood-based suggestions and recommendations",
    type: "textarea",
    placeholder: "e.g., Pop, Rock, Jazz, Classical, Podcasts, Audiobooks, Lo-fi...",
  },
  {
    id: "visual_preferences",
    title: "Would you like visual aids like charts or just text?",
    subtitle: "How you prefer information presented",
    type: "input",
    placeholder: "e.g., Text only, Some visuals, Lots of visuals, Charts and graphs preferred...",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showDemo, setShowDemo] = useState(false)
  const [formData, setFormData] = useState<OnboardingData>({
    full_name: "",
    username: "",
    age: "",
    location: "",
    daily_goals: "",
    daily_priorities: "",
    interests: "",
    usage_context: "",
    wake_time: "",
    sleep_time: "",
    reminder_preference: "",
    tone_preference: "",
    response_style: "",
    music_preferences: "",
    visual_preferences: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push("/auth")
    }
  }, [user, router])

  const currentQuestion = questions[currentStep]
  const isLastQuestion = currentStep === questions.length - 1

  const handleInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
    setError("")
  }

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username) return false

    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "")

    // Check if username exists in preferences since there's no username column
    const { data, error } = await supabase
      .from("users")
      .select("preferences")
      .filter("preferences->username", "eq", cleanUsername)
      .limit(1)

    if (error) {
      console.log("Error checking username availability:", error)
      return true // Assume available if we can't check
    }

    return !data || data.length === 0 // Returns true if username is available (no data found)
  }

  const handleNext = async () => {
    const currentValue = formData[currentQuestion.id as keyof OnboardingData]

    // Check required fields
    if (currentQuestion.required && !currentValue.trim()) {
      setError("This field is required")
      return
    }

    // Check username availability
    if (currentQuestion.id === "username" && currentValue) {
      const cleanUsername = currentValue.toLowerCase().replace(/[^a-z0-9_]/g, "")
      const isAvailable = await checkUsernameAvailability(cleanUsername)

      if (!isAvailable) {
        setError("This username is already taken. Please choose another one.")
        return
      }

      // Update with clean username
      setFormData((prev) => ({ ...prev, username: cleanUsername }))
    }

    if (isLastQuestion) {
      handleComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSkip = () => {
    if (currentQuestion.required) {
      setError("This field is required and cannot be skipped")
      return
    }

    if (isLastQuestion) {
      handleComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return

    setLoading(true)
    setError("")
    
    try {
      // First, check if the user already exists in the users table
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      // Prepare the user data
      const userData: any = {
        id: user.id,
        email: user.email!,
        full_name: formData.full_name || null,
        preferences: {
          age: formData.age || null,
          location: formData.location || null,
          daily_goals: formData.daily_goals || null,
          daily_priorities: formData.daily_priorities || null,
          interests: formData.interests || null,
          usage_context: formData.usage_context || null,
          wake_time: formData.wake_time || null,
          sleep_time: formData.sleep_time || null,
          reminder_preference: formData.reminder_preference || null,
          tone_preference: formData.tone_preference || null,
          response_style: formData.response_style || null,
          music_preferences: formData.music_preferences || null,
          visual_preferences: formData.visual_preferences || null,
          // Store username in preferences for now since the column doesn't exist
          username: formData.username ? formData.username.toLowerCase().replace(/[^a-z0-9_]/g, "") : null,
        },
        onboarding_completed: true,
      }

      // Don't add username as a top-level field since the column doesn't exist
      // if (formData.username && formData.username.trim()) {
      //   const cleanUsername = formData.username.toLowerCase().replace(/[^a-z0-9_]/g, "")
      //   userData.username = cleanUsername
      // }

      let result
      
      if (existingUser) {
        // User exists, update them
        const { data, error } = await supabase
          .from("users")
          .update(userData)
          .eq("id", user.id)
          .select()
          .single()
        
        result = { data, error }
      } else {
        // User doesn't exist, insert them
        const { data, error } = await supabase
          .from("users")
          .insert([userData])
          .select()
          .single()
        
        result = { data, error }
      }

      if (result.error) {
        console.error("Database error:", result.error)
        throw new Error(result.error.message || "Failed to save user data")
      }

      console.log("Successfully saved user preferences:", result.data)
      setShowDemo(true)
      
    } catch (error: any) {
      console.error("Error saving preferences:", error)
      setError(error.message || "Failed to save preferences. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoComplete = () => {
    router.push("/")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (showDemo) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl text-center"
        >
          <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
            <CardHeader>
              <CardTitle className="text-2xl dark:text-white">
                Welcome to Tracy AI, {formData.full_name.split(" ")[0]}!
              </CardTitle>
              <p className="text-gray-500 dark:text-gray-400">Here's a quick demo of how Tracy works</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demo Video Placeholder */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src="/placeholder.svg?width=640&height=360"
                  alt="Demo video placeholder"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold dark:text-white">What you can do with Tracy:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                      🎤
                    </div>
                    <p className="font-medium dark:text-white">Voice Journaling</p>
                    <p className="text-gray-500 dark:text-gray-400">Speak your thoughts naturally</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                      🤖
                    </div>
                    <p className="font-medium dark:text-white">AI Insights</p>
                    <p className="text-gray-500 dark:text-gray-400">Get personalized analysis</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                      📊
                    </div>
                    <p className="font-medium dark:text-white">Track Progress</p>
                    <p className="text-gray-500 dark:text-gray-400">Monitor your productivity</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleDemoComplete}
                className="w-full bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
              >
                Start Using Tracy
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">Let's personalize Tracy</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Help me understand you better for a personalized experience
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="bg-gray-100 dark:bg-gray-800 h-2 rounded-full mb-8">
          <div
            className="bg-black dark:bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="text-xl dark:text-white">{currentQuestion.title}</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentQuestion.subtitle}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion.type === "input" && (
                  <div>
                    <Input
                      value={formData[currentQuestion.id as keyof OnboardingData]}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    {currentQuestion.id === "username" && formData.username && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Your handle will be: @{formData.username.toLowerCase().replace(/[^a-z0-9_]/g, "")}
                      </p>
                    )}
                  </div>
                )}

                {currentQuestion.type === "textarea" && (
                  <Textarea
                    value={formData[currentQuestion.id as keyof OnboardingData]}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    rows={4}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                )}

                {currentQuestion.type === "time" && (
                  <Input
                    type="time"
                    value={formData[currentQuestion.id as keyof OnboardingData]}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  />
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1 bg-transparent dark:border-gray-700 dark:text-gray-300"
                    disabled={currentQuestion.required}
                  >
                    {currentQuestion.required ? "Required" : "Skip"}
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-1 bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black"
                  >
                    {loading ? "Saving..." : isLastQuestion ? "Complete" : "Next"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Question {currentStep + 1} of {questions.length}
          </p>
        </div>
      </div>
    </main>
  )
}
