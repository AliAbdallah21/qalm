import { createServerClient } from '@/lib/supabase/server'
import type { CVGeneration, StructuredCV } from './types'

export async function saveGeneratedCV(
    userId: string,
    data: {
        job_title: string
        company_name: string
        job_description: string
        generated_cv: StructuredCV
        ats_score: number
        model_used: string
    }
): Promise<CVGeneration> {
    const supabase = await createServerClient()

    const { data: cv, error } = await supabase
        .from('cv_generations')
        .insert({
            user_id: userId,
            job_title: data.job_title,
            company_name: data.company_name,
            job_description: data.job_description,
            generated_cv: data.generated_cv as any, // jsonb
            ats_score: data.ats_score,
            model_used: data.model_used
        })
        .select()
        .single()

    if (error) throw error
    return cv as CVGeneration
}

export async function getCVHistory(userId: string): Promise<CVGeneration[]> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('cv_generations')
        .select('id, user_id, job_title, company_name, job_description, generated_cv, pdf_url, ats_score, model_used, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as CVGeneration[]
}

export async function getCVById(userId: string, cvId: string): Promise<CVGeneration> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('cv_generations')
        .select('id, user_id, job_title, company_name, job_description, generated_cv, pdf_url, ats_score, model_used, created_at')
        .eq('id', cvId)
        .eq('user_id', userId)
        .single()

    if (error) throw error
    return data as CVGeneration
}

export async function updateCV(userId: string, cvId: string, data: Partial<CVGeneration>): Promise<void> {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from('cv_generations')
        .update(data)
        .eq('id', cvId)
        .eq('user_id', userId)

    if (error) throw error
}
