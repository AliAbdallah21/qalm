import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { callAI } from '@/lib/ai/client'
import { buildIntelligenceReportPrompt } from '@/lib/ai/prompts'
import { AI_ML_KEYWORDS, SOFTWARE_ENGINEERING_KEYWORDS } from './constants'
import type { IntelligenceReport, JobSearchSnapshot, AnalyticsReportRow } from './types'
import type { JobApplication } from '@/features/job-tracker/types'
import type { CVGeneration } from '@/features/cv-generator/types'
import { differenceInDays, parseISO } from 'date-fns'

export async function buildJobSearchSnapshot(userId: string): Promise<JobSearchSnapshot> {
    const supabase = await createServerClient()

    // 1. Fetch Job Applications
    const { data: applications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId)
        .order('applied_date', { ascending: false })

    const apps = (applications || []) as JobApplication[]

    // 2. Fetch CV Generations for ATS data
    const { data: cvs } = await supabase
        .from('cv_generations')
        .select('ats_score, ats_breakdown, company_name')
        .eq('user_id', userId)

    const cvGenerations = (cvs || []) as Partial<CVGeneration>[]

    // 3. Fetch User Profile Skills
    const { data: skills } = await supabase
        .from('skills')
        .select('name')
        .eq('user_id', userId)

    // Filter skills for AI context - Only Priority 1 and 2
    // Never pass soft skills or office tools to the AI
    const userSkills = (skills || [])
        .map(s => s.name)
        .filter(name => {
            const nameLower = name.toLowerCase()
            return AI_ML_KEYWORDS.some(kw => nameLower === kw.toLowerCase() || nameLower.includes(kw.toLowerCase())) ||
                SOFTWARE_ENGINEERING_KEYWORDS.some(kw => nameLower === kw.toLowerCase() || nameLower.includes(kw.toLowerCase()))
        })

    // 4. Calculations
    const total_applications = apps.length
    const total_interviews = apps.filter(a => a.status === 'interview').length
    const total_offers = apps.filter(a => a.status === 'offer').length
    const total_rejected = apps.filter(a => a.status === 'rejected').length

    const response_rate = total_applications > 0 ? (total_interviews / total_applications) * 100 : 0

    const scores = cvGenerations.map(c => c.ats_score).filter((s): s is number => s !== null && s !== undefined)
    const avg_ats_score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

    // Extract industry from company names (improved detection)
    const industries: Record<string, number> = {}
    const industryResponses: Record<string, number> = {}

    const industryMap: Record<string, string> = {
        // Tech
        'google': 'Tech', 'microsoft': 'Tech', 'amazon': 'Tech',
        'apple': 'Tech', 'meta': 'Tech', 'netflix': 'Tech',
        'uber': 'Tech', 'airbnb': 'Tech', 'spotify': 'Tech',
        'twitter': 'Tech', 'x.com': 'Tech', 'openai': 'Tech',
        'anthropic': 'Tech', 'nvidia': 'Tech', 'intel': 'Tech',
        'oracle': 'Tech', 'sap': 'Tech', 'salesforce': 'Tech',
        'adobe': 'Tech', 'atlassian': 'Tech', 'github': 'Tech',
        // Telecom
        'vodafone': 'Telecom', 'orange': 'Telecom', 'etisalat': 'Telecom',
        'we': 'Telecom', 'telecom': 'Telecom',
        // Finance
        'hsbc': 'Finance', 'barclays': 'Finance', 'jpmorgan': 'Finance',
        'goldman': 'Finance', 'cib': 'Finance', 'nbe': 'Finance',
        'banque': 'Finance', 'bank': 'Finance', 'fawry': 'Fintech',
        'paymob': 'Fintech', 'stripe': 'Fintech', 'paypal': 'Fintech',
        // Consulting
        'mckinsey': 'Consulting', 'deloitte': 'Consulting',
        'accenture': 'Consulting', 'pwc': 'Consulting', 'kpmg': 'Consulting',
        // E-commerce
        'noon': 'E-commerce', 'jumia': 'E-commerce',
        'talabat': 'E-commerce', 'instashop': 'E-commerce',
        // Keywords fallback
        'tech': 'Tech', 'software': 'Tech', 'ai': 'Tech', 'ml': 'Tech',
        'data': 'Tech', 'fintech': 'Fintech', 'health': 'Healthcare',
        'pharma': 'Healthcare', 'hospital': 'Healthcare', 'clinic': 'Healthcare',
        'crypto': 'Crypto', 'saas': 'Tech', 'cloud': 'Tech',
        'media': 'Media', 'news': 'Media', 'game': 'Gaming',
        'logistic': 'Logistics', 'transport': 'Logistics', 'delivery': 'Logistics'
    }

    function detectIndustry(companyName: string): string {
        const lower = companyName.toLowerCase()
        // Check exact company name match first
        for (const [key, industry] of Object.entries(industryMap)) {
            if (lower === key || lower.startsWith(key)) return industry
        }
        // Fallback to keyword contains match
        for (const [key, industry] of Object.entries(industryMap)) {
            if (lower.includes(key)) return industry
        }
        return 'Other'
    }

    apps.forEach(app => {
        const foundIndustry = detectIndustry(app.company)
        industries[foundIndustry] = (industries[foundIndustry] || 0) + 1
        if (app.status === 'interview' || app.status === 'offer') {
            industryResponses[foundIndustry] = (industryResponses[foundIndustry] || 0) + 1
        }
    })

    const industry_stats = Object.keys(industries).map(ind => ({
        industry: ind,
        applications: industries[ind],
        responses: industryResponses[ind] || 0,
        response_rate: (industryResponses[ind] || 0) / industries[ind] * 100
    }))

    // Extract missing keywords
    const missingKeywordsMap: Record<string, number> = {}
    cvGenerations.forEach(cv => {
        const breakdown = cv.ats_breakdown as any
        if (breakdown?.missing_keywords) {
            (breakdown.missing_keywords as string[]).forEach(kw => {
                missingKeywordsMap[kw] = (missingKeywordsMap[kw] || 0) + 1
            })
        }
    })

    const most_common_missing_keywords = Object.entries(missingKeywordsMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([kw]) => kw)

    const lastApp = apps[0]
    const days_since_last_application = lastApp
        ? differenceInDays(new Date(), parseISO(lastApp.applied_date))
        : 999

    const no_reply_over_14_days = apps
        .filter(a => a.status === 'applied' && differenceInDays(new Date(), parseISO(a.applied_date)) > 14)
        .map(a => ({
            company: a.company,
            role: a.role,
            days_waiting: differenceInDays(new Date(), parseISO(a.applied_date))
        }))

    return {
        total_applications,
        total_interviews,
        total_offers,
        total_rejected,
        response_rate,
        avg_ats_score,
        applications_by_industry: industries,
        industry_stats,
        most_common_missing_keywords,
        days_since_last_application,
        no_reply_over_14_days,
        user_skills: userSkills,
        recent_applications: apps.slice(0, 5).map(a => ({
            company: a.company,
            role: a.role,
            status: a.status,
            applied_date: a.applied_date
        }))
    }
}

export async function generateIntelligenceReport(userId: string): Promise<IntelligenceReport | string> {
    const snapshot = await buildJobSearchSnapshot(userId)

    if (snapshot.total_applications < 3) {
        return "Apply to at least 3 jobs to generate your first report"
    }

    const prompt = buildIntelligenceReportPrompt(snapshot)
    const response = await callAI({
        prompt,
        model: 'smart'
    })

    try {
        // Safe JSON parse with markdown stripping
        const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim()
        const report = JSON.parse(cleanJson) as IntelligenceReport

        const admin = createAdminClient()
        const { error } = await admin
            .from('analytics_reports')
            .upsert({
                user_id: userId,
                report: report as any,
                generated_at: new Date().toISOString(),
                data_snapshot: snapshot as any
            }, { onConflict: 'user_id' })

        if (error) throw error

        return report
    } catch (e) {
        console.error('Failed to parse or save intelligence report:', e)
        throw new Error('Intelligence report generation failed')
    }
}

export async function getCachedReport(userId: string): Promise<AnalyticsReportRow | null> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('analytics_reports')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

    if (error || !data) return null
    return data as AnalyticsReportRow
}
