import { createServerClient } from '@/lib/supabase/server'
import type { JobApplication, CreateJobApplicationInput, UpdateJobApplicationInput, ApplicationStatus } from './types'

export async function getApplicationsByUserId(userId: string): Promise<JobApplication[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('job_applications')
        .select(`
            id,
            user_id,
            cv_generation_id,
            company,
            role,
            job_url,
            status,
            applied_date,
            expected_salary,
            notes,
            category,
            created_at,
            updated_at,
            cv_generations (
                ats_score,
                pdf_url
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map((row) => {
        const cv = Array.isArray(row.cv_generations) ? row.cv_generations[0] : row.cv_generations
        return {
            id: row.id,
            user_id: row.user_id,
            cv_generation_id: row.cv_generation_id,
            company: row.company,
            role: row.role,
            job_url: row.job_url,
            status: row.status as ApplicationStatus,
            applied_date: row.applied_date,
            expected_salary: row.expected_salary,
            notes: row.notes,
            category: row.category,
            created_at: row.created_at,
            updated_at: row.updated_at,
            ats_score: cv?.ats_score ?? null,
            pdf_url: cv?.pdf_url ?? null,
        }
    })
}

export async function getApplicationById(userId: string, id: string): Promise<JobApplication | null> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('job_applications')
        .select(`
            id,
            user_id,
            cv_generation_id,
            company,
            role,
            job_url,
            status,
            applied_date,
            expected_salary,
            notes,
            category,
            created_at,
            updated_at,
            cv_generations (
                ats_score,
                pdf_url
            )
        `)
        .eq('user_id', userId)
        .eq('id', id)
        .single()

    if (error || !data) return null

    const cv = Array.isArray(data.cv_generations) ? data.cv_generations[0] : data.cv_generations
    return {
        id: data.id,
        user_id: data.user_id,
        cv_generation_id: data.cv_generation_id,
        company: data.company,
        role: data.role,
        job_url: data.job_url,
        status: data.status as ApplicationStatus,
        applied_date: data.applied_date,
        expected_salary: data.expected_salary,
        notes: data.notes,
        category: data.category,
        created_at: data.created_at,
        updated_at: data.updated_at,
        ats_score: cv?.ats_score ?? null,
        pdf_url: cv?.pdf_url ?? null,
    }
}

export async function createApplication(userId: string, input: CreateJobApplicationInput): Promise<JobApplication> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('job_applications')
        .insert({
            user_id: userId,
            company: input.company,
            role: input.role,
            job_url: input.job_url ?? null,
            cv_generation_id: input.cv_generation_id ?? null,
            status: input.status ?? 'applied',
            applied_date: input.applied_date ?? new Date().toISOString().split('T')[0],
            expected_salary: input.expected_salary ?? null,
            notes: input.notes ?? null,
            category: input.category ?? 'Other',
        })
        .select('id, user_id, cv_generation_id, company, role, job_url, status, applied_date, expected_salary, notes, category, created_at, updated_at')
        .single()

    if (error || !data) throw new Error(error?.message ?? 'Failed to create application')

    return {
        ...data,
        status: data.status as ApplicationStatus,
        ats_score: null,
        pdf_url: null,
    }
}

export async function updateApplication(userId: string, id: string, input: UpdateJobApplicationInput): Promise<JobApplication> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('job_applications')
        .update({
            ...input,
            updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('id', id)
        .select('id, user_id, cv_generation_id, company, role, job_url, status, applied_date, expected_salary, notes, category, created_at, updated_at')
        .single()

    if (error || !data) throw new Error(error?.message ?? 'Failed to update application')

    return {
        ...data,
        status: data.status as ApplicationStatus,
        ats_score: null,
        pdf_url: null,
    }
}

export async function deleteApplication(userId: string, id: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('user_id', userId)
        .eq('id', id)

    if (error) throw new Error(error.message)
}

export async function getApplicationStats(userId: string): Promise<{
    total: number
    interview: number
    offer: number
    rejected: number
}> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('job_applications')
        .select('status')
        .eq('user_id', userId)

    if (error || !data) return { total: 0, interview: 0, offer: 0, rejected: 0 }

    return {
        total: data.length,
        interview: data.filter(r => r.status === 'interview').length,
        offer: data.filter(r => r.status === 'offer').length,
        rejected: data.filter(r => r.status === 'rejected').length,
    }
}

export async function captureMLSnapshots(userId: string, application: JobApplication): Promise<void> {
    try {
        await captureSkillSnapshot(userId, application.id)
        
        if (application.cv_generation_id) {
            await captureCvMatchSnapshot(userId, application.id, application.cv_generation_id, application.company)
        }
    } catch (error) {
        console.error('[ML] captureMLSnapshots failed:', error)
    }
}

async function captureSkillSnapshot(userId: string, appId: string): Promise<void> {
    const supabase = await createServerClient()
    
    // 1. Fetch skills
    const { data: skills } = await supabase
        .from('skills')
        .select('id, name, level, category, years_experience')
        .eq('user_id', userId)

    if (!skills) return

    // 2. Fetch experiences
    const { data: experiences } = await supabase
        .from('experiences')
        .select('start_date, end_date')
        .eq('user_id', userId)

    // 3. Logic
    const aiMlRegex = /\b(python|tensorflow|pytorch|machine learning|deep learning|nlp|llm|ai|ml|data science|scikit|keras|huggingface)\b/i
    const backendRegex = /\b(node|express|django|fastapi|rails|spring|laravel|postgresql|mysql|mongodb|redis|api|rest|graphql)\b/i
    const frontendRegex = /\b(react|vue|angular|nextjs|typescript|javascript|html|css|tailwind|svelte)\b/i
    const devopsRegex = /\b(docker|kubernetes|aws|gcp|azure|ci\/cd|github actions|terraform|linux|nginx)\b/i

    const ai_ml_skill_count = skills.filter(s => s.category === 'AI/ML' || aiMlRegex.test(s.name)).length
    const backend_skill_count = skills.filter(s => s.category === 'Backend' || backendRegex.test(s.name)).length
    const frontend_skill_count = skills.filter(s => s.category === 'Frontend' || frontendRegex.test(s.name)).length
    const devops_skill_count = skills.filter(s => s.category === 'DevOps' || devopsRegex.test(s.name)).length

    let total_months_experience = 0
    if (experiences) {
        const now = new Date()
        experiences.forEach(exp => {
            const start = new Date(exp.start_date)
            const end = exp.end_date ? new Date(exp.end_date) : now
            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
            total_months_experience += Math.max(0, months)
        })
    }

    // 4. Insert
    await supabase.from('user_skill_snapshot').insert({
        user_id: userId,
        job_application_id: appId,
        skills_snapshot: skills,
        total_skill_count: skills.length,
        expert_skill_count: skills.filter(s => s.level === 'expert').length,
        ai_ml_skill_count,
        backend_skill_count,
        frontend_skill_count,
        devops_skill_count,
        total_months_experience,
        job_count: experiences?.length ?? 0
    })
}

async function captureCvMatchSnapshot(userId: string, appId: string, cvGenId: string, companyName: string): Promise<void> {
    const supabase = await createServerClient()
    
    // 1. Fetch CV data
    const { data: cv } = await supabase
        .from('cv_generations')
        .select('ats_score, created_at')
        .eq('id', cvGenId)
        .single()

    if (!cv) return

    // 2. Fetch previous CV
    const { data: prevCv } = await supabase
        .from('cv_generations')
        .select('created_at')
        .eq('user_id', userId)
        .neq('id', cvGenId)
        .order('created_at', { ascending: false })
        .limit(1)

    const previousRecord = Array.isArray(prevCv) ? prevCv[0] : prevCv

    // 3. Logic
    let days_since_last_cv = null
    if (previousRecord) {
        const current = new Date(cv.created_at)
        const previous = new Date(previousRecord.created_at)
        const diffInMs = Math.abs(current.getTime() - previous.getTime())
        days_since_last_cv = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    }

    // 4. Insert
    await supabase.from('cv_generation_job_match').insert({
        user_id: userId,
        cv_generation_id: cvGenId,
        job_application_id: appId,
        ats_score_at_submit: cv.ats_score,
        company_name: companyName,
        outcome: null,
        days_since_last_cv
    })
}
