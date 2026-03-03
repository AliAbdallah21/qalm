import { createServerClient } from '@/lib/supabase/server'
import { removeSkillAction } from '@/features/profile/actions'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { id } = await params
        const result = await removeSkillAction(id)

        if (result.error) {
            return Response.json({ error: result.error, code: result.code }, { status: 400 })
        }

        return Response.json({ data: result.data, message: result.message }, { status: 200 })
    } catch (error) {
        console.error('[/api/profile/skills/[id] DELETE]', error)
        return Response.json({ error: 'Invalid request', code: 'BAD_REQUEST' }, { status: 400 })
    }
}
