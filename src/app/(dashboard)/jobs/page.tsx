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
        { label: 'Total Applied', value: stats.total, icon: Briefcase, color: 'bg-blue-50 text-blue-600' },
        { label: 'Interviews', value: stats.interview, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
        { label: 'Offers', value: stats.offer, icon: Award, color: 'bg-emerald-50 text-emerald-600' },
        { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'bg-red-50 text-red-600' },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <Briefcase className="w-8 h-8" />
                        Job Applications
                    </h1>
                    <p className="text-gray-500 mt-1">Track every application and its current status.</p>
                </div>
                <Link
                    href="/cv-builder"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Generate & Save CV
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map(s => (
                    <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${s.color}`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-500">{s.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Applications list (client component for inline interactions) */}
            <JobsList initialApplications={applications} />
        </div>
    )
}
