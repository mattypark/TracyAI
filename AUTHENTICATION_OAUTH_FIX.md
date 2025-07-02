# Authentication & OAuth Fix Guide

## Issues Fixed
1. **OAuth Callback Authentication** - Users getting redirected to sign-in page after Google OAuth
2. **Google Sign-In 404 Error** - Missing proper OAuth setup
3. **Session Management** - Improved cookie handling and session persistence

## Root Causes Identified
1. **Supabase Google OAuth Not Configured** - Missing Google provider setup in Supabase
2. **Missing Environment Variables** - OAuth credentials not set
3. **Improper Session Handling** - Server-side OAuth callback not setting cookies correctly
4. **Missing Database User Creation** - Google OAuth users not being created in users table

## Fixes Applied

### 1. Enhanced OAuth Callback Handling
- **File**: `app/auth/callback/route.ts` - Server-side OAuth callback
- **File**: `app/auth/callback/page.tsx` - Client-side session handling
- **Improvements**:
  - Proper code exchange for session
  - Cookie management for session persistence
  - User creation with Google metadata (name, avatar)
  - Better error handling and redirects

### 2. Fixed Google Calendar/Gmail OAuth Callbacks
- **Files**: `app/api/calendar/oauth2callback/route.ts`, `app/api/gmail/oauth2callback/route.ts`
- **Improvements**:
  - Better cookie detection (multiple cookie name patterns)
  - Proper user authentication before token storage
  - Enhanced error handling

## Setup Required

### 1. Supabase Configuration

#### A. Enable Google OAuth Provider
1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Providers**
3. Find **Google** and click **Enable**
4. Add your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
5. Set **Redirect URL** to: `https://your-project-ref.supabase.co/auth/v1/callback`

#### B. Update Site URL
1. In **Authentication > URL Configuration**
2. Set **Site URL** to: `http://localhost:3000` (development) or your production URL
3. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (production)

### 2. Google Cloud Console Setup

#### A. Create OAuth 2.0 Client
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client IDs**
5. Choose **Web application**
6. Add **Authorized redirect URIs**:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for development)

#### B. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** (unless you have Google Workspace)
3. Fill in required fields:
   - **App name**: Tracy AI
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes if needed (basic profile info is included by default)
5. Add test users if in development mode

### 3. Environment Variables
Add these to your `.env.local` file:

```env
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (for Calendar/Gmail integration)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Database Updates
The users table should already support Google OAuth users. If you encounter issues, ensure the table has these columns:

```sql
-- Check if columns exist
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';

-- Add missing columns if needed
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

## Testing the Fix

### 1. Test Google Sign-In
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/auth`
3. Click **Sign in with Google**
4. Complete Google OAuth flow
5. Should redirect to onboarding (new user) or dashboard (existing user)

### 2. Test Google Calendar/Gmail Integration
1. Sign in to your app
2. Go to Profile page
3. Click **Connect Google Calendar** or **Connect Gmail**
4. Complete OAuth flow
5. Should stay on Profile page with success message

## Error Messages & Troubleshooting

### "404 Error" on Google Sign-In
- **Cause**: Google OAuth not configured in Supabase
- **Fix**: Follow Supabase Configuration steps above

### "oauth_failed" Error
- **Cause**: OAuth callback failed
- **Fix**: Check Google Cloud Console redirect URIs and Supabase Site URL

### "not_authenticated" Error
- **Cause**: Session not found during OAuth callback
- **Fix**: Clear browser cookies and try again, check environment variables

### "exchange_failed" Error
- **Cause**: Code exchange failed
- **Fix**: Verify Google OAuth credentials in Supabase dashboard

## Additional Notes

### Security Considerations
- OAuth callbacks now use httpOnly cookies for better security
- Session tokens are properly managed server-side
- CSRF protection through Supabase's built-in mechanisms

### Development vs Production
- Development: Uses `http://localhost:3000`
- Production: Update all URLs to your production domain
- Make sure to update both Supabase and Google Cloud Console settings

### User Experience
- New Google OAuth users are automatically created in the users table
- User metadata (name, avatar) is preserved from Google
- Seamless flow from OAuth to onboarding or dashboard

## Quick Test Commands

```bash
# Test if environment variables are set
echo $NEXT_PUBLIC_SUPABASE_URL
echo $GOOGLE_CLIENT_ID

# Check if database is accessible
npm run test:supabase

# Start development server
npm run dev
```

## Support
If you continue to experience issues:
1. Check browser console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Google Cloud Console and Supabase settings match
4. Clear browser cookies and try again
5. Check Supabase Auth logs in the dashboard 