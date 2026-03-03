-- Create languages table
CREATE TABLE languages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    proficiency text NOT NULL, -- native | fluent | intermediate | basic
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own languages" ON languages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own languages" ON languages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own languages" ON languages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own languages" ON languages FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX languages_user_id_idx ON languages(user_id);
