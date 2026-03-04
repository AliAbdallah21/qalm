import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { upsertUserSubscriptionAdmin, upsertUserSubscriptionByCustomerIdAdmin } from '@/features/subscriptions/queries'
import { createAdminClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!
    const admin = createAdminClient()

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    try {
        console.log(`[Stripe Webhook] Received event: ${event.type}`)

        switch (event.type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as any
                const customerId = subscription.customer as string
                let userId = subscription.metadata?.userId

                console.log(`[Stripe Webhook] Processing ${event.type} for customer ${customerId}`)
                console.log(`[Stripe Webhook] Initial userId from metadata: ${userId}`)

                // Fallback 1: Look up by customer ID in user_subscriptions
                if (!userId) {
                    const existingSub = await upsertUserSubscriptionByCustomerIdAdmin(customerId, {
                        stripe_sub_id: subscription.id,
                        current_period_end: subscription.current_period_end
                            ? new Date(subscription.current_period_end * 1000).toISOString()
                            : null,
                    }, admin)
                    if (existingSub) {
                        userId = existingSub.user_id
                        console.log(`[Stripe Webhook] Resolved userId via customer lookup: ${userId}`)
                    }
                }

                // Fallback 2: Look up by email if available on the customer
                if (!userId) {
                    const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
                    if (customer.email) {
                        const { getProfileByEmail } = await import('@/features/profile/queries')
                        const profile = await getProfileByEmail(customer.email, admin)
                        if (profile) {
                            userId = profile.user_id
                            console.log(`[Stripe Webhook] Resolved userId via email lookup: ${userId}`)
                        }
                    }
                }

                if (userId) {
                    console.log(`[Stripe Webhook] Upserting subscription for userId: ${userId} to PRO`)
                    await upsertUserSubscriptionAdmin(userId, {
                        tier: 'pro',
                        stripe_customer_id: customerId,
                        stripe_sub_id: subscription.id,
                        current_period_end: subscription.current_period_end
                            ? new Date(subscription.current_period_end * 1000).toISOString()
                            : null,
                    }, admin)
                } else {
                    console.error(`[Stripe Webhook] Could not resolve userId for customer ${customerId}`)
                }
                break
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any
                const customerId = subscription.customer as string
                let userId = subscription.metadata?.userId

                console.log(`[Stripe Webhook] Processing ${event.type} for customer ${customerId}`)

                if (!userId) {
                    const existingSub = await upsertUserSubscriptionByCustomerIdAdmin(customerId, {
                        stripe_sub_id: null,
                        current_period_end: null,
                    }, admin)
                    if (existingSub) userId = existingSub.user_id
                }

                if (userId) {
                    console.log(`[Stripe Webhook] Downgrading userId: ${userId} to FREE`)
                    await upsertUserSubscriptionAdmin(userId, {
                        tier: 'free',
                        stripe_sub_id: null,
                        current_period_end: null,
                    }, admin)
                }
                break
            }
        }

        return NextResponse.json({ received: true })
    } catch (error: any) {
        console.error('Webhook handler failed:', error)
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
    }
}
