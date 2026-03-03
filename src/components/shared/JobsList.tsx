'use client'

import { useState, useTransition } from 'react'
import type { JobApplication, ApplicationStatus } from '@/features/job-tracker/types'
import { updateStatusAction, deleteApplicationAction } from '@/features/job-tracker/actions'
import {
    Briefcase, ExternalLink, Trash2, Target, Calendar, ChevronDown, FileText
} from 'lucide-react'

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; classes: string }> = {
    applied: { label: 'Applied', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
    interview: { label: 'Interview', classes: 'bg-amber-50 text-amber-700 border-amber-200' },
    offer: { label: 'Offer 🎉', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', classes: 'bg-red-50 text-red-700 border-red-200' },
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
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 transition-all ${isPending ? 'opacity-60' : ''}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{app.company}</h3>
                        {app.job_url && (
                            <a href={app.job_url} target="_blank" rel="noopener noreferrer"
                                className="text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                    <p className="text-gray-600 font-medium">{app.role}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>Applied {new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {app.expected_salary && <span>· {app.expected_salary}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Status Badge with dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowStatusMenu(!showStatusMenu)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.classes} hover:opacity-80 transition-all`}
                        >
                            {cfg.label}
                            <ChevronDown className="w-3 h-3" />
                        </button>
                        {showStatusMenu && (
                            <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-36">
                                {ALL_STATUSES.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${s === app.status ? 'font-semibold' : ''}`}
                                    >
                                        {STATUS_CONFIG[s].label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleDelete}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        title="Delete application"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Bottom row: ATS score + PDF link */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-3">
                    {app.ats_score != null && (
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${app.ats_score >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                app.ats_score >= 60 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            <Target className="w-3 h-3" />
                            ATS {app.ats_score}%
                        </div>
                    )}
                </div>
                {app.pdf_url && (
                    <a
                        href={app.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-black transition-colors"
                    >
                        <FileText className="w-3.5 h-3.5" />
                        View CV
                    </a>
                )}
                {!app.ats_score && !app.pdf_url && (
                    <span className="text-xs text-gray-300">No CV linked</span>
                )}
            </div>

            {app.notes && (
                <p className="text-sm text-gray-500 italic border-t border-gray-50 pt-3">{app.notes}</p>
            )}
        </div>
    )
}

interface JobsListProps {
    initialApplications: JobApplication[]
}

export default function JobsList({ initialApplications }: JobsListProps) {
    const [applications, setApplications] = useState<JobApplication[]>(initialApplications)

    const handleDeleted = (id: string) => {
        setApplications(prev => prev.filter(a => a.id !== id))
    }

    const handleStatusChanged = (id: string, status: ApplicationStatus) => {
        setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    }

    if (applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                    <Briefcase className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 max-w-sm">
                    Generate a CV and save it as an application to start tracking your job search.
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {applications.map(app => (
                <JobCard
                    key={app.id}
                    app={app}
                    onDeleted={handleDeleted}
                    onStatusChanged={handleStatusChanged}
                />
            ))}
        </div>
    )
}
