# Qalm — Database Schema

## Overview

All tables live in **Supabase (PostgreSQL)**.

* The `users` table is managed automatically by Supabase Auth.
* Every other table has a `user_id` foreign key referencing `auth.users(id)`.
* Row Level Security (RLS) is enabled on every table — users can only read/write their own data.

---

# Tables

## profiles

Extends the Supabase auth user with personal info.

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE
full_name       text
email           text
phone           text
country         text
city            text
age             integer
headline        text        -- e.g. "AI/ML Engineer | Python | LangChain"
summary         text        -- professional bio paragraph
linkedin_url    text
github_username text
linkedin_url    text
github_username text
avatar_url      text
preferred_template text DEFAULT 'experienced'
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

---

## projects

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE
name            text NOT NULL
description     text
technologies    text[] DEFAULT '{}'
url             text
github_repo_id  uuid REFERENCES github_repos(id) ON DELETE SET NULL
is_hero         boolean DEFAULT false
start_date      date
end_date        date
created_at      timestamptz DEFAULT now()
```

---

## experiences

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE
company         text NOT NULL
title           text NOT NULL
location        text
start_date      date NOT NULL
end_date        date        -- null if current
is_current      boolean DEFAULT false
description     text        -- detailed bullet points
created_at      timestamptz DEFAULT now()
```

---

## education

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE
institution     text NOT NULL
degree          text NOT NULL   -- e.g. "BSc Computer Science"
field           text            -- e.g. "AI/ML Specialization"
start_date      date
end_date        date
grade           text            -- e.g. "3.8 GPA" or "First Class"
description     text
created_at      timestamptz DEFAULT now()
```

---

## skills

```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE
name             text NOT NULL   -- e.g. "Python", "LangChain", "RAG"
level            text            -- beginner | intermediate | expert
years_experience integer
category         text            -- e.g. "AI/ML", "Backend", "DevOps"
created_at       timestamptz DEFAULT now()
```

---

## certificates

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE
title           text NOT NULL
issuer          text NOT NULL   -- e.g. "Coursera", "Udemy", "AWS"
issue_date      date
expiry_date     date            -- null if no expiry
credential_url  text
description     text
is_hero         boolean DEFAULT false
created_at      timestamptz DEFAULT now()
``````

---

## github_repos

Auto-populated by GitHub sync. Never manually edited by user.

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE
repo_id         bigint UNIQUE   -- GitHub's internal repo ID
repo_name       text NOT NULL
full_name       text NOT NULL   -- e.g. "AliAbdallah21/qalm"
description     text
languages       jsonb           -- e.g. {"Python": 8420, "JavaScript": 1200}
topics          jsonb           -- e.g. ["machine-learning", "rag"]
stars           integer DEFAULT 0
forks           integer DEFAULT 0
is_private      boolean DEFAULT false
is_featured     boolean DEFAULT false
is_hero         boolean DEFAULT false
readme_summary  text            -- AI-generated summary of README
html_url        text
created_at      timestamptz DEFAULT now()
last_synced_at  timestamptz DEFAULT now()
``````

---

## cv_templates (Deprecated)

Stores custom user-uploaded LaTeX templates. (Deprecated in favor of hardcoded templates)

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE
name            text NOT NULL
latex_code      text NOT NULL
is_active       boolean DEFAULT false
created_at      timestamptz DEFAULT now()
```

---

## cv_generations

Every CV ever generated. Never deleted — used for history and analytics.

```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE
job_title       text
company_name    text
job_description text NOT NULL   -- the raw JD the user pasted
generated_cv    jsonb           -- structured CV data (sections, bullets)
pdf_url         text            -- Supabase Storage URL
ats_score       integer         -- 0-100 keyword match score
model_used      text            -- which AI model generated this
template_id     text            -- 'experienced' or 'student'
category        text DEFAULT 'Other' -- e.g. "Frontend", "Backend", "AI/ML"
created_at      timestamptz DEFAULT now()
```

---

## job_applications

Tracks every job applied to. Phase 2 feature but table created in Phase 1.

