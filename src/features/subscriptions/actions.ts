'use server'

import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'
import { getUserSubscription, getOrCreateFreeSubscription } from './queries'
import { redirect } from 'next/navigation'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-02-25.clover',
})

export async function getSubscriptionAction() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    return await getOrCreateFreeSubscription(user.id)
}

export async function createCheckoutSessionAction(priceId: string) {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const subscription = await getOrCreateFreeSubscription(user.id)

    const session = await stripe.checkout.sessions.create({
        customer: subscription.stripe_customer_id || undefined,
        customer_email: subscription.stripe_customer_id ? undefined : user.email,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        subscription_data: {
            metadata: {
                userId: user.id,
            },
        },
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?success=true`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings?canceled=true`,
        metadata: {
            userId: user.id,
        },
    })

    if (!session.url) throw new Error('Failed to create checkout session')

    return session.url
}

export async function createPortalSessionAction() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const subscription = await getUserSubscription(user.id)
    if (!subscription?.stripe_customer_id) {
        throw new Error('No stripe customer found')
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: subscription.stripe_customer_id,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings`,
    })

    return session.url
}
