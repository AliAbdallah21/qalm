export interface CoverLetter {
    id: string
    user_id: string
    cv_generation_id: string | null
    company: string
    role: string
    job_description: string | null
    content: string
    created_at: string
}

export interface CreateCoverLetterInput {
    cv_generation_id?: string
    company: string
    role: string
    job_description: string
    content: string
}
