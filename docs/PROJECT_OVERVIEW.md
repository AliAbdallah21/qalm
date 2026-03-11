markdown

# Qalm — Project Overview

## What is Qalm?

Qalm (قلم — Arabic for "pen") is an AI-powered career assistant that learns everything about a user
once, then generates perfectly tailored CVs, cover letters, and job application materials for any job
description in seconds. It tracks applications, analyzes email responses, and provides career analytics.

## The Core Problem

Job seekers waste hours reformatting their CV for every application. They forget to highlight relevant
projects, miss ATS keywords, and apply with generic materials. Qalm solves this by maintaining a rich,
deep profile of the user and using AI to tailor everything automatically.

## Target User

Developers, AI/ML engineers, and tech professionals who apply to multiple jobs and want
personalized, ATS-optimized application materials without manual effort.

## Vision

One profile. Infinite tailored applications. Full job hunt visibility.

---

## Phase Roadmap

### Phase 1 — Core MVP (CURRENT)
- User authentication (GitHub OAuth + email/password)
- Deep profile setup: personal info, experience, education, skills, certificates
- GitHub integration: auto-pull repos, languages, READMEs, summarize with AI
- Job description input → AI generates tailored CV as downloadable PDF
- Dashboard with profile completeness score

### Phase 2 — Richer Profile + Job Tracking
- LinkedIn data import (user exports ZIP, we parse it automatically)
- Cover letter generation alongside CV
- Job application tracker (applied, interview, rejected, offer)
- Multiple CV versions saved per job
- ATS score: keyword match % between CV and job description

### Phase 3 — Email Intelligence
- Gmail OAuth integration (read-only access)
- AI scans inbox for job-related emails automatically
- Auto-detects: rejection, interview invite, offer, follow-up needed
- Updates job tracker automatically based on emails
- Drafts response emails using AI

### Phase 4 — Analytics & Intelligence
- Hardcoded ATS-optimized CV templates (professional & student)
- CV categories (Frontend/Backend/AI-ML etc.)
- Category filter on job tracker
- Dashboard: total applications, response rate, interview rate, offer rate
- Expected salary per role/company from public data sources
- Skill gap analysis: what skills appear in target jobs that user is missing
- Application pattern insights

---

## What Qalm is NOT
- Not a job board
- Not a resume template builder
- Not a LinkedIn replacement
- Not storing data we don't need

---

## Core Principles
1. User owns their data — they can export or delete everything
2. One profile, many outputs — never ask the user the same thing twice
3. Modular by design — adding features never breaks existing ones
4. Free first — monetization layer added without changing feature code
5. AI does the heavy lifting — user provides data, AI does the work