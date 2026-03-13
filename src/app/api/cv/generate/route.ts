import { generateCVAction } from '@/features/cv-generator/actions'
import { getTemplate, TEMPLATES } from '@/lib/cv-templates/index'
import { createServerClient } from '@/lib/supabase/server'
import { updateCV } from '@/features/cv-generator/queries'
import { callAI, parseAIJSON } from '@/lib/ai/client'
import { buildAtsBreakdownPrompt } from '@/lib/ai/prompts'
import type { ATSBreakdown } from '@/features/cv-generator/types'
import { canUserAccess } from '@/lib/access/permissions'

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        // Check subscription & limits
        const access = await canUserAccess(user.id, 'cv_generation')
        if (!access.allowed) {
            return Response.json({
                error: access.reason || 'Upgrade to Pro for unlimited generations',
                code: 'LIMIT_REACHED'
            }, { status: 403 })
        }

        const body = await request.json()
        const { 
            job_description, 
            job_title, 
            company_name, 
            template_id = 'experienced', 
            category,
            forcedProjectIds = [],
            forcedProjectDescriptions = {},
            allowAiProjects = true,
            forcedCertIds = [],
            allowAiCerts = true
        } = body
        console.log('JOB TITLE RECEIVED:', job_title)

        if (!job_description || !job_title || !company_name) {
            return Response.json({ error: 'Missing required fields (job_description, job_title, company_name)', code: 'BAD_REQUEST' }, { status: 400 })
        }

        const result = await generateCVAction({
            job_description,
            job_title,
            company_name,
            forcedProjectIds,
            forcedProjectDescriptions,
            allowAiProjects,
            forcedCertIds,
            allowAiCerts
        })

        if (result.error || !result.data) {
            return Response.json({ error: result.error || 'Generation failed', code: result.code }, { status: 400 })
        }

        const { 
            cv_id, 
            generated_cv, 
            forcedProjectIds: resolvedForcedIds, 
            forcedProjectDescriptions: resolvedForcedDescs, 
            userProjects,
            userCertificates
        } = result.data
        generated_cv.header.title = job_title // Force exact user input

        // Post-AI replacement: swap FORCED_[id] placeholders with real project data
        if (resolvedForcedIds?.length && userProjects?.length) {
            generated_cv.projects = generated_cv.projects.map((proj: any) => {
                if (!proj.name.startsWith('FORCED_')) return proj
                const id = proj.name.replace('FORCED_', '')
                const realProject = userProjects.find((p: any) => p.id === id)
                if (!realProject) return proj // keep placeholder if lookup fails
                return {
                    name: realProject.name,
                    description: resolvedForcedDescs?.[id] || realProject.description || '',
                    tech_stack: realProject.technologies || [],
                    url: realProject.url || ''
                }
            })
        }

        // Post-AI replacement: swap CERT_[id] placeholders with real certification data
        if (userCertificates?.length) {
            generated_cv.certificates = generated_cv.certificates.map((cert: any) => {
                if (!cert.title.startsWith('CERT_')) return cert
                const id = cert.title.replace('CERT_', '')
                const realCert = userCertificates.find((c: any) => c.id === id)
                if (!realCert) return cert
                return {
                    title: realCert.title,
                    issuer: realCert.issuer,
                    date: realCert.issue_date || '',
                    description: realCert.description || cert.description || '',
                    url: realCert.credential_url || ''
                }
            })
        }

        // generate ATS Breakdown first
        let atsBreakdown: ATSBreakdown | null = null;
        try {
            const cvText = JSON.stringify(generated_cv)
            const prompt = buildAtsBreakdownPrompt(job_description, cvText)
            const aiResponse = await callAI({
                prompt,
                model: 'fast'
            })
            atsBreakdown = parseAIJSON<ATSBreakdown>(aiResponse)
        } catch (atsError) {
            console.error('ATS Breakdown generation failed:', atsError)
        }

        const latexSource = getTemplate(template_id).build(generated_cv)

        await updateCV(user.id, cv_id, {
            latex_source: latexSource,
            pdf_status: 'pending',
            ats_breakdown: atsBreakdown,
            template_id: template_id,
            category: category || 'Other'
        })

        try {
            await fetch(
                `https://api.github.com/repos/${process.env.GITHUB_REPO_OWNER}/${process.env.GITHUB_REPO_NAME}/actions/workflows/compile-pdf.yml/dispatches`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.GITHUB_ACTIONS_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ref: 'main',
                        inputs: { cv_id: cv_id }
                    })
                }
            )
        } catch (triggerError) {
            console.error('GitHub Actions trigger failed:', triggerError)
        }

        return Response.json({
            data: {
                ...result.data,
                pdf_url: null,
                pdf_status: 'pending',
                ats_breakdown: atsBreakdown
            },
            message: result.message
        }, { status: 200 })
    } catch (error) {
        console.error('[/api/cv/generate POST]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}
