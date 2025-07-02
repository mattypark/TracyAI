"use client"


import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/database"
import { useRouter } from "next/navigation"
import { aiService } from "@/lib/ai"
import { audioService } from "@/lib/audio"
import { Mic, MicOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
// Removed hook imports to prevent infinite loops

interface FunctionalActionButtonsProps {
  variant: "journal" | "task" | "event"
  children: React.ReactNode
  className?: string
}

export function FunctionalActionButtons({ variant, children, className }: FunctionalActionButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [processingError, setProcessingError] = useState<string | null>(null)
  // Client-side state to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  
  // Removed hook calls to prevent infinite loops
  // const { refetch: refetchJournal } = useJournal()
  // const { refetch: refetchTasks } = useTasks()
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleClick = () => {
    if (!isClient) return; // Don't open dialog until client-side rendering is ready
    setIsOpen(true)
    setFormData({})
    setProcessingError(null)
  }

  const handleVoiceRecord = async () => {
    if (isRecording) {
      try {
        setIsRecording(false)
        setLoading(true)
        console.log("Stopping recording and transcribing...");
        
        const audioBlob = await audioService.stopRecording()
        console.log("Recording stopped, audio blob size:", audioBlob.size);
        
        // Show a message to the user
        setProcessingError("Transcribing your audio...");
        
        const transcription = await audioService.transcribeAudio(audioBlob)
        console.log("Transcription received:", transcription?.substring(0, 50) + "...");
        
        setProcessingError(null);
        setLoading(false);

        if (variant === "journal" && transcription) {
          setFormData({ ...formData, content: transcription })
        } else if (variant === "task" && transcription) {
          setFormData({ ...formData, title: transcription })
        } else if (variant === "event" && transcription) {
          setFormData({ ...formData, title: transcription })
        }
      } catch (error) {
        console.error("Voice recording error:", error)
        setIsRecording(false)
        setLoading(false)
        setProcessingError("There was an error processing your recording. Please try typing instead.")
      }
    } else {
      try {
        setProcessingError("Please allow microphone access when prompted...");
        await audioService.startRecording()
        setIsRecording(true)
        setProcessingError(null);
      } catch (error) {
        console.error("Failed to start recording:", error)
        setProcessingError("Could not access your microphone. Please check your browser permissions.")
      }
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setProcessingError(null)
    
    try {
      if (variant === "journal") {
        try {
          console.log("Processing journal entry with content:", formData.content);
          
          // Skip AI processing for test entries
          if (formData.content?.toLowerCase().trim() === "test") {
            console.log("Creating test journal entry without AI processing");
            
            const testEntry = {
              content: "This is a test journal entry.",
              summary: "Test entry for debugging purposes.",
              timeline: [{ time: "09:00", activity: "Created test entry" }],
              productivity_score: 7,
              activities: ["Testing", "Debugging"],
              date: new Date().toISOString().split("T")[0],
            };
            
            console.log("Creating test journal entry with data:", testEntry);
            const result = await db.createJournalEntry(testEntry);
            console.log("Test journal entry created:", result);
            
            // Mark that we've created an entry
            if (typeof window !== 'undefined') {
              localStorage.setItem('hasCreatedEntry', 'true');
              // Set flag for one-time refresh on next page load
              sessionStorage.setItem('needsRefresh', 'true');
            }
            
            setIsOpen(false);
            setFormData({});
            
            // Navigate to home page without forcing a reload
            router.push('/');
            return;
          }
          
          // Create a basic entry first
          const basicEntry = {
            content: formData.content || "No content provided",
            summary: formData.content?.substring(0, 100) + "..." || "No content",
            timeline: [],
            productivity_score: 5,
            activities: [],
            date: new Date().toISOString().split("T")[0],
          };
          
          console.log("Creating basic journal entry with data:", basicEntry);
          const result = await db.createJournalEntry(basicEntry);
          console.log("Basic journal entry created:", result);
          
          // Mark that we've created an entry
          if (typeof window !== 'undefined') {
            localStorage.setItem('hasCreatedEntry', 'true');
            // Set flag for one-time refresh on next page load
            sessionStorage.setItem('needsRefresh', 'true');
          }
          
          setIsOpen(false);
          setFormData({});
          
          // Navigate to home page without forcing a reload
          router.push('/');
          
          // Try to enhance with AI in the background if we have content
          if (formData.content && formData.content.trim() !== "") {
            try {
              const processed = await aiService.processJournalEntry(formData.content);
              
              if (result?.id) {
                // Update the entry with AI-processed data
                await supabase.from('journal_entries').update({
                  summary: processed.summary,
                  timeline: processed.timeline,
                  productivity_score: processed.productivityScore,
                  activities: processed.activities,
                }).eq('id', result.id);
                
                console.log("Journal entry enhanced with AI data");
              }
            } catch (aiError) {
              console.error("AI enhancement failed (entry already saved):", aiError);
              // Entry is already saved, so we don't need to show an error to the user
            }
          }
        } catch (error) {
          console.error("Error creating journal entry:", error);
          setProcessingError("There was an error creating your journal entry. Please try again.");
        }
      } else if (variant === "task") {
        await db.createTask({
          title: formData.title,
          description: formData.description || "",
          priority: formData.priority || "medium",
          due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
          completed: false,
        })
        
        // Mark that we've created an entry
        if (typeof window !== 'undefined') {
          localStorage.setItem('hasCreatedEntry', 'true');
          // Set flag for one-time refresh on next page load
          sessionStorage.setItem('needsRefresh', 'true');
        }
        
        setIsOpen(false)
        setFormData({})
        
        // Navigate to home page without forcing a reload
        router.push('/');
      } else if (variant === "event") {
        const startTime = new Date(formData.startTime)
        const endTime = new Date(formData.endTime || startTime.getTime() + 60 * 60 * 1000)

        await db.createCalendarEvent({
          title: formData.title,
          description: formData.description || "",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          location: formData.location || "",
        })
        
        // Mark that we've created an entry
        if (typeof window !== 'undefined') {
          localStorage.setItem('hasCreatedEntry', 'true');
          // Set flag for one-time refresh on next page load
          sessionStorage.setItem('needsRefresh', 'true');
        }
        
        setIsOpen(false)
        setFormData({})
        
        // Navigate to home page without forcing a reload
        router.push('/');
      }
    } catch (error) {
      console.error(`Error creating ${variant}:`, error)
      setProcessingError(`Error creating ${variant}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const getDialogContent = () => {
    switch (variant) {
      case "journal":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  onClick={handleVoiceRecord}
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                  className="flex items-center space-x-2"
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? "Stop Recording" : "Voice Record"}</span>
                </Button>
              </div>

              <Textarea
                placeholder="Tell me about your day..."
                value={formData.content || ""}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full"
              />

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.content || loading} className="flex-1">
                  {loading ? "Creating..." : "Create Entry"}
                </Button>
              </div>
            </div>
          </>
        )

      case "task":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Task title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <Textarea
                placeholder="Description (optional)"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={formData.priority || "medium"}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="datetime-local"
                    value={formData.dueDate || ""}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.title || loading} className="flex-1">
                  {loading ? "Adding..." : "Add Task"}
                </Button>
              </div>
            </div>
          </>
        )

      case "event":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Schedule New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Event title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <Textarea
                placeholder="Description (optional)"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime || ""}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime || ""}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>

              <Input
                placeholder="Location (optional)"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.title || !formData.startTime || loading}
                  className="flex-1"
                >
                  {loading ? "Scheduling..." : "Schedule Event"}
                </Button>
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div onClick={handleClick} className={className}>
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">{getDialogContent()}</DialogContent>
      </Dialog>
    </>
  )
}
