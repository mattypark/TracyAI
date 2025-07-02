import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

class DatabaseService {
  // Get current user
  async getCurrentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  }

  // Journal methods
  async getJournalEntries(userId?: string) {
    try {
      if (!userId) {
        const user = await this.getCurrentUser()
        if (!user) return []
        userId = user.id
      }

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching journal entries:", error)
      return []
    }
  }

  async createJournalEntry(entry: any) {
    console.log("Database Service: Creating journal entry with data:", entry);
    
    try {
      const user = await this.getCurrentUser();
      console.log("Database Service: Current user:", user?.id);
      
      if (!user) {
        console.error("Database Service: User not authenticated");
        throw new Error("User not authenticated");
      }
      
      // Ensure all required fields are present
      const journalEntry = {
        content: entry.content || "",
        summary: entry.summary || entry.content.substring(0, 100) + "...",
        timeline: entry.timeline || [],
        productivity_score: entry.productivity_score || 5,
        activities: entry.activities || [],
        date: entry.date || new Date().toISOString().split("T")[0],
        user_id: user.id,
        created_at: new Date().toISOString(),
      };
      
      console.log("Database Service: Sanitized journal entry:", journalEntry);
      
      const { data, error } = await supabase
        .from("journal_entries")
        .insert(journalEntry)
        .select()
        .single();

      if (error) {
        console.error("Database Service: Error inserting journal entry:", error);
        throw error;
      }
      
      console.log("Database Service: Successfully created journal entry:", data);
      return data;
    } catch (error) {
      console.error("Database Service: Error in createJournalEntry:", error);
      throw error;
    }
  }

  // Tasks methods
  async getTasks(userId?: string) {
    try {
      if (!userId) {
        const user = await this.getCurrentUser()
        if (!user) return []
        userId = user.id
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching tasks:", error)
      return []
    }
  }

  async createTask(task: any) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        ...task,
        user_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateTask(taskId: string, updates: any) {
    const { data, error } = await supabase.from("tasks").update(updates).eq("id", taskId).select().single()

    if (error) throw error
    return data
  }

  // Calendar methods
  async getCalendarEvents(userId?: string) {
    try {
      if (!userId) {
        const user = await this.getCurrentUser()
        // If no user is authenticated, return empty array (no events to show)
        if (!user) return []
        userId = user.id
      }

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", userId)
        .order("start_time", { ascending: true })

      if (error) {
        console.error("Error fetching calendar events:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      return []
    }
  }

  async createCalendarEvent(event: any) {
    try {
      const user = await this.getCurrentUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      const eventData = {
        user_id: user.id,
        title: event.title,
        description: event.description || "",
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location || "",
        guests: event.guests || "",
        link: event.link || "",
        all_day: event.all_day || false,
        flag_name: event.flag_name || "",
        flag_color: event.flag_color || "#3B82F6",
      }

      const { data, error } = await supabase
        .from("calendar_events")
        .insert([eventData])
        .select()
        .single()

      if (error) {
        console.error("Error creating calendar event:", error)
        throw error
      }

      console.log("Successfully created calendar event:", data)
      return data
    } catch (error) {
      console.error("Error in createCalendarEvent:", error)
      throw error
    }
  }

  async getUpcomingEvents(days: number = 7) {
    try {
      const user = await this.getCurrentUser()
      // If no user is authenticated, return empty array
      if (!user) return []

      const now = new Date()
      const futureDate = new Date()
      futureDate.setDate(now.getDate() + days)

      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("user_id", user.id)
        .gte("start_time", now.toISOString())
        .lte("start_time", futureDate.toISOString())
        .order("start_time", { ascending: true })

      if (error) {
        console.error("Error fetching upcoming events:", error)
        return []
      }
      return data || []
    } catch (error) {
      console.error("Error fetching upcoming events:", error)
      return []
    }
  }

  // Flags methods
  async getUserFlags(userId?: string) {
    try {
      // If no userId provided, try to get current user
      if (!userId) {
        const user = await this.getCurrentUser()
        // If no user is authenticated, return default flags
        if (!user) {
          return this.getDefaultFlags()
        }
        userId = user.id
      }

      const { data, error } = await supabase
        .from("event_flags")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        // If table doesn't exist, return default flags
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          console.log("event_flags table does not exist, returning default flags")
          return this.getDefaultFlags()
        }
        console.error("Error fetching flags:", error)
        return this.getDefaultFlags()
      }
      
      // If no flags found in database, return default flags
      if (!data || data.length === 0) {
        return this.getDefaultFlags()
      }
      
      return data
    } catch (error) {
      console.error("Error fetching flags:", error)
      return this.getDefaultFlags()
    }
  }

  // Get default flags when table doesn't exist
  private getDefaultFlags() {
    return [
      { id: "default-work", name: "Work", color: "#3B82F6", user_id: "default" },
      { id: "default-personal", name: "Personal", color: "#10B981", user_id: "default" },
      { id: "default-health", name: "Health", color: "#EF4444", user_id: "default" },
      { id: "default-social", name: "Social", color: "#8B5CF6", user_id: "default" },
    ]
  }

  async createFlag(flag: { name: string; color: string }) {
    try {
      const user = await this.getCurrentUser()
      
      // If no user is authenticated, create a local flag that works in the UI
      if (!user) {
        return {
          id: `local-${Date.now()}`,
          name: flag.name,
          color: flag.color,
          user_id: "local",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }

      const { data, error } = await supabase
        .from("event_flags")
        .insert({
          ...flag,
          user_id: user.id,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("Supabase error creating flag:", error)
        
        // If database tables don't exist, create a mock flag that works locally
        if (error.code === '42P01' || (error.message && typeof error.message === 'string' && error.message.includes('does not exist'))) {
          return {
            id: `local-${Date.now()}`,
            name: flag.name,
            color: flag.color,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        }
        
        // For any other database error, create a local flag
        return {
          id: `local-${Date.now()}`,
          name: flag.name,
          color: flag.color,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }
      
      return data
    } catch (error: any) {
      console.error("Error in createFlag:", error)
      
      // For any error (network, auth, etc.), create a local flag that works
      return {
        id: `local-${Date.now()}`,
        name: flag.name,
        color: flag.color,
        user_id: "local",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
  }

  async updateFlag(flagId: string, updates: { name: string; color: string }) {
    try {
      // If it's a default flag or local flag, just return the updated data without database call
      if (flagId.startsWith('default-') || flagId.startsWith('local-')) {
        return {
          id: flagId,
          ...updates,
          user_id: flagId.startsWith('default-') ? "default" : "local",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      }

      const { data, error } = await supabase.from("event_flags").update(updates).eq("id", flagId).select().single()

      if (error) {
        console.error("Error updating flag:", error)
        throw error
      }
      return data
    } catch (error) {
      console.error("Error in updateFlag:", error)
      throw error
    }
  }

  async deleteFlag(flagId: string) {
    try {
      // If it's a default flag or local flag, just return success without database call
      if (flagId.startsWith('default-') || flagId.startsWith('local-')) {
        return
      }

      const { error } = await supabase.from("event_flags").delete().eq("id", flagId)

      if (error) {
        console.error("Error deleting flag:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in deleteFlag:", error)
      throw error
    }
  }

  // Create default flags for new users
  async createDefaultFlags(userId: string) {
    const defaultFlags = [
      { name: "Work", color: "#3B82F6" },
      { name: "Personal", color: "#10B981" },
      { name: "Health", color: "#EF4444" },
      { name: "Social", color: "#8B5CF6" },
    ]

    try {
      const promises = defaultFlags.map(flag => 
        supabase.from("event_flags").insert({
          ...flag,
          user_id: userId,
          created_at: new Date().toISOString(),
        }).select().single()
      )

      await Promise.all(promises)
    } catch (error) {
      console.error("Error creating default flags:", error)
      // Don't throw error as this is not critical
    }
  }

  // Stats methods
  async getProductivityStats(userId?: string) {
    try {
      if (!userId) {
        const user = await this.getCurrentUser()
        if (!user)
          return {
            weeklyAverage: 0,
            monthlyAverage: 0,
            currentStreak: 0,
            totalEntries: 0,
          }
        userId = user.id
      }

      // Get journal entries for stats
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("productivity_score, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const weeklyEntries = entries?.filter((entry) => new Date(entry.created_at) >= oneWeekAgo) || []

      const monthlyEntries = entries?.filter((entry) => new Date(entry.created_at) >= oneMonthAgo) || []

      const weeklyAverage =
        weeklyEntries.length > 0
          ? weeklyEntries.reduce((sum, entry) => sum + (entry.productivity_score || 0), 0) / weeklyEntries.length
          : 0

      const monthlyAverage =
        monthlyEntries.length > 0
          ? monthlyEntries.reduce((sum, entry) => sum + (entry.productivity_score || 0), 0) / monthlyEntries.length
          : 0

      // Calculate streak (consecutive days with entries)
      let currentStreak = 0
      const today = new Date().toDateString()
      const entriesByDate = new Map()

      entries?.forEach((entry) => {
        const date = new Date(entry.created_at).toDateString()
        if (!entriesByDate.has(date)) {
          entriesByDate.set(date, true)
        }
      })

      const checkDate = new Date()
      while (entriesByDate.has(checkDate.toDateString())) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      }

      return {
        weeklyAverage: Math.round(weeklyAverage * 10) / 10,
        monthlyAverage: Math.round(monthlyAverage * 10) / 10,
        currentStreak,
        totalEntries: entries?.length || 0,
      }
    } catch (error) {
      console.error("Error fetching productivity stats:", error)
      return {
        weeklyAverage: 0,
        monthlyAverage: 0,
        currentStreak: 0,
        totalEntries: 0,
      }
    }
  }

  // User profile methods
  async getUserProfile(userId?: string) {
    try {
      if (!userId) {
        const user = await this.getCurrentUser()
        if (!user) return null
        userId = user.id
      }

      // Try to get the user profile - don't throw error if not found
      try {
        const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

        // If there's no profile yet, create a default one
        if (error) {
          if (error.code === "PGRST116") {
            console.log("No user profile found, creating default profile");
            
            // Create a default profile if none exists
            const defaultProfile = {
              user_id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              preferences: {}
            };
            
            // Insert the default profile into the database
            try {
              const { data: newProfile, error: insertError } = await supabase
                .from("user_profiles")
                .insert(defaultProfile)
                .select()
                .single();
                
              if (insertError) {
                console.error("Error creating default profile:", insertError);
                return defaultProfile; // Return the default even if save failed
              }
              
              return newProfile || defaultProfile;
            } catch (insertErr) {
              console.error("Error inserting default profile:", insertErr);
              return defaultProfile;
            }
          }
          console.error("Error fetching user profile:", error);
          return null;
        }
        
        return data;
      } catch (dbError) {
        console.error("Database error in getUserProfile:", dbError);
        return null;
      }
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  }

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export const db = new DatabaseService()
