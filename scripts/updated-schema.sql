-- Add onboarding_completed column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Update existing users to have onboarding completed (for existing data)
UPDATE users SET onboarding_completed = TRUE WHERE onboarding_completed IS NULL;
