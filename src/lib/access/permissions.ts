import { getUserSubscription } from '@/features/subscriptions/queries'
import { getMonthlyCVGenerationCount } from '@/features/cv-generator/queries'
import type { SubscriptionTier, PlanFeatures, UserLimits } from '@/features/subscriptions/types'

export const ENABLED_FEATURES = new Set([
    'auth_email',
    'auth_github',
    'profile_basic',
    'profile_experience',
    'profile_education',
    'profile_skills',
    'profile_certificates',
    'profile_languages',
    'github_sync',
    'github_featured',
    'cv_generation',
    'cv_download_pdf',
    'cv_history',
    'dashboard_completeness',
    'job_tracker',
    'linkedin_import',
    'cover_letter',
    'ats_breakdown',
    'gmail_integration',
])

export const TIER_FEATURES: Record<SubscriptionTier, PlanFeatures> = {
    free: {
        cv_generations_per_month: 5,
        cover_letters: false,
        email_sync: false,
        ats_breakdown: false,
        linkedin_import: true, // as per instructions
    },
    pro: {
        cv_generations_per_month: 'unlimited',
        cover_letters: true,
        email_sync: true,
        ats_breakdown: true,
        linkedin_import: true,
    }
}

export async function canUserAccess(userId: string, feature: string): Promise<{
    allowed: boolean
    reason?: string
}> {
    if (!ENABLED_FEATURES.has(feature)) {
        return { allowed: false, reason: 'Feature disabled' }
    }

    const subscription = await getUserSubscription(userId)
    const tier = subscription?.tier || 'free'
    const features = TIER_FEATURES[tier]

    // Feature-specific checks
    if (feature === 'cv_generation') {
        if (features.cv_generations_per_month === 'unlimited') return { allowed: true }
        const count = await getMonthlyCVGenerationCount(userId)
        if (count >= features.cv_generations_per_month) {
            return {
                allowed: false,
                reason: `You've used all ${features.cv_generations_per_month} free CV generations this month. Upgrade to Pro for unlimited generations.`
            }
        }
        return { allowed: true }
    }

    if (feature === 'cover_letter' && !features.cover_letters) {
        return { allowed: false, reason: 'Cover letters are a Pro feature' }
    }

    if (feature === 'gmail_integration' && !features.email_sync) {
        return { allowed: false, reason: 'Email sync is a Pro feature' }
    }

    if (feature === 'ats_breakdown' && !features.ats_breakdown) {
        return { allowed: false, reason: 'ATS breakdown is a Pro feature' }
    }

    return { allowed: true }
}

export async function getUserLimits(userId: string): Promise<UserLimits> {
    const subscription = await getUserSubscription(userId)
    const tier = subscription?.tier || 'free'
    const features = TIER_FEATURES[tier]
    const cvCount = await getMonthlyCVGenerationCount(userId)

    return {
        tier,
        features,
        usage: {
            cv_generations_this_month: cvCount
        }
    }
}
