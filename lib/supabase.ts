import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create a single instance to avoid multiple client warnings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  username?: string
  avatar_url?: string
  preferences?: UserPreferences
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  age?: string
  location?: string
  daily_goals?: string
  interests?: string
  work_schedule?: string
  communication_style?: string
  response_style?: string
  music_preferences?: string
  visual_preferences?: string
  preferred_contact?: string
  wake_time?: string
  sleep_time?: string
  priorities?: string[]
  usage_context?: string
  tone_preference?: string
  reminder_preference?: string
}

export interface JournalEntry {
  id: string
  user_id: string
  content: string
  summary?: string
  timeline?: TimelineEvent[]
  productivity_score?: number
  happiness_score?: number
  activities?: string[]
  date: string
  created_at: string
  updated_at: string
}

export interface TimelineEvent {
  time: string
  activity: string
  duration?: number
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  due_date?: string
  priority: "low" | "medium" | "high"
  category?: string
  completed: boolean
  created_at: string
  updated_at: string
}

export interface Reminder {
  id: string
  user_id: string
  title: string
  description?: string
  reminder_time: string
  type: "notification" | "sms" | "email" | "whatsapp"
  completed: boolean
  created_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  attendees?: string[]
  created_at: string
  updated_at: string
}
