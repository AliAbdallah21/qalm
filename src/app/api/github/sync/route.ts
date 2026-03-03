import { syncGithubReposAction } from '@/features/github/actions'

export async function POST(request: Request) {
    try {
        const result = await syncGithubReposAction()

        if (result.error) {
            return Response.json({ error: result.error, code: result.code }, { status: 400 })
        }

        return Response.json({ data: result.data, message: result.message }, { status: 200 })
    } catch (error) {
        console.error('[/api/github/sync POST]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}
