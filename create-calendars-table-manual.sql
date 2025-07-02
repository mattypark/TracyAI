-- Run this SQL in your Supabase SQL Editor to create the calendars table
-- Go to: https://supabase.com/dashboard/project/[your-project]/sql

-- Create the calendars table
CREATE TABLE IF NOT EXISTS public.calendars (
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

-- Enable Row Level Security
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security
CREATE POLICY "Users can view their own calendars" ON public.calendars
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendars" ON public.calendars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendars" ON public.calendars
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendars" ON public.calendars
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendars_user_id ON public.calendars(user_id);
CREATE INDEX IF NOT EXISTS idx_calendars_google_id ON public.calendars(google_calendar_id);
CREATE INDEX IF NOT EXISTS idx_calendars_user_visible ON public.calendars(user_id, is_visible);

-- Add a comment explaining the color codes
COMMENT ON COLUMN public.calendars.color IS 'Google Calendar color codes: #a4bdfc (Lavender), #7ae7bf (Sage), #dbadff (Grape), #ff887c (Flamingo), #fbd75b (Banana), #ffb878 (Tangerine), #46d6db (Peacock), #e1e1e1 (Graphite), #5484ed (Blueberry), #51b749 (Basil), #dc2127 (Tomato), #1a73e8 (Default Blue)';

-- Test the table creation
SELECT 'Calendars table created successfully!' as result; 