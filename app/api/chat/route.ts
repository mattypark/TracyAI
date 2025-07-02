import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { db } from "@/lib/database"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]

    // Get user context for personalized responses
    const user = await db.getCurrentUser()
    const recentEntries = await db.getJournalEntries()
    const tasks = await db.getTasks()

    // Create a safe user context object
    const userContext = {
      name: user?.user_metadata?.full_name || "User",
      email: user?.email,
      recentJournalEntries: recentEntries.map((entry: any) => ({
        date: entry.date,
        summary: entry.summary,
        activities: entry.activities,
        productivityScore: entry.productivity_score?.toString() || "0",
      })),
      activeTasks: tasks.filter((task: any) => !task.completed).length.toString(),
      completedTasks: tasks.filter((task: any) => task.completed).length.toString(),
    }

    const systemPrompt = `You are Tracy AI, the user's personal assistant. You know them well from their journal entries, tasks, and preferences.

USER PERSONALIZATION DATA:
${JSON.stringify(userContext, null, 2)}

INSTRUCTIONS:
1. Use the personalization data to tailor your responses to the user's preferences
2. Address the user by their preferred name if available
3. Match your communication style to their preference (direct, detailed, casual, professional)
4. Reference their interests, goals, and priorities when relevant
5. Consider their wake/sleep time when suggesting activities
6. Adjust your tone based on their tone preference
7. Keep responses concise but helpful
8. Act as a supportive personal assistant like Jarvis from Iron Man

Be conversational, helpful, and personalized. Reference their habits, goals, and recent activities when relevant.`

    try {
      const result = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        messages,
        temperature: 0.7,
      })
      
      return new Response(JSON.stringify({ text: result.text }), {
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.error("OpenAI API error:", error)
      return new Response(
        JSON.stringify({ error: "There was an error with the AI service. Please check your API key." }),
        { 
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      )
    }
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    )
  }
}
