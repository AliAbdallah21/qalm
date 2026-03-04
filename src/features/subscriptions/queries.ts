import { createServerClient } from '@/lib/supabase/server'
import type { UserSubscription, SubscriptionTier } from './types'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getUserSubscription(userId: string, client?: SupabaseClient): Promise<UserSubscription | null> {
    const supabase = client || await createServerClient()
    const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error) return null
    return data as UserSubscription
}

export async function getUserTier(userId: string, client?: SupabaseClient): Promise<SubscriptionTier> {
    const sub = await getUserSubscription(userId, client)
    return (sub?.tier as SubscriptionTier) || 'free'
}

export async function upsertUserSubscription(
    userId: string,
    data: Partial<Omit<UserSubscription, 'id' | 'user_id' | 'created_at'>>,
    client?: SupabaseClient
): Promise<UserSubscription> {
    const supabase = client || await createServerClient()
    const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .upsert({
            user_id: userId,
            ...data,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
        .select()
        .single()

    if (error) throw error
    return subscription as UserSubscription
}

export async function upsertUserSubscriptionAdmin(
    userId: string,
    data: Partial<Omit<UserSubscription, 'id' | 'user_id' | 'created_at'>>,
    adminClient: SupabaseClient
): Promise<UserSubscription> {
    return upsertUserSubscription(userId, data, adminClient)
}

export async function getOrCreateFreeSubscription(userId: string): Promise<UserSubscription> {
    const existing = await getUserSubscription(userId)
    if (existing) return existing

    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
            user_id: userId,
            tier: 'free' as SubscriptionTier
        })
        .select()
        .single()

    if (error) throw error
    return data as UserSubscription
}

export async function getSubscriptionByCustomerId(customerId: string, client?: SupabaseClient): Promise<UserSubscription | null> {
    const supabase = client || await createServerClient()
    const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('stripe_customer_id', customerId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) return null
    return data as UserSubscription
}

export async function upsertUserSubscriptionByCustomerId(
    customerId: string,
    data: Partial<Omit<UserSubscription, 'id' | 'user_id' | 'created_at'>>,
    client?: SupabaseClient
): Promise<UserSubscription | null> {
    const supabase = client || await createServerClient()

    // First find the user_id for this customer
    const existing = await getSubscriptionByCustomerId(customerId, supabase)
    if (!existing) return null

    const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId)
        .select()
        .single()

    if (error) throw error
    return subscription as UserSubscription
}

export async function upsertUserSubscriptionByCustomerIdAdmin(
    customerId: string,
    data: Partial<Omit<UserSubscription, 'id' | 'user_id' | 'created_at'>>,
    adminClient: SupabaseClient
): Promise<UserSubscription | null> {
    return upsertUserSubscriptionByCustomerId(customerId, data, adminClient)
}
