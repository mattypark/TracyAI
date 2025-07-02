#!/bin/bash

echo "Creating .env.local file for Tracy AI..."

cat > .env.local << 'ENVEOF'
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
ENVEOF

echo "✅ .env.local file created!"
echo "🔧 Now you need to:"
echo "1. Replace the placeholder values with your actual credentials"
echo "2. Update Google Cloud Console redirect URIs to use port 3001"
echo "3. Restart your dev server with: npm run dev"
echo ""
echo "📖 See fix-google-oauth.md for detailed instructions"
