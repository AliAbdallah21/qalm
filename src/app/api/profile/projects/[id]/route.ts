import { createServerClient } from '@/lib/supabase/server'
import { updateProject, deleteProject } from '@/features/projects/queries'

export async function PATCH(request: Request, context: any) {
    try {
        const params = await context.params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const project = await updateProject(params.id, body)
        
        return Response.json({ data: project })
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 })
    }
}

export async function DELETE(request: Request, context: any) {
    try {
        const params = await context.params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

        await deleteProject(params.id)
        
        return Response.json({ data: { success: true } })
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 })
    }
}
