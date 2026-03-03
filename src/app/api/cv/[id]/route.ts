import { getCVById } from '@/features/cv-generator/queries'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const cv = await getCVById(user.id, id)
        return Response.json({ data: cv, message: 'CV fetched successfully' }, { status: 200 })
    } catch (error) {
        console.error('[/api/cv/[id] GET]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}
