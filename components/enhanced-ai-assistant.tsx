"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth/auth-provider"
import { aiService } from "@/lib/ai"
import { db } from "@/lib/database"
import { audioService } from "@/lib/audio"
import { supabase } from "@/lib/supabase"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: Array<{
    type: "task" | "event" | "journal"
    data: any
  }>
}

interface EnhancedAIAssistantProps {
  isFullPage?: boolean
}

export function EnhancedAIAssistant({ isFullPage = false }: EnhancedAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hi! I'm Tracy, your AI assistant. I can help you schedule meetings, add tasks, create journal entries, and more. Try saying something like 'Schedule a meeting tomorrow at 10am' or 'Add task: Call dentist'.",
          timestamp: new Date(),
        },
      ])
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const processAICommand = async (message: string): Promise<{ response: string; actions?: any[] }> => {
    try {
      // Get user context for personalized responses
      const userContext = await getUserContext()

      // Check for specific commands
      if (message.toLowerCase().includes("schedule") || message.toLowerCase().includes("meeting")) {
        return await handleScheduleCommand(message)
      } else if (message.toLowerCase().includes("add task") || message.toLowerCase().includes("create task")) {
        return await handleTaskCommand(message)
      } else if (message.toLowerCase().includes("journal") || message.toLowerCase().includes("entry")) {
        return await handleJournalCommand(message)
      } else {
        // General AI response
        const response = await aiService.generatePersonalizedResponse(message, userContext)
        return { response }
      }
    } catch (error) {
      console.error("AI command processing error:", error)
      return { response: "I'm having trouble processing that right now. Could you try again?" }
    }
  }

  const handleScheduleCommand = async (message: string): Promise<{ response: string; actions?: any[] }> => {
    try {
      // Extract event details using AI
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      
      const todayFormatted = today.toISOString().split('T')[0];
      const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
      
      const eventPrompt = `
Extract event details from this message: "${message}"

Today is ${todayFormatted} and tomorrow is ${tomorrowFormatted}.

Return ONLY valid JSON with this exact structure (no markdown, no backticks, no additional text):
{
  "title": "Meeting title",
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "description": "Brief description"
}
`;

      const responseText = await aiService.generatePersonalizedResponse(eventPrompt, {});
      console.log("AI response for schedule command:", responseText);
      
      try {
        // Clean the text before parsing to handle any unexpected characters
        const cleanedText = responseText.trim().replace(/^```json\s*|\s*```$/g, '');
        
        // Try to extract JSON from the text if it's not already valid JSON
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : cleanedText;
        
        console.log("Cleaned text for parsing:", jsonString);
        
        const eventData = JSON.parse(jsonString);
        console.log("Parsed event data:", eventData);

        // Validate required fields
        if (!eventData.title || !eventData.date || !eventData.startTime) {
          return { 
            response: "I need more details to schedule this event. Could you provide a title, date, and time?" 
          };
        }

        // Create the event
        const startDateTime = new Date(`${eventData.date}T${eventData.startTime}`);
        const endDateTime = eventData.endTime 
          ? new Date(`${eventData.date}T${eventData.endTime}`)
          : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default to 1 hour later

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          return { 
            response: "I couldn't understand the date or time format. Could you provide them in a clearer format?" 
          };
        }

        await db.createCalendarEvent({
          title: eventData.title,
          description: eventData.description || "",
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          flag_name: "Work",
          flag_color: "blue",
        });

        // Format date for display
        const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        const displayDate = startDateTime.toLocaleDateString('en-US', dateOptions);
        const displayStartTime = startDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const displayEndTime = endDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        return {
          response: `Great! I've scheduled "${eventData.title}" for ${displayDate} from ${displayStartTime} to ${displayEndTime}. The event has been added to your calendar.`,
          actions: [{ type: "event", data: eventData }],
        };
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.error("Raw response that failed to parse:", responseText);
        
        // Try to extract information manually if JSON parsing fails
        const title = message.replace(/schedule|meeting|appointment|event/gi, '').trim();
        
        return { 
          response: `I had trouble understanding the event details. Could you provide them in this format? "Schedule a meeting titled [title] on [date] at [time]"` 
        };
      }
    } catch (error) {
      console.error("Error in handleScheduleCommand:", error);
      return { response: "I had trouble scheduling that event. Could you provide more details like the date and time?" };
    }
  }

  const handleTaskCommand = async (message: string): Promise<{ response: string; actions?: any[] }> => {
    try {
      const tasks = await aiService.extractTasksFromText(message)

      if (tasks.length > 0) {
        const createdTasks = []
        for (const task of tasks) {
          const createdTask = await db.createTask({
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            due_date: task.dueDate,
            completed: false,
          })
          createdTasks.push(createdTask)
        }

        return {
          response: `Perfect! I've added ${tasks.length} task${tasks.length > 1 ? "s" : ""} to your list: ${tasks.map((t) => t.title).join(", ")}.`,
          actions: createdTasks.map((task) => ({ type: "task", data: task })),
        }
      } else {
        return { response: "I couldn't identify any specific tasks in your message. Could you be more specific?" }
      }
    } catch (error) {
      return { response: "I had trouble creating that task. Could you try rephrasing it?" }
    }
  }

  const handleJournalCommand = async (message: string): Promise<{ response: string; actions?: any[] }> => {
    try {
      console.log("Processing journal entry from chat:", message);
      
      const userContext = await getUserContext();
      
      // First create a basic entry to ensure it's saved
      const basicEntry = {
        content: message,
        summary: message.substring(0, 100) + "...",
        timeline: [],
        productivity_score: 5,
        activities: [],
        date: new Date().toISOString().split("T")[0],
      };
      
      console.log("Creating basic journal entry:", basicEntry);
      
      try {
        const journalEntry = await db.createJournalEntry(basicEntry);
        console.log("Basic journal entry created:", journalEntry);
        
        // Set flag to indicate we've created an entry
        if (typeof window !== 'undefined') {
          localStorage.setItem('hasCreatedEntry', 'true');
          // Set flag for one-time refresh on next page load
          sessionStorage.setItem('needsRefresh', 'true');
        }
        
        // Process with AI in the background
        try {
          const processedEntry = await aiService.processJournalEntry(message, userContext);
          console.log("AI processed journal entry:", processedEntry);
          
          // Update the entry with AI-processed data if we have an ID
          if (journalEntry?.id) {
            await supabase.from('journal_entries').update({
              summary: processedEntry.summary,
              timeline: processedEntry.timeline,
              productivity_score: processedEntry.productivityScore,
              activities: processedEntry.activities,
            }).eq('id', journalEntry.id);
            
            console.log("Journal entry enhanced with AI data");
            
            return {
              response: `I've created your journal entry! Your productivity score for today is ${processedEntry.productivityScore}/10. ${processedEntry.summary}`,
              actions: [{ type: "journal", data: processedEntry }],
            };
          }
        } catch (aiError) {
          console.error("AI processing error (entry already saved):", aiError);
        }
        
        // Return a response even if AI processing fails
        return {
          response: "I've saved your journal entry! You can view it in the journal section.",
          actions: [{ type: "journal", data: basicEntry }],
        };
      } catch (dbError) {
        console.error("Database error saving journal entry:", dbError);
        return { 
          response: "I had trouble saving your journal entry to the database. Could you try again?" 
        };
      }
    } catch (error) {
      console.error("Error in handleJournalCommand:", error);
      return { response: "I had trouble creating that journal entry. Could you try again?" };
    }
  }

  const getUserContext = async () => {
    if (!user) return {}

    try {
      const userData = await db.getCurrentUser()
      const userProfile = await db.getUserProfile()
      
      // Get user preferences from Supabase
      const { data: userPreferences } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userData?.id)
        .single();
      
      return {
        name: userData?.user_metadata?.full_name || userPreferences?.preferences?.full_name || "there",
        preferences: userPreferences?.preferences || {},
        email: userData?.email,
        profile: userProfile || {},
      }
    } catch (error) {
      console.error("Error fetching user context:", error)
      return {}
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    try {
      const { response, actions } = await processAICommand(inputValue)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        actions,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble processing that right now. Could you try again?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceToggle = async () => {
    if (isListening) {
      try {
        const audioBlob = await audioService.stopRecording()
        const transcription = await audioService.transcribeAudio(audioBlob)

        if (transcription) {
          setInputValue(transcription)
        }
        setIsListening(false)
      } catch (error) {
        console.error("Voice recording error:", error)
        setIsListening(false)
      }
    } else {
      try {
        await audioService.startRecording()
        setIsListening(true)
      } catch (error) {
        console.error("Failed to start recording:", error)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={`flex flex-col ${isFullPage ? "h-full" : "h-[600px]"} bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                }`}
              >
                <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {message.actions.map((action, index) => (
                      <div key={index} className="text-xs opacity-75">
                        ✓{" "}
                        {action.type === "task"
                          ? "Task created"
                          : action.type === "event"
                            ? "Event scheduled"
                            : "Journal entry saved"}
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        {isListening && (
          <div className="mb-1 p-1 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center text-red-600 dark:text-red-400">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1" />
              <span className="text-xs">Listening...</span>
            </div>
          </div>
        )}

        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="icon"
            onClick={handleVoiceToggle}
            className={`h-7 w-7 ${isListening ? "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400" : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </Button>

          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Tracy anything..."
            className="flex-1 h-7 text-xs"
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="h-7 w-7 p-0 bg-black dark:bg-white text-white dark:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </Button>
        </div>

        <div className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
          Try: "Schedule meeting", "Add task", "Create journal"
        </div>
      </div>
    </div>
  )
}
