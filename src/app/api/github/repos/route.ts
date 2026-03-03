import { fetchStoredReposAction } from '@/features/github/actions'

export async function GET(request: Request) {
    try {
        const result = await fetchStoredReposAction()

        if (result.error) {
            return Response.json({ error: result.error, code: result.code }, { status: 400 })
        }

        return Response.json({ data: result.data, message: result.message }, { status: 200 })
    } catch (error) {
        console.error('[/api/github/repos GET]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}
