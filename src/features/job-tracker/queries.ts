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
