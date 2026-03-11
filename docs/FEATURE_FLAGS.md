# Qalm — Feature Flags

## Overview

Feature flags control what is enabled, disabled, or coming soon. Before building anything, check this file to confirm the feature is in scope for the current phase.

The `canUserAccess()` function in `src/lib/access/permissions.ts` is the single place that enforces these flags at runtime. Never check phase or tier anywhere else in the codebase.

**Current Phase:** Phase 2

---

## Flag Reference Table

| Feature Key            | Display Name                 | Phase | Status      | Tier Required |
| ---------------------- | ---------------------------- | ----- | ----------- | ------------- |
| auth_email             | Email/Password Auth          | 1     | ✅ ENABLED   | free          |
| auth_github            | GitHub OAuth Login           | 1     | ✅ ENABLED   | free          |
| profile_basic          | Basic Profile Setup          | 1     | ✅ ENABLED   | free          |
| profile_experience     | Experience Entries           | 1     | ✅ ENABLED   | free          |
| profile_education      | Education Entries            | 1     | ✅ ENABLED   | free          |
| profile_skills         | Skills List                  | 1     | ✅ ENABLED   | free          |
| profile_certificates   | Certificates & Courses       | 1     | ✅ ENABLED   | free          |
| github_sync            | GitHub Repo Sync             | 1     | ✅ ENABLED   | free          |
| github_featured        | Mark Repos as Featured       | 1     | ✅ ENABLED   | free          |
| cv_generation          | AI CV Generation             | 1     | ✅ ENABLED   | free          |
| cv_download_pdf        | Download CV as PDF           | 1     | ✅ ENABLED   | free          |
| cv_history             | View Past Generated CVs      | 1     | ✅ ENABLED   | free          |
| dashboard_completeness | Profile Completeness Score   | 1     | ✅ ENABLED   | free          |
| linkedin_import        | LinkedIn ZIP Import          | 2     | ✅ ENABLED   | free          |
| cover_letter           | Cover Letter Generation      | 2     | ✅ ENABLED   | free          |
| job_tracker            | Job Application Tracker      | 2     | ✅ ENABLED   | free          |
| ats_score              | ATS Keyword Score            | 2     | ✅ ENABLED   | free          |
| profile_projects       | User Projects Section        | 2     | ✅ ENABLED   | free          |
| cv_versions            | Multiple CV Versions per Job | 2     | 🔒 DISABLED | free          |
| gmail_connect          | Connect Gmail Account        | 3     | 🔒 DISABLED | free          |
| email_scan             | Auto-scan Job Emails         | 3     | 🔒 DISABLED | free          |
| email_classify         | AI Email Classification      | 3     | 🔒 DISABLED | free          |
| email_drafts           | AI Draft Email Replies       | 3     | 🔒 DISABLED | pro           |
| analytics_basic        | Basic Application Stats      | 4     | 🔒 DISABLED | free          |
| analytics_salary       | Salary Expectations Data     | 4     | 🔒 DISABLED | pro           |
| analytics_skill_gap    | Skill Gap Analysis           | 4     | 🔒 DISABLED | pro           |
| analytics_patterns     | Application Pattern Insights | 4     | 🔒 DISABLED | pro           |
| outlook_connect        | Connect Outlook Account      | 4+    | 🔒 DISABLED | free          |
| monetization           | Stripe Payments              | 4+    | 🔒 DISABLED | —             |

---

## Status Definitions

* ✅ **ENABLED** — Built and active for all users
* 🚧 **IN PROGRESS** — Currently being built
* 🔒 **DISABLED** — Not built yet, returns 403 if called
* ⚠️ **DEPRECATED** — Was enabled, now turned off

---

## How `canUserAccess()` Works

```typescript
// src/lib/access/permissions.ts

// Phase 1: everything enabled is just returned true
// Phase 4+: this function queries user_subscriptions table

const ENABLED_FEATURES = new Set([
  'auth_email',
  'auth_github',
  'profile_basic',
  'profile_experience',
  'profile_education',
  'profile_skills',
  'profile_certificates',
  'github_sync',
  'github_featured',
  'cv_generation',
  'cv_download_pdf',
  'cv_history',
  'dashboard_completeness',
  'linkedin_import',
  'cover_letter',
  'job_tracker',
  'ats_score',
  'profile_projects',
])

export async function canUserAccess(userId: string, feature: string): Promise<boolean> {
  // If feature is not in enabled set, it's disabled regardless of tier
  if (!ENABLED_FEATURES.has(feature)) return false

  // Phase 1: all enabled features are free for everyone
  return true

  // Phase 4 — uncomment when adding Stripe:
  // const subscription = await getUserSubscription(userId)
  // const requiredTier = FEATURE_TIER_MAP[feature]
  // return checkTierAccess(subscription.tier, requiredTier)
}
```

---

## How to Enable a Feature (Phase Transition)

When moving from Phase 1 to Phase 2, follow these exact steps:

1. Update this file — change feature status from 🔒 DISABLED to ✅ ENABLED
2. Add the feature key to `ENABLED_FEATURES` set in `permissions.ts`
3. Update `PHASE_TRACKER.md` — mark Phase 1 complete, set Phase 2 as current
4. Build the feature in its own folder under `src/features/`
5. Add the API routes under `src/app/api/`
6. Add the page under `src/app/(dashboard)/`

Never skip step 1 and 2 — the flag must be enabled before the feature is accessible.

---

## Future Monetization Tier Map (Phase 4+)

```typescript
// Will live in src/lib/access/permissions.ts when monetization is added
const FEATURE_TIER_MAP: Record<string, 'free' | 'pro' | 'enterprise'> = {
  cv_generation:        'free',
  cv_download_pdf:      'free',
  cv_history:           'free',
  github_sync:          'free',
  linkedin_import:      'free',
  cover_letter:         'free',
  job_tracker:          'free',
  ats_score:            'free',
  gmail_connect:        'free',
  email_scan:           'free',
  email_classify:       'free',
  email_drafts:         'pro',
  analytics_basic:      'free',
  analytics_salary:     'pro',
  analytics_skill_gap:  'pro',
  analytics_patterns:   'pro',
  outlook_connect:      'free',
}
```

---

## Notes

* Disabled features should show a "Coming Soon" badge in the UI, not a broken page
* Never remove a feature key from this file — mark it DEPRECATED instead
* When a feature moves from disabled to enabled, git commit message must be:

  `feat: enable [feature_key] — Phase X`
