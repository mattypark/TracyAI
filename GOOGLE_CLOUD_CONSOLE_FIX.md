# Google Cloud Console Redirect URI Fix

## Issue
Your app is running on `http://localhost:3000` but the Google OAuth redirect URI is configured for a different port, causing the "This site can't be reached" error.

## Quick Fix Steps

### 1. Update Google Cloud Console
1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Select your project** (or create one if needed)
3. **Navigate to APIs & Services > Credentials**
4. **Find your OAuth 2.0 Client ID** (should be: `246216049329-eaac9gb3dlb3t13fiqicfpv323tt6fjp`)
5. **Click the edit button** (pencil icon)
6. **In "Authorized redirect URIs" section**:
   - **Remove**: `http://localhost:3001/api/calendar/oauth2callback` (if present)
   - **Add**: `http://localhost:3000/api/calendar/oauth2callback`
7. **Click "Save"**

### 2. Verify Environment Configuration
Your `.env.local` should now have:
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/oauth2callback
```

### 3. Restart Your App
```bash
# Stop the current app (Ctrl+C)
npm run dev
```

### 4. Test the Connection
1. Go to your app: `http://localhost:3000`
2. Navigate to Profile page
3. Click "Connect Calendar"
4. You should now successfully reach Google OAuth
5. After clicking "Continue", you'll be redirected back to your app

## Alternative: Force Port 3001

If you prefer to use port 3001 (as originally configured):

### Option A: Force Next.js to use port 3001
```bash
npm run dev -- --port 3001
```

### Option B: Update package.json
```json
{
  "scripts": {
    "dev": "next dev --port 3001"
  }
}
```

## Expected Flow After Fix

1. **Profile Page**: Click "Connect Calendar"
2. **Google OAuth**: Authorize Tracy AI to access your calendar
3. **Automatic Redirect**: Back to your app with success message
4. **Automatic Sync**: All your Google Calendar events will be imported
5. **Profile Page**: Shows "Connected" status with green badge
6. **Calendar Page**: Displays all your synced events

## Troubleshooting

### If you still get "This site can't be reached":
1. Double-check the redirect URI in Google Cloud Console
2. Make sure there are no typos in the URL
3. Ensure the port matches exactly
4. Clear your browser cache and try again

### If OAuth works but no events sync:
1. Check the browser console for errors
2. Verify you have events in your Google Calendar
3. Try the manual "Sync Calendar" button on the calendar page

### If you see "Not authenticated" errors:
1. Make sure you're logged into the Tracy AI app first
2. Try refreshing the page and connecting again
3. Check that your Supabase session is active

## Success Indicators

✅ **OAuth Flow**: No "site can't be reached" error  
✅ **Redirect**: Successfully returns to Tracy AI  
✅ **Connection Status**: Profile shows "Connected" badge  
✅ **Events Sync**: Calendar page shows your Google events  
✅ **Manual Sync**: "Sync Calendar" button works  

## Next Steps After Successful Connection

1. **View Events**: Go to Calendar page to see all synced events
2. **Manual Sync**: Use "Sync Calendar" button to refresh events
3. **Create Events**: Events created in Tracy AI can sync back to Google
4. **Multiple Calendars**: All your Google calendars are supported

Your Google Calendar integration will be fully functional once the redirect URI is updated! 🎉 