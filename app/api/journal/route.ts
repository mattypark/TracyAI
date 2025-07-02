import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Get user preferences for AI processing
    const user = await db.getCurrentUser()
    const userProfile = user ? await db.getUserProfile(user.id) : null

    // Process with AI
    const processed = await aiService.processJournalEntry(content, userProfile?.preferences)

    // Save to database
    const entry = await db.createJournalEntry({
      content,
      summary: processed.summary,
      timeline: processed.timeline,
      productivity_score: processed.productivityScore,
      activities: processed.activities,
      date: new Date().toISOString().split("T")[0],
    })

    // Extract and create tasks if any
    const extractedTasks = await aiService.extractTasksFromText(content)
    for (const task of extractedTasks) {
      await db.createTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate,
        completed: false,
      })
    }

    return NextResponse.json({ entry, extractedTasks })
  } catch (error) {
    console.error("Journal API error:", error)
    return NextResponse.json({ error: "Failed to process journal entry" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const entries = await db.getJournalEntries()
    return NextResponse.json({ entries })
  } catch (error) {
    console.error("Journal GET error:", error)
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 })
  }
}
