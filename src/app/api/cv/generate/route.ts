import { generateCVAction } from '@/features/cv-generator/actions'
import { buildLatexString } from '@/features/cv-generator/latex-template'
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
        const { job_description, job_title, company_name } = body
        console.log('JOB TITLE RECEIVED:', job_title)

        if (!job_description || !job_title || !company_name) {
            return Response.json({ error: 'Missing required fields (job_description, job_title, company_name)', code: 'BAD_REQUEST' }, { status: 400 })
        }

        const result = await generateCVAction({
            job_description,
            job_title,
            company_name
        })

        if (result.error || !result.data) {
            return Response.json({ error: result.error || 'Generation failed', code: result.code }, { status: 400 })
        }

        const { cv_id, generated_cv } = result.data
        generated_cv.header.title = job_title // Force exact user input

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

        const latexSource = buildLatexString(generated_cv)

        await updateCV(user.id, cv_id, {
            latex_source: latexSource,
            pdf_status: 'pending',
            ats_breakdown: atsBreakdown
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
