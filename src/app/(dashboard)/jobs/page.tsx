import { createServerClient } from '@/lib/supabase/server'
import { getApplicationsByUserId, getApplicationStats } from '@/features/job-tracker/queries'
import { redirect } from 'next/navigation'
import { Briefcase, TrendingUp, Award, XCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import JobsList from '@/components/shared/JobsList'

export default async function JobsPage() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const [applications, stats] = await Promise.all([
        getApplicationsByUserId(user.id),
        getApplicationStats(user.id),
    ])

    const statCards = [
        { label: 'Total Scoped', value: stats.total, icon: Briefcase, color: 'text-accent', bg: 'bg-accent/10' },
        { label: 'Interviews', value: stats.interview, icon: TrendingUp, color: 'text-warning', bg: 'bg-warning/10' },
        { label: 'Offers', value: stats.offer, icon: Award, color: 'text-success', bg: 'bg-success/10' },
        { label: 'Not Pursuing', value: stats.rejected, icon: XCircle, color: 'text-text-muted', bg: 'bg-bg-surface-hover' },
    ]

    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-text-main italic flex items-center gap-3">
                        <Briefcase className="text-accent" />
                        Job Tracker
                    </h1>
                    <p className="text-text-secondary font-medium">
                        Monitor your application pipeline and manage status transitions with AI insights.
                    </p>
                </div>
                <Link
                    href="/cv-builder"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-text-main text-bg-primary rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:opacity-90 transition-all hover:scale-[1.02] active:scale-100 shadow-xl"
                >
                    <Plus size={16} />
                    New Application
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map(s => (
                    <div key={s.label} className="bg-bg-surface border border-border-default rounded-3xl p-6 group hover:border-accent/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${s.bg} ${s.color} transition-transform group-hover:scale-110`}>
                                <s.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-0.5">{s.label}</p>
                                <p className="text-3xl font-black text-text-main italic leading-none">{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Applications list */}
            <JobsList initialApplications={applications} />
        </div>
    )
}
