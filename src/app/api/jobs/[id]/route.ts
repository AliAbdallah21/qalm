import { createServerClient } from '@/lib/supabase/server'
import { getApplicationById, updateApplication, deleteApplication } from '@/features/job-tracker/queries'
import type { UpdateJobApplicationInput } from '@/features/job-tracker/types'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { id } = await params
        const application = await getApplicationById(user.id, id)

        if (!application) {
            return Response.json({ error: 'Not found', code: 'NOT_FOUND' }, { status: 404 })
        }

        return Response.json({ data: application, message: 'Application fetched' }, { status: 200 })
    } catch (error) {
        console.error('[/api/jobs/[id] GET]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { id } = await params
        const body: UpdateJobApplicationInput = await request.json()
        const application = await updateApplication(user.id, id, body)

        return Response.json({ data: application, message: 'Application updated' }, { status: 200 })
    } catch (error) {
        console.error('[/api/jobs/[id] PATCH]', error)
        return Response.json({ error: 'Failed to update application', code: 'UPDATE_FAILED' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { id } = await params
        await deleteApplication(user.id, id)

        return Response.json({ data: null, message: 'Application deleted' }, { status: 200 })
    } catch (error) {
        console.error('[/api/jobs/[id] DELETE]', error)
        return Response.json({ error: 'Failed to delete application', code: 'DELETE_FAILED' }, { status: 500 })
    }
}
