import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { upsertUserSubscription } from '@/features/subscriptions/queries'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
})

export async function GET() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Get current subscription record
        const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (!sub?.stripe_customer_id) {
            return NextResponse.json({ message: 'No Stripe customer associated with this user.' })
        }

        // 2. Fetch active subscriptions from Stripe
        const subscriptions = await stripe.subscriptions.list({
            customer: sub.stripe_customer_id,
            status: 'active',
            limit: 1,
        })

        if (subscriptions.data.length > 0) {
            const stripeSub = subscriptions.data[0] as any
            // Sync to DB
            const updated = await upsertUserSubscription(user.id, {
                tier: 'pro',
                stripe_customer_id: sub.stripe_customer_id,
                stripe_sub_id: stripeSub.id,
                current_period_end: stripeSub.current_period_end
                    ? new Date(stripeSub.current_period_end * 1000).toISOString()
                    : null,
            })
            return NextResponse.json({ success: true, tier: updated.tier })
        } else {
            // No active sub, ensure free tier
            const updated = await upsertUserSubscription(user.id, {
                tier: 'free',
                stripe_sub_id: null,
                current_period_end: null,
            })
            return NextResponse.json({ success: true, tier: updated.tier, message: 'No active subscription found on Stripe.' })
        }
    } catch (error: any) {
        console.error('[/api/stripe/sync-subscription GET]', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
