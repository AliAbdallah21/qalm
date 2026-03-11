export interface CVHeader {
    name: string
    title: string
    email: string
    phone: string
    location: string
    linkedin: string
    github: string
}

export interface CVExperience {
    company: string
    title: string
    location: string
    start_date: string
    end_date: string
    bullets: string[]
}

export interface CVEducation {
    institution: string
    degree: string
    field: string
    dates: string
    grade: string
}

export interface CVSkillCategory {
    name: string
    skills: string[]
}

export interface CVProject {
    name: string
    description: string
    tech_stack: string[]
    url: string
}

export interface CVCertificate {
    title: string
    issuer: string
    date: string
    url: string
}

export interface StructuredCV {
    header: CVHeader
    experience: CVExperience[]
    education: CVEducation[]
    skills: {
        categories: CVSkillCategory[]
    }
    projects: CVProject[]
    certificates: CVCertificate[]
    ats_score: number
    heroProjects?: CVProject[]
    forcedProjects?: Array<{ project: CVProject, customDescription?: string }>
    heroCertifications?: CVCertificate[]
}

export interface ATSBreakdown {
    score: number
    matched_keywords: string[]
    missing_keywords: string[]
    matched_phrases: string[]
    missing_phrases: string[]
    improvement_tips: string[]
}


export interface CVGeneration {
    id: string
    user_id: string
    job_title: string | null
    company_name: string | null
    job_description: string
    generated_cv: StructuredCV
    pdf_url: string | null
    latex_source?: string
    pdf_status?: 'pending' | 'compiling' | 'ready' | 'failed'
    pdf_error?: string
    ats_score: number | null
    ats_breakdown: ATSBreakdown | null
    template_id?: string | null
    category?: string
    model_used: string | null
    created_at: string
}
