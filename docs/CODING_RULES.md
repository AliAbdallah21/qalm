# Qalm — Coding Rules

---

# Golden Rules

* Never break existing features when adding new ones — if adding a feature requires editing an existing file extensively, the architecture is wrong.
* Never put business logic in page files — pages are thin, logic lives in `features/`.
* Never call external APIs directly from components — always go through `lib/`.
* Never hardcode strings that will change — use constants or environment variables.
* Never commit `.env.local` — it's in `.gitignore`, keep it there.

---

# Naming Conventions

## Files and Folders

| Item        | Convention     | Example                                      |
| ----------- | -------------- | -------------------------------------------- |
| Folders     | kebab-case     | `cv-generator`, `job-tracker`                |
| Components  | PascalCase.tsx | `ProfileCard.tsx`, `CVPreview.tsx`           |
| Hooks       | camelCase.ts   | `useProfile.ts`, `useUser.ts`                |
| Utilities   | camelCase.ts   | `formatDate.ts`, `buildPrompt.ts`            |
| API routes  | route.ts       | Always named `route.ts` (Next.js convention) |
| Types files | types.ts       | Always named `types.ts` per feature          |

---

## Variables and Functions

```ts
// Variables — camelCase
const userProfile = await getProfile(userId)
const cvGenerations = []

// Functions — camelCase, verb first
async function generateCV(userId: string, jobDescription: string) {}
async function syncGithubRepos(userId: string) {}
async function getProfile(userId: string) {}
async function updateExperience(id: string, data: Partial<Experience>) {}

// Constants — SCREAMING_SNAKE_CASE
const MAX_REPOS_TO_SYNC = 100
const DEFAULT_AI_MODEL = 'anthropic/claude-sonnet-4-5'
const CV_STORAGE_BUCKET = 'cvs'

// Types and Interfaces — PascalCase
interface UserProfile {}
type CVGenerationStatus = 'pending' | 'generating' | 'done' | 'failed'
```

---

# Database Conventions

```
tables       → snake_case plural   (cv_generations, job_applications)
columns      → snake_case          (user_id, created_at, is_current)
foreign keys → table_singular_id   (user_id, cv_generation_id)
```

---

# TypeScript Rules

## Always type function parameters and return values

```ts
// ✅ Good
async function getProfile(userId: string): Promise<UserProfile | null> {}

// ❌ Bad
async function getProfile(userId) {}
```

## Use types from the feature's types.ts file

```ts
// ✅ Good
import type { Experience } from '@/features/profile/types'

// ❌ Bad
const exp: { company: string; title: string } = {}
```

## Never use `any`

```ts
// ✅ Good
const data: CVGenerationResult = await generateCV(...)

// ❌ Bad
const data: any = await generateCV(...)
```

## Use `interface` for objects, `type` for unions

```ts
// Object shapes → interface
interface UserProfile {
  id: string
  full_name: string
  email: string
}

// Unions → type
type ApplicationStatus = 'applied' | 'interview' | 'rejected' | 'offer'
type ProfileWithExperiences = UserProfile & { experiences: Experience[] }
```

---

# Component Rules

## One component per file

```ts
// ProfileCard.tsx
export default function ProfileCard({ profile }: ProfileCardProps) {
  return (...)
}
```

## Props must have an interface defined above

```ts
interface ProfileCardProps {
  profile: UserProfile
  onEdit?: () => void
  className?: string
}

export default function ProfileCard({ profile, onEdit, className }: ProfileCardProps) {}
```

## No business logic in components

```ts
// ✅ Good
import { updateProfile } from '@/features/profile/actions'

export default function ProfileForm() {
  async function handleSubmit(data: ProfileFormData) {
    await updateProfile(data)
  }
}

// ❌ Bad
export default function ProfileForm() {
  async function handleSubmit(data: ProfileFormData) {
    await supabase.from('profiles').upsert(data)
  }
}
```

---

# API Route Rules

## Always validate auth first

```ts
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }
}
```

## Always return consistent response shapes

```ts
// ✅ Success
return Response.json({ data: result, message: 'Done' }, { status: 200 })

// ✅ Error
return Response.json({ error: 'Something went wrong', code: 'GENERATION_FAILED' }, { status: 500 })
```

