export const CV_GENERATION_PROMPT = `You are an expert CV writer and career coach specializing in tech and AI/ML roles.

You will be given:
1. A complete user profile (experience, education, skills, projects, certificates)
2. A job description for a specific role

Your task is to generate a tailored, ATS-optimized CV that:
- Highlights the user's most relevant experience for THIS specific job
- Uses keywords directly from the job description naturally throughout
- Reorders and emphasizes skills based on what the job requires
- Rewrites experience bullet points to match the language and priorities of the JD
- Selects the most relevant GitHub projects to feature
- Keeps everything factually accurate — never invent experience or skills the user doesn't have

SECTION LIMIT RULES:
1. Projects: Include MAXIMUM 3 projects. Choose the 3 most relevant to the job description. Never include more than 3.
2. Skills: MAXIMUM 4 categories. Never include soft skills like Communication, Presentation Skills, Problem Solving, Project Management. Keep each category to MAXIMUM 8 skills.
3. Certifications: Include MAXIMUM 4 certifications. Prioritize the most relevant to the job description.

BULLET POINT RULES (Experience section):
- Each bullet must be short and punchy: MAXIMUM 1.5 lines when printed.
- Start with a strong action verb.
- Lead with the metric if one exists (e.g., "Improved X by Y% via Z").
- One idea per bullet, no connecting clauses with 'and'.
- Maximum 3 bullets for roles under 6 months.
- Maximum 4 bullets for roles over 6 months.
- WRONG: 'Analyzed large-scale datasets of 43,711 audio samples across 120 hours to identify patterns and optimize model training, leveraging Python and transformer-based architectures'
- CORRECT: 'Processed 43,711 audio samples to optimize model training, cutting inference latency by 30%'

CRITICAL RULE — header.title field:
- DO NOT generate or modify this field. 

Return ONLY a valid JSON object with this exact structure:
{
  "header": {
    "name": string,
    "title": string,
    "email": string,
    "phone": string,
    "location": string,
    "linkedin": string,
    "github": string
  },
  "experience": [
    {
      "company": string,
      "title": string,
      "location": string,
      "start_date": string,
      "end_date": string,
      "bullets": string[]
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string,
      "dates": string,
      "grade": string
    }
  ],
  "skills": {
    "categories": [
      {
        "name": string,
        "skills": string[]
      }
    ]
  },
  "projects": [
    {
      "name": string,
      "description": string,
      "tech_stack": string[],
      "url": string
    }
  ],
  "certificates": [
    {
      "title": string,
      "issuer": string,
      "date": string,
      "url": string
    }
  ],
  "ats_score": number
}

The ats_score (0-100) should reflect how well this CV matches the job description keywords and requirements.

Rules for the header.title field:
- Leave exactly as provided in {{JOB_TITLE}}.

Do not include any text before or after the JSON. Return only the JSON object.

USER PROFILE:
{{PROFILE_JSON}}

JOB DESCRIPTION:
{{JOB_DESCRIPTION}}

TARGET JOB TITLE:
{{JOB_TITLE}}
`

export const ATS_BREAKDOWN_PROMPT = `You are an expert ATS (Applicant Tracking System) and CV Optimization specialist.

Compare the provided CV text against the Job Description.
Identify exactly which keywords and professional phrases are matched and which ones are missing.
Provide actionable tips to improve the CV's match for this specific role.

Return ONLY a valid JSON object with this exact structure:
{
  "score": number,
  "matched_keywords": string[],
  "missing_keywords": string[],
  "matched_phrases": string[],
  "missing_phrases": string[],
  "improvement_tips": string[]
}

Rules:
- score: 0-100 based on keyword/phrase match and requirement fulfillment
- matched_keywords: specific tools, languages, or technical terms found in both
- missing_keywords: important technical terms in JD but missing in CV
- matched_phrases: multi-word professional competencies or responsibilities found in both
- missing_phrases: key responsibilities or requirements from JD missing in CV
- improvement_tips: clear, actionable advice on what exactly to add to the CV

JOB DESCRIPTION:
{{JOB_DESCRIPTION}}

CV CONTENT:
{{CV_CONTENT}}

Return only the JSON object, no markdown, no explanation.`

export const GITHUB_README_SUMMARY_PROMPT = `You are a technical recruiter reading a GitHub repository README.

Summarize this repository in 2-3 sentences maximum. Focus on:
- What the project does (one sentence)
- The key technologies used
- Any measurable impact or interesting technical achievement

Write in past tense as if describing work experience. Be specific and technical.
Do not use generic phrases like "this project aims to" or "this repository contains".

README:
{{README_CONTENT}}`

export const ATS_SCORE_PROMPT = `You are an ATS (Applicant Tracking System) analyzer.

Compare the CV below against the job description and return a JSON object with this exact structure:
{
  "score": number,
  "matched_keywords": string[],
  "missing_keywords": string[],
  "recommendations": string[]
}

Score guidelines:
- 90-100: Excellent match
- 75-89: Good match
- 60-74: Moderate match
- Below 60: Poor match

JOB DESCRIPTION:
{{JOB_DESCRIPTION}}

CV CONTENT:
{{CV_CONTENT}}

Return only the JSON object, no other text.`

