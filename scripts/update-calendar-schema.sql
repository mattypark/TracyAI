-- Update calendar_events table to include all required columns
-- Run this in your Supabase SQL editor if columns are missing

-- Add missing columns if they don't exist
ALTER TABLE calendar_events 
ADD COLUMN IF NOT EXISTS flag_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS flag_color TEXT DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS guests TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS link TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS all_day BOOLEAN DEFAULT FALSE;

-- Update existing records to have default values
UPDATE calendar_events 
SET 
  flag_name = COALESCE(flag_name, ''),
  flag_color = COALESCE(flag_color, '#3B82F6'),
  guests = COALESCE(guests, ''),
  link = COALESCE(link, ''),
  all_day = COALESCE(all_day, FALSE)
WHERE 
  flag_name IS NULL 
  OR flag_color IS NULL 
  OR guests IS NULL 
  OR link IS NULL 
  OR all_day IS NULL; 