-- Create google_tokens table for storing Google OAuth tokens
CREATE TABLE IF NOT EXISTS google_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service TEXT NOT NULL,
  tokens JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service)
);

-- Enable Row Level Security
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own tokens" ON google_tokens
FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_google_tokens_user_id ON google_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_tokens_service ON google_tokens(service);
CREATE INDEX IF NOT EXISTS idx_google_tokens_user_service ON google_tokens(user_id, service);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_google_tokens_updated_at ON google_tokens;
CREATE TRIGGER update_google_tokens_updated_at
    BEFORE UPDATE ON google_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table creation
SELECT 'google_tokens table created successfully' as status 
WHERE EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'google_tokens'
); 