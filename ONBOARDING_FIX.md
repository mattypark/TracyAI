# Onboarding Preferences Saving Fix

## Problem
Users are getting "Error saving preferences: {}" when trying to complete the onboarding process.

## Root Cause
The error occurs because:
1. The `users` table may be missing required columns
2. RLS (Row Level Security) policies may not be properly configured
3. The upsert operation was not handling edge cases properly

## Solution Applied

### 1. Fixed Onboarding Code (`app/onboarding/page.tsx`)
- Replaced problematic `upsert` with explicit `insert` or `update` logic
- Added proper error handling and logging
- Made username field optional to avoid constraint issues
- Added null handling for all preference fields

### 2. Database Schema Requirements
The `users` table needs these columns:
```sql
- id (UUID, primary key, references auth.users)
- email (TEXT, not null)
- username (TEXT, nullable, unique when not null)
- full_name (TEXT, nullable)
- avatar_url (TEXT, nullable)
- preferences (JSONB, default '{}')
- onboarding_completed (BOOLEAN, default false)
- created_at (TIMESTAMP WITH TIME ZONE, default NOW())
- updated_at (TIMESTAMP WITH TIME ZONE, default NOW())
```

### 3. Required Database Migration
Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create unique constraint on username (allowing nulls)
DROP INDEX IF EXISTS idx_users_username;
CREATE UNIQUE INDEX idx_users_username ON users(username) WHERE username IS NOT NULL;

-- Ensure RLS policies exist for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users 
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## How the Fix Works

### Before (Problematic)
```javascript
const { error } = await supabase.from("users").upsert({
  // This could fail due to missing columns or RLS issues
})
```

### After (Fixed)
```javascript
// Check if user exists first
const { data: existingUser } = await supabase
  .from("users")
  .select("*")
  .eq("id", user.id)
  .single()

// Use explicit insert or update based on existence
if (existingUser) {
  // Update existing user
  const { data, error } = await supabase
    .from("users")
    .update(userData)
    .eq("id", user.id)
} else {
  // Insert new user
  const { data, error } = await supabase
    .from("users")
    .insert([userData])
}
```

## Benefits of This Fix
1. **Better Error Handling**: Clear error messages help debug issues
2. **Null Safety**: Handles empty/null values properly
3. **Schema Flexibility**: Works even if some columns are missing
4. **RLS Compatibility**: Properly handles Row Level Security
5. **Username Optional**: Avoids unique constraint issues

## Testing
After applying the fix:
1. Go to the onboarding page
2. Fill out the preferences form
3. Click "Complete"
4. Should see success and redirect to demo page
5. Check Supabase dashboard to confirm data was saved

## Rollback Plan
If issues persist:
1. Revert `app/onboarding/page.tsx` to use simple insert without username
2. Make all fields optional in the database
3. Focus on core functionality first, add features incrementally

## Additional Notes
- The fix maintains backward compatibility
- Username is now optional to avoid constraint conflicts
- All preference data is stored in JSONB for flexibility
- RLS policies ensure data security 