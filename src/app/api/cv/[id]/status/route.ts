import { createServerClient } from '@/lib/supabase/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { data, error } = await supabase
        .from('cv_generations')
        .select('pdf_status, pdf_url, pdf_error')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()
    if (error || !data) {
        return Response.json({ error: 'Not found' }, { status: 404 })
    }
    return Response.json({
        pdf_status: data.pdf_status,
        pdf_url: data.pdf_url,
        pdf_error: data.pdf_error
    })
}
