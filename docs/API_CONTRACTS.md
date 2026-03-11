# Qalm — API Contracts

## Conventions

* All routes live under `/api/`
* All requests and responses are JSON
* All protected routes require a valid Supabase session cookie
* Error responses always return:

  ```json
  { "error": "string", "code"?: "string" }
  ```
* Success responses always return:

  ```json
  { "data": "T", "message"?: "string" }
  ```
* HTTP methods:

  * `GET` = read
  * `POST` = create
  * `PUT` = full update
  * `PATCH` = partial update
  * `DELETE` = remove

---

# Authentication

Handled entirely by Supabase Auth. No custom auth endpoints needed.

```
GET /auth/callback
```

Supabase handles login, signup, token refresh, and session management automatically.

The only custom file needed is:

```
/app/auth/callback/route.ts
```

This exchanges the OAuth code for a session.

---

# Profile

## GET /api/profile

Returns the full profile of the authenticated user including all related data.

### Response

```json
{
  "data": {
    "profile": {
      "id": "uuid",
      "full_name": "Ali Abdallah",
      "email": "aliabdalla2110@gmail.com",
      "phone": "+201015929862",
      "country": "Egypt",
      "city": "Cairo",
      "age": 21,
      "headline": "AI/ML Engineer | Python | LangChain | RAG",
      "summary": "Computer Science undergraduate...",
      "linkedin_url": "https://linkedin.com/in/...",
      "github_username": "AliAbdallah21",
      "avatar_url": "https://..."
    },
    "experiences": [],
    "education": [],
    "skills": [],
    "certificates": [],
    "completeness_score": 78
  }
}
```

## POST /api/profile

Creates or updates the user's profile (upsert).

### Request Body

```json
{
  "full_name": "Ali Abdallah",
  "phone": "+201015929862",
  "country": "Egypt",
  "city": "Cairo",
  "age": 21,
  "headline": "AI/ML Engineer",
  "summary": "...",
  "linkedin_url": "...",
  "github_username": "AliAbdallah21"
}
```

### Response

```json
{
  "data": {},
  "message": "Profile updated successfully"
}
```

---

# Experiences

```
GET    /api/profile/experiences
POST   /api/profile/experiences
PATCH  /api/profile/experiences/[id]
DELETE /api/profile/experiences/[id]
```

### POST Request Body

```json
{
  "company": "Ollimi AI",
  "title": "AI/ML Engineering Intern",
  "location": "Cairo, Egypt",
  "start_date": "2025-06-01",
  "end_date": null,
  "is_current": true,
  "description": "Contributed to TTS model training..."
}
```

---

# Education

```
GET    /api/profile/education
POST   /api/profile/education
PATCH  /api/profile/education/[id]
DELETE /api/profile/education/[id]
```

### POST Request Body

```json
{
  "institution": "Misr International University",
  "degree": "BSc Computer Science",
  "field": "AI/ML Specialization",
  "start_date": "2022-09-01",
  "end_date": "2026-06-01",
  "grade": "3.8 GPA",
  "description": "Specializing in AI/ML..."
}
```

---

# Skills

```
GET    /api/profile/skills
POST   /api/profile/skills
DELETE /api/profile/skills/[id]
```

### POST Request Body

```json
{
  "name": "LangChain",
  "level": "expert",
  "years_experience": 2,
  "category": "AI/ML"
}
```

---

# Certificates

```
GET    /api/profile/certificates
POST   /api/profile/certificates
DELETE /api/profile/certificates/[id]
```

### POST Request Body

```json
{
  "title": "Advanced LangChain & RAG",
  "issuer": "Coursera",
  "issue_date": "2024-11-01",
  "expiry_date": null,
  "credential_url": "https://coursera.org/...",
  "description": "..."
}
```

---

# GitHub

## POST /api/github/sync

Triggers full GitHub sync.

### Response

```json
{
  "data": {
    "synced_count": 29,
    "repos": [
      {
        "repo_name": "qalm",
        "description": "AI-powered career assistant",
        "languages": { "TypeScript": 45000, "CSS": 2000 },
        "topics": ["nextjs", "ai", "career"],
        "stars": 0,
        "readme_summary": "Qalm is an AI career assistant that...",
        "is_featured": false
      }
    ],
    "last_synced_at": "2026-03-02T17:00:00Z"
  },
  "message": "Synced 29 repositories"
}
```

```
GET    /api/github/repos
PATCH  /api/github/repos/[id]/feature
```

### PATCH Request Body

```json
{ "is_featured": true }
```

---

# CV Generation

## POST /api/cv/generate

Generates a tailored CV.

### Request Body

```json
{
  "job_description": "We are looking for a Senior AI Engineer...",
  "job_title": "Senior AI Engineer",
  "company_name": "OpenAI",
  "template_id": "experienced" // matches a key in the TEMPLATES registry defaults to 'experienced'
}
```

### Response

```json
{
  "data": {
    "cv_id": "uuid",
    "ats_score": 87,
    "pdf_url": "https://.../uuid.pdf",
    "generated_cv": {
      "header": {
        "name": "Ali Abdallah",
        "email": "aliabdalla2110@gmail.com",
        "phone": "+201015929862",
        "linkedin": "...",
        "github": "..."
      },
      "summary": "Tailored summary...",
      "experience": [],
      "education": [],
      "skills": [],
      "projects": [],
      "certificates": []
    }
  }
}
```

```
GET /api/cv/history
GET /api/cv/[id]
```

---

# Job Applications (Phase 2)

```
GET    /api/jobs
POST   /api/jobs
PATCH  /api/jobs/[id]
DELETE /api/jobs/[id]
```

### POST Request Body

```json
{
  "company": "OpenAI",
  "role": "Senior AI Engineer",
  "job_url": "https://openai.com/careers/...",
  "cv_generation_id": "uuid",
  "status": "applied",
  "applied_date": "2026-03-02",
  "expected_salary": "$180,000",
  "notes": "Referred by John"
}
```

---

# Email Intelligence (Phase 3)

```
POST /api/emails/connect/gmail
POST /api/emails/sync
GET  /api/emails/threads
```

### Sync Response

```json
{
  "data": {
    "scanned": 150,
    "job_related_found": 12,
    "updated_applications": 5
  }
}
```

---

# Access Control

```
GET /api/access/[feature]
```

### Response

```json
{
  "data": {
    "feature": "cv_generation",
    "has_access": true,
    "tier_required": "free"
  }
}
```

---

# Error Codes

| Code                 | Meaning                             |
| -------------------- | ----------------------------------- |
| UNAUTHORIZED         | No valid session                    |
| PROFILE_INCOMPLETE   | Profile missing required fields     |
| GITHUB_NOT_CONNECTED | GitHub OAuth not connected          |
| GENERATION_FAILED    | AI call failed or invalid response  |
| STORAGE_FAILED       | PDF upload failed                   |
| RATE_LIMITED         | Too many requests                   |
| NOT_FOUND            | Resource doesn't exist or not owned |
