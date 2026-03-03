# Qalm — Phase Tracker

**Current Status:** Phase 2 — In Progress

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

# Phase 2 — Richer Profile + Job Tracking

**Goal:** Deeper profile data, track every application, richer CV output.

**Status:** 🚀 In Progress
**Started:** March 3, 2026

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

# Phase 3 — Email Intelligence

**Goal:** Close the loop between applying and hearing back.

**Status:** 🔒 Not started
**Dependencies:** Phase 2 fully complete

## Tasks (Planned)

* [ ] Gmail OAuth integration (Google Cloud Console setup)
* [ ] lib/email-providers/interface.ts — EmailProvider interface
* [ ] lib/email-providers/gmail.ts — Gmail implementation
* [ ] POST /api/emails/connect/gmail — OAuth flow
* [ ] POST /api/emails/sync — scan inbox, classify emails
* [ ] Auto-update job tracker based on email classification
* [ ] AI draft reply suggestions
* [ ] Enable feature flags for all Phase 3 features

---

# Phase 4 — Analytics & Monetization

**Goal:** Turn job hunting data into insights. Add paid tier.

**Status:** 🔒 Not started
**Dependencies:** Phase 3 fully complete

## Tasks (Planned)

* [ ] Analytics dashboard — applications, response rate, offer rate
* [ ] Salary expectations data integration
* [ ] Skill gap analysis
* [ ] Stripe integration — user_subscriptions table already exists
* [ ] Pro tier feature gating via canUserAccess()
* [ ] Outlook email provider (lib/email-providers/outlook.ts)
* [ ] Enable feature flags for all Phase 4 features

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