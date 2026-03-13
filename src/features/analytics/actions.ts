'use server'

import { createServerClient } from '@/lib/supabase/server'
import * as queries from './queries'
import type { AnalyticsData } from './types'

export async function getAnalyticsAction(): Promise<AnalyticsData> {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Determine Target Role
    let targetRole = 'software engineer'

    // Try job applications first
    const { data: appRoles } = await supabase
        .from('job_applications')
        .select('role')
        .eq('user_id', user.id)

    if (appRoles && appRoles.length > 0) {
        const counts: Record<string, number> = {}
        appRoles.forEach(a => {
            counts[a.role] = (counts[a.role] || 0) + 1
        })
        targetRole = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
    } else {
        // Fallback to profile headline
        const { data: profile } = await supabase
            .from('profiles')
            .select('headline')
            .eq('user_id', user.id)
            .single()
        
        if (profile?.headline) {
            targetRole = profile.headline
        }
    }

    const [stats, weeklyActivity, topSkills, marketKeywords] = await Promise.all([
        queries.getApplicationStats(user.id),
        queries.getWeeklyActivity(user.id),
        queries.getTopSkillsFromProfile(user.id),
        queries.getMarketKeywordFrequency(targetRole)
    ])

    return {
        stats,
        weeklyActivity,
        topSkills,
        missingKeywords: marketKeywords
    }
}
