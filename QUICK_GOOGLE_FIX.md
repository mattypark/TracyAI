# Quick Fix for Google OAuth Errors

## The Problem
You're getting "Access blocked: Authorization Error" because:
1. Google OAuth isn't set up in Google Cloud Console
2. The database table `google_tokens` doesn't exist
3. Environment variables aren't configured

## Quick Fix (5 minutes)

### Step 1: Run Database Migration
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → SQL Editor
3. Copy and run this SQL:

```sql
-- Create google_tokens table
create table if not exists google_tokens (
  user_id uuid references auth.users(id) on delete cascade,
  service text not null check (service in ('calendar', 'gmail')),
  tokens jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, service)
);

-- Enable security
alter table google_tokens enable row level security;

-- Create policies
create policy "Users can manage their own tokens" on google_tokens
  for all using (auth.uid() = user_id);
```

### Step 2: Set Up Google OAuth (2 minutes)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **OAuth consent screen**
   - Choose "External"
   - Fill app name: "Tracy AI"
   - Add your email as test user
3. **APIs & Services** → **Credentials**
   - Create OAuth 2.0 Client ID
   - Web application
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/calendar/oauth2callback
     http://localhost:3000/api/gmail/oauth2callback
     ```
4. Copy Client ID and Secret

### Step 3: Update Environment Variables
Add to your `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Restart Server
```bash
npm run dev
```

## Test It
1. Go to Profile page
2. Click "Connect Calendar" or "Connect Gmail"
3. Should redirect to Google OAuth (not error page)

## If Still Not Working
- Check that you added your email as a test user in Google Cloud Console
- Verify redirect URIs exactly match (no trailing slashes)
- Make sure environment variables are saved and server restarted

For detailed instructions, see `GOOGLE_OAUTH_SETUP.md` 