```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE
cv_generation_id    uuid REFERENCES cv_generations(id)
company             text NOT NULL
role                text NOT NULL
job_url             text
status              text DEFAULT 'applied'
                    -- applied | interview | rejected | offer | withdrawn
applied_date        date DEFAULT CURRENT_DATE
expected_salary     text
notes               text
category            text DEFAULT 'Other' -- e.g. "Frontend", "Backend", "AI/ML"
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

---

## user_subscriptions

Phase 4 monetization. Created now so `canUserAccess()` has a table to query.

```sql
id                 uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id            uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE
tier               text DEFAULT 'free'   -- free | pro | enterprise
stripe_customer_id text
stripe_sub_id      text
current_period_end timestamptz
created_at         timestamptz DEFAULT now()
updated_at         timestamptz DEFAULT now()
```

---

## cv_generation_job_match

Captures ML signals related to CV generation and job applications at the time of submission.

```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE
cv_generation_id        uuid REFERENCES cv_generations(id) ON DELETE CASCADE
job_application_id      uuid REFERENCES job_applications(id) ON DELETE CASCADE
ats_score_at_submit      integer         -- score at the moment of application
missing_keywords        jsonb           -- keywords missing in CV for this JD
skill_overlap_pct       numeric         -- calculated overlap percentage
cv_word_count           integer
jd_word_count           integer
days_since_last_cv      integer         -- freshness of the CV
company_name            text
company_industry        text
job_seniority           text
job_location_type       text            -- remote | hybrid | on-site
outcome                 text            -- interview | offer | reject | ghosted
outcome_updated_at      timestamptz
days_to_response        integer         -- diff between applied_date and outcome_updated_at
created_at              timestamptz DEFAULT now()
updated_at              timestamptz DEFAULT now()
```

---

## user_skill_snapshot

Captured upon every job application to provide a temporal record of a user's skills.

```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE
job_application_id      uuid REFERENCES job_applications(id) ON DELETE CASCADE
skills_snapshot         jsonb           -- full skill array at submission time
total_skill_count       integer
expert_skill_count      integer
ai_ml_skill_count       integer
backend_skill_count     integer
frontend_skill_count    integer
devops_skill_count      integer
total_months_experience integer         -- cumulative duration of all experiences
job_count               integer         -- record count in experiences table
created_at              timestamptz DEFAULT now()
```

---

## skill_acquisition_events

Logs every time a skill is added to track how users grow their profiles.

```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE
skill_name              text NOT NULL
skill_category          text
source                  text            -- user_added | qalm_recommended | linkedin_import | github_detected
recommendation_reason   text
estimated_impact        text
recommended_at          timestamptz
apps_30d_before         integer
apps_30d_after          integer
response_rate_before    numeric
response_rate_after     numeric
created_at              timestamptz DEFAULT now()
```

---

## application_sessions

Aggregates daily user activity for ML velocity signals.

```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE
session_date            date NOT NULL
applications_submitted  integer DEFAULT 0
cvs_generated           integer DEFAULT 0
profile_edits           integer DEFAULT 0
skills_added            integer DEFAULT 0
applications_last_7d    integer DEFAULT 0
applications_last_30d   integer DEFAULT 0
created_at              timestamptz DEFAULT now()
updated_at              timestamptz DEFAULT now()
UNIQUE (user_id, session_date)
```

---

## ml_user_features

Denormalized feature store for offline ML training. Updated periodically or on-demand.

```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id                 uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE
total_months_experience integer
job_count               integer
has_degree              boolean
degree_field_category   text
career_level            text
total_skills            integer
expert_skills           integer
ai_ml_skills            integer
top_skill_categories    jsonb
total_applications      integer
total_interviews        integer
total_offers            integer
total_rejections        integer
overall_response_rate   numeric
interview_to_offer_rate numeric
avg_ats_score           numeric
days_since_first_apply  integer
days_since_last_apply   integer
applications_last_7d    integer
applications_last_30d   integer
active_job_search       boolean
user_segment            text
features_computed_at    timestamptz
created_at              timestamptz DEFAULT now()
updated_at              timestamptz DEFAULT now()
```

---

# Row Level Security Policies

Every table has RLS enabled. The pattern is identical for all tables:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rows
CREATE POLICY "Users can view own data"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own rows
CREATE POLICY "Users can insert own data"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own rows
CREATE POLICY "Users can update own data"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Users can only delete their own rows
CREATE POLICY "Users can delete own data"
ON profiles FOR DELETE
USING (auth.uid() = user_id);
```

Apply the same pattern to:

* experiences
* education
* skills
* certificates
* github_repos
* cv_generations
* job_applications
* user_subscriptions

---

# Migration File Location

```
supabase/migrations/001_initial_schema.sql
```

All tables above are created in this single migration file.

* Run it once to set up the entire database.
* Never edit a migration file after running it.
* Create a new migration file for any changes.

---

# Notes

* All `id` fields use `uuid` (not integer) — safer for distributed systems and public APIs.
* `jsonb` is used for `languages` and `topics` in `github_repos` — flexible and queryable.
* `cv_generations.generated_cv` stores the full structured CV as JSON so we can re-render without re-generating.
* `job_applications` references `cv_generations` so we always know which CV version was sent to which company.
