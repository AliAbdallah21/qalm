import { getCVHistory } from '@/features/cv-generator/queries'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const history = await getCVHistory(user.id)
        return Response.json({ data: history, message: 'CV history fetched successfully' }, { status: 200 })
    } catch (error) {
        console.error('[/api/cv/history GET]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}
