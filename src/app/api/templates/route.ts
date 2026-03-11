import { createServerClient } from '@/lib/supabase/server'
import { getUserTemplates, saveTemplate } from '@/features/cv-generator/queries'

export async function GET() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const templates = await getUserTemplates(user.id)
        return Response.json({ data: templates })
    } catch (error) {
        console.error('[/api/templates GET]', error)
        return Response.json({ error: 'Failed to fetch templates', code: 'FETCH_FAILED' }, { status: 500 })
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
        const { name, latex_code } = body

        if (!name || name.trim() === '') {
            return Response.json({ error: 'Name cannot be empty', code: 'INVALID_INPUT' }, { status: 400 })
        }

        if (!latex_code || typeof latex_code !== 'string') {
            return Response.json({ error: 'LaTeX code is required', code: 'INVALID_INPUT' }, { status: 400 })
        }

        if (!latex_code.includes('\\documentclass')) {
            return Response.json({ error: 'LaTeX code must contain \\documentclass', code: 'INVALID_INPUT' }, { status: 400 })
        }

        if (!latex_code.includes('\\begin{document}')) {
            return Response.json({ error: 'LaTeX code must contain \\begin{document}', code: 'INVALID_INPUT' }, { status: 400 })
        }

        if (!latex_code.includes('\\end{document}')) {
            return Response.json({ error: 'LaTeX code must contain \\end{document}', code: 'INVALID_INPUT' }, { status: 400 })
        }

        if (!latex_code.includes('{{NAME}}')) {
            return Response.json({ error: 'LaTeX code must contain at least {{NAME}}', code: 'INVALID_INPUT' }, { status: 400 })
        }

        const template = await saveTemplate(user.id, name, latex_code)
        
        return Response.json({ data: template, message: 'Template saved' }, { status: 201 })
    } catch (error) {
        console.error('[/api/templates POST]', error)
        return Response.json({ error: 'Failed to save template', code: 'SAVE_FAILED' }, { status: 500 })
    }
}
