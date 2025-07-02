# Google OAuth Setup Guide - Fix Authorization Errors

## Overview
You're getting "Access blocked: Authorization Error" because the Google OAuth application hasn't been properly configured. Here's how to fix it:

## Step 1: Set Up Google Cloud Console

### 1.1 Create/Access Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note down your project ID

### 1.2 Enable Required APIs
1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for and enable these APIs:
   - **Google Calendar API**
   - **Gmail API**

### 1.3 Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Fill out the required fields:
   - **App name**: Tracy AI
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. **Scopes**: Skip this for now, click **Save and Continue**
6. **Test users**: Add your email address as a test user
7. Click **Save and Continue**

### 1.4 Create OAuth Credentials
1. Go to **APIs & Services > Credentials**
2. Click **+ Create Credentials > OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Set the name: "Tracy AI Web Client"
5. **Authorized redirect URIs** - Add these URLs:
   ```
   http://localhost:3000/api/calendar/oauth2callback
   http://localhost:3000/api/gmail/oauth2callback
   ```
6. Click **Create**
7. **IMPORTANT**: Copy the Client ID and Client Secret

## Step 2: Update Environment Variables

Create or update your `.env.local` file with the Google credentials:

```env
# Existing variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key

# Add these new Google OAuth variables
GOOGLE_CLIENT_ID=your_google_client_id_from_step_1.4
GOOGLE_CLIENT_SECRET=your_google_client_secret_from_step_1.4
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Run Database Migration

You need to create the `google_tokens` table in your Supabase database:

### Option A: Using Supabase Dashboard (Recommended)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**
4. Run this SQL script:

```sql
-- Create conversations table for chat history
create table if not exists conversations (
  id serial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz default now()
);

-- Create google_tokens table for OAuth tokens
create table if not exists google_tokens (
  user_id uuid references auth.users(id) on delete cascade,
  service text not null check (service in ('calendar', 'gmail')),
  tokens jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, service)
);

-- Enable RLS (Row Level Security)
alter table conversations enable row level security;
alter table google_tokens enable row level security;

-- Create policies for conversations
create policy "Users can view their own conversations" on conversations
  for select using (auth.uid() = user_id);

create policy "Users can insert their own conversations" on conversations
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own conversations" on conversations
  for update using (auth.uid() = user_id);

create policy "Users can delete their own conversations" on conversations
  for delete using (auth.uid() = user_id);

-- Create policies for google_tokens
create policy "Users can view their own tokens" on google_tokens
  for select using (auth.uid() = user_id);

create policy "Users can insert their own tokens" on google_tokens
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own tokens" on google_tokens
  for update using (auth.uid() = user_id);

create policy "Users can delete their own tokens" on google_tokens
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists conversations_user_id_idx on conversations(user_id);
create index if not exists conversations_created_at_idx on conversations(created_at);
create index if not exists google_tokens_user_id_idx on google_tokens(user_id);
create index if not exists google_tokens_service_idx on google_tokens(service);
```

5. Click **Run** to execute the migration

### Option B: Using the provided script file
The script is already created at `scripts/add-jarvis-tables.sql` - copy its contents to the Supabase SQL Editor.

## Step 4: Restart Your Development Server

After updating the environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Test the Integration

1. Go to your app's Profile page: `http://localhost:3000/profile`
2. You should see the Google Services Integration section
3. Click "Connect Calendar" or "Connect Gmail"
4. You should be redirected to Google's OAuth consent screen
5. Grant the requested permissions
6. You should be redirected back to your app with a success message

## Troubleshooting

### If you still get "Access blocked" error:
1. **Check OAuth Consent Screen**: Make sure you've added your email as a test user
2. **Verify Redirect URIs**: Ensure the redirect URIs in Google Cloud Console exactly match:
   - `http://localhost:3000/api/calendar/oauth2callback`
   - `http://localhost:3000/api/gmail/oauth2callback`
3. **Check Environment Variables**: Restart your dev server after updating `.env.local`

### If you get "invalid_request" error:
1. Check that `NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000`
2. Verify your Google Client ID and Secret are correct

### If you get database errors:
1. Make sure you've run the database migration (Step 3)
2. Check that your Supabase credentials are correct in `.env.local`

### Common Error Messages:
- **"Database setup required"** → Run the database migration (Step 3)
- **"redirect_uri_mismatch"** → Check your redirect URIs in Google Cloud Console
- **"invalid_client"** → Check your Google Client ID and Secret

## Production Deployment

When you deploy to production:
1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Add production redirect URIs to Google Cloud Console:
   - `https://yourdomain.com/api/calendar/oauth2callback`
   - `https://yourdomain.com/api/gmail/oauth2callback`
3. Update OAuth consent screen if needed

## Security Notes

- Never commit your `.env.local` file to version control
- The Google Client Secret should be kept secure
- OAuth tokens are encrypted and stored securely in your Supabase database
- Row Level Security (RLS) ensures users can only access their own tokens 