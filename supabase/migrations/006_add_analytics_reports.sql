-- 006_add_analytics_reports.sql

CREATE TABLE analytics_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  report jsonb NOT NULL,
  generated_at timestamptz DEFAULT now(),
  data_snapshot jsonb,
  UNIQUE(user_id)
);

CREATE INDEX analytics_reports_user_id_idx 
  ON analytics_reports(user_id);

ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" 
  ON analytics_reports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" 
  ON analytics_reports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" 
  ON analytics_reports FOR UPDATE 
  USING (auth.uid() = user_id);
