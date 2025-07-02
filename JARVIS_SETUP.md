# Tracy AI - Jarvis Setup Guide

This guide will help you set up the new Jarvis-style voice interface and Google Calendar/Gmail integration for your Tracy AI app.

## 🚀 Features Added

- **Voice-Activated Chat**: Say "Hey Tracy" to activate the AI assistant
- **Jarvis-Style Interface**: Floating chat button with voice responses
- **Google Calendar Integration**: View and create calendar events through Tracy
- **Gmail Integration**: Check and send emails through Tracy
- **Speech Recognition & Synthesis**: Full voice interaction capabilities
- **Electron Desktop App**: Run Tracy as a native desktop application

## 📋 Prerequisites

1. **Google Cloud Console Setup**:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Calendar API and Gmail API
   - Create OAuth 2.0 credentials (Web application type)
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/calendar/oauth2callback`
     - `http://localhost:3000/api/gmail/oauth2callback`
     - Add your production domain URLs when deploying

2. **Environment Variables**: Update your `.env.local` file with:

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key

# New Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Twilio for SMS reminders
TWILIO_SID=your_twilio_sid
TWILIO_TOKEN=your_twilio_token
TWILIO_FROM=+1234567890

# Optional: Weather & News APIs
OPENWEATHER_KEY=your_openweather_key
NEWS_API_KEY=your_news_api_key
```

## 🗄️ Database Setup

1. **Run the database migration** in your Supabase SQL editor:

```sql
-- Run the contents of scripts/add-jarvis-tables.sql
-- This creates the conversations and google_tokens tables
```

2. **Verify tables were created**:
   - `conversations` - stores chat history
   - `google_tokens` - stores OAuth tokens for Google services

## 🛠️ Installation

The required dependencies have already been installed:
- `googleapis` - Google APIs client
- `twilio` - SMS notifications (optional)
- `wait-on` & `concurrently` - Development tools
- `electron` & `electron-builder` - Desktop app (dev dependencies)

## 🎯 Usage

### Web Application

1. **Start the development server**:
```bash
npm run dev
```

2. **Access the app**: Open http://localhost:3000

3. **Connect Google Services**:
   - Go to Profile page
   - Click "Connect Calendar" and "Connect Gmail"
   - Complete OAuth flow

4. **Use Jarvis Chat**:
   - Click the floating chat button (bottom right)
   - Or say "Hey Tracy" to activate voice mode
   - Try commands like:
     - "What's on my calendar today?"
     - "Do I have any unread emails?"
     - "Schedule a meeting tomorrow at 3 PM"

### Electron Desktop App

1. **Run in development**:
```bash
npm run electron:dev
```

2. **Build for production**:
```bash
npm run electron:pack
```

## 🗣️ Voice Commands

### Calendar Commands
- "What's on my calendar today?"
- "Do I have any meetings tomorrow?"
- "Schedule a meeting at 3 PM"
- "Create an event for next Friday"

### Email Commands
- "Check my emails"
- "Any unread messages?"
- "Do I have any important emails?"
- "What are my recent emails?"

### General Commands
- "Hey Tracy" - Activate voice mode
- "What's my productivity score?"
- "How many tasks do I have?"
- "Tell me about my day"

## 🔧 API Endpoints

### New API Routes Added:

- `GET /api/calendar/auth` - Initiate Google Calendar OAuth
- `GET /api/calendar/oauth2callback` - Handle OAuth callback
- `GET /api/calendar/events` - Fetch calendar events
- `GET /api/gmail/auth` - Initiate Gmail OAuth  
- `GET /api/gmail/oauth2callback` - Handle OAuth callback
- `GET /api/gmail/emails` - Fetch emails
- `POST /api/jarvis` - Enhanced chat with Google services integration

## 🎨 UI Components Added

- `JarvisChat` - Main chat interface with voice support
- `VoiceListener` - Background voice activation
- `JarvisProvider` - Global state management
- `GoogleSyncButtons` - OAuth connection management

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all new tables
- **OAuth token encryption** in database
- **Secure API endpoints** with user authentication
- **Context isolation** in Electron app

## 🐛 Troubleshooting

### Voice Recognition Not Working
- Ensure you're using HTTPS or localhost
- Check browser permissions for microphone access
- Supported browsers: Chrome, Edge, Safari (limited)

### Google OAuth Errors
- Verify redirect URIs in Google Cloud Console
- Check that APIs are enabled (Calendar & Gmail)
- Ensure environment variables are set correctly

### Database Errors
- Run the migration script in Supabase
- Check RLS policies are applied
- Verify user authentication is working

### Electron Issues
- Make sure Next.js dev server is running first
- Check that electron.js and preload.js are in root directory
- Verify file paths in electron.js

## 🚢 Deployment

### Web App Deployment
1. Update `NEXT_PUBLIC_APP_URL` in production environment
2. Add production redirect URIs to Google Cloud Console
3. Deploy to your preferred platform (Vercel, Netlify, etc.)

### Electron App Distribution
1. Update electron-builder configuration in package.json
2. Build for your target platforms:
   ```bash
   npm run electron:pack
   ```
3. Distribute the built application

## 📱 Browser Compatibility

- **Chrome/Chromium**: Full support (recommended)
- **Firefox**: Limited voice recognition support
- **Safari**: Basic support, some voice features may not work
- **Edge**: Full support

## 🤝 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure database migration was successful
4. Check Google Cloud Console configuration
5. Test OAuth flow in incognito mode

## 🎉 What's Next?

Your Tracy AI app now has:
- ✅ Jarvis-style voice interface
- ✅ Google Calendar integration
- ✅ Gmail integration  
- ✅ Desktop app capability
- ✅ Enhanced AI conversations

Enjoy your new AI assistant! 🚀 