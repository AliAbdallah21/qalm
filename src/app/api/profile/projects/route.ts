import { createServerClient } from '@/lib/supabase/server'
import { createProject, getUserProjects } from '@/features/projects/queries'

export async function GET() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

        const projects = await getUserProjects(user.id)
        return Response.json({ data: projects })
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const project = await createProject(user.id, body)
        
        return Response.json({ data: project })
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 400 })
    }
}
