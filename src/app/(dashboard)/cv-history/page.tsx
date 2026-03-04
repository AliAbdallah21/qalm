'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Target, Loader2, ChevronDown, ChevronUp, Check, X, Lightbulb, Sparkles, Trophy } from 'lucide-react'
import Link from 'next/link'

interface CVHistoryItem {
    id: string
    job_title: string
    company_name: string
    created_at: string
    ats_score: number
    pdf_url: string
    pdf_status?: 'pending' | 'compiling' | 'ready' | 'failed' | null
    ats_breakdown?: {
        score: number
        matched_keywords: string[]
        missing_keywords: string[]
        matched_phrases: string[]
        missing_phrases: string[]
        improvement_tips: string[]
    }
}

export default function CvHistoryPage() {
    const [history, setHistory] = useState<CVHistoryItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expandedBreakdown, setExpandedBreakdown] = useState<string | null>(null)

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/cv/history')
            const json = await response.json()
            if (!response.ok) throw new Error(json.error || 'Failed to fetch history')
            setHistory(json.data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    const getAtsStyles = (score: number) => {
        if (score >= 80) return {
            text: 'text-success',
            bg: 'bg-success/5',
            border: 'border-success/20',
            shadow: 'shadow-success/10',
            glow: 'bg-success'
        }
        if (score >= 60) return {
            text: 'text-warning',
            bg: 'bg-warning/5',
            border: 'border-warning/20',
            shadow: 'shadow-warning/10',
            glow: 'bg-warning'
        }
        return {
            text: 'text-danger',
            bg: 'bg-danger/5',
            border: 'border-danger/20',
            shadow: 'shadow-danger/10',
            glow: 'bg-danger'
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
                <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Retrieving CV Sequence...</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-bg-surface border border-border-default rounded-xl text-text-main">
                        <FileText size={20} />
                    </div>
                    <h1 className="text-4xl font-black text-text-main italic tracking-tighter">
                        CV History
                    </h1>
                </div>
                <p className="text-text-muted font-bold ml-1">
                    Neural logs of every tailored CV transaction and ATS performance analysis.
                </p>
            </div>

            {error && (
                <div className="p-6 bg-danger/10 border border-danger/20 text-danger rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                    <X size={16} />
                    System Error: {error}
                </div>
            )}

            {history.length === 0 ? (
                <div className="p-16 bg-bg-surface border border-border-default rounded-[3rem] text-center space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] -mr-32 -mt-32" />

                    <div className="w-20 h-20 bg-bg-primary border border-border-default rounded-[2rem] flex items-center justify-center mx-auto text-text-muted group-hover:border-accent/30 group-hover:bg-accent/5 transition-all">
                        <FileText size={32} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-text-main italic">Zero CV Data Found</h3>
                        <p className="text-text-muted max-w-xs mx-auto text-xs font-bold">No CV sequences have been generated for this profile yet.</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="inline-flex py-4 px-8 bg-text-main text-bg-primary rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Initialize CV Tailoring
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {history.map((cv) => {
                        const styles = getAtsStyles(cv.ats_score)
                        const isExpanded = expandedBreakdown === cv.id

                        return (
                            <div key={cv.id} className={`bg-bg-surface border ${isExpanded ? 'border-accent/30' : 'border-border-default'} rounded-[2.5rem] transition-all overflow-hidden group`}>
                                <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-bg-primary border border-border-default rounded-2xl flex items-center justify-center text-accent group-hover:border-accent/30 transition-all">
                                                <FileText size={28} />
                                            </div>
                                            {cv.ats_score >= 80 && (
                                                <div className="absolute -top-2 -right-2 p-1.5 bg-success rounded-lg border-2 border-bg-surface shadow-lg">
                                                    <Trophy className="w-3 h-3 text-[var(--text-primary)]" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-text-main italic tracking-tight mb-1">{cv.job_title}</h3>
                                            <div className="flex items-center gap-3 text-xs font-bold text-text-muted uppercase tracking-widest">
                                                <span>{cv.company_name}</span>
                                                <span className="w-1 h-1 bg-border-subtle rounded-full" />
                                                <span>{new Date(cv.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className={`px-6 py-2.5 rounded-2xl border ${styles.bg} ${styles.border} flex flex-col items-center shadow-lg ${styles.shadow} relative overflow-hidden group/score`}>
                                            <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${styles.glow} opacity-50`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${styles.text} opacity-70`}>ATS Competency</span>
                                            <span className={`text-2xl font-black ${styles.text} italic`}>{cv.ats_score}%</span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {(!cv.pdf_status || cv.pdf_status === 'ready') ? (
                                                <a
                                                    href={cv.pdf_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-4 bg-bg-primary text-text-muted rounded-2xl hover:text-text-main hover:border-accent/30 hover:bg-accent/5 border border-border-default transition-all shadow-xl"
                                                    title="Download PDF"
                                                >
                                                    <Download size={22} />
                                                </a>
                                            ) : (cv.pdf_status === 'pending' || cv.pdf_status === 'compiling') ? (
                                                <div className="px-5 py-4 bg-bg-primary text-text-muted border border-border-default rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                                    ⏳ Processing...
                                                </div>
                                            ) : cv.pdf_status === 'failed' ? (
                                                <div className="px-5 py-4 bg-danger/10 text-danger border border-danger/20 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                                    ✕ Failed
                                                </div>
                                            ) : null}
                                            <button
                                                onClick={() => setExpandedBreakdown(isExpanded ? null : cv.id)}
                                                className={`flex items-center gap-3 px-8 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shadow-xl border ${isExpanded
                                                    ? 'bg-text-main text-bg-primary border-text-main'
                                                    : 'bg-bg-primary text-text-main border-border-default hover:border-accent/50'
                                                    }`}
                                            >
                                                <Target size={18} />
                                                {isExpanded ? 'Hide Neural Analysis' : 'Analyze Breakdown'}
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Breakdown Panel */}
                                {isExpanded && cv.ats_breakdown && (
                                    <div className="p-8 bg-bg-secondary border-t border-border-default space-y-8 animate-in slide-in-from-top-4 duration-500">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Matched */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-success flex items-center gap-3 italic">
                                                        <Check size={14} />
                                                        Matched Keywords & Syntax
                                                    </h5>
                                                    <span className="text-[10px] font-bold text-success/50 uppercase italic">{cv.ats_breakdown.matched_keywords.length + cv.ats_breakdown.matched_phrases.length} Hits</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {cv.ats_breakdown.matched_keywords.map((kw, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-success/5 text-success rounded-xl text-[10px] font-black uppercase tracking-widest border border-success/10">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                    {cv.ats_breakdown.matched_phrases.map((phrase, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-success/5 text-success rounded-xl text-[10px] font-black uppercase tracking-widest border border-success/10 italic">
                                                            "{phrase}"
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Missing */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-danger flex items-center gap-3 italic">
                                                        <X size={14} />
                                                        Missing Neural Nodes
                                                    </h5>
                                                    <span className="text-[10px] font-bold text-danger/50 uppercase italic">{cv.ats_breakdown.missing_keywords.length + cv.ats_breakdown.missing_phrases.length} Gaps</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {cv.ats_breakdown.missing_keywords.map((kw, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-danger/5 text-danger rounded-xl text-[10px] font-black uppercase tracking-widest border border-danger/10">
                                                            {kw}
                                                        </span>
                                                    ))}
                                                    {cv.ats_breakdown.missing_phrases.map((phrase, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-danger/5 text-danger rounded-xl text-[10px] font-black uppercase tracking-widest border border-danger/10 italic">
                                                            "{phrase}"
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Improvement Tips */}
                                        <div className="p-8 bg-bg-surface border border-accent/20 rounded-[2rem] space-y-6 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                                                <Sparkles className="w-16 h-16 text-accent" />
                                            </div>
                                            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-3 italic">
                                                <Lightbulb size={16} />
                                                Optimization Strategy
                                            </h5>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {cv.ats_breakdown.improvement_tips.map((tip, i) => (
                                                    <li key={i} className="flex items-start gap-4 p-4 bg-bg-primary/50 rounded-2xl border border-border-default group-hover:border-accent/10 transition-all">
                                                        <div className="flex-shrink-0 w-6 h-6 bg-accent/10 text-accent rounded-lg flex items-center justify-center text-[10px] font-black">
                                                            0{i + 1}
                                                        </div>
                                                        <p className="text-xs font-bold text-text-sub leading-relaxed">{tip}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
