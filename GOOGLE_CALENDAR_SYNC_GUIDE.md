# Google Calendar Sync Guide

## Overview
Your Tracy AI app now has full Google Calendar synchronization! After connecting your Google account, the app will automatically sync all your calendars and events, just like how Google Calendar connects with Notion.

## What's Been Implemented

### 1. Complete Calendar Sync System
- **Automatic Sync**: Events sync automatically after OAuth connection
- **Manual Sync**: "Sync Calendar" button in the calendar view
- **Real-time Status**: Visual feedback during sync process
- **Multi-Calendar Support**: Syncs ALL your Google calendars

### 2. Comprehensive Event Data
The sync captures everything from your Google Calendar:
- ✅ Event titles and descriptions
- ✅ Start/end times (including all-day events)
- ✅ Locations and attendees
- ✅ Calendar names and colors
- ✅ Google Meet links
- ✅ Recurring events
- ✅ Event status (confirmed, tentative, cancelled)
- ✅ Visibility settings

### 3. Two-Way Integration
- **View**: See all Google Calendar events in Tracy AI
- **Create**: Events created in Tracy AI can sync to Google Calendar
- **Update**: Changes sync bidirectionally
- **Delete**: Deletions are reflected across both platforms

## How to Use

### Step 1: Connect Google Calendar
1. Go to your Profile page
2. Click "Connect Google Calendar"
3. Authorize Tracy AI to access your Google Calendar
4. **Automatic sync will start immediately**

### Step 2: Manual Sync (if needed)
1. Go to the Calendar page
2. Click the "Sync Calendar" button in the header
3. Watch the real-time sync status
4. Get confirmation with event count

### Step 3: View Your Events
- All Google Calendar events appear in Tracy AI's calendar view
- Events show with original calendar colors
- Click any event to see full details
- All-day events are properly displayed

## Features

### Visual Sync Status
- 🔄 **Syncing**: Spinning icon with "Syncing..." text
- ✅ **Success**: Green checkmark with event count
- ❌ **Error**: Red alert icon with error message
- 📅 **Auto-refresh**: Status resets after 3-5 seconds

### Smart Sync Logic
- **Deduplication**: Prevents duplicate events
- **Batch Processing**: Handles large calendars efficiently
- **Error Handling**: Graceful failure with detailed logging
- **Incremental Updates**: Only syncs changed events

### Calendar Management
- **Multiple Calendars**: Syncs all your Google calendars
- **Calendar Colors**: Preserves original calendar colors
- **Calendar Names**: Shows which calendar each event belongs to
- **Privacy Settings**: Respects event visibility settings

## Database Structure

Your events are stored in the `calendar_events` table with these fields:
```sql
- id: Unique event ID
- user_id: Your user ID
- google_event_id: Original Google Calendar event ID
- google_calendar_id: Source calendar ID
- title: Event title
- description: Event description
- start_time: Start date/time
- end_time: End date/time
- all_day: Boolean for all-day events
- location: Event location
- attendees: Comma-separated attendee emails
- calendar_name: Name of the source calendar
- calendar_color: Original calendar color
- google_meet_link: Google Meet URL if present
- recurring: Boolean for recurring events
- status: Event status (confirmed/tentative/cancelled)
- visibility: Event visibility setting
- created_at: Creation timestamp
- updated_at: Last update timestamp
```

## API Endpoints

### Sync Endpoint
```
POST /api/calendar/sync
```
- Triggers manual calendar sync
- Returns sync results with event counts
- Handles authentication automatically

### Events Endpoint
```
GET /api/calendar/events
```
- Fetches all events (Google + local)
- Deduplicates automatically
- Sorts by start time

## Troubleshooting

### If Sync Doesn't Work
1. Check that you're authenticated (logged in)
2. Verify Google Calendar is connected in Profile
3. Check browser console for errors
4. Try manual sync button
5. Refresh the page and try again

### If Events Don't Appear
1. Wait for sync to complete (can take 30-60 seconds for large calendars)
2. Check that events are within the sync window (3 months past to 6 months future)
3. Verify calendar permissions in Google account settings
4. Try disconnecting and reconnecting Google Calendar

### Common Issues
- **401 Unauthorized**: Reauthorize Google Calendar in Profile
- **Network Errors**: Check internet connection
- **Database Errors**: Contact support if persistent

## Testing

Run the test script to verify your setup:
```bash
node test-calendar-sync.js
```

This will check:
- Database table existence
- Current event count
- Google token status
- Sample event data

## Security & Privacy

- **OAuth 2.0**: Secure Google authentication
- **Token Encryption**: Refresh tokens securely stored
- **User Isolation**: Each user only sees their own events
- **Privacy Respect**: Honors Google Calendar privacy settings
- **Minimal Permissions**: Only requests necessary calendar permissions

## Next Steps

1. **Connect your Google Calendar** if you haven't already
2. **Test the sync** using the manual sync button
3. **Create events** in Tracy AI to test two-way sync
4. **Set up recurring sync** (automatic every hour when app is open)

Your calendar data is now fully integrated between Google Calendar and Tracy AI! 🎉 