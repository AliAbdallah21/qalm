'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { getFullProfile } from '@/features/profile/queries'
import { getStoredRepos } from '@/features/github/queries'
import { getUserProjects } from '@/features/projects/queries'
import { callAI, parseAIJSON } from '@/lib/ai/client'
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
    forcedProjectIds?: string[]
    forcedProjectDescriptions?: Record<string, string>
    allowAiProjects?: boolean
    forcedCertIds?: string[]
    allowAiCerts?: boolean
}) {
    try {
        const userId = await requireAuth()

        // 1. Fetch all context for the AI
        const [profileData, githubRepos, userProjects] = await Promise.all([
            getFullProfile(userId),
            getStoredRepos(userId),
            getUserProjects(userId)
        ])

        // Filter for featured repos first, then top starred ones
        const relevantRepos = githubRepos
            .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) || b.stars - a.stars)
            .slice(0, 5)

        // Determine projects
        let aiProjectsInput: any[] = []
        if (data.allowAiProjects !== false) {
             aiProjectsInput = userProjects.map(pr => ({
                 id: pr.id,
                 name: pr.name,
                 description: pr.description,
                 tech_stack: pr.technologies || [],
                 url: pr.url,
                 is_hero: pr.is_hero
             }))
        }
        
        // Determine certs
        let aiCertsInput: any[] = []
        if (data.allowAiCerts !== false) {
             aiCertsInput = profileData.certificates.map(c => ({
                 id: c.id,
                 title: c.title,
                 issuer: c.issuer,
                 date: c.issue_date,
                 url: c.credential_url
             }))
        }

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
            certificates: aiCertsInput,
            projects: aiProjectsInput
        }

        let forcedOptionsText = ''
        
        if (data.forcedProjectIds?.length) {
            const forcedProjects = userProjects.filter(p => data.forcedProjectIds!.includes(p.id))
            if (forcedProjects.length > 0) {
                forcedOptionsText += `\nFORCED PROJECTS (must appear in CV):\n`
                forcedProjects.forEach(p => {
                    const customDesc = data.forcedProjectDescriptions?.[p.id]
                    forcedOptionsText += `- ${p.name}: ${customDesc || "write a tailored description for this role based on the project"}\n`
                })
            }
        }
        
        const heroProjects = userProjects.filter(p => p.is_hero)
        if (heroProjects.length > 0) {
            forcedOptionsText += `\nHERO PROJECTS (prioritize these when selecting projects):\n`
            heroProjects.forEach(p => {
                forcedOptionsText += `- ${p.name}\n`
            })
        }
        
        if (data.allowAiProjects !== false) {
            forcedOptionsText += `\nAI MAY ALSO INCLUDE: Pick additional projects from the full list that best match the job role and title.\n`
        }

        if (data.forcedCertIds?.length) {
            const forcedCerts = profileData.certificates.filter(c => data.forcedCertIds!.includes(c.id))
            if (forcedCerts.length > 0) {
                forcedOptionsText += `\nFORCED CERTIFICATIONS (must appear in CV):\n`
                forcedCerts.forEach(c => {
                    forcedOptionsText += `- ${c.title} from ${c.issuer}\n`
                })
            }
        }
        
        if (data.allowAiCerts !== false) {
            forcedOptionsText += `\nAI MAY ALSO INCLUDE: Pick additional certifications from the full list that best match the job role.\n`
        }

        // 3. Generate the CV using the 'smart' model (Claude 3.5 Sonnet)
        const prompt = buildCVGenerationPrompt(context, data.job_description, data.job_title, forcedOptionsText)
        const aiResponse = await callAI({ prompt, model: 'smart' })

        // 4. Parse the JSON safely
        let structuredCV: StructuredCV
        try {
            structuredCV = parseAIJSON<StructuredCV>(aiResponse)
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
