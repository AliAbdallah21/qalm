import { createServerClient } from '@/lib/supabase/server'
import { removeLanguageAction } from '@/features/profile/actions'

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
        const result = await removeLanguageAction(id)

        if (result.error) {
            return Response.json({ error: result.error, code: result.code }, { status: 400 })
        }

        return Response.json({ data: result.data, message: result.message })
    } catch (error) {
        console.error('[/api/profile/languages/[id] DELETE]', error)
        return Response.json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' }, { status: 500 })
    }
}
