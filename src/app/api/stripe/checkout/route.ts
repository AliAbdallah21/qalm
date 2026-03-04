import { NextResponse } from 'next/server'
import { createCheckoutSessionAction } from '@/features/subscriptions/actions'

export async function POST(request: Request) {
    if (!process.env.STRIPE_PRO_PRICE_ID) {
        return Response.json(
            { error: 'Stripe price not configured', code: 'CONFIG_ERROR' },
            { status: 500 }
        )
    }

    try {
        const url = await createCheckoutSessionAction(process.env.STRIPE_PRO_PRICE_ID!)
        return NextResponse.json({ data: { url } })
    } catch (error: any) {
        console.error('[/api/stripe/checkout POST]', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error', code: 'SERVER_ERROR' },
            { status: 500 }
        )
    }
}
