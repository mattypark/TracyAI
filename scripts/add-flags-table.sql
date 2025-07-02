-- Create event_flags table
CREATE TABLE IF NOT EXISTS public.event_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.event_flags ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own flags" ON public.event_flags
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flags" ON public.event_flags
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flags" ON public.event_flags
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flags" ON public.event_flags
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_event_flags_updated_at BEFORE UPDATE
    ON public.event_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add flag_id column to calendar_events table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='calendar_events' AND column_name='flag_id') THEN
        ALTER TABLE public.calendar_events ADD COLUMN flag_id UUID REFERENCES public.event_flags(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add flag_id column to tasks table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='tasks' AND column_name='flag_id') THEN
        ALTER TABLE public.tasks ADD COLUMN flag_id UUID REFERENCES public.event_flags(id) ON DELETE SET NULL;
    END IF;
END $$;
