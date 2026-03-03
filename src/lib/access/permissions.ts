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
])

export async function canUserAccess(userId: string, feature: string): Promise<boolean> {
    // If feature is not in enabled set, it's disabled regardless of tier
    if (!ENABLED_FEATURES.has(feature)) {
        return false
    }

    // Phase 1: all enabled features are free for everyone
    return true

    /* 
     * ==========================================
     * TODO: Phase 4 — Monetization (Stripe)
     * ==========================================
     * 
     * When rolling out Phase 4, the check above (return true)
     * should be removed or modified to implement tier checking:
     * 
     * const subscription = await getUserSubscription(userId)
     * const requiredTier = FEATURE_TIER_MAP[feature]
     * return checkTierAccess(subscription?.tier || 'free', requiredTier)
     * 
     * ==========================================
     */
}
