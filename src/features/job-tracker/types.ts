export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected'

export interface JobApplication {
    id: string
    user_id: string
    cv_generation_id: string | null
    company: string
    role: string
    job_url: string | null
    status: ApplicationStatus
    applied_date: string
    expected_salary: string | null
    notes: string | null
    category: string | null
    created_at: string
    updated_at: string
    // Joined from cv_generations
    ats_score?: number | null
    pdf_url?: string | null
}

export interface CreateJobApplicationInput {
    company: string
    role: string
    job_url?: string | null
    cv_generation_id?: string | null
    status?: ApplicationStatus
    applied_date?: string
    expected_salary?: string | null
    notes?: string | null
    category?: string | null
}

export interface UpdateJobApplicationInput {
    company?: string
    role?: string
    job_url?: string | null
    status?: ApplicationStatus
    applied_date?: string
    expected_salary?: string | null
    notes?: string | null
}
