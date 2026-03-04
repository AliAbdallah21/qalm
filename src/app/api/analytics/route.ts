import { NextResponse } from 'next/server'
import { getAnalyticsAction } from '@/features/analytics/actions'

export async function GET() {
    try {
        const data = await getAnalyticsAction()
        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('[/api/analytics GET]', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error', code: 'SERVER_ERROR' },
            { status: 500 }
        )
    }
}
