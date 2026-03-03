import { createServerClient } from '@/lib/supabase/server'
import { getStoredRepos } from '@/features/github/queries'
import { syncGithubReposAction } from '@/features/github/actions'
import { redirect } from 'next/navigation'

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
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">GitHub Repositories</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Sync your GitHub repositories. Qalm uses AI to read your READMEs and understand your exact technical impact for CV tailoring.
                    </p>
                </div>

                {githubUsername && (
                    <form action={async () => {
                        'use server'
                        await syncGithubReposAction()
                    }}>
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition"
                        >
                            Sync GitHub Now
                        </button>
                    </form>
                )}
            </div>

            {!githubUsername ? (
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                    <h3 className="text-lg font-medium text-amber-800">GitHub Username Missing</h3>
                    <p className="mt-2 text-sm text-amber-700">
                        You need to add your GitHub username to your Profile before Qalm can sync your repositories.
                    </p>
                </div>
            ) : (
                repos.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200 border-dashed">
                        <h3 className="text-lg font-medium text-gray-900">No repositories synced yet</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            Click the "Sync GitHub Now" button above to pull in your public repositories and have AI summarize them.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {repos.map(repo => (
                            <div key={repo.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate" title={repo.repo_name}>
                                            <a href={repo.html_url || '#'} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">
                                                {repo.repo_name}
                                            </a>
                                        </h3>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <span className="flex items-center">⭐ {repo.stars}</span>
                                            <span className="flex items-center">🍴 {repo.forks}</span>
                                        </div>
                                    </div>

                                    {repo.description && (
                                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{repo.description}</p>
                                    )}

                                    <div className="mt-4">
                                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">AI Summary</h4>
                                        <p className="mt-1 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            {repo.readme_summary ? repo.readme_summary : 'No README summary available.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center gap-2 flex-wrap">
                                    {repo.languages && Object.keys(repo.languages).slice(0, 3).map(lang => (
                                        <span key={lang} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {lang}
                                        </span>
                                    ))}
                                    <div className="ml-auto">
                                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${repo.is_featured ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-gray-50 text-gray-600 ring-gray-500/10'}`}>
                                            {repo.is_featured ? 'Featured' : 'Standard'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}
        </div>
    )
}
