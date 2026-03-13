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
            certificates: profileData.certificates.map(c => ({
                id: c.id,
                title: c.title,
                issuer: c.issuer,
                date: c.issue_date,
                url: c.credential_url,
                description: c.description
            })),
            projects: userProjects.map(pr => ({
                id: pr.id,
                name: pr.name,
                description: pr.description,
                tech_stack: pr.technologies || [],
                url: pr.url,
                is_hero: pr.is_hero
            }))
        }

        let forcedOptionsText = ''
        
        // PROJECTS LOGIC — use FORCED_[id] placeholders so route.ts can do exact replacement post-generation
        if (data.forcedProjectIds?.length) {
            const forcedProjects = userProjects.filter(p => data.forcedProjectIds!.includes(p.id))
            if (forcedProjects.length > 0) {
                forcedOptionsText += `\nThese project slots are pre-filled. Include a placeholder project entry for each one below. Use the name EXACTLY as shown (starting with FORCED_). Do NOT write a description for them — just leave description as an empty string:\n`
                forcedProjects.forEach(p => {
                    forcedOptionsText += `- Include a project with name exactly: FORCED_${p.id}\n`
                })
                forcedOptionsText += `Do NOT modify these names. Do NOT replace them. Do NOT generate descriptions for them.\n`
            }
        }
        
        if (data.allowAiProjects === false) {
            forcedOptionsText += `\nSTRICT: Only include the pre-filled projects listed above. Do NOT add any other projects.\n`
        } else {
            forcedOptionsText += `\nAfter the pre-filled slots above, you MAY add additional relevant projects from the user's profile (up to the total limit).\n`
        }
        forcedOptionsText += `Include a MAXIMUM of 3 projects total in the CV.\n`

        // CERTS LOGIC — use CERT_[id] placeholders so route.ts can do exact replacement post-generation
        if (data.forcedCertIds?.length) {
            const forcedCerts = profileData.certificates.filter(c => data.forcedCertIds!.includes(c.id))
            if (forcedCerts.length > 0) {
                forcedOptionsText += `\nMANDATORY: The following certifications MUST appear in the CV. Include a placeholder entry for each one below. Use the title EXACTLY as shown (starting with CERT_):\n`
                forcedCerts.forEach(c => {
                    forcedOptionsText += `- Include a certification with title exactly: CERT_${c.id}\n`
                })
                forcedOptionsText += `Do NOT modify these titles. If the context already has a description for a certificate, use it EXACTLY as-is. For others, write exactly one line (max 15 words).\n`
            }
        }
        
        if (data.allowAiCerts === false) {
            forcedOptionsText += `\nSTRICT: Only include the certifications listed above. Do NOT add any others.\n`
        }
        forcedOptionsText += `Include a MAXIMUM of 3 certifications total in the CV.\n`

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
                generated_cv: savedCV.generated_cv,
                // Pass these so route.ts can do post-AI replacement
                forcedProjectIds: data.forcedProjectIds || [],
                forcedProjectDescriptions: data.forcedProjectDescriptions || {},
                userProjects,
                userCertificates: profileData.certificates
            },
            message: 'CV tailored and generated successfully!'
        }

    } catch (error: any) {
        console.error('[/features/cv-generator/actions.ts:generateCVAction]', error)
        return { error: error.message || 'Failed to generate CV', code: 'GENERATION_FAILED' }
    }
}
