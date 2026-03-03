import { createServerClient } from '@/lib/supabase/server'
import { generateCoverLetterAction } from '@/features/cover-letter/actions'

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { job_description, company, role, cv_generation_id } = await request.json()

        if (!job_description || !company || !role) {
            return Response.json({ error: 'Missing required fields', code: 'BAD_REQUEST' }, { status: 400 })
        }

        const result = await generateCoverLetterAction(job_description, company, role, cv_generation_id)

        if (result.error) {
            return Response.json({ error: result.error, code: result.code }, { status: 500 })
        }

        return Response.json({ data: result.data, message: result.message }, { status: 200 })
    } catch (error) {
        console.error('[/api/cover-letter/generate]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}