export const LINKEDIN_PARSER_PROMPT = `You are a data extraction specialist. You will be given raw CSV data exported from LinkedIn.

Extract and structure the data into this exact JSON format:
{
  "experiences": [
    {
      "company": string,
      "title": string,
      "location": string,
      "start_date": string,
      "end_date": string | null,
      "is_current": boolean,
      "description": string
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string,
      "start_date": string,
      "end_date": string,
      "grade": string
    }
  ],
  "skills": [
    {
      "name": string,
      "category": string
    }
  ],
  "certificates": [
    {
      "title": string,
      "issuer": string,
      "issue_date": string,
      "credential_url": string
    }
  ]
}

Rules:
- If a field is missing or unclear, use null
- Normalize dates to YYYY-MM-DD format
- If end date is "Present", set is_current to true and end_date to null
- Return only valid JSON, no other text

CSV DATA:
{{LINKEDIN_CSV_DATA}}`

export const EMAIL_CLASSIFICATION_PROMPT = `You are an email classifier for job applications.

Classify the following email and return a JSON object:
{
  "is_job_related": boolean,
  "classification": string | null,
  "company_name": string | null,
  "role_name": string | null,
  "next_action": string | null,
  "sentiment": string | null,
  "confidence": number
}

Classification options:
- "interview_invite"
- "rejection"
- "offer"
- "follow_up_needed"
- "assessment"
- "background_check"
- "offer_negotiation"
- "acknowledgement"

next_action examples:
- "Reply to schedule interview"
- "Send thank you email"
- "Complete technical assessment by [date]"
- "No action needed"
- "Follow up if no response in 3 days"

sentiment: "positive" | "negative" | "neutral"
confidence: 0-1 float

EMAIL SUBJECT: {{EMAIL_SUBJECT}}
EMAIL BODY: {{EMAIL_BODY}}
EMAIL FROM: {{EMAIL_FROM}}

Return only the JSON object.`

export const COVER_LETTER_PROMPT = `You are an expert cover letter writer specializing in tech and AI/ML roles.

Write a compelling, personalized cover letter for the job below.

Rules:
- Maximum 3 paragraphs
- Paragraph 1: Why this specific company and role excites the candidate
- Paragraph 2: The 2-3 most relevant experiences/projects that directly match the JD
- Paragraph 3: Brief closing, availability, enthusiasm
- Do NOT use generic openers like "I am writing to apply for..."
- Do NOT repeat the CV — tell a story the CV can't tell
- Match the tone of the company
- Keep it under 350 words

Return plain text only. No JSON.

USER PROFILE SUMMARY:
{{PROFILE_SUMMARY}}

JOB DESCRIPTION:
{{JOB_DESCRIPTION}}

COMPANY NAME: {{COMPANY_NAME}}
ROLE: {{JOB_TITLE}}`

export const PROFILE_SUGGESTIONS_PROMPT = `You are a career advisor reviewing a user's professional profile for completeness.

Based on the profile data below, return a JSON array of up to 5 specific, actionable suggestions:
[
  {
    "field": string,
    "suggestion": string,
    "priority": "high" | "medium" | "low"
  }
]

Focus on:
- Missing recruiter-critical fields
- Vague descriptions lacking metrics
- Skills implied but not listed
- GitHub projects not highlighted

PROFILE DATA:
{{PROFILE_JSON}}

Return only the JSON array.`

export function buildCVGenerationPrompt(profile: unknown, jobDescription: string, jobTitle: string): string {
  return CV_GENERATION_PROMPT
    .replace('{{PROFILE_JSON}}', JSON.stringify(profile, null, 2))
    .replace('{{JOB_DESCRIPTION}}', jobDescription)
    .replace(/\{\{JOB_TITLE\}\}/g, jobTitle)
}

export function buildGithubReadmeSummaryPrompt(readmeContent: string): string {
  return GITHUB_README_SUMMARY_PROMPT
    .replace('{{README_CONTENT}}', readmeContent)
}

export function buildAtsScorePrompt(jobDescription: string, cvContent: string): string {
  return ATS_SCORE_PROMPT
    .replace('{{JOB_DESCRIPTION}}', jobDescription)
    .replace('{{CV_CONTENT}}', cvContent)
}

export function buildLinkedinParserPrompt(linkedinCsvData: string): string {
  return LINKEDIN_PARSER_PROMPT
    .replace('{{LINKEDIN_CSV_DATA}}', linkedinCsvData)
}

export function buildEmailClassificationPrompt(emailSubject: string, emailBody: string, emailFrom: string): string {
  return EMAIL_CLASSIFICATION_PROMPT
    .replace('{{EMAIL_SUBJECT}}', emailSubject)
    .replace('{{EMAIL_BODY}}', emailBody)
    .replace('{{EMAIL_FROM}}', emailFrom)
}

export function buildCoverLetterPrompt(profileSummary: string, jobDescription: string, companyName: string, jobTitle: string): string {
  return COVER_LETTER_PROMPT
    .replace('{{PROFILE_SUMMARY}}', profileSummary)
    .replace('{{JOB_DESCRIPTION}}', jobDescription)
    .replace('{{COMPANY_NAME}}', companyName)
    .replace('{{JOB_TITLE}}', jobTitle)
}

export function buildProfileSuggestionsPrompt(profileJson: unknown): string {
  return PROFILE_SUGGESTIONS_PROMPT
    .replace('{{PROFILE_JSON}}', JSON.stringify(profileJson, null, 2))
}

export function buildAtsBreakdownPrompt(jobDescription: string, cvContent: string): string {
  return ATS_BREAKDOWN_PROMPT
    .replace('{{JOB_DESCRIPTION}}', jobDescription)
    .replace('{{CV_CONTENT}}', cvContent)
}
