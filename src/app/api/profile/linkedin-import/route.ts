import { createServerClient } from '@/lib/supabase/server'
import { parseLinkedInZip } from '@/features/linkedin-import/parser'
import { confirmImportAction } from '@/features/linkedin-import/actions'
import type { LinkedInImportPreview } from '@/features/linkedin-import/types'

/** POST /api/profile/linkedin-import — parse ZIP, return preview */
export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return Response.json({ error: 'No file uploaded', code: 'BAD_REQUEST' }, { status: 400 })
        }
        if (!file.name.endsWith('.zip')) {
            return Response.json({ error: 'File must be a .zip archive', code: 'BAD_REQUEST' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const preview = parseLinkedInZip(buffer)

        return Response.json({ data: preview, message: 'ZIP parsed successfully' }, { status: 200 })
    } catch (error) {
        console.error('[/api/profile/linkedin-import POST]', error)
        return Response.json({ error: 'Failed to parse ZIP file', code: 'PARSE_FAILED' }, { status: 500 })
    }
}

/** POST /api/profile/linkedin-import/confirm — save the parsed preview */
export async function PUT(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const preview: LinkedInImportPreview = await request.json()
        const result = await confirmImportAction(preview)

        if (result.error) {
            return Response.json({ error: result.error, code: result.code }, { status: 400 })
        }

        return Response.json({ data: result.data, message: 'LinkedIn data imported successfully!' }, { status: 200 })
    } catch (error) {
        console.error('[/api/profile/linkedin-import PUT]', error)
        return Response.json({ error: 'Import failed', code: 'IMPORT_FAILED' }, { status: 500 })
    }
}
