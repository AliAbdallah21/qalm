import { createServerClient } from '@/lib/supabase/server'
import { deleteTemplate } from '@/features/cv-generator/queries'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { id } = await params
        await deleteTemplate(id, user.id)

        return Response.json({ message: 'Template deleted' })
    } catch (error) {
        console.error('[/api/templates/[id] DELETE]', error)
        return Response.json({ error: 'Failed to delete template', code: 'DELETE_FAILED' }, { status: 500 })
    }
}
