import { createServerClient } from '@/lib/supabase/server'
import { getFullProfile } from '@/features/profile/queries'
import { getStoredRepos } from '@/features/github/queries'
import { getCVHistory } from '@/features/cv-generator/queries'
import { getApplicationsByUserId, getApplicationStats } from '@/features/job-tracker/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  RefreshCcw,
  ArrowRight,
  FileText,
  Github,
  UserCheck,
  Briefcase,
  Mail,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react'
import type { ApplicationStatus } from '@/features/job-tracker/types'
import { getGmailTokens } from '@/features/email-intel/queries'
import { formatDistanceToNow } from 'date-fns'


export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch all dashboard data
  const [profileData, githubRepos, cvHistory, recentApplications, appStats, gmailTokens] = await Promise.all([
    getFullProfile(user.id),
    getStoredRepos(user.id),
    getCVHistory(user.id),
    getApplicationsByUserId(user.id),
    getApplicationStats(user.id),
    getGmailTokens(user.id),
  ])

  const STATUS_COLORS: Record<ApplicationStatus, string> = {
    applied: 'bg-blue-50 text-blue-700',
    interview: 'bg-amber-50 text-amber-700',
    offer: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
  }

  const STATUS_LABELS: Record<ApplicationStatus, string> = {
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected',
  }

  const stats = [
    {
      name: 'Profile Completeness',
      value: `${profileData.completeness_score}%`,
      icon: UserCheck,
      color: 'bg-blue-50 text-blue-600',
      href: '/profile'
    },
    {
      name: 'Repos Synced',
      value: githubRepos.length,
      icon: Github,
      color: 'bg-indigo-50 text-indigo-600',
      href: '/github'
    },
    {
      name: 'CVs Generated',
      value: cvHistory.length,
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600',
      href: '/cv-history'
    },
    {
      name: 'Applications',
      value: appStats.total,
      icon: Briefcase,
      color: 'bg-violet-50 text-violet-600',
      href: '/jobs'
    },
    {
      name: 'Gmail Sync',
      value: gmailTokens ? 'Active' : 'Missing',
      icon: Mail,
      color: gmailTokens ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600',
      href: '/emails'
    },
  ]

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)] italic">
            Welcome back, {profileData.profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-text-secondary mt-2 flex items-center gap-2 font-medium">
            <Calendar size={16} className="text-accent-blue" />
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/github"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-[var(--text-primary)] bg-surface-card border border-border-subtle rounded-xl hover:bg-surface-hover transition-all active:scale-95"
          >
            <RefreshCcw size={16} />
            Sync GitHub
          </Link>
          <Link
            href="/cv-builder"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-accent-blue rounded-xl hover:bg-blue-700 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] active:scale-95"
          >
            <Plus size={16} />
            Generate CV
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-surface-card p-5 rounded-2xl border border-border-subtle transition-all card-hover group"
          >
            <div className="space-y-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-surface-hover group-hover:bg-accent-blue-muted`}>
                <stat.icon size={20} className="text-text-secondary group-hover:text-accent-blue" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{stat.name}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</p>
                  <ArrowRight size={16} className="text-text-muted group-hover:text-accent-blue group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent CV History Widget */}
        <div className="lg:col-span-7 bg-surface-card rounded-2xl border border-border-subtle overflow-hidden">
          <div className="p-6 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-accent-blue" />
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Recent CV History</h2>
            </div>
            <Link href="/cv-history" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-[var(--text-primary)] transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border-subtle/50">
            {cvHistory.length > 0 ? (
              cvHistory.slice(0, 4).map((cv) => (
                <div key={cv.id} className="p-5 flex items-center justify-between hover:bg-surface-hover/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-hover rounded-xl flex items-center justify-center text-text-muted group-hover:text-[var(--text-primary)] transition-colors">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-primary)] text-sm">{cv.job_title || 'Untitled Role'}</p>
                      <p className="text-xs text-text-muted">{cv.company_name || 'Target Company'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-2 py-1 rounded text-[10px] font-black bg-accent-blue-muted text-accent-blue mb-1`}>
                      ATS: {cv.ats_score}%
                    </div>
                    <p className="text-[10px] font-bold text-text-muted lowercase">{formatDistanceToNow(new Date(cv.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center space-y-3">
                <p className="text-text-muted text-sm italic">No CVs generated yet.</p>
                <Link href="/cv-builder" className="text-xs text-accent-blue font-black uppercase tracking-widest hover:underline">
                  Generate your first CV
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications Widget */}
        <div className="lg:col-span-5 bg-surface-card rounded-2xl border border-border-subtle overflow-hidden">
          <div className="p-6 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-accent-blue" />
              <h2 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)]">Recent Applications</h2>
            </div>
            <Link href="/jobs" className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-[var(--text-primary)] transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border-subtle/50">
            {recentApplications.length > 0 ? (
              recentApplications.slice(0, 4).map((app) => (
                <div key={app.id} className="p-5 flex items-center justify-between hover:bg-surface-hover/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-surface-hover rounded-xl flex items-center justify-center text-text-muted">
                      <Briefcase size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[var(--text-primary)] text-sm truncate">{app.company}</p>
                      <p className="text-xs text-text-muted truncate">{app.role}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5 ${STATUS_COLORS[app.status].replace('bg-blue-50 text-blue-700', 'bg-blue-500/10 text-blue-400')
                    .replace('bg-amber-50 text-amber-700', 'bg-amber-500/10 text-amber-400')
                    .replace('bg-emerald-50 text-emerald-700', 'bg-emerald-500/10 text-emerald-400')
                    .replace('bg-red-50 text-red-700', 'bg-red-500/10 text-red-400')}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center space-y-3">
                <p className="text-text-muted text-sm italic">No applications yet.</p>
                <Link href="/cv-builder" className="text-xs text-accent-blue font-black uppercase tracking-widest hover:underline">
                  Start tracking
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips / Next Steps Widget */}
        <div className="lg:col-span-12 glass rounded-3xl p-8 text-[var(--text-primary)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-accent-blue/20 transition-all duration-1000" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-black italic tracking-tight">Level up your career intelligence</h2>
              <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-2xl">
                Companies look for specific keywords and GitHub contributions.
                Sync your latest repos to get better tailored CV suggestions and deep ATS insights.
              </p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Optimize Profile
                <ArrowRight size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full md:w-auto">
              {[
                { t: 'Complete professional summary', i: UserCheck },
                { t: 'Feature at least 3 GitHub repos', i: Github },
                { t: 'Add 5 core technical skills', i: Sparkles }
              ].map((tip, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-[var(--bg-surface-hover)] border border-[var(--border)] p-4 rounded-2xl backdrop-blur-md">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-hover)] flex items-center justify-center text-accent-blue">
                    <tip.i size={20} />
                  </div>
                  <p className="text-sm font-bold">{tip.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}