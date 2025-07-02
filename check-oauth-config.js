#!/usr/bin/env node

// Check OAuth Configuration Script
const fs = require('fs')
const path = require('path')

console.log('🔍 Checking Google OAuth Configuration...\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!')
  console.log('   Run: ./create-env.sh to create it')
  process.exit(1)
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf8')
const envLines = envContent.split('\n')
const envVars = {}

envLines.forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=')
    const value = valueParts.join('=').replace(/['"]/g, '')
    envVars[key] = value
  }
})

// Check required variables
const required = [
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL', 
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
]

let allGood = true

console.log('📋 Environment Variables Check:')
required.forEach(key => {
  const value = envVars[key]
  if (!value || value.includes('your_') || value.includes('_here')) {
    console.log(`❌ ${key}: Not configured (placeholder value)`)
    allGood = false
  } else {
    console.log(`✅ ${key}: Configured`)
  }
})

// Check port configuration
if (envVars.NEXT_PUBLIC_APP_URL) {
  if (envVars.NEXT_PUBLIC_APP_URL.includes(':3001')) {
    console.log('✅ App URL: Correctly set to port 3001')
  } else if (envVars.NEXT_PUBLIC_APP_URL.includes(':3000')) {
    console.log('⚠️  App URL: Set to port 3000, but your app runs on 3001!')
    console.log('   Update to: NEXT_PUBLIC_APP_URL=http://localhost:3001')
    allGood = false
  } else {
    console.log('❌ App URL: Invalid format')
    allGood = false
  }
}

console.log('\n🔧 Next Steps:')

if (!allGood) {
  console.log('1. Update .env.local with your actual credentials')
  console.log('2. Make sure NEXT_PUBLIC_APP_URL=http://localhost:3001')
}

console.log('3. Update Google Cloud Console redirect URIs to:')
console.log('   - http://localhost:3001/api/calendar/oauth2callback')
console.log('   - http://localhost:3001/api/gmail/oauth2callback')
console.log('4. Restart your dev server: npm run dev')

if (allGood) {
  console.log('\n🎉 Configuration looks good! Try connecting to Google Calendar now.')
} else {
  console.log('\n⚠️  Please fix the issues above before testing.')
}

console.log('\n📖 For detailed instructions, see: fix-google-oauth.md') 