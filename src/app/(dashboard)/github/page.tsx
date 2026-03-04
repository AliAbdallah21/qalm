import { createServerClient } from '@/lib/supabase/server'
import { getStoredRepos } from '@/features/github/queries'
import { syncGithubReposAction } from '@/features/github/actions'
import { redirect } from 'next/navigation'
import { RepoCard } from '@/components/features/github/RepoCard'
import { Github, RefreshCw, AlertCircle, Search } from 'lucide-react'

export default async function GithubPage() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Fetch user's profile to see if they provided a github_username
    const { data: profile } = await supabase
        .from('profiles')
        .select('github_username')
        .eq('user_id', user.id)
        .single()

    const githubUsername = profile?.github_username

    // 2. Fetch already stored repos from DB
    const repos = await getStoredRepos(user.id)

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-[1400px] mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border-subtle pb-8">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight text-[var(--text-primary)] italic">
                        Neural Repository Map
                    </h1>
                    <p className="text-text-secondary font-medium text-lg">
                        AI-driven analysis of your technical impact and repository architecture.
                    </p>
                </div>

                {githubUsername && (
                    <form action={async () => {
                        'use server'
                        await syncGithubReposAction()
                    }}>
                        <button
                            type="submit"
                            className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-gray-100 active:scale-95 transition-all shadow-2xl"
                        >
                            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                            Sync Force Update
                        </button>
                    </form>
                )}
            </div>

            {/* Content Section */}
            <div className="space-y-10">
                {!githubUsername ? (
                    <div className="bg-surface-card border border-border-subtle rounded-[2.5rem] p-12 text-center space-y-8 max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-warning/10 rounded-2xl border border-warning/20 flex items-center justify-center mx-auto">
                            <AlertCircle className="text-warning w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-[var(--text-primary)] italic">Identity Missing</h3>
                            <p className="text-text-secondary font-medium text-lg leading-relaxed">
                                Link your GitHub identity in your profile settings to enable neural repository syncing.
                            </p>
                        </div>
                        <div className="pt-4">
                            <a
                                href="/profile"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-surface-main text-[var(--text-primary)] font-black uppercase tracking-widest text-xs rounded-2xl border border-border-subtle hover:border-accent-blue/50 transition-all"
                            >
                                Update Profile Identity
                            </a>
                        </div>
                    </div>
                ) : repos.length === 0 ? (
                    <div className="bg-surface-card border border-dashed border-border-subtle rounded-[3rem] p-24 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in zoom-in-95">
                        <div className="w-24 h-24 bg-accent-blue/5 rounded-3xl border border-accent-blue/10 flex items-center justify-center">
                            <Search className="w-12 h-12 text-accent-blue opacity-30" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-[var(--text-primary)] italic tracking-tight">Zero Signals Detected</h3>
                            <p className="text-text-secondary font-medium max-w-sm mx-auto text-lg leading-relaxed">
                                No repositories have been mapped to your profile yet. Initiate a manual sync to begin analysis.
                            </p>
                        </div>
                        <form action={async () => {
                            'use server'
                            await syncGithubReposAction()
                        }}>
                            <button
                                type="submit"
                                className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-gray-100 active:scale-95 transition-all shadow-2xl"
                            >
                                <Github size={18} />
                                Initialize Repository Mapping
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        {repos.map(repo => (
                            <RepoCard key={repo.id} repo={repo} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
