'use server'

import { createServerClient } from '@/lib/supabase/server'
import * as queries from './queries'
import type { AnalyticsData } from './types'

export async function getAnalyticsAction(): Promise<AnalyticsData> {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const [stats, weeklyActivity, topSkills, missingKeywords] = await Promise.all([
        queries.getApplicationStats(user.id),
        queries.getWeeklyActivity(user.id),
        queries.getTopSkillsFromProfile(user.id),
        queries.getMissingKeywordsFrequency(user.id)
    ])

    return {
        stats,
        weeklyActivity,
        topSkills,
        missingKeywords
    }
}
