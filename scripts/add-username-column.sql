-- Add username column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add constraint to ensure username is unique when not null
ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);
