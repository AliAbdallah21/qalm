'use server'

import { revalidatePath } from 'next/cache'
import {
    upsertProfile,
    createExperience,
    updateExperience,
    deleteExperience,
    createEducation,
    updateEducation,
    deleteEducation,
    createSkill,
    deleteSkill,
    createCertificate,
    updateCertificate,
    deleteCertificate,
    createLanguage,
    deleteLanguage,
} from './queries'
import type { Profile, Experience, Education, Skill, Certificate, Language } from './types'
import { createServerClient } from '@/lib/supabase/server'

// Helper to get authenticated user ID
async function requireAuth() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }
    return user.id
}

// Ensure the profile page data refreshes when we mutate data
function revalidateProfile() {
    revalidatePath('/dashboard/profile')
}

// -----------------------------------------------------------------
// Profile Actions
// -----------------------------------------------------------------
export async function updateProfileAction(data: Partial<Profile>) {
    try {
        const userId = await requireAuth()
        const result = await upsertProfile(userId, data)
        revalidateProfile()
        return { data: result, message: 'Profile updated successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:updateProfileAction]', error)
        return { error: 'Failed to update profile', code: 'PROFILE_UPDATE_FAILED' }
    }
}

// -----------------------------------------------------------------
// Experience Actions
// -----------------------------------------------------------------
export async function addExperienceAction(data: Partial<Experience>) {
    try {
        const userId = await requireAuth()
        const result = await createExperience(userId, data)
        revalidateProfile()
        return { data: result, message: 'Experience added successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:addExperienceAction]', error)
        return { error: 'Failed to add experience', code: 'EXPERIENCE_ADD_FAILED' }
    }
}

export async function editExperienceAction(id: string, data: Partial<Experience>) {
    try {
        const userId = await requireAuth()
        const result = await updateExperience(userId, id, data)
        revalidateProfile()
        return { data: result, message: 'Experience updated successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:editExperienceAction]', error)
        return { error: 'Failed to update experience', code: 'EXPERIENCE_UPDATE_FAILED' }
    }
}

export async function removeExperienceAction(id: string) {
    try {
        const userId = await requireAuth()
        await deleteExperience(userId, id)
        revalidateProfile()
        return { data: null, message: 'Experience deleted successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:removeExperienceAction]', error)
        return { error: 'Failed to delete experience', code: 'EXPERIENCE_DELETE_FAILED' }
    }
}

// -----------------------------------------------------------------
// Education Actions
// -----------------------------------------------------------------
export async function addEducationAction(data: Partial<Education>) {
    try {
        const userId = await requireAuth()
        const result = await createEducation(userId, data)
        revalidateProfile()
        return { data: result, message: 'Education added successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:addEducationAction]', error)
        return { error: 'Failed to add education', code: 'EDUCATION_ADD_FAILED' }
    }
}

export async function editEducationAction(id: string, data: Partial<Education>) {
    try {
        const userId = await requireAuth()
        const result = await updateEducation(userId, id, data)
        revalidateProfile()
        return { data: result, message: 'Education updated successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:editEducationAction]', error)
        return { error: 'Failed to update education', code: 'EDUCATION_UPDATE_FAILED' }
    }
}

export async function removeEducationAction(id: string) {
    try {
        const userId = await requireAuth()
        await deleteEducation(userId, id)
        revalidateProfile()
        return { data: null, message: 'Education deleted successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:removeEducationAction]', error)
        return { error: 'Failed to delete education', code: 'EDUCATION_DELETE_FAILED' }
    }
}

// -----------------------------------------------------------------
// Skills Actions
// -----------------------------------------------------------------
export async function addSkillAction(data: Partial<Skill>) {
    try {
        const userId = await requireAuth()
        const result = await createSkill(userId, data)
        revalidateProfile()
        return { data: result, message: 'Skill added successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:addSkillAction]', error)
        return { error: 'Failed to add skill', code: 'SKILL_ADD_FAILED' }
    }
}

export async function removeSkillAction(id: string) {
    try {
        const userId = await requireAuth()
        await deleteSkill(userId, id)
        revalidateProfile()
        return { data: null, message: 'Skill deleted successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:removeSkillAction]', error)
        return { error: 'Failed to delete skill', code: 'SKILL_DELETE_FAILED' }
    }
}

// -----------------------------------------------------------------
// Certificates Actions
// -----------------------------------------------------------------
export async function addCertificateAction(data: Partial<Certificate>) {
    try {
        const userId = await requireAuth()
        const result = await createCertificate(userId, data)
        revalidateProfile()
        return { data: result, message: 'Certificate added successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:addCertificateAction]', error)
        return { error: 'Failed to add certificate', code: 'CERTIFICATE_ADD_FAILED' }
    }
}

export async function removeCertificateAction(id: string) {
    try {
        const userId = await requireAuth()
        await deleteCertificate(userId, id)
        revalidateProfile()
        return { data: null, message: 'Certificate deleted successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:removeCertificateAction]', error)
        return { error: 'Failed to delete certificate', code: 'CERTIFICATE_DELETE_FAILED' }
    }
}

// -----------------------------------------------------------------
// Languages Actions
// -----------------------------------------------------------------
export async function addLanguageAction(data: Partial<Language>) {
    try {
        const userId = await requireAuth()
        const result = await createLanguage(userId, data)
        revalidateProfile()
        return { data: result, message: 'Language added successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:addLanguageAction]', error)
        return { error: 'Failed to add language', code: 'LANGUAGE_ADD_FAILED' }
    }
}

export async function removeLanguageAction(id: string) {
    try {
        const userId = await requireAuth()
        await deleteLanguage(userId, id)
        revalidateProfile()
        return { data: null, message: 'Language deleted successfully' }
    } catch (error) {
        console.error('[/features/profile/actions.ts:removeLanguageAction]', error)
        return { error: 'Failed to delete language', code: 'LANGUAGE_DELETE_FAILED' }
    }
}
