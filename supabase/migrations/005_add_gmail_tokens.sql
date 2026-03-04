-- Create gmail_tokens table to store OAuth credentials
CREATE TABLE gmail_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  access_token text NOT NULL,
  refresh_token text,
  token_expiry timestamptz,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster lookups by user_id
CREATE INDEX gmail_tokens_user_id_idx ON gmail_tokens(user_id);

-- Enable RLS
ALTER TABLE gmail_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own tokens" ON gmail_tokens 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens" ON gmail_tokens 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON gmail_tokens 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON gmail_tokens 
  FOR DELETE USING (auth.uid() = user_id);
