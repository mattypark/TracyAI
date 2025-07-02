const { createClient } = require('@supabase/supabase-js');

// You need to manually set these values from your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please set environment variables or edit this script with your values:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  console.log('\nOr run: NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key node scripts/test-database.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('⚠️  No authenticated user (this is normal for testing)');
    } else {
      console.log('✅ User authenticated:', user?.email || 'Unknown');
    }

    // Test event_flags table
    console.log('\n📋 Testing event_flags table...');
    const { data: flags, error: flagsError } = await supabase
      .from('event_flags')
      .select('*')
      .limit(1);

    if (flagsError) {
      console.log('❌ event_flags table error:', flagsError.message);
      if (flagsError.code === '42P01') {
        console.log('   → Table does not exist');
      }
    } else {
      console.log('✅ event_flags table exists');
    }

    // Test calendar_events table
    console.log('\n📅 Testing calendar_events table...');
    const { data: events, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*')
      .limit(1);

    if (eventsError) {
      console.log('❌ calendar_events table error:', eventsError.message);
      if (eventsError.code === '42P01') {
        console.log('   → Table does not exist');
      }
    } else {
      console.log('✅ calendar_events table exists');
    }

    // Summary
    console.log('\n📊 Summary:');
    if (flagsError || eventsError) {
      console.log('❌ Database setup incomplete');
      console.log('   → Run the SQL script in scripts/setup-database.sql');
      console.log('   → Copy and paste it into your Supabase SQL Editor');
      console.log('   → Then refresh your application');
    } else {
      console.log('✅ Database setup looks good!');
    }

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }
}

testDatabase(); 