# Qalm — Phase Tracker

**Current Status:** Phase 4 — Analytics & Intelligence

---

# Phase 1 — Core MVP ✅ COMPLETE

**Goal:** User sets up profile once, gets a tailored CV out.

**Started:** March 2, 2026
**Completed:** March 3, 2026

---

## Setup & Infrastructure

* [x] Next.js project initialized with TypeScript + Tailwind
* [x] Supabase project created
* [x] GitHub OAuth app created
* [x] Vercel account connected to GitHub repo
* [x] .env.local configured with all Phase 1 keys
* [x] /docs folder created with all context files
* [x] Supabase database migration run (001_initial_schema.sql)
* [x] Supabase Auth configured (GitHub OAuth callback URL added)
* [x] Folder structure created (src/features, src/lib, src/components)
* [x] Supabase client files created (lib/supabase/client.ts + server.ts)
* [x] OpenRouter AI client created (lib/ai/client.ts)
* [x] canUserAccess() function created (lib/access/permissions.ts)

---

## Authentication

* [x] /app/(auth)/login/page.tsx — login page UI
* [x] /app/(auth)/signup/page.tsx — signup page UI
* [x] /app/auth/callback/route.ts — Supabase OAuth callback handler
* [x] GitHub OAuth login working end to end
* [x] Email/password signup and login working
* [x] Auth guard on (dashboard) layout — redirect to login if not authenticated
* [x] Redirect to /dashboard after successful login

---

## Profile

* [x] features/profile/types.ts — all profile TypeScript types
* [x] features/profile/queries.ts — all DB queries for profile
* [x] features/profile/actions.ts — server actions for profile CRUD
* [x] GET /api/profile — fetch full profile with completeness score
* [x] POST /api/profile — upsert basic profile info
* [x] POST /api/profile/experiences — add experience
* [x] PATCH /api/profile/experiences/[id] — update experience
* [x] DELETE /api/profile/experiences/[id] — delete experience
* [x] POST /api/profile/education — add education
* [x] PATCH /api/profile/education/[id] — update education
* [x] DELETE /api/profile/education/[id] — delete education
* [x] POST /api/profile/skills — add skill
* [x] DELETE /api/profile/skills/[id] — delete skill
* [x] POST /api/profile/certificates — add certificate
* [x] DELETE /api/profile/certificates/[id] — delete certificate
* [x] POST /api/profile/languages — add language
* [x] DELETE /api/profile/languages/[id] — delete language
* [x] Supabase migration run (002_add_languages.sql)
* [x] /dashboard/profile/page.tsx — full profile setup UI with all sections
* [x] Profile completeness score calculation (0-100) — showing 100%

---

## GitHub Integration

* [x] lib/github/client.ts — GitHub API wrapper
* [x] features/github/types.ts
* [x] features/github/queries.ts
* [x] features/github/actions.ts
* [x] POST /api/github/sync — fetch and store all repos with AI summaries
* [x] GET /api/github/repos — return stored repos from DB
* [x] PATCH /api/github/repos/[id]/feature — toggle featured
* [x] /dashboard/github/page.tsx — repos view with sync button + featured toggle

---

## CV Generation

* [x] features/cv-generator/types.ts
* [x] features/cv-generator/queries.ts
* [x] features/cv-generator/actions.ts
* [x] lib/ai/prompts.ts — all prompt constants and builder functions
* [x] POST /api/cv/generate — full CV generation endpoint
* [x] GET /api/cv/history — list past generated CVs
* [x] GET /api/cv/[id] — get single CV
* [x] PDF generation from CV JSON using LaTeX (node-latex + MiKTeX)
* [x] PDF upload to Supabase Storage (bucket: cvs)
* [x] Supabase Storage RLS policies configured
* [x] Human-readable PDF filename: company_jobtitle_timestamp.pdf
* [x] /dashboard/cv-builder/page.tsx — paste JD → generate → download UI
* [x] ATS score displayed with color indicator (green/yellow/red)
* [x] CV_STYLE_REFERENCE.tex added to docs as style reference
* [x] Hardcoded ATS-optimized CV templates (professional & student)

---

## Dashboard

* [x] /dashboard/page.tsx — main dashboard
* [x] Profile completeness widget
* [x] Recent CV generations widget
* [x] Quick action buttons (Generate CV, Sync GitHub, Edit Profile)
* [x] Sidebar navigation with all routes

---

## Landing Page

* [x] /app/page.tsx — public landing page
* [x] Hero section with Qalm branding and tagline
* [x] CTA to sign up and login
* [x] Feature highlights

---

## Known Issues / Future Polish

* [ ] CV header title sometimes generates as a long sentence instead of "Role | Skill | Skill" format — needs post-processing truncation
* [ ] Page count overflow when many certificates added — needs LaTeX page constraint
* [ ] Buffer() deprecation warning in PDF generation — cosmetic only, no functional impact

---

# Phase 2 — Richer Profile + Job Tracking ✅ COMPLETE

**Goal:** Deeper profile data, track every application, richer CV output.

**Started:** March 3, 2026
**Completed:** March 12, 2026

---

## Step 1 — Job Application Tracker ✅ COMPLETE

* [x] features/job-tracker/types.ts
* [x] features/job-tracker/queries.ts
* [x] features/job-tracker/actions.ts
* [x] GET /api/jobs — list all applications
* [x] POST /api/jobs — create new application
* [x] GET /api/jobs/[id] — get single application
* [x] PATCH /api/jobs/[id] — update status
* [x] DELETE /api/jobs/[id] — delete application
* [x] /dashboard/jobs/page.tsx — applications list with status badges
* [x] "Save as Application" button on cv-builder page after generation
* [x] Application stats widget on dashboard (total, interviews, offers, rejections)
* [x] Recent applications list on dashboard

