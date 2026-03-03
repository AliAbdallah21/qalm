import { createServerClient } from '@/lib/supabase/server'
import type { CoverLetter, CreateCoverLetterInput } from './types'

export async function saveCoverLetter(userId: string, data: CreateCoverLetterInput): Promise<CoverLetter> {
    const supabase = await createServerClient()

    const { data: created, error } = await supabase
        .from('cover_letters')
        .insert([{
            user_id: userId,
            cv_generation_id: data.cv_generation_id,
            company: data.company,
            role: data.role,
            job_description: data.job_description,
            content: data.content
        }])
        .select('*')
        .single()

    if (error) throw error
    return created as CoverLetter
}

export async function getCoverLettersByUserId(userId: string): Promise<CoverLetter[]> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as CoverLetter[]
}

export async function getCoverLetterById(userId: string, id: string): Promise<CoverLetter | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

    if (error) return null
    return data as CoverLetter
}
