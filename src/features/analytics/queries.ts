import { createServerClient } from '@/lib/supabase/server'
import type { ApplicationStats, WeeklyActivity, TopSkill, MissingKeyword } from './types'
import { AI_ML_KEYWORDS, SOFTWARE_ENGINEERING_KEYWORDS } from './constants'
import { searchJobs } from '@/lib/jsearch/client'

export async function getApplicationStats(userId: string): Promise<ApplicationStats> {
    const supabase = await createServerClient()

    // Get basic status counts
    const { data: apps, error: appsError } = await supabase
        .from('job_applications')
        .select('status, cv_generation_id')
        .eq('user_id', userId)

    if (appsError || !apps) {
        return {
            total_applications: 0,
            total_interviews: 0,
            total_offers: 0,
            total_rejected: 0,
            response_rate: 0,
            interview_to_offer_rate: 0,
            avg_ats_score: 0
        }
    }

    const total = apps.length
    const interviews = apps.filter(a => a.status === 'interview').length
    const offers = apps.filter(a => a.status === 'offer').length
    const rejected = apps.filter(a => a.status === 'rejected').length

    // Get average ATS score
    const { data: cvs, error: cvsError } = await supabase
        .from('cv_generations')
        .select('ats_score')
        .eq('user_id', userId)
        .not('ats_score', 'is', null)

    const avgAts = cvs && cvs.length > 0
        ? cvs.reduce((acc, cv) => acc + (cv.ats_score || 0), 0) / cvs.length
        : 0

    return {
        total_applications: total,
        total_interviews: interviews,
        total_offers: offers,
        total_rejected: rejected,
        response_rate: total > 0 ? (interviews / total) * 100 : 0,
        interview_to_offer_rate: interviews > 0 ? (offers / interviews) * 100 : 0,
        avg_ats_score: Math.round(avgAts)
    }
}

export async function getWeeklyActivity(userId: string): Promise<WeeklyActivity[]> {
    const supabase = await createServerClient()

    // Get applications from last 8 weeks
    const eightWeeksAgo = new Date()
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56)

    const { data, error } = await supabase
        .from('job_applications')
        .select('applied_date, status')
        .eq('user_id', userId)
        .gte('applied_date', eightWeeksAgo.toISOString().split('T')[0])
        .order('applied_date', { ascending: true })

    if (error || !data) return []

    // Group by week
    const weeks: Record<string, WeeklyActivity> = {}

    // Initialize last 8 weeks
    for (let i = 7; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - (i * 7))
        // Get start of week (Monday)
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(d.setDate(diff))
        const weekLabel = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        weeks[weekLabel] = { week: weekLabel, applications: 0, interviews: 0 }
    }

    data.forEach(app => {
        const d = new Date(app.applied_date)
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(d.setDate(diff))
        const weekLabel = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

        if (weeks[weekLabel]) {
            weeks[weekLabel].applications++
            if (app.status === 'interview') {
                weeks[weekLabel].interviews++
            }
        }
    })

    return Object.values(weeks)
}

export async function getTopSkillsFromProfile(userId: string): Promise<TopSkill[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('skills')
        .select('name, category, level, years_experience')
        .eq('user_id', userId)

    if (error || !data) return []

    // Priority calculation
    const prioritized = data.map(s => {
        let priority = 3
        const nameLower = s.name.toLowerCase()

        if (AI_ML_KEYWORDS.some(kw => nameLower === kw.toLowerCase() || nameLower.includes(kw.toLowerCase()))) {
            priority = 1
        } else if (SOFTWARE_ENGINEERING_KEYWORDS.some(kw => nameLower === kw.toLowerCase() || nameLower.includes(kw.toLowerCase()))) {
            priority = 2
        }

        return { ...s, priority }
    })

    // Sort by priority then alphabetical
    prioritized.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        return a.name.localeCompare(b.name)
    })

    const priority1Count = prioritized.filter(s => s.priority === 1).length

    // Filter out priority 3 if priority 1 is strong (5+ skills)
    let filtered = prioritized
    if (priority1Count >= 5) {
        filtered = prioritized.filter(s => s.priority !== 3)
    }

    return filtered.slice(0, 10).map(s => {
        // Calculate count based on years or level
        let count = s.years_experience || 0
        if (count <= 0) {
            const level = s.level?.toLowerCase() || ''
            if (level === 'expert') count = 5
            else if (level === 'intermediate') count = 3
            else if (level === 'beginner') count = 1
            else count = 1
        }

        return {
            name: s.name,
            count,
            category: s.category
        }
    })
}

export async function getMissingKeywordsFrequency(userId: string): Promise<MissingKeyword[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('cv_generations')
        .select('ats_breakdown')
        .eq('user_id', userId)
        .not('ats_breakdown', 'is', null)

    if (error || !data) return []

    const frequency: Record<string, number> = {}

    data.forEach(cv => {
        const breakdown = cv.ats_breakdown as any
        const missing = breakdown?.missing_keywords || []
        missing.forEach((kw: string) => {
            frequency[kw] = (frequency[kw] || 0) + 1
        })
    })

    return Object.entries(frequency)
        .map(([keyword, count]) => ({ keyword, frequency: count }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
}

export async function getMarketKeywordFrequency(
    targetRole: string
): Promise<MissingKeyword[]> {
    try {
        // Fetch 2 pages of jobs (20 postings) for the target role
        const [page1, page2] = await Promise.all([
            searchJobs(targetRole, { page: 1, numPages: 1, datePosted: 'month' }),
            searchJobs(targetRole, { page: 2, numPages: 1, datePosted: 'month' })
        ])
        const jobs = [...page1, ...page2]

        if (jobs.length === 0) return []

        // Extract all text from job descriptions and qualifications
        const keywordCounts: Record<string, number> = {}

        const techKeywords = [
            'python', 'javascript', 'typescript', 'react', 'node', 'sql',
            'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws',
            'gcp', 'azure', 'git', 'ci/cd', 'tensorflow', 'pytorch', 'pandas',
            'numpy', 'fastapi', 'django', 'nextjs', 'graphql', 'rest', 'api',
            'machine learning', 'deep learning', 'nlp', 'llm', 'data science',
            'mlops', 'airflow', 'spark', 'kafka', 'elasticsearch', 'linux',
            'agile', 'scrum', 'java', 'golang', 'rust', 'c++', 'flutter',
            'react native', 'vue', 'angular', 'tailwind', 'figma'
        ]

        jobs.forEach(job => {
            const text = [
                job.job_description ?? '',
                ...(job.job_required_skills ?? []),
                ...(job.job_highlights?.Qualifications ?? []),
                ...(job.job_highlights?.Responsibilities ?? [])
            ].join(' ').toLowerCase()

            techKeywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    keywordCounts[keyword] = (keywordCounts[keyword] ?? 0) + 1
                }
            })
        })

        return Object.entries(keywordCounts)
            .map(([keyword, count]) => ({ keyword, frequency: count }))
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 15)
    } catch (error) {
        console.error('[JSearch] getMarketKeywordFrequency failed:', error)
        return []
    }
}
