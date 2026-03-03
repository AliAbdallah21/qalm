# Qalm

> **One profile. Infinite tailored applications.**

Qalm (قلم — Arabic for "pen") is an AI-powered career assistant designed for tech professionals and AI/ML engineers. It solves the fragmentation of the job search by learning about a user once and automatically generating perfectly tailored CVs and cover letters in seconds. By maintaining a deep professional profile, Qalm ensures every application is ATS-optimized and highlights the most relevant skills for every specific role.

## ✨ Features (Phase 2)

- **AI-Powered CV Generation**: Perfectly tailored to any job description in seconds.
- **LaTeX PDF Export**: High-standard professional CV matching the provided style reference.
- **ATS Score & Visual Breakdown**: See exactly which keywords you matched and what's missing.
- **Cover Letter Generation**: Dynamic, story-driven letters targeted at specific roles and companies.
- **GitHub Sync**: Automatically pull repositories and summarize them with AI for your profile.
- **LinkedIn ZIP Import**: Populate your entire professional history from a LinkedIn export in one click.
- **Job Application Tracker**: Centralized management for all your applications, interview statuses, and notes.
- **Profile Completeness System**: Intelligent suggestions to help you build the strongest possible profile.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **AI Integration**: [OpenRouter](https://openrouter.ai/) (GPT-4o, Claude 3.5 Sonnet)
- **PDF Generation**: [MiKTeX](https://miktex.org/) (LaTeX)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/AliAbdallah21/qalm.git
cd qalm
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory and add the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=             # Your Supabase Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # Your Supabase Anon Key
SUPABASE_SERVICE_ROLE_KEY=            # Your Supabase Service Role Key
NEXT_PUBLIC_GITHUB_CLIENT_ID=         # GitHub OAuth App Client ID
GITHUB_CLIENT_SECRET=                 # GitHub OAuth App Client Secret
OPENROUTER_API_KEY=                   # Your OpenRouter API Key
```

### 4. Database Setup
Run the SQL migrations found in the `supabase/migrations/` folder on your Supabase SQL Editor to set up the required tables and RLS policies.

### 5. Run the dev server
```bash
npm run dev
```

## 🗺 Roadmap

- **Phase 3: Email Intelligence**
  - Gmail OAuth integration
  - Auto-scanning inbox for job-related updates (rejections, invites, offers)
  - AI-driven response drafting
- **Phase 4: Analytics & Intelligence**
  - Application response and success rate analytics
  - Skill gap analysis vs. target roles
  - Stripe integration for Pro features

## 📄 License

This project is licensed under the MIT License.
