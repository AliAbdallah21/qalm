import { createServerClient } from '@/lib/supabase/server'
import { addSkillAction } from '@/features/profile/actions'

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const body = await request.json()
        const result = await addSkillAction(body)

        if (result.error) {
            return Response.json({ error: result.error, code: result.code }, { status: 400 })
        }

        return Response.json({ data: result.data, message: result.message }, { status: 201 })
    } catch (error) {
        console.error('[/api/profile/skills POST]', error)
        return Response.json({ error: 'Invalid request format', code: 'BAD_REQUEST' }, { status: 400 })
    }
}
