import { createServerClient } from '@/lib/supabase/server'
import { getApplicationsByUserId, createApplication } from '@/features/job-tracker/queries'
import type { CreateJobApplicationInput } from '@/features/job-tracker/types'

export async function GET() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const applications = await getApplicationsByUserId(user.id)
        return Response.json({ data: applications, message: 'Applications fetched' }, { status: 200 })
    } catch (error) {
        console.error('[/api/jobs GET]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const body: CreateJobApplicationInput = await request.json()

        if (!body.company || !body.role) {
            return Response.json({ error: 'company and role are required', code: 'BAD_REQUEST' }, { status: 400 })
        }

        const application = await createApplication(user.id, body)
        return Response.json({ data: application, message: 'Application saved successfully!' }, { status: 201 })
    } catch (error) {
        console.error('[/api/jobs POST]', error)
        return Response.json({ error: 'Failed to save application', code: 'SAVE_FAILED' }, { status: 500 })
    }
}
