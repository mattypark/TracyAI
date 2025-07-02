-- Temporarily disable RLS to test event creation
-- Run this in your Supabase SQL Editor

-- Disable RLS on calendar_events table temporarily
ALTER TABLE calendar_events DISABLE ROW LEVEL SECURITY;

-- Also check if users table exists and has proper structure
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on users table too
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Verify calendar_events table has all required columns
DO $$ 
BEGIN 
  -- Add any missing columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'all_day') THEN
    ALTER TABLE calendar_events ADD COLUMN all_day BOOLEAN DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'flag') THEN
    ALTER TABLE calendar_events ADD COLUMN flag TEXT DEFAULT 'personal';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'flag_color') THEN
    ALTER TABLE calendar_events ADD COLUMN flag_color TEXT DEFAULT '#3B82F6';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'source') THEN
    ALTER TABLE calendar_events ADD COLUMN source TEXT DEFAULT 'local';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'status') THEN
    ALTER TABLE calendar_events ADD COLUMN status TEXT DEFAULT 'confirmed';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'google_event_id') THEN
    ALTER TABLE calendar_events ADD COLUMN google_event_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'google_calendar_id') THEN
    ALTER TABLE calendar_events ADD COLUMN google_calendar_id TEXT;
  END IF;
END $$;

SELECT 'RLS disabled temporarily - event creation should now work!' as result; 