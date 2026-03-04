import { NextResponse } from 'next/server'
import { createPortalSessionAction } from '@/features/subscriptions/actions'

export async function GET() {
    try {
        const url = await createPortalSessionAction()
        return NextResponse.json({ data: { url } })
    } catch (error: any) {
        console.error('[/api/stripe/portal GET]', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error', code: 'SERVER_ERROR' },
            { status: 500 }
        )
    }
}
