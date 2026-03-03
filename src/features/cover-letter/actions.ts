'use server'

import { createServerClient } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai/client'
import { buildCoverLetterPrompt } from '@/lib/ai/prompts'
import { getFullProfile } from '@/features/profile/queries'
import { saveCoverLetter } from './queries'
import { revalidatePath } from 'next/cache'

export async function generateCoverLetterAction(
    jobDescription: string,
    company: string,
    role: string,
    cvId?: string
) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        // 1. Fetch user profile
        const profile = await getFullProfile(user.id)
        if (!profile.profile) throw new Error('Profile not found')

        // 2. Build prompt context
        // Create a summary for the AI
        const profileSummary = `
Name: ${profile.profile.full_name}
Headline: ${profile.profile.headline}
Summary: ${profile.profile.summary}
Experience: ${profile.experiences.map(e => `${e.title} at ${e.company} (${e.description})`).join('; ')}
Skills: ${profile.skills.map(s => s.name).join(', ')}
        `.trim()

        const prompt = buildCoverLetterPrompt(profileSummary, jobDescription, company, role)

        // 3. Call AI
        const content = await callAI({
            prompt,
            model: 'smart'
        })

        // 4. Save to DB
        const saved = await saveCoverLetter(user.id, {
            company,
            role,
            job_description: jobDescription,
            content,
            cv_generation_id: cvId
        })

        revalidatePath('/jobs')
        revalidatePath('/cv-builder')

        return { data: saved, message: 'Cover letter generated successfully' }
    } catch (error) {
        console.error('[generateCoverLetterAction]', error)
        return { error: 'Failed to generate cover letter', code: 'GENERATION_FAILED' }
    }
}
