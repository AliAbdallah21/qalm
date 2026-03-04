import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getCachedReport, generateIntelligenceReport } from '@/features/analytics/intelligence'
import { getUserTier } from '@/features/subscriptions/queries'
import { addDays, isAfter, parseISO } from 'date-fns'

export async function GET() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const reportData = await getCachedReport(user.id)

        if (!reportData) {
            return NextResponse.json({ data: null, message: 'No report yet' })
        }

        return NextResponse.json({ data: reportData, message: 'Success' })
    } catch (error) {
        console.error('[/api/analytics/report] GET error:', error)
        return NextResponse.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR' }, { status: 500 })
    }
}

export async function POST() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        // Rate limiting logic
        const tier = await getUserTier(user.id)
        const cachedReport = await getCachedReport(user.id)

        if (tier === 'free' && cachedReport) {
            const lastGenerated = parseISO(cachedReport.generated_at)
            const nextAvailable = addDays(lastGenerated, 7)

            if (!isAfter(new Date(), nextAvailable)) {
                return NextResponse.json({
                    error: 'Report limit reached',
                    code: 'RATE_LIMITED',
                    next_available: nextAvailable.toISOString()
                }, { status: 429 })
            }
        }

        const result = await generateIntelligenceReport(user.id)

        if (typeof result === 'string') {
            return NextResponse.json({ error: result, code: 'INSUFFICIENT_DATA' }, { status: 400 })
        }

        return NextResponse.json({ data: result, message: 'Report generated successfully' })
    } catch (error: any) {
        console.error('[/api/analytics/report] POST error:', error)
        return NextResponse.json({ error: error.message || 'Generation failed', code: 'GENERATION_FAILED' }, { status: 500 })
    }
}
