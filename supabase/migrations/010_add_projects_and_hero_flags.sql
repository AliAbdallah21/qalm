CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  technologies text[] DEFAULT '{}',
  url text,
  github_repo_id uuid REFERENCES github_repos(id) ON DELETE SET NULL,
  is_hero boolean DEFAULT false,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX projects_user_id_idx ON projects(user_id);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON projects FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS is_hero boolean DEFAULT false;

ALTER TABLE github_repos ADD COLUMN IF NOT EXISTS is_hero boolean DEFAULT false;
