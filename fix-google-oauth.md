# 🚨 URGENT FIX: Google Calendar OAuth Error

## The Problem
Your app is running on **port 3001** but your Google OAuth is configured for **port 3000**. This causes the "Error 401: invalid_client" error.

## 🛠️ IMMEDIATE FIX - Follow These Steps:

### Step 1: Create `.env.local` File
Create a new file called `.env.local` in your project root with this content:

```env
# Next.js App Configuration - IMPORTANT: Port 3001!
NEXT_PUBLIC_APP_URL=http://localhost:3001

# Supabase Configuration (replace with your actual values)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url_here"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key_here"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key_here"

# OpenAI Configuration (replace with your actual key)
OPENAI_API_KEY="your_openai_api_key_here"

# Google OAuth Configuration (get these from Google Cloud Console)
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
```

### Step 2: Update Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Find your OAuth 2.0 Client ID
4. Click **Edit** (pencil icon)
5. In **Authorized redirect URIs**, add these URLs:
   ```
   http://localhost:3001/api/calendar/oauth2callback
   http://localhost:3001/api/gmail/oauth2callback
   ```
6. **Remove** the old port 3000 URLs if they exist
7. Click **Save**

### Step 3: Get Your Google OAuth Credentials
If you don't have Google OAuth credentials yet:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google Calendar API** and **Gmail API**
4. Go to **APIs & Services > OAuth consent screen**
   - Choose **External** user type
   - Fill in app name: "Tracy AI"
   - Add your email as test user
5. Go to **APIs & Services > Credentials**
6. Click **+ Create Credentials > OAuth 2.0 Client IDs**
7. Choose **Web application**
8. Add redirect URIs:
   ```
   http://localhost:3001/api/calendar/oauth2callback
   http://localhost:3001/api/gmail/oauth2callback
   ```
9. Copy the **Client ID** and **Client Secret**

### Step 4: Update Your `.env.local`
Replace the placeholder values in `.env.local` with your actual credentials:

```env
# Example - replace with your actual values:
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
OPENAI_API_KEY="sk-..."
GOOGLE_CLIENT_ID="123456789-abcdefgh.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-abcdefghijklmnopqrstuvwx"
```

### Step 5: Restart Your Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 6: Test the Connection
1. Go to `http://localhost:3001/calendar`
2. Click the settings button (⚙️) in the top right
3. Try to connect Google Calendar
4. You should now be redirected to Google's OAuth screen

## 🔍 Troubleshooting

### Still getting "invalid_client"?
- Double-check your Google Client ID and Secret in `.env.local`
- Make sure there are no extra spaces or quotes
- Verify the redirect URIs in Google Cloud Console match exactly

### Getting "redirect_uri_mismatch"?
- Check that you added `http://localhost:3001/api/calendar/oauth2callback` to Google Cloud Console
- Make sure `NEXT_PUBLIC_APP_URL=http://localhost:3001` in `.env.local`

### Getting "Access blocked"?
- Add your email as a test user in OAuth consent screen
- Make sure your app is in "Testing" mode, not "Production"

### Database errors?
Run this SQL in your Supabase SQL Editor:

```sql
-- Create google_tokens table if it doesn't exist
create table if not exists google_tokens (
  user_id uuid references auth.users(id) on delete cascade,
  service text not null check (service in ('calendar', 'gmail')),
  tokens jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, service)
);

-- Enable RLS
alter table google_tokens enable row level security;

-- Create policies
create policy "Users can manage their own tokens" on google_tokens
  for all using (auth.uid() = user_id);
```

## ✅ Success Indicators
- No "invalid_client" error
- Google OAuth consent screen appears
- After granting permissions, you're redirected back to your app
- Calendar events load successfully

## 🚨 IMPORTANT NOTES
- Never commit `.env.local` to git (it's already in .gitignore)
- Keep your Google Client Secret secure
- The port mismatch was the main issue - your app runs on 3001, not 3000 