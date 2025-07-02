-- Safe Database Migration for Tracy AI
-- This safely adds missing columns without breaking existing tables
-- DELETE EVERYTHING in your Supabase SQL Editor and paste this script

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Safely add missing columns to calendar_events table
DO $$ 
BEGIN 
  -- Add all_day column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'all_day') THEN
    ALTER TABLE calendar_events ADD COLUMN all_day BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- Add flag column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'flag') THEN
    ALTER TABLE calendar_events ADD COLUMN flag TEXT DEFAULT 'personal';
  END IF;
  
  -- Add flag_color column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'flag_color') THEN
    ALTER TABLE calendar_events ADD COLUMN flag_color TEXT DEFAULT '#3B82F6';
  END IF;
  
  -- Add google_event_id column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'google_event_id') THEN
    ALTER TABLE calendar_events ADD COLUMN google_event_id TEXT;
  END IF;
  
  -- Add google_calendar_id column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'google_calendar_id') THEN
    ALTER TABLE calendar_events ADD COLUMN google_calendar_id TEXT;
  END IF;
  
  -- Add source column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'source') THEN
    ALTER TABLE calendar_events ADD COLUMN source TEXT DEFAULT 'local';
  END IF;
  
  -- Add status column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'status') THEN
    ALTER TABLE calendar_events ADD COLUMN status TEXT DEFAULT 'confirmed';
  END IF;
END $$;

-- Fix attendees column type if it's currently an array
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'calendar_events' 
             AND column_name = 'attendees' 
             AND data_type = 'ARRAY') THEN
    ALTER TABLE calendar_events ALTER COLUMN attendees TYPE TEXT USING array_to_string(attendees, ', ');
  END IF;
END $$;

-- Create google_tokens table if it doesn't exist
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service TEXT NOT NULL,
  tokens JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Enable RLS on google_tokens
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

-- Drop and recreate google_tokens policies
DROP POLICY IF EXISTS "Users can manage their own tokens" ON google_tokens;
CREATE POLICY "Users can manage their own tokens" ON google_tokens FOR ALL USING (auth.uid() = user_id);

-- Add indexes for calendar_events new columns
CREATE INDEX IF NOT EXISTS idx_calendar_events_google_event_id ON calendar_events(google_event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_flag ON calendar_events(user_id, flag);
CREATE INDEX IF NOT EXISTS idx_google_tokens_user_service ON google_tokens(user_id, service);

-- Create updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger for google_tokens
DROP TRIGGER IF EXISTS update_google_tokens_updated_at ON google_tokens;
CREATE TRIGGER update_google_tokens_updated_at 
  BEFORE UPDATE ON google_tokens 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Calendar events table successfully updated with all required columns!' as result; 