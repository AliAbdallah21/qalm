'use client'

import { useState, useTransition } from 'react'
import type { JobApplication, ApplicationStatus } from '@/features/job-tracker/types'
import { updateStatusAction, deleteApplicationAction } from '@/features/job-tracker/actions'
import {
    Briefcase, ExternalLink, Trash2, Target, Calendar, ChevronDown, FileText, Tag
} from 'lucide-react'
import Link from 'next/link'

const CATEGORY_COLORS: Record<string, string> = {
    'Frontend': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Backend': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Full Stack': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'AI/ML': 'bg-accent/10 text-accent border-accent/20',
    'Data Science': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    'DevOps': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    'Mobile': 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    'Security': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Other': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; classes: string }> = {
    applied: { label: 'Applied', classes: 'bg-accent-blue/10 text-accent-blue border-accent-blue/20' },
    interview: { label: 'Interview', classes: 'bg-warning/10 text-warning border-warning/20' },
    offer: { label: 'Offer 🎉', classes: 'bg-success/10 text-success border-success/20' },
    rejected: { label: 'Rejected', classes: 'bg-surface-hover text-text-muted border-border-subtle' },
}

const ALL_STATUSES: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected']

interface JobCardProps {
    app: JobApplication
    onDeleted: (id: string) => void
    onStatusChanged: (id: string, status: ApplicationStatus) => void
}

function JobCard({ app, onDeleted, onStatusChanged }: JobCardProps) {
    const [isPending, startTransition] = useTransition()
    const [showStatusMenu, setShowStatusMenu] = useState(false)

    const handleStatusChange = (status: ApplicationStatus) => {
        setShowStatusMenu(false)
        startTransition(async () => {
            const result = await updateStatusAction(app.id, status)
            if (!result.error) onStatusChanged(app.id, status)
        })
    }

    const handleDelete = () => {
        if (!confirm('Delete this application?')) return
        startTransition(async () => {
            const result = await deleteApplicationAction(app.id)
            if (!result.error) onDeleted(app.id)
        })
    }

    const cfg = STATUS_CONFIG[app.status]

    return (
        <div className={`bg-bg-surface border border-border-default hover:border-accent/20 rounded-3xl p-6 flex flex-col gap-6 transition-all group relative ${isPending ? 'opacity-60' : ''}`}>
            {/* Background Accent Gradient */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors" />
            </div>

            <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="text-xl font-black text-text-main italic tracking-tight truncate">{app.company}</h3>
                        {app.job_url && (
                            <a href={app.job_url} target="_blank" rel="noopener noreferrer"
                                className="text-text-muted hover:text-text-main transition-colors">
                                <ExternalLink size={16} />
                            </a>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                        <p className="text-text-secondary font-bold text-sm tracking-wide uppercase">{app.role}</p>
                        {app.category && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${CATEGORY_COLORS[app.category] || CATEGORY_COLORS['Other']}`}>
                                {app.category}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                            <Calendar size={12} className="text-accent" />
                            <span>{new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {app.expected_salary && (
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                                <span className="w-1 h-1 bg-border-subtle rounded-full" />
                                <span>{app.expected_salary}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 ${cfg.classes}`}
                        >
                            {cfg.label}
                            <ChevronDown size={12} />
                        </button>
                        {showStatusMenu && (
                            <div className="absolute right-0 top-full mt-2 z-50 bg-bg-surface border border-border-default rounded-2xl shadow-2xl py-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-200">
                                {ALL_STATUSES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-bg-surface-hover transition-colors cursor-pointer pointer-events-auto ${s === app.status ? 'text-accent bg-accent/5' : 'text-text-sub'}`}
                                    >
                                        {STATUS_CONFIG[s].label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleDelete}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/5 rounded-xl transition-all"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Meta Row: ATS & PDF */}
            {(app.ats_score != null || app.pdf_url) && (
                <div className="flex items-center justify-between pt-5 border-t border-border-default relative z-10">
                    {app.ats_score != null && (
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${app.ats_score >= 80 ? 'bg-success/10 text-success border-success/20' :
                            app.ats_score >= 60 ? 'bg-warning/10 text-warning border-warning/20' :
                                'bg-danger/10 text-danger border-danger/20'
                            }`}>
                            <Target size={12} />
                            ATS {app.ats_score}%
                        </div>
                    )}

                    {app.pdf_url ? (
                        <a
                            href={app.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-bg-surface-hover text-accent rounded-xl text-[10px] font-black uppercase tracking-widest border border-border-default hover:border-text-main transition-all group/btn"
                        >
                            <FileText size={14} className="text-text-muted group-hover/btn:text-accent" />
                            View CV
                        </a>
                    ) : (
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest italic opacity-50">No linked CV</span>
                    )}
                </div>
            )}

            {app.notes && (
                <div className="bg-bg-primary/30 border border-border-default rounded-2xl p-4 relative z-10">
                    <p className="text-xs text-text-sub font-medium leading-relaxed italic">
                        "{app.notes}"
                    </p>
                </div>
            )}
        </div>
    )
}

interface JobsListProps {
    initialApplications: JobApplication[]
}

export default function JobsList({ initialApplications }: JobsListProps) {
    const [applications, setApplications] = useState<JobApplication[]>(initialApplications)
    const [filterCategory, setFilterCategory] = useState<string>('All Categories')

    const filteredApplications = applications.filter(app => {
        if (filterCategory === 'All Categories') return true
        return app.category === filterCategory
    })

    const handleDeleted = (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id))
    }

    const handleStatusChanged = (id: string, status: ApplicationStatus) => {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    }

    if (applications.length === 0) {
        return (
            <div className="bg-bg-surface border border-border-default border-dashed rounded-[40px] flex flex-col items-center justify-center py-32 text-center space-y-8">
                <div className="w-24 h-24 bg-bg-surface-hover rounded-[32px] flex items-center justify-center text-text-muted border border-border-default">
                    <Briefcase size={40} />
                </div>
                <div className="space-y-3">
                    <h3 className="text-2xl font-black text-text-main italic tracking-tight">Empty Pipeline</h3>
                    <p className="text-text-sub font-medium max-w-sm mx-auto">
                        Your career journey starts here. Build a tailored CV and save your first target application.
                    </p>
                </div>
                <Link
                    href="/cv-builder"
                    className="px-8 py-3 bg-text-main text-bg-primary rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all shadow-xl"
                >
                    Start Tailoring
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-bg-surface border border-border-default rounded-2xl p-4">
                <Tag size={18} className="text-text-muted" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-text-sub">Filter</span>
                <div className="relative">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-bg-surface-hover border border-border-subtle rounded-xl px-4 py-2 text-text-main text-xs font-bold outline-none focus:border-accent appearance-none pr-10 cursor-pointer"
                    >
                        <option value="All Categories">All Categories</option>
                        {['Frontend', 'Backend', 'Full Stack', 'AI/ML', 'Data Science', 'DevOps', 'Mobile', 'Security', 'Other'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
                <span className="text-[10px] font-bold text-text-muted ml-auto">
                    {filteredApplications.length} {filteredApplications.length === 1 ? 'result' : 'results'}
                </span>
            </div>

            {filteredApplications.length === 0 ? (
                <div className="text-center py-12 text-text-muted font-medium border border-border-default border-dashed rounded-[32px]">
                    No applications match the selected category filter.
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filteredApplications.map(app => (
                        <JobCard
                            key={app.id}
                            app={app}
                            onDeleted={handleDeleted}
                            onStatusChanged={handleStatusChanged}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
