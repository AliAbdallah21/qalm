import { createServerClient } from '@/lib/supabase/server'
import { setActiveTemplate, deactivateAllTemplates } from '@/features/cv-generator/queries'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const { id } = await params

        if (id === 'default') {
            await deactivateAllTemplates(user.id)
            return Response.json({ message: 'Using default template' })
        } else {
            await setActiveTemplate(id, user.id)
            return Response.json({ message: 'Template activated' })
        }
    } catch (error) {
        console.error('[/api/templates/[id]/activate PATCH]', error)
        return Response.json({ error: 'Failed to activate template', code: 'ACTIVATE_FAILED' }, { status: 500 })
    }
}
