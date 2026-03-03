import { toggleFeaturedRepoAction } from '@/features/github/actions'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const { is_featured } = body

        if (typeof is_featured !== 'boolean') {
            return Response.json({ error: 'is_featured must be a boolean', code: 'BAD_REQUEST' }, { status: 400 })
        }

        const result = await toggleFeaturedRepoAction(id, is_featured)

        if (result.error) {
            return Response.json({ error: result.error, code: result.code }, { status: 400 })
        }

        return Response.json({ data: result.data, message: result.message }, { status: 200 })
    } catch (error) {
        console.error('[/api/github/repos/[id]/feature PATCH]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}
