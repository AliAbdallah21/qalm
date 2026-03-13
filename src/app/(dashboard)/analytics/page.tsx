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
                        className="px-8 py-4 bg-text-main text-bg-primary font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
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
        <div className="space-y-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-default pb-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight text-text-main italic">
                        Career Intelligence
                    </h1>
                    <p className="text-text-secondary font-medium text-lg">
                        Advanced predictive modeling and performance analytics.
                    </p>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <div className="flex items-center gap-1.5 bg-bg-surface px-5 py-2.5 rounded-full border border-border-default">
                        <Clock size={14} className="text-accent-blue" />
                        SYNCED {formatDistanceToNow(new Date(reportRow?.generated_at || data.weeklyActivity[0]?.week || new Date()), { addSuffix: true })}
                    </div>
                </div>
            </div>

            {/* SECTION 1: AI INTELLIGENCE REPORT */}
            <section className="space-y-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center shadow-lg shadow-accent-blue/5">
                            <BrainCircuit className="text-accent-blue w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-text-main italic tracking-tight">AI Neural Insights</h2>
                            <p className="text-sm text-text-muted font-bold tracking-wide uppercase">Generative analysis of your career trajectory.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        disabled={generating}
                        className="group flex items-center gap-3 px-8 py-4 bg-text-main text-bg-primary font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing Neural Data...
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                                {report ? 'Refresh Neural Map' : 'Generate Intelligence Report'}
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="p-5 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-4 text-danger animate-in slide-in-from-top-4">
                        <AlertCircle size={20} />
                        <div className="text-sm font-black uppercase tracking-widest">{error}</div>
                    </div>
                )}

                {report ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {/* Health Score Card */}
                        <div className="lg:col-span-12 bg-bg-surface border border-border-default rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/5 blur-[100px] rounded-full -mr-48 -mt-48 group-hover:bg-accent-blue/10 transition-colors" />

                            <div className="relative z-10">
                                <svg className="w-40 h-40 transform -rotate-90">
                                    <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-border-subtle" />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="74"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={464.7}
                                        strokeDashoffset={464.7 - (464.7 * report.health_score) / 100}
                                        className={`${report.health_score >= 80 ? 'text-success' : report.health_score >= 60 ? 'text-warning' : 'text-danger'} transition-all duration-1000 ease-out`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black text-text-main italic">{report.health_score}</span>
                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Score</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${report.overall_health === 'great' ? 'bg-success/10 text-success border-success/20' :
                                        report.overall_health === 'good' ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/20' :
                                            report.overall_health === 'concerning' ? 'bg-warning/10 text-warning border-warning/20' :
                                                'bg-danger/10 text-danger border-danger/20'
                                        }`}>
                                        Status: {report.overall_health}
                                    </span>
                                </div>
                                <p className="text-3xl font-black text-text-main leading-tight italic tracking-tight">
                                    {report.health_summary}
                                </p>
                            </div>
                        </div>

                        {/* Insights & Action Plan */}
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-bg-surface border border-border-default rounded-[2rem] p-10 space-y-8">
                                <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Lightbulb size={20} className="text-warning" />
                                    Core Intelligence Gaps
                                </h3>
                                <div className="space-y-5">
                                    {report.key_insights.map((insight, idx) => (
                                        <div key={idx} className="flex gap-4 p-5 bg-bg-primary/50 rounded-2xl border border-border-default group hover:border-accent-blue/30 transition-all">
                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${insight.type === 'positive' ? 'bg-success shadow-success' : 'bg-danger shadow-danger'} shadow-lg`} />
                                            <p className="text-sm font-bold text-text-secondary leading-relaxed">{insight.insight}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-bg-surface border border-border-default rounded-[2rem] p-10 space-y-8">
                                <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-3">
                                    <TrendingUp size={20} className="text-accent-blue" />
                                    Dynamic Strategy Map
                                </h3>
                                <div className="space-y-5">
                                    {report.action_plan.map((item, idx) => (
                                        <div key={idx} className="flex gap-5 p-5 rounded-2xl border border-accent-blue/10 bg-accent-blue/5">
                                            <div className="w-10 h-10 rounded-xl bg-accent-blue text-white flex items-center justify-center font-black text-sm italic shadow-lg shadow-accent-blue/20">
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-1.5 min-w-0 flex-1">
                                                <p className="text-[10px] items-center gap-2 uppercase font-black text-accent-blue tracking-widest flex">
                                                    <Clock size={10} />
                                                    {item.timeframe}
                                                </p>
                                                <p className="text-sm font-bold text-text-main leading-snug">{item.action}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Success/Failure & Follow-ups */}
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-bg-surface border border-border-default rounded-[2rem] p-8 space-y-6">
                                <h3 className="text-[10px] font-black text-success uppercase tracking-[0.2em] flex items-center gap-3">
                                    <CheckCircle2 size={16} />
                                    Winning Signals
                                </h3>
                                <div className="space-y-3">
                                    {report.whats_working.map((item, i) => (
                                        <div key={i} className="text-xs font-bold text-text-secondary bg-success/5 p-4 rounded-xl border border-success/10 leading-relaxed italic">
                                            "{item}"
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-bg-surface border border-border-default rounded-[2rem] p-8 space-y-6">
                                <h3 className="text-[10px] font-black text-danger uppercase tracking-[0.2em] flex items-center gap-3">
                                    <XCircle size={16} />
                                    Friction Points
                                </h3>
                                <div className="space-y-3">
                                    {report.whats_not_working.map((item, i) => (
                                        <div key={i} className="text-xs font-bold text-text-secondary bg-danger/5 p-4 rounded-xl border border-danger/10 leading-relaxed italic">
                                            "{item}"
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-bg-surface border border-border-default rounded-[2rem] p-8 space-y-6">
                                <h3 className="text-[10px] font-black text-accent-blue uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Calendar size={16} />
                                    Urgent Pipeline
                                </h3>
                                <div className="space-y-3">
                                    {report.follow_ups_needed.length > 0 ? report.follow_ups_needed.map((item, i) => (
                                        <div key={i} className="group p-4 bg-bg-primary/50 rounded-2xl border border-border-default space-y-3 hover:border-accent/30 transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className="font-black text-text-main text-sm uppercase tracking-tight">{item.company}</div>
                                                <div className="text-[10px] font-black text-text-muted italic">{item.days_since_apply}d ago</div>
                                            </div>
                                            <p className="text-[10px] text-accent-blue font-black bg-accent-blue/10 px-3 py-1.5 rounded-lg border border-accent-blue/20 uppercase tracking-widest inline-block">{item.suggested_action}</p>
                                        </div>
                                    )) : (
                                        <div className="text-xs text-text-muted italic py-8 text-center bg-bg-primary/30 rounded-2xl border border-border-default border-dashed">
                                            Pipeline fully optimized
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Final Row: Skill Gaps */}
                        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-bg-surface border border-border-default rounded-[2rem] p-10 space-y-8">
                                <h3 className="text-lg font-black text-text-main italic tracking-tight">Personalized Radar</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {report.skill_recommendations.map((skill, idx) => (
                                        <div key={idx} className="p-5 rounded-2xl border border-border-default bg-bg-primary/50 space-y-4 group hover:border-accent/30 transition-all">
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-text-main uppercase tracking-[0.1em] text-xs underline decoration-accent-blue/30 underline-offset-4">{skill.skill}</span>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${skill.impact === 'high' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                                                    }`}>
                                                    {skill.impact} priority
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-secondary font-medium leading-relaxed">{skill.reasoning}</p>
                                            <div className="pt-3 border-t border-border-subtle flex items-center gap-2 text-[9px] font-black text-accent-blue uppercase tracking-widest">
                                                <Clock size={12} />
                                                EST: {skill.estimated_learn_time}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-bg-surface border border-border-default rounded-[2rem] p-10 space-y-8">
                                <h3 className="text-lg font-black text-text-main italic tracking-tight">Market Conversion Rates</h3>
                                <div className="space-y-6">
                                    {report.industry_performance.map((item, idx) => (
                                        <div key={idx} className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-black text-text-main uppercase tracking-widest">{item.industry}</span>
                                                <span className="text-[10px] font-bold text-text-muted italic tracking-wide">{item.responses} Positive Signals</span>
                                            </div>
                                            <div className="h-2 w-full bg-bg-surface-hover rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-accent-blue transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                                                    style={{ width: `${item.response_rate}%` }}
                                                />
                                            </div>
                                            <div className="text-right text-[10px] font-black text-accent-blue uppercase tracking-widest leading-none">
                                                {item.response_rate}% Success Velocity
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-bg-surface border border-dashed border-border-default rounded-[3rem] p-24 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in-95">
                        <div className="w-24 h-24 bg-accent-blue/5 rounded-[2rem] border border-accent-blue/10 flex items-center justify-center">
                            <BrainCircuit className="w-12 h-12 text-accent-blue opacity-30" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-text-main italic tracking-tight">Unlock Neural Intelligence</h3>
                            <p className="text-text-secondary font-medium max-w-sm mx-auto text-lg leading-relaxed">
                                Process your job search metadata through our career language models to identify hidden market patterns.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-left max-w-2xl mx-auto py-8">
                            <div className="flex items-center gap-4 text-xs font-black text-text-secondary uppercase tracking-widest">
                                <CheckCircle2 className="text-accent-blue w-5 h-5" />
                                Volume conversion analysis
                            </div>
                            <div className="flex items-center gap-4 text-xs font-black text-text-secondary uppercase tracking-widest">
                                <CheckCircle2 className="text-accent-blue w-5 h-5" />
                                Industry-specific velocity
                            </div>
                            <div className="flex items-center gap-4 text-xs font-black text-text-secondary uppercase tracking-widest">
                                <CheckCircle2 className="text-accent-blue w-5 h-5" />
                                Automated skill gap mapping
                            </div>
                            <div className="flex items-center gap-4 text-xs font-black text-text-secondary uppercase tracking-widest">
                                <CheckCircle2 className="text-accent-blue w-5 h-5" />
                                Predictive pipeline alerts
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* SECTION 2: RAW DATA (Charts) */}
            <section className="space-y-12 pt-16 border-t border-border-default">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-text-main text-bg-primary flex items-center justify-center shadow-2xl">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-text-main italic tracking-tight">Historical Telemetry</h2>
                        <p className="text-sm text-text-muted font-bold tracking-wide uppercase">Raw metric tracking and trend analysis.</p>
                    </div>
                </div>

                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    <StatCard title="Applications" value={stats.total_applications} icon={Briefcase} color="text-accent-blue" bg="bg-accent-blue/10" />
                    <StatCard title="Response rate" value={`${Math.round(stats.response_rate)}%`} icon={Target} color="text-success" bg="bg-success/10" />
                    <StatCard title="Interview rate" value={`${Math.round(stats.interview_to_offer_rate)}%`} icon={UserCheck} color="text-warning" bg="bg-warning/10" />
                    <StatCard title="Avg ATS score" value={`${stats.avg_ats_score}`} icon={FileText} color="text-indigo-400" bg="bg-indigo-400/10" />
                    <StatCard title="Total Offers" value={stats.total_offers} icon={Trophy} color="text-yellow-400" bg="bg-yellow-400/10" />
                </div>

                {/* Activity Table & Frequency */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[500px]">
                    <div className="bg-bg-surface border border-border-default rounded-[2.5rem] p-10 flex flex-col">
                        <div className="mb-10 min-w-0">
                            <h2 className="text-xl font-black text-text-main italic tracking-tight mb-1">Weekly Velocity</h2>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] italic">Telemetry across 8 weeks</p>
                        </div>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyActivity} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1C1C1C" />
                                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 'bold' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#141414', borderRadius: '16px', border: '1px solid #2A2A2A', boxShadow: 'none' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                    />
                                    <Legend iconType="rect" wrapperStyle={{ paddingTop: '24px', opacity: 0.8 }} />
                                    <Bar dataKey="applications" name="Applied" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={24} />
                                    <Bar dataKey="interviews" name="Interviews" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-bg-surface border border-border-default rounded-[2.5rem] p-10 flex flex-col overflow-hidden">
                        <div className="mb-8">
                            <h2 className="text-xl font-black text-text-main italic tracking-tight mb-1">Your CV Keyword Frequency</h2>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 italic">Based on real job postings for your target role</p>
                            <p className="text-[10px] font-black text-accent-blue uppercase tracking-[0.2em]">Highest impact keywords found in your funnel</p>
                        </div>

                        {missingKeywords.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 bg-bg-primary/30 rounded-3xl border border-dashed border-border-default">
                                <Lightbulb size={40} className="text-text-muted opacity-20" />
                                <p className="text-sm font-bold text-text-muted uppercase tracking-widest italic">Awaiting additional metadata</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 overflow-y-auto pr-3 custom-scrollbar">
                                {missingKeywords.map((kw, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-bg-primary/50 rounded-2xl border border-border-default group hover:border-accent/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-bg-surface-hover flex items-center justify-center text-[10px] font-black text-accent-blue border border-border-default italic">
                                                0{i + 1}
                                            </div>
                                            <span className="font-black text-text-main uppercase tracking-tight text-sm">{kw.keyword}</span>
                                        </div>
                                        <div className="px-4 py-2 bg-accent-blue/5 text-accent-blue rounded-xl text-[10px] font-black tracking-[0.1em] border border-accent-blue/10 uppercase">
                                            {kw.frequency} Jobs
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Row: Funnel & Profile Skills */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-8">
                    <div className="lg:col-span-7 bg-bg-surface border border-border-default rounded-[2.5rem] p-10 space-y-12">
                        <div className="min-w-0">
                            <h2 className="text-2xl font-black text-text-main italic tracking-tight mb-1">Market-Fit Funnel</h2>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Conversion efficiency through the application life-cycle</p>
                        </div>
                        <div className="space-y-10 relative">
                            {/* Visual Connecting Line */}
                            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-accent-blue via-warning to-success opacity-20 hidden md:block" />

                            <FunnelStep label="Gross Applications" count={stats.total_applications} percent={100} color="bg-accent-blue" />
                            <FunnelStep label="Interview Stages" count={stats.total_interviews} percent={Math.round(stats.response_rate)} color="bg-warning" conversionLabel="Conversion Rate" />
                            <FunnelStep label="Signed Offers" count={stats.total_offers} percent={Math.round((stats.total_offers / stats.total_applications) * 100)} color="bg-success" conversionLabel="Terminal Success" />
                        </div>
                    </div>
                    <div className="lg:col-span-5 bg-bg-surface border border-border-default rounded-[2.5rem] p-10 flex flex-col">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h2 className="text-xl font-black text-text-main italic tracking-tight mb-1">Tailored Skill Stack</h2>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Dominant technical clusters in your CVs</p>
                            </div>
                            <Link href="/profile" className="w-12 h-12 bg-text-main text-bg-primary rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl">
                                <ArrowUpRight size={20} />
                            </Link>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {topSkills.map((skill, i) => (
                                <span key={i} className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${skill.category === 'AI/ML' ? 'bg-accent-blue/10 border-accent-blue/20 text-accent-blue' :
                                    skill.category === 'Backend' ? 'bg-success/10 border-success/20 text-success' :
                                        'bg-bg-surface-hover border-border-default text-text-muted'
                                    }`}>
                                    {skill.name}
                                </span>
                            ))}
                        </div>
                        <div className="mt-auto pt-10">
                            <div className="p-6 bg-accent-blue/5 border border-accent-blue/10 rounded-3xl flex items-center gap-4">
                                <div className="p-3 bg-accent-blue/10 rounded-2xl text-accent-blue">
                                    <Sparkles size={20} />
                                </div>
                                <p className="text-[10px] font-bold text-text-secondary leading-relaxed uppercase tracking-wide">
                                    Your profile currently weights <span className="text-text-main font-black italic">Machine Learning</span> projects more heavily in active tails.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-bg-surface p-6 rounded-[2rem] border border-border-default flex flex-col items-center text-center group hover:border-accent-blue/30 transition-all relative overflow-hidden">
            <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 mb-5 ${bg} ${color} border border-white/5`}>
                <Icon size={28} />
            </div>
            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">{title}</p>
            <p className="text-4xl font-black tracking-tighter text-text-main italic transition-all group-hover:scale-105">{value}</p>
        </div>
    )
}

function FunnelStep({ label, count, percent, color, conversionLabel }: any) {
    return (
        <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] px-2">
                <span className="text-text-muted">{label}</span>
                <span className="text-text-main italic">{count} Events</span>
            </div>
            <div className="relative h-6 w-full bg-bg-primary/50 rounded-2xl overflow-hidden border border-border-default">
                <div
                    className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out flex items-center justify-end px-4 text-[10px] font-black text-white ${color} shadow-[0_0_15px_rgba(0,0,0,0.3)]`}
                    style={{ width: `${Math.max(percent, 8)}%` }}
                >
                    {percent > 15 && <span className="italic">{percent}%</span>}
                </div>
            </div>
            {conversionLabel && (
                <div className="flex justify-end pr-2">
                    <p className="text-[10px] text-accent-blue uppercase tracking-[0.2em] font-black bg-accent-blue/5 px-4 py-1.5 rounded-full border border-accent-blue/10">
                        {conversionLabel}: <span className="text-text-main ml-2 italic">{percent}% Efficiency</span>
                    </p>
                </div>
            )}
        </div>
    )
}
