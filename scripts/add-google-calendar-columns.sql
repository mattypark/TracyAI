-- Add missing columns for Google Calendar sync
DO $$ 
BEGIN
    -- Add google_event_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'google_event_id') THEN
        ALTER TABLE calendar_events ADD COLUMN google_event_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_calendar_events_google_event_id ON calendar_events(google_event_id);
    END IF;

    -- Add google_calendar_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'google_calendar_id') THEN
        ALTER TABLE calendar_events ADD COLUMN google_calendar_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_calendar_events_google_calendar_id ON calendar_events(google_calendar_id);
    END IF;

    -- Add attendees column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'attendees') THEN
        ALTER TABLE calendar_events ADD COLUMN attendees TEXT DEFAULT '';
    END IF;

    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'status') THEN
        ALTER TABLE calendar_events ADD COLUMN status TEXT DEFAULT 'confirmed';
    END IF;

    -- Add calendar_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'calendar_name') THEN
        ALTER TABLE calendar_events ADD COLUMN calendar_name TEXT DEFAULT '';
    END IF;

    -- Add calendar_color column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'calendar_color') THEN
        ALTER TABLE calendar_events ADD COLUMN calendar_color TEXT DEFAULT '#1a73e8';
    END IF;

    -- Add google_meet_link column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'google_meet_link') THEN
        ALTER TABLE calendar_events ADD COLUMN google_meet_link TEXT DEFAULT '';
    END IF;

    -- Add recurring column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'recurring') THEN
        ALTER TABLE calendar_events ADD COLUMN recurring BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add visibility column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'visibility') THEN
        ALTER TABLE calendar_events ADD COLUMN visibility TEXT DEFAULT 'default';
    END IF;

    -- Add source column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'source') THEN
        ALTER TABLE calendar_events ADD COLUMN source TEXT DEFAULT 'local';
    END IF;

    -- Rename guests to attendees if guests exists and attendees doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'guests') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'calendar_events' AND column_name = 'attendees') THEN
        ALTER TABLE calendar_events RENAME COLUMN guests TO attendees;
    END IF;

END $$;

-- Create composite indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_google ON calendar_events(user_id, google_calendar_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_time_range ON calendar_events(start_time, end_time);

-- Verify the changes
SELECT 
    'calendar_events table updated successfully' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'calendar_events'; 