export interface ApplicationStats {
    total_applications: number
    total_interviews: number
    total_offers: number
    total_rejected: number
    response_rate: number
    interview_to_offer_rate: number
    avg_ats_score: number
}

export interface WeeklyActivity {
    week: string
    applications: number
    interviews: number
}

export interface TopSkill {
    name: string
    count: number
    category: string | null
}

export interface MissingKeyword {
    keyword: string
    frequency: number
}

export interface AnalyticsData {
    stats: ApplicationStats
    weeklyActivity: WeeklyActivity[]
    topSkills: TopSkill[]
    missingKeywords: MissingKeyword[]
}

export interface IntelligenceReport {
    health_score: number
    overall_health: 'great' | 'good' | 'concerning' | 'critical'
    health_summary: string
    key_insights: {
        insight: string
        type: 'positive' | 'negative'
    }[]
    whats_working: string[]
    whats_not_working: string[]
    skill_recommendations: {
        skill: string
        impact: 'high' | 'medium' | 'low'
        reasoning: string
        estimated_learn_time: string
    }[]
    action_plan: {
        timeframe: string
        action: string
    }[]
    follow_ups_needed: {
        company: string
        role: string
        days_since_apply: number
        suggested_action: string
    }[]
    industry_performance: {
        industry: string
        applications: number
        responses: number
        response_rate: number
    }[]
}

export interface AnalyticsReportRow {
    id: string
    user_id: string
    report: IntelligenceReport
    generated_at: string
    data_snapshot: any
}

export interface JobSearchSnapshot {
    total_applications: number
    total_interviews: number
    total_offers: number
    total_rejected: number
    response_rate: number
    avg_ats_score: number
    applications_by_industry: Record<string, number>
    industry_stats: {
        industry: string
        applications: number
        responses: number
        response_rate: number
    }[]
    most_common_missing_keywords: string[]
    days_since_last_application: number
    no_reply_over_14_days: {
        company: string
        role: string
        days_waiting: number
    }[]
    user_skills: string[]
    recent_applications: {
        company: string
        role: string
        status: string
        applied_date: string
    }[]
}
