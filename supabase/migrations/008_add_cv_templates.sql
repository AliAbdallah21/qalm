CREATE TABLE cv_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    latex_code text NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);
CREATE INDEX cv_templates_user_id_idx ON cv_templates(user_id);
ALTER TABLE cv_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON cv_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON cv_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON cv_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON cv_templates FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE cv_generations
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES cv_templates(id) ON DELETE SET NULL;

ALTER TABLE cv_generations
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Other';

ALTER TABLE job_applications
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Other';
