const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Use hardcoded values to avoid environment variable issues
const supabaseUrl = "https://wyzllktxgkmfkbhgyhsf.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5emxsa3R4Z2ttZmtiaGd5aHNmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDYxMTExOSwiZXhwIjoyMDY2MTg3MTE5fQ.EW7Mxk3ETm9tH-cZw9F_wV0vMY6BDwo9jY6hcpMDL84"

const supabase = createClient(supabaseUrl, supabaseKey)

async function createCalendarsTable() {
  console.log('Creating calendars table...')
  
  try {
    // First, check if table already exists
    const { error: checkError } = await supabase
      .from('calendars')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('✅ Calendars table already exists!')
      return
    }
    
    if (checkError.code !== '42P01') {
      console.error('❌ Unexpected error checking table:', checkError)
      return
    }
    
    console.log('📋 Table does not exist, creating it...')
    
    // Create the table using raw SQL
    const createTableSQL = `
      CREATE TABLE public.calendars (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        google_calendar_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        color TEXT NOT NULL DEFAULT '#1a73e8',
        background_color TEXT,
        foreground_color TEXT,
        is_primary BOOLEAN DEFAULT FALSE,
        access_role TEXT DEFAULT 'reader',
        timezone TEXT DEFAULT 'UTC',
        summary TEXT DEFAULT '',
        location TEXT DEFAULT '',
        is_visible BOOLEAN DEFAULT TRUE,
        is_selected BOOLEAN DEFAULT TRUE,
        source TEXT DEFAULT 'google',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, google_calendar_id)
      );
    `
    
    const { error: createError } = await supabase.rpc('exec', { sql: createTableSQL })
    
    if (createError) {
      console.error('❌ Failed to create table:', createError)
      console.log('\n📝 Please run this SQL manually in your Supabase dashboard:')
      console.log(createTableSQL)
      return
    }
    
    console.log('✅ Table created successfully!')
    
    // Enable RLS and create policies
    console.log('🔒 Setting up Row Level Security...')
    
    const rlsSQL = `
      ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Users can view their own calendars" ON public.calendars;
      DROP POLICY IF EXISTS "Users can insert their own calendars" ON public.calendars;
      DROP POLICY IF EXISTS "Users can update their own calendars" ON public.calendars;
      DROP POLICY IF EXISTS "Users can delete their own calendars" ON public.calendars;
      
      CREATE POLICY "Users can view their own calendars" ON public.calendars FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can insert their own calendars" ON public.calendars FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update their own calendars" ON public.calendars FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY "Users can delete their own calendars" ON public.calendars FOR DELETE USING (auth.uid() = user_id);
      
      CREATE INDEX IF NOT EXISTS idx_calendars_user_id ON public.calendars(user_id);
      CREATE INDEX IF NOT EXISTS idx_calendars_google_id ON public.calendars(google_calendar_id);
    `
    
    const { error: rlsError } = await supabase.rpc('exec', { sql: rlsSQL })
    
    if (rlsError) {
      console.error('⚠️ Warning: Failed to set up RLS policies:', rlsError)
      console.log('The table was created but you may need to set up policies manually.')
    } else {
      console.log('✅ Row Level Security policies created successfully!')
    }
    
    console.log('\n🎉 Calendars table setup complete!')
    console.log('You can now sync your Google Calendar with full metadata support.')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

createCalendarsTable() 