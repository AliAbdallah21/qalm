export interface Profile {
    id: string
    user_id: string
    full_name: string | null
    email: string | null
    phone: string | null
    country: string | null
    city: string | null
    age: number | null
    headline: string | null
    summary: string | null
    linkedin_url: string | null
    github_username: string | null
    avatar_url: string | null
    created_at: string
    updated_at: string
}

export interface Experience {
    id: string
    user_id: string
    company: string
    title: string
    location: string | null
    start_date: string
    end_date: string | null
    is_current: boolean
    description: string | null
    created_at: string
}

export interface Education {
    id: string
    user_id: string
    institution: string
    degree: string
    field: string | null
    start_date: string | null
    end_date: string | null
    grade: string | null
    description: string | null
    created_at: string
}

export interface Skill {
    id: string
    user_id: string
    name: string
    level: string | null
    years_experience: number | null
    category: string | null
    created_at: string
}

export interface Certificate {
    id: string
    user_id: string
    title: string
    issuer: string
    issue_date: string | null
    expiry_date: string | null
    credential_url: string | null
    description: string | null
    created_at: string
}

export interface Language {
    id: string
    user_id: string
    name: string
    proficiency: string
    created_at: string
}

export interface FullProfileData {
    profile: Profile | null
    experiences: Experience[]
    education: Education[]
    skills: Skill[]
    certificates: Certificate[]
    languages: Language[]
    completeness_score: number
}
