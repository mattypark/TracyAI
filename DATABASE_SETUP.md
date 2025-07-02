# Database Setup Guide

## Issue Resolution

The console errors you're seeing are due to missing database tables. Here's how to fix them:

## Quick Fix

1. **Go to your Supabase Dashboard**
   - Open [supabase.com](https://supabase.com)
   - Navigate to your project
   - Go to the SQL Editor

2. **Run the Database Setup Script**
   - Copy the entire contents of `scripts/setup-database.sql`
   - Paste it into the Supabase SQL Editor
   - Click "Run" to execute the script

3. **Verify Setup**
   - The script will create:
     - `event_flags` table for organizing events
     - `calendar_events` table for storing events
     - All necessary columns and relationships
     - Security policies (RLS)
     - Performance indexes

## What This Fixes

✅ **"Error fetching flags"** - Creates the event_flags table
✅ **"Error creating flag"** - Sets up proper table structure  
✅ **"Error creating event"** - Creates calendar_events table with all required columns
✅ **Missing database schema** - Adds all necessary columns like `all_day`, `guests`, `link`, etc.

## After Setup

Once you run the SQL script:

1. **Refresh your application** - The errors should disappear
2. **Test flag creation** - Try creating a new flag in the calendar sidebar
3. **Test event creation** - Click on a calendar day to create an event
4. **Verify functionality** - Both simple and "more options" modes should work

## Default Flags

The application will show default flags (Work, Personal, Health, Social) until you create custom ones. After database setup, you can create your own custom flags.

## Troubleshooting

If you still see errors after running the script:

1. Check that you're logged into Supabase with the correct account
2. Verify the script ran without errors in the SQL Editor
3. Try refreshing your browser and clearing cache
4. Check the browser console for any remaining errors

## Optional: Add Sample Data

If you want to add some sample flags, uncomment the INSERT section at the bottom of the SQL script and replace `'YOUR_USER_ID'` with your actual user ID (you can find this in the Supabase Auth section). 