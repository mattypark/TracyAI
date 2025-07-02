import OpenAI from 'openai';
import { format, addDays } from 'date-fns';

type TimelineItem = { time: string; activity: string }

class AIService {
  private openai: OpenAI | null = null;

  constructor() {
    // We'll initialize the client lazily when needed
  }

  private getClient() {
    if (this.openai) return this.openai;
    
    // Get API key - for client-side, we need to use NEXT_PUBLIC_ prefix
    const apiKey = typeof window === 'undefined'
      ? process.env.OPENAI_API_KEY  // Server-side
      : process.env.NEXT_PUBLIC_OPENAI_API_KEY;  // Client-side
    
    if (!apiKey) {
      throw new Error("OpenAI API key is missing. Set OPENAI_API_KEY in your environment.");
    }
    
    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Allow usage in browser
    });
    
    return this.openai;
  }

  /* ---------- JOURNAL PROCESSING ---------- */
  async processJournalEntry(
    content: string,
    userPreferences: unknown = {},
  ): Promise<{
    summary: string
    timeline: TimelineItem[]
    productivityScore: number
    activities: string[]
  }> {
    console.log("AI Service: Processing journal entry with content:", content.substring(0, 50) + "...");
    
    // Default response in case of errors
    const defaultResponse = {
      summary: content.substring(0, 100) + "...",
      timeline: [],
      productivityScore: 5,
      activities: [],
    };
    
    if (!content || content.trim() === "") {
      console.error("AI Service: Empty content provided");
      return defaultResponse;
    }
    
    const prompt = `
You are Tracy AI, a personal assistant that helps structure daily reflections. 

User said: "${content}"

User preferences: ${JSON.stringify(userPreferences)}

Return ONLY valid JSON with this exact structure (no markdown, no backticks, no additional text):
{
  "summary": "Brief summary of the journal entry",
  "timeline": [{ "time": "09:00", "activity": "Woke up" }],
  "productivityScore": 7,
  "activities": ["Workout","Study"]
}
`;

    try {
      console.log("AI Service: Sending request to OpenAI");
      
      const openai = this.getClient();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an AI assistant that processes journal entries. Always respond with valid JSON only. No markdown formatting, no backticks, no additional text." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      
      const text = response.choices[0].message.content || "";
      console.log("AI Service: Received response from OpenAI:", text.substring(0, 100) + "...");

      try {
        // Clean the text before parsing to handle any unexpected characters
        const cleanedText = text.trim().replace(/^```json\s*|\s*```$/g, '');
        const parsed = JSON.parse(cleanedText);
        console.log("AI Service: Successfully parsed JSON response");
        
        return {
          summary: parsed.summary ?? content.substring(0, 100) + "...",
          timeline: parsed.timeline ?? [],
          productivityScore: parsed.productivityScore ?? 5,
          activities: parsed.activities ?? [],
        };
      } catch (parseError) {
        console.error("AI Service: Error parsing AI response:", parseError);
        console.log("AI Service: Raw response that failed to parse:", text);
        
        // Return default values if parsing fails
        return defaultResponse;
      }
    } catch (err) {
      console.error("AI Service: Processing error:", err);
      return defaultResponse;
    }
  }

  /* ---------- PERSONALISED ASSISTANT ---------- */
  async generatePersonalizedResponse(message: string, userContext: unknown): Promise<string> {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    const prompt = `
You are Tracy AI, the user's personal assistant and digital companion.

USER PERSONALIZATION DATA:
${JSON.stringify(userContext, null, 2)}

CURRENT DATE INFORMATION:
- Today's date: ${format(today, 'MMMM d, yyyy')}
- Tomorrow's date: ${format(tomorrow, 'MMMM d, yyyy')}
- Current day of week: ${format(today, 'EEEE')}

INSTRUCTIONS:
1. Use the personalization data to tailor your responses to the user's preferences
2. Address the user by their preferred name if available
3. Match your communication style to their preference (direct, detailed, casual, professional)
4. Reference their interests, goals, and priorities when relevant
5. Consider their wake/sleep time when suggesting activities
6. Adjust your tone based on their tone preference
7. Keep responses concise but helpful
8. Act as a supportive personal assistant
9. Always provide accurate date and time information
10. If asked about dates, use the current date information provided above

User message: "${message}"

Respond conversationally while incorporating their personalization preferences.`;

    try {
      const openai = this.getClient();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a personalized AI assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      });
      
      return response.choices[0].message.content || "I couldn't generate a response.";
    } catch (err) {
      console.error("AI response error:", err);
      return "I'm having trouble processing that right now. Could you try again?";
    }
  }

  /* ---------- TASK EXTRACTION ---------- */
  async extractTasksFromText(
    content: string,
  ): Promise<Array<{ title: string; description?: string; priority: "low" | "medium" | "high"; dueDate?: string }>> {
    const prompt = `
Extract tasks/reminders from: "${content}"

Return ONLY valid JSON with this structure (no markdown, no backticks, no additional text):
[
  { "title": "Call dentist", "description": "", "priority": "medium", "dueDate": "${format(new Date(), 'yyyy-MM-dd')}" }
]`;

    try {
      const openai = this.getClient();
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an AI assistant that extracts tasks from text. Always respond with valid JSON only." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });
      
      const text = response.choices[0].message.content || "[]";
      
      try {
        // Clean the text before parsing
        const cleanedText = text.trim().replace(/^```json\s*|\s*```$/g, '');
        return JSON.parse(cleanedText) ?? [];
      } catch (parseError) {
        console.error("Task extraction: Error parsing AI response:", parseError);
        return [];
      }
    } catch (err) {
      console.error("Task extraction error:", err);
      return [];
    }
  }
}

export const aiService = new AIService();