---

## Step 2 — LinkedIn ZIP Import ✅ COMPLETE

* [x] POST /api/profile/linkedin-import — parse LinkedIn ZIP export
* [x] Parse positions, education, skills, certifications from CSV files
* [x] Preview before saving
* [x] UI on profile page to upload ZIP

---

## Step 3 — Cover Letter Generator ✅ COMPLETE

* [x] COVER_LETTER_PROMPT added to lib/ai/prompts.ts
* [x] POST /api/cover-letter/generate
* [x] Cover letter PDF generation (LaTeX template)
* [x] Cover letter section on cv-builder page alongside CV

---

## Step 4 — ATS Score Visual Breakdown ✅ COMPLETE

* [x] Matched keywords shown in green
* [x] Missing keywords shown in red
* [x] Improvement suggestions
* [x] Visual breakdown on cv-builder page after generation

---

## Step 5 — Projects & Hero Flags ✅ COMPLETE

* [x] Create `projects` table with RLS (010_add_projects_and_hero_flags.sql)
* [x] Add `is_hero` column to `certificates` and `github_repos`
* [x] features/projects/ folder with types, queries, actions
* [x] GET/POST/PATCH/DELETE /api/profile/projects
* [x] PATCH /api/profile/projects/[id]/hero — toggle status with limit check (max 4)
* [x] /dashboard/profile/page.tsx — Projects section with "Promote from GitHub"
* [x] CV Builder: Featured Projects & Certifications selection UI
* [x] CV Builder: Optional custom descriptions for forced projects
* [x] CV Builder: Toggles for "Let AI pick additional" projects/certs
* [x] CV Builder: Auto-disable AI toggles when 3+ items selected
* [x] Profile: Language selection dropdown with duplicate prevention
* [x] Projects: Filter already promoted repos from GitHub dropdown
* [x] API Update: /api/cv/generate accepts forced IDs and descriptions
* [x] Prompt Update: buildCVGenerationPrompt incorporates forced/hero context
* [x] Logic Update: Post-AI placeholder replacement for guaranteed data accuracy

---

# Phase 3 — Email Intelligence ✅ COMPLETE

**Goal:** Close the loop between applying and hearing back.

**Started:** March 3, 2026
**Completed:** March 3, 2026

---

## Tasks ✅ COMPLETE

* [x] Gmail OAuth integration (Google Cloud Console setup)
* [x] lib/email-providers/gmail.ts — Gmail implementation
* [x] POST /api/emails/connect/gmail — OAuth flow
* [x] POST /api/emails/sync — scan inbox, classify emails
* [x] Auto-update job tracker based on email classification
* [x] AI draft reply suggestions
* [x] Enable feature flags for all Phase 3 features

---

---

# ML Instrumentation — Phase 0 ✅ COMPLETE

**Goal:** Capture atomic snapshots of every meaningful user action for future ML model training.

**Completed:** March 13, 2026

* [x] Migration 012 — 5 ML tables created in Supabase
* [x] captureMLSnapshots() added to features/job-tracker/queries.ts
* [x] captureSkillSnapshot() — inserts into user_skill_snapshot on every job application
* [x] captureCvMatchSnapshot() — inserts into cv_generation_job_match on every job application (only when cv_generation_id present)
* [x] captureMLSnapshots called with await in POST /api/jobs/route.ts
* [x] skill_acquisition_events insert added to createSkill in features/profile/queries.ts
* [x] application_sessions upsert added to POST /api/jobs/route.ts with manual increment logic

---

# Phase 4 — Analytics & Intelligence 🚧 IN PROGRESS

**Goal:** Turn job hunting data into insights. Add paid tier.

**Status:** 🚧 In Progress
**Dependencies:** Phase 3 fully complete

## Tasks

* [x] Analytics dashboard — applications, response rate, offer rate
* [x] AI Intelligence Report — Top of analytics page with insights
* [ ] Salary expectations data integration
* [ ] Skill gap analysis
* [x] Stripe integration — user_subscriptions table already exists
* [x] Pro tier feature gating via canUserAccess()
* [x] Real market data integration via JSearch API
* [ ] Outlook email provider (lib/email-providers/outlook.ts)
* [x] Enable feature flags for all Phase 4 features

---

# How to Use This File

When you start a coding session, tell the AI assistant:

> "Read all files in /docs. We are on Phase 2. Today I want to work on [specific section above]."

* Check off items as you complete them by changing `- [ ]` to `- [x]`.
* Never mark something complete unless it's tested and working.
* Never start Phase 3 tasks while Phase 2 has unchecked items.

---

# Decisions Log

| Date       | Decision                                    | Reason                                            |
| ---------- | ------------------------------------------- | ------------------------------------------------- |
| 2026-03-02 | Chose Next.js App Router                    | Server components, one repo, Vercel deploy        |
| 2026-03-02 | Chose Supabase over raw Postgres            | Auth + DB + Storage in one, free tier             |
| 2026-03-02 | Chose OpenRouter over direct APIs           | One key, swap models freely                       |
| 2026-03-02 | Named app "Qalm"                            | Arabic for pen, unique, global appeal             |
| 2026-03-02 | Started with Gmail only for email           | Simpler OAuth, largest user base, Outlook Phase 4 |
| 2026-03-02 | All features free for Phase 1–3             | Build user base first, monetize in Phase 4        |
| 2026-03-03 | Used LaTeX + MiKTeX for PDF generation      | Consistent output matching existing CV style      |
| 2026-03-03 | Added languages table (002_add_languages)   | CV quality improvement, international users       |
| 2026-03-03 | CV title post-processing deferred           | Minor issue, revisit in Phase 2 polish            |