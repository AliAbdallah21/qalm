import { createServerClient } from '@/lib/supabase/server'
import type { CVGeneration, StructuredCV, CVTemplate } from './types'

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
        .select('id, user_id, job_title, company_name, job_description, generated_cv, pdf_url, pdf_status, latex_source, ats_score, model_used, created_at')
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
export async function getMonthlyCVGenerationCount(userId: string): Promise<number> {
    const supabase = await createServerClient()
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
        .from('cv_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString())

    if (error) throw error
    return count || 0
}

export async function getUserTemplates(userId: string): Promise<CVTemplate[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('cv_templates')
        .select('id, user_id, name, latex_code, is_active, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as CVTemplate[]
}

export async function getActiveTemplate(userId: string): Promise<CVTemplate | null> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('cv_templates')
        .select('id, user_id, name, latex_code, is_active, created_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

    if (error) throw error
    return data as CVTemplate | null
}

export async function saveTemplate(userId: string, name: string, latex_code: string): Promise<CVTemplate> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('cv_templates')
        .insert({ user_id: userId, name, latex_code })
        .select()
        .single()

    if (error) throw error
    return data as CVTemplate
}

export async function deleteTemplate(id: string, userId: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('cv_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) throw error
}

export async function setActiveTemplate(id: string, userId: string): Promise<void> {
    const supabase = await createServerClient()
    
    // Deactivate all first
    const { error: err1 } = await supabase
        .from('cv_templates')
        .update({ is_active: false })
        .eq('user_id', userId)
        
    if (err1) throw err1
    
    // Activate specific one
    const { error: err2 } = await supabase
        .from('cv_templates')
        .update({ is_active: true })
        .eq('id', id)
        .eq('user_id', userId)
        
    if (err2) throw err2
}

export async function deactivateAllTemplates(userId: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('cv_templates')
        .update({ is_active: false })
        .eq('user_id', userId)

    if (error) throw error
}
