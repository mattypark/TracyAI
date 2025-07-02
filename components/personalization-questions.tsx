"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/auth/auth-provider"

interface PersonalizationData {
  communication_style: string
  goals: string[]
  work_schedule: string
  priorities: string
  current_challenges: string
}

interface PersonalizationQuestionsProps {
  onComplete: (data: PersonalizationData) => void
  initialData?: Partial<PersonalizationData>
}

export function PersonalizationQuestions({ onComplete, initialData }: PersonalizationQuestionsProps) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<PersonalizationData>({
    communication_style: initialData?.communication_style || "",
    goals: initialData?.goals || [],
    work_schedule: initialData?.work_schedule || "",
    priorities: initialData?.priorities || "",
    current_challenges: initialData?.current_challenges || "",
  })

  const questions = [
    {
      title: "How do you prefer to communicate?",
      subtitle: "This helps me tailor my responses to your style",
      type: "radio",
      key: "communication_style" as keyof PersonalizationData,
      options: [
        { value: "direct", label: "Direct and to the point" },
        { value: "detailed", label: "Detailed explanations" },
        { value: "casual", label: "Casual and friendly" },
        { value: "professional", label: "Professional and formal" },
      ],
    },
    {
      title: "What are your main goals?",
      subtitle: "Select all that apply to help me understand your focus areas",
      type: "checkbox",
      key: "goals" as keyof PersonalizationData,
      options: [
        { value: "productivity", label: "Increase productivity" },
        { value: "wellness", label: "Improve mental wellness" },
        { value: "organization", label: "Better organization" },
        { value: "habits", label: "Build better habits" },
        { value: "work_life_balance", label: "Work-life balance" },
        { value: "creativity", label: "Boost creativity" },
      ],
    },
    {
      title: "What's your typical work schedule?",
      subtitle: "This helps me suggest the best times for tasks and breaks",
      type: "radio",
      key: "work_schedule" as keyof PersonalizationData,
      options: [
        { value: "9to5", label: "Traditional 9-5" },
        { value: "flexible", label: "Flexible hours" },
        { value: "remote", label: "Remote work" },
        { value: "shift", label: "Shift work" },
        { value: "freelance", label: "Freelance/Variable" },
      ],
    },
    {
      title: "What are your main priorities on a day-to-day basis?",
      subtitle: "Tell me about what matters most to you in your daily routine",
      type: "textarea",
      key: "priorities" as keyof PersonalizationData,
      placeholder: "e.g., Family time, career growth, health and fitness, creative projects...",
    },
    {
      title: "What challenges are you currently facing?",
      subtitle: "Understanding your challenges helps me provide better support",
      type: "textarea",
      key: "current_challenges" as keyof PersonalizationData,
      placeholder: "e.g., Time management, staying motivated, work stress, maintaining routines...",
    },
  ]

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Save personalization data
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        communication_style: formData.communication_style,
        goals: formData.goals,
        work_schedule: formData.work_schedule,
        priorities: formData.priorities,
        current_challenges: formData.current_challenges,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      onComplete(formData)
    } catch (error) {
      console.error("Error saving personalization data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (key: keyof PersonalizationData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const canProceed =
    formData[currentQuestion.key] &&
    (Array.isArray(formData[currentQuestion.key])
      ? (formData[currentQuestion.key] as any[]).length > 0
      : (formData[currentQuestion.key] as string).trim() !== "")

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">
                Question {currentStep + 1} of {questions.length}
              </span>
              <div className="flex space-x-1">
                {questions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${index <= currentStep ? "bg-purple-600" : "bg-gray-300"}`}
                  />
                ))}
              </div>
            </div>
            <CardTitle className="text-xl">{currentQuestion.title}</CardTitle>
            <p className="text-gray-600">{currentQuestion.subtitle}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentQuestion.type === "radio" && (
              <RadioGroup
                value={formData[currentQuestion.key] as string}
                onValueChange={(value) => updateFormData(currentQuestion.key, value)}
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "checkbox" && (
              <div className="space-y-3">
                {currentQuestion.options?.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={(formData[currentQuestion.key] as string[]).includes(option.value)}
                      onCheckedChange={(checked) => {
                        const currentValues = formData[currentQuestion.key] as string[]
                        if (checked) {
                          updateFormData(currentQuestion.key, [...currentValues, option.value])
                        } else {
                          updateFormData(
                            currentQuestion.key,
                            currentValues.filter((v) => v !== option.value),
                          )
                        }
                      }}
                    />
                    <Label htmlFor={option.value} className="cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === "textarea" && (
              <Textarea
                placeholder={currentQuestion.placeholder}
                value={formData[currentQuestion.key] as string}
                onChange={(e) => updateFormData(currentQuestion.key, e.target.value)}
                rows={4}
                className="resize-none"
              />
            )}

            <div className="flex justify-between pt-6">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!canProceed || loading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : isLastStep ? (
                  "Complete Setup"
                ) : (
                  "Next"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
