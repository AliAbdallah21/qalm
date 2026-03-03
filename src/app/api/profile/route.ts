import { createServerClient } from '@/lib/supabase/server'
import { getFullProfile } from '@/features/profile/queries'
import { updateProfileAction } from '@/features/profile/actions'

export async function GET(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const fullProfile = await getFullProfile(user.id)
        return Response.json({ data: fullProfile, message: 'Profile fetched successfully' }, { status: 200 })
    } catch (error) {
        console.error('[/api/profile GET]', error)
        return Response.json({ error: 'Failed to fetch profile', code: 'SERVER_ERROR' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const body = await request.json()
        const result = await updateProfileAction(body)

        if (result.error) {
            return Response.json({ error: result.error, code: result.code }, { status: 400 })
        }

        return Response.json({ data: result.data, message: result.message }, { status: 200 })
    } catch (error) {
        console.error('[/api/profile POST]', error)
        return Response.json({ error: 'Invalid request format', code: 'BAD_REQUEST' }, { status: 400 })
    }
}
