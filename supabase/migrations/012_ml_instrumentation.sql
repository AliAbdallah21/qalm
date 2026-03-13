-- ===== 012_ml_instrumentation.sql =====
-- ML Instrumentation Tables
-- Run in Supabase Dashboard → SQL Editor
-- Purpose: Capture training data for future ML models.
-- Every row is a sample you CANNOT recover retroactively.

-------------------------------------------------------------------
-- 1. cv_generation_job_match
-- Links a CV to the job application it was used for.
-- Stores ML signals at submission time (ats score, skill overlap, etc.)
-- outcome column is updated when job_applications.status changes.
-------------------------------------------------------------------
CREATE TABLE cv_generation_job_match (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    cv_generation_id    uuid REFERENCES cv_generations(id) ON DELETE SET NULL,
    job_application_id  uuid REFERENCES job_applications(id) ON DELETE SET NULL,

    -- Signals captured at submission time
    ats_score_at_submit     integer,
    missing_keywords        jsonb DEFAULT '[]',
    skill_overlap_pct       numeric(5,2),
    cv_word_count           integer,
    jd_word_count           integer,
    days_since_last_cv      integer,

    -- Company context
    company_name            text,
    company_industry        text,
    job_seniority           text,
    job_location_type       text,

    -- Outcome — populated when application status changes
    outcome                 text,
    outcome_updated_at      timestamptz,
    days_to_response        integer,

    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

CREATE INDEX cv_generation_job_match_user_id_idx  ON cv_generation_job_match(user_id);
CREATE INDEX cv_generation_job_match_cv_id_idx    ON cv_generation_job_match(cv_generation_id);
CREATE INDEX cv_generation_job_match_app_id_idx   ON cv_generation_job_match(job_application_id);

CREATE TRIGGER update_cv_generation_job_match_updated_at
    BEFORE UPDATE ON cv_generation_job_match
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE cv_generation_job_match ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON cv_generation_job_match FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON cv_generation_job_match FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON cv_generation_job_match FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON cv_generation_job_match FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 2. user_skill_snapshot
-- MOST CRITICAL TABLE.
-- Captures the user's exact skill set at the moment they submit a job application.
-- Without this you cannot do temporal learning.
-- You can NEVER reconstruct what skills a user had in the past.
-------------------------------------------------------------------
CREATE TABLE user_skill_snapshot (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    job_application_id      uuid REFERENCES job_applications(id) ON DELETE CASCADE,

    -- Full skills array at this exact moment
    skills_snapshot         jsonb NOT NULL DEFAULT '[]',
    -- Shape: [{ name, level, category, years_experience }]

    -- Derived counts for fast ML queries
    total_skill_count       integer DEFAULT 0,
    expert_skill_count      integer DEFAULT 0,
    ai_ml_skill_count       integer DEFAULT 0,
    backend_skill_count     integer DEFAULT 0,
    frontend_skill_count    integer DEFAULT 0,
    devops_skill_count      integer DEFAULT 0,

    -- Experience context at snapshot time
    total_months_experience integer DEFAULT 0,
    job_count               integer DEFAULT 0,

    created_at  timestamptz DEFAULT now()
);

CREATE INDEX user_skill_snapshot_user_id_idx  ON user_skill_snapshot(user_id);
CREATE INDEX user_skill_snapshot_app_id_idx   ON user_skill_snapshot(job_application_id);

ALTER TABLE user_skill_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON user_skill_snapshot FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON user_skill_snapshot FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON user_skill_snapshot FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON user_skill_snapshot FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 3. skill_acquisition_events
-- Tracks when a skill is added to the user's profile.
-- Captures whether it was self-initiated or Qalm-recommended.
-- Used for uplift modeling: did Qalm recommendations improve response rate?
-------------------------------------------------------------------
CREATE TABLE skill_acquisition_events (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_name              text NOT NULL,
    skill_category          text,

    -- How the skill was added
    source                  text NOT NULL, -- user_added | qalm_recommended | linkedin_import | github_detected

    -- Only set when source = qalm_recommended
    recommendation_reason   text,
    estimated_impact        text,
    recommended_at          timestamptz,

    -- Outcome metrics populated by background job
    apps_30d_before         integer,
    apps_30d_after          integer,
    response_rate_before    numeric(5,2),
    response_rate_after     numeric(5,2),

    created_at  timestamptz DEFAULT now()
);

CREATE INDEX skill_acquisition_events_user_id_idx  ON skill_acquisition_events(user_id);
CREATE INDEX skill_acquisition_events_skill_idx    ON skill_acquisition_events(skill_name);
CREATE INDEX skill_acquisition_events_source_idx   ON skill_acquisition_events(source);

ALTER TABLE skill_acquisition_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON skill_acquisition_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON skill_acquisition_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON skill_acquisition_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON skill_acquisition_events FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 4. application_sessions
-- Daily application activity log per user.
-- One row per user per day. Upserted on each application submit.
-- Used for velocity features (is the user actively job hunting?).
-------------------------------------------------------------------
CREATE TABLE application_sessions (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date            date NOT NULL DEFAULT CURRENT_DATE,

    -- Activity counts for this day
    applications_submitted  integer DEFAULT 0,
    cvs_generated           integer DEFAULT 0,
    profile_edits           integer DEFAULT 0,
    skills_added            integer DEFAULT 0,

    -- Rolling velocity (computed at upsert time)
    applications_last_7d    integer DEFAULT 0,
    applications_last_30d   integer DEFAULT 0,

    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now(),

    UNIQUE (user_id, session_date)
);

CREATE INDEX application_sessions_user_id_idx  ON application_sessions(user_id);
CREATE INDEX application_sessions_date_idx     ON application_sessions(session_date);

CREATE TRIGGER update_application_sessions_updated_at
    BEFORE UPDATE ON application_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE application_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON application_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON application_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON application_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON application_sessions FOR DELETE USING (auth.uid() = user_id);

-------------------------------------------------------------------
-- 5. ml_user_features
-- Denormalized ML feature store. One row per user.
-- Upserted whenever user has significant activity.
-- This is what gets passed to the ML inference API.
-------------------------------------------------------------------
CREATE TABLE ml_user_features (
    id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

    -- Career profile
    total_months_experience     integer DEFAULT 0,
    job_count                   integer DEFAULT 0,
    has_degree                  boolean DEFAULT false,
    degree_field_category       text,
    career_level                text, -- student | junior | mid | senior | lead | unknown

    -- Skills
    total_skills                integer DEFAULT 0,
    expert_skills               integer DEFAULT 0,
    ai_ml_skills                integer DEFAULT 0,
    top_skill_categories        jsonb DEFAULT '[]',

    -- Application history
    total_applications          integer DEFAULT 0,
    total_interviews            integer DEFAULT 0,
    total_offers                integer DEFAULT 0,
    total_rejections            integer DEFAULT 0,
    overall_response_rate       numeric(5,2) DEFAULT 0,
    interview_to_offer_rate     numeric(5,2) DEFAULT 0,
    avg_ats_score               numeric(5,2) DEFAULT 0,
    days_since_first_apply      integer DEFAULT 0,
    days_since_last_apply       integer DEFAULT 0,

    -- Velocity
    applications_last_7d        integer DEFAULT 0,
    applications_last_30d       integer DEFAULT 0,
    active_job_search           boolean DEFAULT false,

    -- Segment
    user_segment                text, -- student | recent_grad | career_changer | experienced | unknown

    features_computed_at    timestamptz DEFAULT now(),
    created_at              timestamptz DEFAULT now(),
    updated_at              timestamptz DEFAULT now()
);

CREATE INDEX ml_user_features_user_id_idx  ON ml_user_features(user_id);
CREATE INDEX ml_user_features_segment_idx  ON ml_user_features(user_segment);

CREATE TRIGGER update_ml_user_features_updated_at
    BEFORE UPDATE ON ml_user_features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE ml_user_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON ml_user_features FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON ml_user_features FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON ml_user_features FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data" ON ml_user_features FOR DELETE USING (auth.uid() = user_id);