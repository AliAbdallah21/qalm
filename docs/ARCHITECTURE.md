# Qalm — Architecture

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend + Backend | Next.js 14 (App Router) | One repo, one deploy |
| Language | TypeScript | Type safety, better AI assistance |
| Database | Supabase (PostgreSQL) | Auth + DB + Storage in one |
| Auth | Supabase Auth | GitHub OAuth, email/password |
| File Storage | Supabase Storage | PDFs, LinkedIn exports, avatars |
| AI | OpenRouter | Single integration, swap models freely |
| Deployment | Vercel | Push to GitHub = live instantly |
| Email Sending | Resend (Phase 2+) | Transactional emails |
| Styling | Tailwind CSS | Utility-first, fast |

---

## Folder Structure

```
qalm/
├── docs/                         ← AI context files (this folder)
├── src/
│   ├── app/                      ← Next.js App Router (file = route)
│   │   ├── (auth)/               ← Public: login, signup, callback
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts  ← Supabase OAuth callback handler
│   │   ├── (dashboard)/          ← Protected: requires auth
│   │   │   ├── layout.tsx        ← Auth guard lives here
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx      ← Home after login
│   │   │   ├── profile/
│   │   │   │   └── page.tsx      ← User profile setup
│   │   │   ├── github/
│   │   │   │   └── page.tsx      ← GitHub repos view
│   │   │   ├── cv-builder/
│   │   │   │   └── page.tsx      ← Paste JD → generate CV
│   │   │   ├── jobs/             ← Phase 2
│   │   │   │   └── page.tsx
│   │   │   ├── emails/           ← Phase 3
│   │   │   │   └── page.tsx
│   │   │   └── analytics/        ← Phase 4
│   │   │       └── page.tsx
│   │   ├── api/                  ← API routes (backend)
│   │   │   ├── github/
│   │   │   │   └── sync/
│   │   │   │       └── route.ts  ← Pull repos from GitHub API
│   │   │   ├── cv/
│   │   │   │   └── generate/
│   │   │   │       └── route.ts  ← AI CV generation endpoint
│   │   │   ├── profile/
│   │   │   │   └── route.ts      ← CRUD profile data
│   │   │   ├── jobs/             ← Phase 2
│   │   │   └── emails/           ← Phase 3
│   │   ├── layout.tsx            ← Root layout
│   │   └── page.tsx              ← Landing page
│   │
│   ├── features/                 ← Business logic, one folder per feature
│   │   ├── profile/
│   │   │   ├── actions.ts        ← Server actions for profile CRUD
│   │   │   ├── queries.ts        ← DB queries for profile
│   │   │   └── types.ts          ← TypeScript types for profile
│   │   ├── cv-generator/
│   │   │   ├── actions.ts
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   ├── github/
│   │   │   ├── actions.ts
│   │   │   ├── queries.ts
│   │   │   └── types.ts
│   │   ├── job-tracker/          ← Phase 2
│   │   ├── email-intel/          ← Phase 3
│   │   └── analytics/            ← Phase 4
│   │
│   ├── lib/                      ← Shared utilities and integrations
│   │   ├── ai/
│   │   │   └── client.ts         ← All OpenRouter calls go through here
│   │   ├── github/
│   │   │   └── client.ts         ← GitHub API wrapper
│   │   ├── email-providers/
│   │   │   ├── interface.ts      ← EmailProvider interface (contract)
│   │   │   ├── gmail.ts          ← Phase 3 implementation
│   │   │   └── outlook.ts        ← Phase 4 (same interface, plug in)
│   │   ├── storage/
│   │   │   └── index.ts          ← All Supabase Storage operations
│   │   ├── access/
│   │   │   └── permissions.ts    ← canUserAccess() — monetization hook
│   │   └── supabase/
│   │       ├── client.ts         ← Browser Supabase client
│   │       └── server.ts         ← Server Supabase client
│   │
│   ├── components/               ← Shared UI components
│   │   ├── ui/                   ← Base components (Button, Input, Card...)
│   │   ├── layout/               ← Sidebar, Header, Nav
│   │   └── shared/               ← Reusable business components
│   │
│   └── hooks/                    ← Shared React hooks
│       ├── useProfile.ts
│       └── useUser.ts
│
├── supabase/
│   └── migrations/               ← SQL migration files (schema as code)
│       └── 001_initial_schema.sql
│
├── public/                       ← Static assets
├── .env.local                    ← Local secrets (never commit)
├── .env.example                  ← Placeholder file (commit this)
└── docs/                         ← This folder
```

---

## Request Flow

### CV Generation (core feature)
```
User pastes job description
  → POST /api/cv/generate
  → Server fetches full user profile from Supabase
  → Server fetches user's GitHub repos from DB
  → Builds rich context string
  → Sends to OpenRouter (claude-sonnet or gpt-4o)
  → AI returns structured CV JSON
  → Server converts to PDF
  → PDF uploaded to Supabase Storage
  → URL returned to client
  → User downloads PDF
```

### GitHub Sync
```
User clicks "Sync GitHub"
  → POST /api/github/sync
  → Server uses user's stored GitHub OAuth token
  → Fetches all repos from GitHub API
  → For each repo: fetches languages, README, topics
  → Sends README to AI for summarization
  → Stores all data in github_repos table
  → Returns updated repos to client
```

### Authentication Flow
```
User clicks "Sign in with GitHub"
  → Supabase Auth redirects to GitHub
  → GitHub redirects back to /auth/callback
  → Supabase creates/updates user
  → Redirect to /dashboard
```

---

## Key Architectural Decisions

### Why one repo (monorepo)?
Solo developer. Simpler to manage. When scaling, extract `/api` routes into a
separate service — the interface stays identical.

### Why App Router (not Pages Router)?
Server Components reduce client bundle size. Server Actions simplify data mutations.
Better suited for a data-heavy app like Qalm.

### Why Supabase over raw Postgres?
Auth, storage, and DB in one platform. Free tier is generous. Row Level Security (RLS)
means the DB enforces access control even if API has a bug.

### Why OpenRouter over direct OpenAI/Anthropic?
One API key. Switch from GPT-4o to Claude to Gemini without code changes.
Use cheap models for simple tasks, strong models for CV generation.

### Why features/ folder separate from app/?
`app/` is routing only. Business logic lives in `features/`. This means pages stay
thin and logic is testable and reusable. A feature can be deleted by deleting one folder.