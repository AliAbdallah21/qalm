'use client'

import { useState, useEffect } from 'react'
import {
    Briefcase,
    Target,
    UserCheck,
    FileText,
    Trophy,
    ArrowUpRight,
    TrendingUp,
    AlertCircle,
    Lightbulb,
    Plus,
    Loader2,
    CheckCircle2,
    XCircle,
    BrainCircuit,
    Sparkles,
    Calendar,
    ChevronRight,
    Clock
} from 'lucide-react'
import Link from 'next/link'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts'
import type { AnalyticsData, AnalyticsReportRow, IntelligenceReport } from '@/features/analytics/types'
import { formatDistanceToNow } from 'date-fns'

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [reportRow, setReportRow] = useState<AnalyticsReportRow | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            const [analyticsRes, reportRes] = await Promise.all([
                fetch('/api/analytics'),
                fetch('/api/analytics/report')
            ])

            if (analyticsRes.ok) {
                const { data } = await analyticsRes.json()
                setData(data)
            }

            if (reportRes.ok) {
                const { data } = await reportRes.json()
                setReportRow(data)
            }
        } catch (error) {
            console.error('Failed to fetch analytics', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleGenerateReport = async () => {
        setGenerating(true)
        setError(null)
        try {
            const res = await fetch('/api/analytics/report', { method: 'POST' })
            const result = await res.json()

            if (res.ok) {
                // The post returns { data: IntelligenceReport }
                // Re-fetch to get the full AnalyticsReportRow
                await fetchData()
            } else {
                setError(result.error || 'Failed to generate report')
            }
        } catch (err) {
            setError('An error occurred while generating the report')
        } finally {
            setGenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!data || data.stats.total_applications === 0) {
        return (
            <div className="p-8 max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mx-auto w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
                    <TrendingUp className="w-12 h-12 text-blue-600" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Your Career Insights</h1>
                    <p className="text-gray-500 text-lg max-w-md mx-auto">
                        Once you start applying, Qalm will analyze your performance and provide personalized intelligence reports.
                    </p>
                </div>
                <div className="flex justify-center gap-4">
                    <Link
                        href="/cv-builder"
                        className="px-8 py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Generate Your First CV
                    </Link>
                </div>
            </div>
        )
    }

    const { stats, weeklyActivity, topSkills, missingKeywords } = data
    const report = reportRow?.report

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-gray-100">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900">Career Intelligence</h1>
                    <p className="text-gray-500 mt-2 text-lg">AI-powered insights and raw application data.</p>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="text-gray-400 flex items-center gap-1.5 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <Clock className="w-4 h-4" />
                        Updated {formatDistanceToNow(new Date(reportRow?.generated_at || data.weeklyActivity[0]?.week || new Date()), { addSuffix: true })}
                    </div>
                </div>
            </div>

            {/* SECTION 1: AI INTELLIGENCE REPORT */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-indigo-200 shadow-lg">
                            <BrainCircuit className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">AI Deep Analysis</h2>
                            <p className="text-sm text-gray-400 font-medium">Insights based on your actual performance data.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        disabled={generating}
                        className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing Data...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                                {report ? 'Regenerate Report' : 'Generate Intelligence Report'}
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600 animate-in slide-in-from-top-4">
                        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <div className="text-sm font-medium">{error}</div>
                    </div>
                )}

                {report ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Health Score Card */}
                        <div className="lg:col-span-12 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row items-center gap-10">
                            <div className="relative">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-gray-100"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="58"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={364.4}
                                        strokeDashoffset={364.4 - (364.4 * report.health_score) / 100}
                                        className={`${report.health_score >= 80 ? 'text-emerald-500' : report.health_score >= 60 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black text-gray-900">{report.health_score}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${report.overall_health === 'great' ? 'bg-emerald-100 text-emerald-800' :
                                            report.overall_health === 'good' ? 'bg-blue-100 text-blue-800' :
                                                report.overall_health === 'concerning' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-rose-100 text-rose-800'
                                        }`}>
                                        Status: {report.overall_health}
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-gray-900 leading-tight">
                                    {report.health_summary}
                                </p>
                            </div>
                        </div>

                        {/* Insights & Action Plan */}
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <Lightbulb className="text-amber-500 w-5 h-5" />
                                    Key Data Insights
                                </h3>
                                <div className="space-y-4">
                                    {report.key_insights.map((insight, idx) => (
                                        <div key={idx} className="flex gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-100 transition-colors">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${insight.type === 'positive' ? 'bg-emerald-500 shadow-emerald-200' : 'bg-rose-500 shadow-rose-200'} shadow-lg`} />
                                            <p className="text-sm font-medium text-gray-700 leading-relaxed">{insight.insight}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                                <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="text-blue-500 w-5 h-5" />
                                    Immediate Action Plan
                                </h3>
                                <div className="space-y-4">
                                    {report.action_plan.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-blue-50/30">
                                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest">{item.timeframe}</p>
                                                <p className="text-sm font-bold text-gray-800">{item.action}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Working vs Not Working & Follow-ups */}
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                                <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    What's Working
                                </h3>
                                <div className="space-y-3">
                                    {report.whats_working.map((item, i) => (
                                        <div key={i} className="text-sm font-medium text-gray-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                                <h3 className="text-sm font-black text-rose-600 uppercase tracking-widest flex items-center gap-2">
                                    <XCircle size={16} />
                                    What's Underperforming
                                </h3>
                                <div className="space-y-3">
                                    {report.whats_not_working.map((item, i) => (
                                        <div key={i} className="text-sm font-medium text-gray-600 bg-rose-50/50 p-3 rounded-xl border border-rose-100/50">
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                                <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={16} />
                                    Follow-ups Required
                                </h3>
                                <div className="space-y-3">
                                    {report.follow_ups_needed.length > 0 ? report.follow_ups_needed.map((item, i) => (
                                        <div key={i} className="group p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 hover:border-indigo-200 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="font-bold text-gray-900 text-sm">{item.company}</div>
                                                <div className="text-[10px] font-black text-gray-400">{item.days_since_apply}d ago</div>
                                            </div>
                                            <p className="text-xs text-indigo-700 font-bold bg-indigo-50 px-2 py-1 rounded inline-block">{item.suggested_action}</p>
                                        </div>
                                    )) : (
                                        <div className="text-xs text-gray-400 italic py-4 text-center">No immediate follow-ups identified.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Skill Gaps & Industry */}
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                                <h3 className="text-lg font-black text-gray-900">Recommended Skills</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {report.skill_recommendations.map((skill, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-slate-50 space-y-3 group hover:border-indigo-300 transition-all">
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-gray-900 uppercase tracking-tight">{skill.skill}</span>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${skill.impact === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {skill.impact} impact
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{skill.reasoning}</p>
                                            <div className="pt-2 border-t border-gray-200/50 flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                                <Clock size={10} />
                                                Est: {skill.estimated_learn_time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-6">
                                <h3 className="text-lg font-black text-gray-900">Industry Performance</h3>
                                <div className="space-y-5">
                                    {report.industry_performance.map((item, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{item.industry}</span>
                                                <span className="text-xs font-bold text-gray-400 italic">{item.responses}/{item.applications} replied</span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-indigo-600 transition-all duration-1000 ease-out"
                                                    style={{ width: `${item.response_rate}%` }}
                                                />
                                            </div>
                                            <div className="text-right text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                                                {item.response_rate}% Success
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-16 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                            <BrainCircuit className="w-10 h-10 text-indigo-600 opacity-40" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-gray-900">Unlock Career Intelligence</h3>
                            <p className="text-gray-400 max-w-sm mx-auto">
                                Generate your first report to get a brutally honest analysis of your job search, skill gaps, and an actual action plan.
                            </p>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                                Health check on application volume
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                                Industry conversion analysis
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                                Personalized skill gap detection
                            </li>
                            <li className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                                Immediate follow-up reminders
                            </li>
                        </ul>
                    </div>
                )}
            </section>

            {/* SECTION 2: RAW DATA (Existing Charts) */}
            <section className="space-y-8 pt-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
                        <Briefcase className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900">Raw Performance Data</h2>
                        <p className="text-sm text-gray-400 font-medium">Historical metrics and trend charts.</p>
                    </div>
                </div>

                {/* Row 1: Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <StatCard
                        title="Applications"
                        value={stats.total_applications}
                        icon={Briefcase}
                        color="bg-blue-50 text-blue-600"
                    />
                    <StatCard
                        title="Response Rate"
                        value={`${Math.round(stats.response_rate)}%`}
                        icon={Target}
                        color="bg-green-50 text-green-600"
                        valColor={stats.response_rate > 30 ? 'text-green-600' : 'text-amber-600'}
                    />
                    <StatCard
                        title="Interview Rate"
                        value={`${Math.round(stats.interview_to_offer_rate)}%`}
                        icon={UserCheck}
                        color="bg-amber-50 text-amber-600"
                        valColor={stats.interview_to_offer_rate > 20 ? 'text-green-600' : 'text-amber-600'}
                    />
                    <StatCard
                        title="Avg ATS Score"
                        value={`${stats.avg_ats_score}`}
                        icon={FileText}
                        color="bg-indigo-50 text-indigo-600"
                        valColor={stats.avg_ats_score >= 80 ? 'text-green-600' : 'text-amber-600'}
                    />
                    <StatCard
                        title="Offers"
                        value={stats.total_offers}
                        icon={Trophy}
                        color="bg-yellow-50 text-yellow-600"
                    />
                </div>

                {/* Row 2: Chart & Keywords */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Weekly Activity */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Application Activity</h2>
                                <p className="text-sm text-gray-500 italic">Last 8 weeks of performance</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="week"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="applications" name="Applied" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={32} />
                                    <Bar dataKey="interviews" name="Interviews" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ATS Insights */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Requirement Frequency</h2>
                            <p className="text-sm text-gray-500 mt-1 uppercase font-black text-[10px] tracking-widest text-indigo-500">Market Pattern Analysis</p>
                        </div>

                        {missingKeywords.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
                                <Lightbulb className="w-12 h-12 text-gray-200" />
                                <p className="text-sm text-gray-400">Generate more CVs to see detailed requirement patterns.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                                {missingKeywords.map((kw, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm">
                                                {i + 1}
                                            </div>
                                            <span className="font-semibold text-gray-900 uppercase tracking-tight">{kw.keyword}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-gray-400 uppercase italic">Seen in</span>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold leading-none">
                                                {kw.frequency} jobs
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Funnel & Skills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="mb-10 text-center">
                            <h2 className="text-xl font-bold text-gray-900">Success Pipeline</h2>
                            <p className="text-sm text-gray-500 mt-1 italic">Visualizing your success from application to offer.</p>
                        </div>
                        <div className="relative space-y-8">
                            <FunnelStep label="Applied" count={stats.total_applications} percent={100} color="bg-blue-600" />
                            <FunnelStep label="Interviewed" count={stats.total_interviews} percent={Math.round(stats.response_rate)} color="bg-amber-500" conversionLabel="Response rate" />
                            <FunnelStep label="Offered" count={stats.total_offers} percent={Math.round((stats.total_offers / stats.total_applications) * 100)} color="bg-emerald-500" conversionLabel="Overall success" />
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Top Skills in Profile</h2>
                                <p className="text-sm text-gray-500 mt-1">Skills currently showcased in your tailored CVs.</p>
                            </div>
                            <Link href="/profile" className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg bg-gray-50 border border-gray-100">
                                <ArrowUpRight size={20} />
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {topSkills.map((skill, i) => (
                                <span key={i} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${skill.category === 'AI/ML' ? 'bg-indigo-50 border-indigo-100 text-indigo-700' :
                                        skill.category === 'Backend' ? 'bg-slate-50 border-slate-200 text-slate-700' :
                                            'bg-gray-50 border-gray-100 text-gray-600'
                                    }`}>
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, valColor = 'text-gray-900' }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-all">
            <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 mb-4 ${color} shadow-sm`}>
                <Icon size={24} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <p className={`text-3xl font-black tracking-tight ${valColor}`}>{value}</p>
        </div>
    )
}

function FunnelStep({ label, count, percent, color, conversionLabel }: any) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-900 opacity-60 italic">{count} instances</span>
            </div>
            <div className="relative h-4 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                <div
                    className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out flex items-center justify-end px-3 text-[10px] font-black text-white ${color}`}
                    style={{ width: `${Math.max(percent, 5)}%` }}
                >
                    {percent > 15 && `${percent}%`}
                </div>
            </div>
            {conversionLabel && (
                <p className="text-[10px] text-gray-400 text-right uppercase tracking-[0.2em] font-black">
                    {conversionLabel}: <span className="text-black">{percent}%</span>
                </p>
            )}
        </div>
    )
}