## Wrap everything in try/catch

```ts
export async function POST(request: Request) {
  try {
    return Response.json({ data: result })
  } catch (error) {
    console.error('[/api/cv/generate]', error)
    return Response.json({ error: 'Generation failed', code: 'GENERATION_FAILED' }, { status: 500 })
  }
}
```

## IMPORTANT: Next.js 16 Async Params

`params` in dynamic routes is a Promise. Always await it:

```ts
// ✅ Good
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// ❌ Bad — will throw at runtime in Next.js 16
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
}
```

Never access `params.id` directly. Always destructure with `await`.

---

# AI Call Rules

* All AI calls go through `lib/ai/client.ts`.
* Never call OpenRouter directly from a feature.

```ts
// ✅ Good
import { callAI } from '@/lib/ai/client'
const result = await callAI({ prompt, model: 'fast' })

// ❌ Bad
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', ...)
```

## Model aliases only (never hardcoded model strings)

```ts
type ModelAlias = 'fast' | 'smart' | 'best'

// fast  → openai/gpt-4o-mini
// smart → anthropic/claude-sonnet-4-5
// best  → anthropic/claude-opus-4-5
```

## Prompts live in `docs/AI_PROMPTS.md`

```ts
// ✅ Good
import { CV_GENERATION_PROMPT } from '@/lib/ai/prompts'

// ❌ Bad
const prompt = `You are an expert CV writer...`
```

---

# Database Rules

## Use correct Supabase client

```ts
// API routes & server components
import { createServerClient } from '@/lib/supabase/server'

// Client components only
import { createBrowserClient } from '@/lib/supabase/client'
```

## Never select *

```ts
// ✅ Good
const { data } = await supabase
  .from('profiles')
  .select('id, full_name, email, headline')
  .eq('user_id', userId)
  .single()

// ❌ Bad
const { data } = await supabase.from('profiles').select('*')
```

## All DB queries live in feature `queries.ts`

```ts
export async function getProfileByUserId(userId: string): Promise<UserProfile | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, headline, summary, country, city')
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data
}
```
## IMPORTANT: Next.js 15 Async Cookies
createServerClient() is async in this project. Always await it:
```ts
// ✅ Good
const supabase = await createServerClient()

// ❌ Bad
const supabase = createServerClient()
```

Every API route and server component must await it or you will get cookie/session errors.
---

# Access Control Rules

* Every paid feature MUST check `canUserAccess()` first.
* Never hardcode access logic outside `lib/access/permissions.ts`.

```ts
import { canUserAccess } from '@/lib/access/permissions'

const hasAccess = await canUserAccess(user.id, 'cv_generation')

if (!hasAccess) {
  return Response.json({ error: 'Upgrade required', code: 'UPGRADE_REQUIRED' }, { status: 403 })
}
```

---
# CV Style Rules
The file docs/CV_STYLE_REFERENCE.tex is the reference CV style.
When building any PDF template or CV rendering component:
- Always open and read CV_STYLE_REFERENCE.tex first
- Match the section order, typography, and layout exactly
- Black and white only, no colors except blue hyperlinks
- Maximum 2 pages, A4 size
- Never deviate from this style without explicit instruction
---

# Feature Flag Rules

* Check `FEATURE_FLAGS.md` before building anything.
* Commented Phase 2/3/4 code is allowed with clear TODO.

```ts
// TODO: Phase 2 — enable cover letter generation
// const coverLetter = await generateCoverLetter(userId, jobDescription)
```

---

# Git Rules

```
feat: add github sync endpoint
fix: correct ats score calculation
chore: update dependencies
docs: update API_CONTRACTS.md
refactor: extract cv builder logic to feature folder
```

* One commit per logical change.
* Never commit broken code to `main`.
* Use feature branches:

```
feat/github-sync
feat/cv-generator
fix/auth-callback
```

---

# What the AI Assistant Must Always Do

* When starting a new session, read all files in `/docs` before writing code.
* When adding a new feature, check `PHASE_TRACKER.md` first.
* When writing a DB query, check `DATABASE_SCHEMA.md` for exact column names.
* When writing an API route, check `API_CONTRACTS.md` for expected response shape.
* When writing an AI prompt, add it to `AI_PROMPTS.md` and import it — never inline it.
