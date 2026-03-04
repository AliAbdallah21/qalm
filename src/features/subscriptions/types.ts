export type SubscriptionTier = 'free' | 'pro'

export interface UserSubscription {
    id: string
    user_id: string
    tier: SubscriptionTier
    stripe_customer_id: string | null
    stripe_sub_id: string | null
    current_period_end: string | null
    created_at: string
    updated_at: string
}

export interface PlanFeatures {
    cv_generations_per_month: number | 'unlimited'
    cover_letters: boolean
    email_sync: boolean
    ats_breakdown: boolean
    linkedin_import: boolean
}

export interface UserLimits {
    tier: SubscriptionTier
    features: PlanFeatures
    usage: {
        cv_generations_this_month: number
    }
}
