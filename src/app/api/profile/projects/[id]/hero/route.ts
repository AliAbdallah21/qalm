import { createServerClient } from '@/lib/supabase/server'
import { toggleProjectHero } from '@/features/projects/queries'

export async function PATCH(request: Request, context: any) {
    try {
        const params = await context.params
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        await toggleProjectHero(params.id, body.is_hero)
        
        return Response.json({ data: { success: true } })
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 })
    }
}
