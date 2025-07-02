-- Complete database setup for Tracy AI App
-- Run this in your Supabase SQL editor

-- Create event_flags table
CREATE TABLE IF NOT EXISTS public.event_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create calendar_events table with all required columns
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT DEFAULT '',
    guests TEXT DEFAULT '',
    link TEXT DEFAULT '',
    all_day BOOLEAN DEFAULT FALSE,
    flag_id UUID REFERENCES public.event_flags(id) ON DELETE SET NULL,
    flag_name TEXT DEFAULT '',
    flag_color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.event_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for event_flags
CREATE POLICY IF NOT EXISTS "Users can view their own flags" ON public.event_flags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own flags" ON public.event_flags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own flags" ON public.event_flags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own flags" ON public.event_flags
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for calendar_events
CREATE POLICY IF NOT EXISTS "Users can view their own events" ON public.calendar_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own events" ON public.calendar_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own events" ON public.calendar_events
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own events" ON public.calendar_events
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_event_flags_updated_at ON public.event_flags;
CREATE TRIGGER update_event_flags_updated_at 
    BEFORE UPDATE ON public.event_flags 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_calendar_events_updated_at ON public.calendar_events;
CREATE TRIGGER update_calendar_events_updated_at 
    BEFORE UPDATE ON public.calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_flags_user_id ON public.event_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_id ON public.calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_time ON public.calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_calendar_events_flag_id ON public.calendar_events(flag_id);

-- Insert some default flags for testing (optional)
-- You can uncomment this section and replace 'YOUR_USER_ID' with your actual user ID
/*
INSERT INTO public.event_flags (user_id, name, color) VALUES 
    ('YOUR_USER_ID', 'Work', '#3B82F6'),
    ('YOUR_USER_ID', 'Personal', '#10B981'),
    ('YOUR_USER_ID', 'Health', '#EF4444'),
    ('YOUR_USER_ID', 'Social', '#8B5CF6')
ON CONFLICT DO NOTHING;
*/

-- Verify tables were created
SELECT 'event_flags table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'event_flags');
SELECT 'calendar_events table created' as status WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'calendar_events'); 