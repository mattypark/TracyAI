require('dotenv').config({ path: '.env.local' })

console.log('Environment Variables Check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET')
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET')
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI)

const { createClient } = require('@supabase/supabase-js')

try {
  console.log('\nTesting Supabase client creation...')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  console.log('✅ Supabase client created successfully')
  
  // Test a simple query
  console.log('\nTesting database connection...')
  supabase
    .from('users')
    .select('id')
    .limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.log('❌ Database error:', error.message)
      } else {
        console.log('✅ Database connection successful')
      }
    })
    .catch(err => {
      console.log('❌ Database connection failed:', err.message)
    })
    
} catch (error) {
  console.log('❌ Supabase client creation failed:', error.message)
} 