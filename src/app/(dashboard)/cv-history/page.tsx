'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Target, Loader2, ChevronDown, ChevronUp, Check, X, Lightbulb, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface CVHistoryItem {
    id: string
    job_title: string
    company_name: string
    created_at: string
    ats_score: number
    pdf_url: string
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

    const getAtsColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                <p className="text-gray-500 font-medium">Loading your CV history...</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                    <FileText className="text-black" />
                    CV History
                </h1>
                <p className="text-gray-500">
                    View and manage all your previously tailored CVs and their ATS performance.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                    {error}
                </div>
            )}

            {history.length === 0 ? (
                <div className="p-12 bg-white border border-gray-100 rounded-3xl text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300">
                        <FileText size={32} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-bold text-gray-900">No CVs generated yet</h3>
                        <p className="text-gray-500 max-w-xs mx-auto text-sm">Tailor your first CV to see it appear here in your history.</p>
                    </div>
                    <Link
                        href="/cv-builder"
                        className="inline-flex py-2 px-6 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-all text-sm shadow-lg"
                    >
                        Tailor a CV
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {history.map((cv) => (
                        <div key={cv.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{cv.job_title}</h3>
                                        <p className="text-sm text-gray-500">{cv.company_name} • {new Date(cv.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className={`px-4 py-2 rounded-xl border flex flex-col items-center ${getAtsColor(cv.ats_score)}`}>
                                        <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">ATS Score</span>
                                        <span className="text-lg font-bold">{cv.ats_score}%</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={cv.pdf_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2.5 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100 shadow-sm tooltip"
                                            title="Download PDF"
                                        >
                                            <Download size={20} />
                                        </a>
                                        <button
                                            onClick={() => setExpandedBreakdown(expandedBreakdown === cv.id ? null : cv.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-bold text-sm shadow-sm ${expandedBreakdown === cv.id
                                                    ? 'bg-black text-white border-black'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:border-black'
                                                }`}
                                        >
                                            <Target size={18} />
                                            {expandedBreakdown === cv.id ? 'Hide Breakdown' : 'Breakdown'}
                                            {expandedBreakdown === cv.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Breakdown Panel */}
                            {expandedBreakdown === cv.id && cv.ats_breakdown && (
                                <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-6 animate-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Matched */}
                                        <div className="space-y-3">
                                            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                                                <Check size={14} />
                                                Matched Keywords & Phrases
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {cv.ats_breakdown.matched_keywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium border border-emerald-200">
                                                        {kw}
                                                    </span>
                                                ))}
                                                {cv.ats_breakdown.matched_phrases.map((phrase, i) => (
                                                    <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-medium border border-emerald-100 italic">
                                                        "{phrase}"
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Missing */}
                                        <div className="space-y-3">
                                            <h5 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1">
                                                <X size={14} />
                                                Missing Keywords & Phrases
                                            </h5>
                                            <div className="flex flex-wrap gap-2">
                                                {cv.ats_breakdown.missing_keywords.map((kw, i) => (
                                                    <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium border border-red-200">
                                                        {kw}
                                                    </span>
                                                ))}
                                                {cv.ats_breakdown.missing_phrases.map((phrase, i) => (
                                                    <span key={i} className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium border border-red-100 italic">
                                                        "{phrase}"
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Improvement Tips */}
                                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
                                        <h5 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
                                            <Lightbulb size={14} />
                                            Optimization Tips
                                        </h5>
                                        <ul className="space-y-2 text-sm text-amber-900">
                                            {cv.ats_breakdown.improvement_tips.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <span className="flex-shrink-0 w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                                                        {i + 1}
                                                    </span>
                                                    {tip}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
