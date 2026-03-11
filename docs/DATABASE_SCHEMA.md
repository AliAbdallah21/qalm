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
avatar_url      text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
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
created_at      timestamptz DEFAULT now()
```

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
readme_summary  text            -- AI-generated summary of README
html_url        text
created_at      timestamptz DEFAULT now()
last_synced_at  timestamptz DEFAULT now()
```

---

## cv_templates

Stores custom user-uploaded LaTeX templates.

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
template_id     uuid REFERENCES cv_templates(id) -- if null, standard template
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
