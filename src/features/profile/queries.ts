import { createServerClient } from '@/lib/supabase/server'
import type { Profile, Experience, Education, Skill, Certificate, Language, FullProfileData } from './types'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getFullProfile(userId: string): Promise<FullProfileData> {
    const supabase = await createServerClient()

    // Run all queries concurrently for performance
    const [
        profileResult,
        experiencesResult,
        educationResult,
        skillsResult,
        certificatesResult,
        languagesResult
    ] = await Promise.all([
        supabase
            .from('profiles')
            .select('id, user_id, full_name, email, phone, country, city, age, headline, summary, linkedin_url, github_username, avatar_url, preferred_template, created_at, updated_at')
            .eq('user_id', userId)
            .single(),
        supabase
            .from('experiences')
            .select('id, user_id, company, title, location, start_date, end_date, is_current, description, created_at')
            .eq('user_id', userId)
            .order('start_date', { ascending: false }),
        supabase
            .from('education')
            .select('id, user_id, institution, degree, field, start_date, end_date, grade, description, created_at')
            .eq('user_id', userId)
            .order('start_date', { ascending: false }),
        supabase
            .from('skills')
            .select('id, user_id, name, level, years_experience, category, created_at')
            .eq('user_id', userId)
            .order('name', { ascending: true }),
        supabase
            .from('certificates')
            .select('id, user_id, title, issuer, issue_date, expiry_date, credential_url, description, is_hero, created_at')
            .eq('user_id', userId)
            .order('issue_date', { ascending: false }),
        supabase
            .from('languages')
            .select('id, user_id, name, proficiency, created_at')
            .eq('user_id', userId)
            .order('name', { ascending: true })
    ])

    const profile = (profileResult.data as Profile) || null

    // Calculate completeness score (0-100)
    let completenessScore = 0
    let totalFields = 0
    let filledFields = 0

    if (profile) {
        const fieldsToCheck = [
            profile.full_name, profile.headline, profile.summary,
            profile.country, profile.github_username
        ]
        totalFields += fieldsToCheck.length
        filledFields += fieldsToCheck.filter(Boolean).length
    } else {
        totalFields += 5
    }

    // Must have at least one of each to be considered "complete" for that section
    totalFields += 5 // experience, education, skills, certs, languages

    const hasExperiences = (experiencesResult.data || []).length > 0
    const hasEducation = (educationResult.data || []).length > 0
    const hasSkills = (skillsResult.data || []).length > 0
    const hasCertificates = (certificatesResult.data || []).length > 0
    const hasLanguages = (languagesResult.data || []).length > 0

    if (hasExperiences) filledFields++
    if (hasEducation) filledFields++
    if (hasSkills) filledFields++
    if (hasCertificates) filledFields++
    if (hasLanguages) filledFields++

    completenessScore = Math.round((filledFields / totalFields) * 100)

    return {
        profile,
        experiences: (experiencesResult.data as Experience[]) || [],
        education: (educationResult.data as Education[]) || [],
        skills: (skillsResult.data as Skill[]) || [],
        certificates: (certificatesResult.data as Certificate[]) || [],
        languages: (languagesResult.data as Language[]) || [],
        completeness_score: completenessScore
    }
}

// ... existing profile, experience, education, skill, certificate queries ...
// To save space in the diff, I'm only adding the new language queries at the end.
// But wait, the tool requires complete drop-in replacement. 
// I'll keep the existing ones and add the new ones.

export async function upsertProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    const supabase = await createServerClient()

    const { data: updated, error } = await supabase
        .from('profiles')
        .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' })
        .select('id, user_id, full_name, email, phone, country, city, age, headline, summary, linkedin_url, github_username, avatar_url, preferred_template, created_at, updated_at')
        .single()

    if (error) throw error
    return updated as Profile
}

export async function createExperience(userId: string, data: Partial<Experience>): Promise<Experience> {
    const supabase = await createServerClient()
    const { data: created, error } = await supabase
        .from('experiences')
        .insert([{ ...data, user_id: userId }])
        .select('id, user_id, company, title, location, start_date, end_date, is_current, description, created_at')
        .single()

    if (error) throw error
    return created as Experience
}

