-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-------------------------------------------------------------------
-- 1. profiles
-------------------------------------------------------------------
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name text,
    email text,
    phone text,
    country text,
    city text,
    age integer,
    headline text,
    summary text,
    linkedin_url text,
    github_username text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX profiles_user_id_idx ON profiles(user_id);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON profiles FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 2. experiences
-------------------------------------------------------------------
CREATE TABLE experiences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    company text NOT NULL,
    title text NOT NULL,
    location text,
    start_date date NOT NULL,
    end_date date,
    is_current boolean DEFAULT false,
    description text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX experiences_user_id_idx ON experiences(user_id);

ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON experiences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON experiences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON experiences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON experiences FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 3. education
-------------------------------------------------------------------
CREATE TABLE education (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    institution text NOT NULL,
    degree text NOT NULL,
    field text,
    start_date date,
    end_date date,
    grade text,
    description text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX education_user_id_idx ON education(user_id);

ALTER TABLE education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON education FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON education FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 4. skills
-------------------------------------------------------------------
CREATE TABLE skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    level text,
    years_experience integer,
    category text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX skills_user_id_idx ON skills(user_id);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON skills FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 5. certificates
-------------------------------------------------------------------
CREATE TABLE certificates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    issuer text NOT NULL,
    issue_date date,
    expiry_date date,
    credential_url text,
    description text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX certificates_user_id_idx ON certificates(user_id);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON certificates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON certificates FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 6. github_repos
-------------------------------------------------------------------
CREATE TABLE github_repos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    repo_id bigint UNIQUE,
    repo_name text NOT NULL,
    full_name text NOT NULL,
    description text,
    languages jsonb,
    topics jsonb,
    stars integer DEFAULT 0,
    forks integer DEFAULT 0,
    is_private boolean DEFAULT false,
    is_featured boolean DEFAULT false,
    readme_summary text,
    html_url text,
    created_at timestamptz DEFAULT now(),
    last_synced_at timestamptz DEFAULT now()
);

CREATE INDEX github_repos_user_id_idx ON github_repos(user_id);

ALTER TABLE github_repos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON github_repos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON github_repos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON github_repos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON github_repos FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 7. cv_generations
-------------------------------------------------------------------
CREATE TABLE cv_generations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    job_title text,
    company_name text,
    job_description text NOT NULL,
    generated_cv jsonb,
    pdf_url text,
    ats_score integer,
    model_used text,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX cv_generations_user_id_idx ON cv_generations(user_id);

ALTER TABLE cv_generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON cv_generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON cv_generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON cv_generations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON cv_generations FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 8. job_applications
-------------------------------------------------------------------
CREATE TABLE job_applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    cv_generation_id uuid REFERENCES cv_generations(id),
    company text NOT NULL,
    role text NOT NULL,
    job_url text,
    status text DEFAULT 'applied',
    applied_date date DEFAULT CURRENT_DATE,
    expected_salary text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX job_applications_user_id_idx ON job_applications(user_id);

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON job_applications FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 9. user_subscriptions
-------------------------------------------------------------------
CREATE TABLE user_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    tier text DEFAULT 'free',
    stripe_customer_id text,
    stripe_sub_id text,
    current_period_end timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX user_subscriptions_user_id_idx ON user_subscriptions(user_id);

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON user_subscriptions FOR DELETE USING (auth.uid() = user_id);
