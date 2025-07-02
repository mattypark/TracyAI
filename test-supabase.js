// Simple script to test Supabase connection
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local file manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    // Remove any quotes and trim whitespace
    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    envVars[key.trim()] = value;
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Check if we can get the user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('Auth response:', authData ? 'Success' : 'Failed');
    if (authError) console.error('Auth error:', authError);
    
    // Check if tables exist
    const tables = ['journal_entries', 'tasks', 'calendar_events', 'users'];
    
    for (const table of tables) {
      console.log(`\nChecking table: ${table}`);
      const { data, error } = await supabase.from(table).select('*').limit(1);
      
      if (error) {
        console.error(`Error accessing ${table}:`, error);
      } else {
        console.log(`Table ${table} exists. Row count in sample:`, data.length);
      }
    }
    
    console.log('\nTest completed.');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testConnection(); 