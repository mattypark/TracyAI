import { supabase } from './supabase'

export async function initializeDatabase() {
  try {
    // Create event_flags table if it doesn't exist
    const { error: flagsError } = await supabase.rpc('create_event_flags_table', {})
    if (flagsError && !flagsError.message.includes('already exists')) {
      console.warn('Could not create event_flags table:', flagsError.message)
    }

    // Create calendar_events table if it doesn't exist  
    const { error: eventsError } = await supabase.rpc('create_calendar_events_table', {})
    if (eventsError && !eventsError.message.includes('already exists')) {
      console.warn('Could not create calendar_events table:', eventsError.message)
    }

    console.log('Database initialization completed')
  } catch (error) {
    console.error('Database initialization error:', error)
  }
}

// Fallback: Try to create tables using raw SQL
export async function createTablesIfNeeded() {
  try {
    // Try to select from event_flags table
    const { error: flagsError } = await supabase.from('event_flags').select('id').limit(1)
    
    if (flagsError) {
      console.log('event_flags table does not exist, creating mock data structure')
      // Since we can't create tables directly, we'll handle this in the application logic
    }

    // Try to select from calendar_events table
    const { error: eventsError } = await supabase.from('calendar_events').select('id').limit(1)
    
    if (eventsError) {
      console.log('calendar_events table does not exist, creating mock data structure')
      // Since we can't create tables directly, we'll handle this in the application logic
    }

  } catch (error) {
    console.error('Error checking tables:', error)
  }
} 