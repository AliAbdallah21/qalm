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
  AlertCircle
} from 'lucide-react'
import type { ApplicationStatus } from '@/features/job-tracker/types'
import { getGmailTokens } from '@/features/email-intel/queries'


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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {profileData.profile?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/github"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCcw size={16} />
            Sync GitHub
          </Link>
          <Link
            href="/cv-builder"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-all shadow-sm"
          >
            <Plus size={16} />
            Generate CV
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <ArrowRight size={18} className="ml-auto text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent CV History Widget */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent CV History</h2>
            <Link href="/cv-history" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {cvHistory.length > 0 ? (
              cvHistory.slice(0, 3).map((cv) => (
                <div key={cv.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{cv.job_title || 'Untitled Role'}</p>
                      <p className="text-sm text-gray-500">{cv.company_name || 'Target Company'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">Score: {cv.ats_score}%</p>
                    <p className="text-xs text-gray-500">{new Date(cv.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-gray-400 text-sm">No CVs generated yet.</p>
                <Link href="/cv-builder" className="text-sm text-black font-semibold mt-2 inline-block hover:underline">
                  Generate your first CV
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Applications Widget */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
            <Link href="/jobs" className="text-sm font-medium text-gray-500 hover:text-black transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentApplications.length > 0 ? (
              recentApplications.slice(0, 3).map((app) => (
                <div key={app.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{app.company}</p>
                      <p className="text-sm text-gray-500">{app.role}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[app.status]}`}>
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-gray-400 text-sm">No applications yet.</p>
                <Link href="/cv-builder" className="text-sm text-black font-semibold mt-2 inline-block hover:underline">
                  Generate a CV to start tracking
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Tips / Next Steps Widget */}
        <div className="bg-gradient-to-br from-black to-gray-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-4">Improve your Profile</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Companies look for specific keywords and GitHub contributions.
              Sync your latest repos to get better tailored CV suggestions.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">1</div>
                <p className="text-sm text-gray-200">Complete your professional summary</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">2</div>
                <p className="text-sm text-gray-200">Feature at least 3 GitHub repositories</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">3</div>
                <p className="text-sm text-gray-200">Add 5 core technical skills</p>
              </div>
            </div>
            <Link
              href="/profile"
              className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
            >
              Update Profile
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Abstract SVG Background Element */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10">
            <svg width="300" height="300" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" />
              <rect x="20" y="20" width="60" height="60" stroke="white" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}