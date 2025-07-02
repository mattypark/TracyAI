# Google Calendar Integration Setup Guide

This guide will help you fix the Google Calendar integration errors you're experiencing.

## Issues Being Fixed

1. **Database table missing**: The `google_tokens` table doesn't exist
2. **Authentication errors**: API routes having trouble with authentication  
3. **Google OAuth not configured**: Missing Google OAuth credentials

## Step 1: Create the Database Table

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `create-google-tokens-table.sql` (created in your project root)
4. Click **Run** to execute the SQL

This will create the `google_tokens` table needed to store Google OAuth tokens.

## Step 2: Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Calendar API
   - Gmail API (optional, for future Gmail integration)

4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > OAuth client ID**
6. Choose **Web application**
7. Add these authorized redirect URIs:
   - `http://localhost:3000/api/calendar/oauth2callback` (for development)
   - `https://yourdomain.com/api/calendar/oauth2callback` (for production)

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_from_step_2
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_step_2
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/oauth2callback

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Restart Your Development Server

After setting up the environment variables:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## Step 5: Test the Integration

1. Go to your **Profile page**
2. Click **Connect Calendar** in the Google Services section
3. You should be redirected to Google's OAuth consent screen
4. Grant permissions to your app
5. You should be redirected back with a success message

## Fixed Issues

### Authentication Errors
- ✅ Fixed API routes to properly handle Supabase authentication
- ✅ Added proper error handling and fallbacks
- ✅ Improved cookie-based authentication

### Database Errors  
- ✅ Created proper SQL migration for `google_tokens` table
- ✅ Added RLS policies for security
- ✅ Added proper indexes and triggers

### OAuth Integration
- ✅ Fixed OAuth callback handling
- ✅ Added proper token storage and retrieval
- ✅ Added fallback for when Google Calendar is not connected

## Troubleshooting

### "Database setup required" Error
- Make sure you ran the SQL script from Step 1
- Check that the `google_tokens` table exists in your Supabase dashboard

### "Google OAuth not configured" Error  
- Verify your `.env.local` file has the correct Google OAuth credentials
- Make sure you've enabled the Google Calendar API in Google Cloud Console

### "Not authenticated" Error
- Make sure you're logged into the app
- Clear your browser cookies and try logging in again
- Check that your Supabase configuration is correct

### OAuth Redirect Issues
- Verify the redirect URI in Google Cloud Console matches your environment
- For development: `http://localhost:3000/api/calendar/oauth2callback`
- For production: `https://yourdomain.com/api/calendar/oauth2callback`

## Features Now Available

Once set up, you'll have:
- ✅ Google Calendar integration in your profile
- ✅ Ability to view Google Calendar events in the app
- ✅ Create events that sync to Google Calendar
- ✅ Fallback to local storage when Google Calendar is not connected
- ✅ Proper error handling and user feedback

## Next Steps

After completing this setup:
1. Test creating events through the calendar interface
2. Verify events appear in both the app and Google Calendar
3. Test the AI assistant's calendar integration features

The integration should now work without the errors you were experiencing! 