export async function updateExperience(userId: string, id: string, data: Partial<Experience>): Promise<Experience> {
    const supabase = await createServerClient()
    const { data: updated, error } = await supabase
        .from('experiences')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select('id, user_id, company, title, location, start_date, end_date, is_current, description, created_at')
        .single()

    if (error) throw error
    return updated as Experience
}

export async function deleteExperience(userId: string, id: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) throw error
}

export async function createEducation(userId: string, data: Partial<Education>): Promise<Education> {
    const supabase = await createServerClient()
    const { data: created, error } = await supabase
        .from('education')
        .insert([{ ...data, user_id: userId }])
        .select('id, user_id, institution, degree, field, start_date, end_date, grade, description, created_at')
        .single()

    if (error) throw error
    return created as Education
}

export async function updateEducation(userId: string, id: string, data: Partial<Education>): Promise<Education> {
    const supabase = await createServerClient()
    const { data: updated, error } = await supabase
        .from('education')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select('id, user_id, institution, degree, field, start_date, end_date, grade, description, created_at')
        .single()

    if (error) throw error
    return updated as Education
}

export async function deleteEducation(userId: string, id: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) throw error
}

export async function createSkill(userId: string, data: Partial<Skill>): Promise<Skill> {
    const supabase = await createServerClient()
    const { data: created, error } = await supabase
        .from('skills')
        .insert([{ ...data, user_id: userId }])
        .select('id, user_id, name, level, years_experience, category, created_at')
        .single()

    if (error) throw error

    // ML Instrumentation: Track skill acquisition (awaited for serverless safety)
    try {
        await supabase.from('skill_acquisition_events').insert({
            user_id: userId,
            skill_name: created.name,
            skill_category: created.category ?? null,
            source: 'user_added',
            recommendation_reason: null,
            estimated_impact: null,
            recommended_at: null,
            apps_30d_before: null,
            apps_30d_after: null,
            response_rate_before: null,
            response_rate_after: null
        })
    } catch (mlError) {
        console.error('[ML] skill_acquisition_events insert failed:', mlError)
    }

    return created as Skill
}

export async function deleteSkill(userId: string, id: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) throw error
}

export async function createCertificate(userId: string, data: Partial<Certificate>): Promise<Certificate> {
    const supabase = await createServerClient()
    const { data: created, error } = await supabase
        .from('certificates')
        .insert([{ ...data, user_id: userId }])
        .select('id, user_id, title, issuer, issue_date, expiry_date, credential_url, description, created_at')
        .single()

    if (error) throw error
    return created as Certificate
}

export async function updateCertificate(userId: string, id: string, data: Partial<Certificate>): Promise<Certificate> {
    const supabase = await createServerClient()
    const { data: updated, error } = await supabase
        .from('certificates')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select('id, user_id, title, issuer, issue_date, expiry_date, credential_url, description, created_at')
        .single()

    if (error) throw error
    return updated as Certificate
}

export async function deleteCertificate(userId: string, id: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) throw error
}

export async function createLanguage(userId: string, data: Partial<Language>): Promise<Language> {
    const supabase = await createServerClient()
    const { data: created, error } = await supabase
        .from('languages')
        .insert([{ ...data, user_id: userId }])
        .select('id, user_id, name, proficiency, created_at')
        .single()

    if (error) throw error
    return created as Language
}

export async function deleteLanguage(userId: string, id: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
    .from('languages')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

    if (error) throw error
}

export async function toggleCertificateHero(userId: string, id: string, isHero: boolean): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('certificates')
        .update({ is_hero: isHero })
        .eq('id', id)
        .eq('user_id', userId)

    if (error) throw error
}

export async function getProfileByEmail(email: string, client?: SupabaseClient): Promise<Profile | null> {
    const supabase = client || await createServerClient()
    const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, phone, country, city, age, headline, summary, linkedin_url, github_username, avatar_url, preferred_template, created_at, updated_at')
        .eq('email', email)
        .maybeSingle()

    if (error) return null
    return data as Profile
}
