   # Tracy AI - Personal Assistant & Reflection Journal

   A modern AI-powered personal assistant and reflection journal built with Next.js, Supabase, and OpenAI.

   ## Features

   - 🤖 AI-powered personal assistant with voice commands
   - 📝 Daily reflection journal with AI summaries
   - ✅ Task management with priorities and flags
   - 📅 Calendar integration with Google Calendar-style interface
   - 🎯 Goal tracking and productivity analytics
   - 🔐 Secure authentication with Supabase
   - 🌙 Dark/light mode support
   - 📱 Mobile-responsive design

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- An OpenAI API key
- Git installed

## Installation

1. **Clone or download the project**
   \`\`\`bash
   git clone <your-repo-url>
   cd tracy-ai-app
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Fill in your environment variables in `.env.local`:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=sk-your-openai-api-key
   NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key
   \`\`\`

4. **Set up Supabase database**
   
   Run these SQL scripts in your Supabase SQL Editor (in order):
   - `scripts/complete-database-schema.sql`
   - `scripts/add-flags-table.sql`
   - `scripts/add-profile-features.sql`

5. **Configure Google OAuth (optional)**
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Get credentials from Google Cloud Console
   - Add redirect URI: `https://[your-project].supabase.co/auth/v1/callback`

6. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

7. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

\`\`\`
tracy-ai-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── calendar/          # Calendar page
│   ├── journal/           # Journal page
│   ├── tasks/             # Tasks page
│   └── profile/           # Profile page
├── components/            # React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── scripts/               # Database migration scripts
└── public/                # Static assets
\`\`\`

## Key Dependencies

- **Next.js 15** - React framework
- **Supabase** - Backend as a service (database, auth, storage)
- **OpenAI SDK** - AI integration
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible UI components
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `NEXT_PUBLIC_OPENAI_API_KEY` | Public OpenAI key (for client-side) | Yes |

## Database Setup

The app requires several database tables. Run these scripts in your Supabase SQL Editor:

1. **Main schema**: `scripts/complete-database-schema.sql`
2. **Flags system**: `scripts/add-flags-table.sql`
3. **Profile features**: `scripts/add-profile-features.sql`

## Features Overview

### AI Assistant
- Voice commands for scheduling, task creation, journaling
- Personalized responses based on user preferences
- Natural language processing for calendar events

### Journal
- Daily reflection entries
- AI-generated summaries and insights
- Productivity and happiness tracking
- Timeline view of daily activities

### Tasks
- Priority-based task management
- Flag categorization with custom colors
- Due date tracking
- Completion analytics

### Calendar
- Google Calendar-style interface
- Event creation with flags and categories
- Upcoming events sidebar
- Integration with task deadlines

### Profile
- Customizable preferences and settings
- Productivity statistics and streaks
- Avatar and profile management
- Onboarding flow for new users

## Deployment

1. **Build the project**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Deploy to Vercel** (recommended)
   \`\`\`bash
   npx vercel
   \`\`\`

3. **Set environment variables** in your deployment platform

## Troubleshooting

### Common Issues

1. **Database errors**: Ensure all SQL scripts have been run in Supabase
2. **Auth errors**: Check Supabase configuration and redirect URLs
3. **AI errors**: Verify OpenAI API key is valid and has credits
4. **Build errors**: Run `npm run type-check` to identify TypeScript issues

### Getting Help

- Check the browser console for detailed error messages
- Verify all environment variables are set correctly
- Ensure Supabase RLS policies are properly configured

## License

This project is private and proprietary.
# TracyAI
