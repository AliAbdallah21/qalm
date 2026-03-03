'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getFullProfile } from '@/features/profile/queries'
import { getStoredRepos } from '@/features/github/queries'
import { callAI } from '@/lib/ai/client'
import { buildCVGenerationPrompt } from '@/lib/ai/prompts'
import { saveGeneratedCV } from './queries'
import type { StructuredCV } from './types'

async function requireAuth() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    return user.id
}

export async function generateCVAction(data: {
    job_description: string
    job_title: string
    company_name: string
}) {
    try {
        const userId = await requireAuth()

        // 1. Fetch all context for the AI
        const [profileData, githubRepos] = await Promise.all([
            getFullProfile(userId),
            getStoredRepos(userId)
        ])

        // Filter for featured repos first, then top starred ones
        const relevantRepos = githubRepos
            .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.stars - a.stars)
            .slice(0, 5)

        // 2. Prepare the payload for the prompt builder
        // Only pass fields the AI needs — never expose internal IDs or DB metadata
        const p = profileData.profile
        const context = {
            profile: {
                full_name: p?.full_name ?? '',
                email: p?.email ?? '',
                phone: p?.phone ?? '',
                city: p?.city ?? '',
                country: p?.country ?? '',
                headline: p?.headline ?? '',
                summary: p?.summary ?? '',
                linkedin_url: p?.linkedin_url ?? '',
                github_username: p?.github_username ?? '',
            },
            experience: profileData.experiences,
            education: profileData.education,
            skills: profileData.skills,
            certificates: profileData.certificates,
            projects: relevantRepos.map(repo => ({
                name: repo.repo_name,
                description: repo.readme_summary || repo.description,
                tech_stack: repo.languages ? Object.keys(repo.languages) : [],
                url: repo.html_url
            }))
        }

        // 3. Generate the CV using the 'smart' model (Claude 3.5 Sonnet)
        const prompt = buildCVGenerationPrompt(context, data.job_description, data.job_title)
        const aiResponse = await callAI({ prompt, model: 'smart' })

        // 4. Parse the JSON safely
        let structuredCV: StructuredCV
        try {
            // Find the first { and last } to extract JSON if AI included markdown filler
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
            structuredCV = JSON.parse(jsonString)
        } catch (parseError) {
            console.error('Failed to parse AI CV response:', aiResponse)
            return { error: 'AI generated an invalid format. Please try again.', code: 'GENERATION_FAILED' }
        }

        // 5. Save to database
        const savedCV = await saveGeneratedCV(userId, {
            job_title: data.job_title,
            company_name: data.company_name,
            job_description: data.job_description,
            generated_cv: structuredCV,
            ats_score: structuredCV.ats_score || 0,
            model_used: 'anthropic/claude-sonnet-4-5'
        })

        revalidatePath('/dashboard')
        revalidatePath('/dashboard/cv-builder')

        return {
            data: {
                cv_id: savedCV.id,
                ats_score: savedCV.ats_score,
                generated_cv: savedCV.generated_cv
            },
            message: 'CV tailored and generated successfully!'
        }

    } catch (error: any) {
        console.error('[/features/cv-generator/actions.ts:generateCVAction]', error)
        return { error: error.message || 'Failed to generate CV', code: 'GENERATION_FAILED' }
    }
}
