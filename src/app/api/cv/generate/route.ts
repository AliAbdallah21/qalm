import { generateCVAction } from '@/features/cv-generator/actions'
import { generateLatexCVPdf } from '@/features/cv-generator/latex-template'
import { createServerClient } from '@/lib/supabase/server'
import { updateCV } from '@/features/cv-generator/queries'
import { callAI } from '@/lib/ai/client'
import { buildAtsBreakdownPrompt } from '@/lib/ai/prompts'
import type { ATSBreakdown } from '@/features/cv-generator/types'

export async function POST(request: Request) {
    try {
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

        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        // 1. Generate PDF Buffer using LaTeX
        let pdfBuffer: Buffer;
        try {
            pdfBuffer = await generateLatexCVPdf(generated_cv)
        } catch (latexError) {
            console.error('LaTeX generation failed:', latexError);
            return Response.json({ error: 'LaTeX compilation failed', code: 'LATEX_ERROR' }, { status: 500 })
        }

        // 2. Upload to Supabase Storage
        const sanitize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
        const timestamp = Math.floor(Date.now() / 1000)
        const fileName = `${user.id}/${sanitize(company_name || 'company')}_${sanitize(job_title || 'role')}_${timestamp}.pdf`
        const { error: uploadError } = await supabase.storage
            .from('cvs')
            .upload(fileName, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
            })

        if (uploadError) {
            console.error('PDF upload failed:', uploadError)
            return Response.json({ error: 'Failed to upload PDF', code: 'STORAGE_FAILED' }, { status: 500 })
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('cvs')
            .getPublicUrl(fileName)

        // 4. Generate ATS Breakdown
        let atsBreakdown: ATSBreakdown | null = null;
        try {
            const cvText = JSON.stringify(generated_cv)
            const prompt = buildAtsBreakdownPrompt(job_description, cvText)
            const aiResponse = await callAI({
                prompt,
                model: 'fast'
            })
            atsBreakdown = JSON.parse(aiResponse)
        } catch (atsError) {
            console.error('ATS Breakdown generation failed:', atsError)
        }

        // 5. Update database
        await updateCV(user.id, cv_id, {
            pdf_url: publicUrl,
            ats_breakdown: atsBreakdown
        })

        return Response.json({
            data: {
                ...result.data,
                pdf_url: publicUrl,
                ats_breakdown: atsBreakdown
            },
            message: result.message
        }, { status: 200 })
    } catch (error) {
        console.error('[/api/cv/generate POST]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}
