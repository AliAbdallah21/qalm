'use server'

import { revalidatePath } from 'next/cache'
import { getStoredRepos, upsertStoredRepos, toggleRepoFeatured } from './queries'
import { fetchUserRepos, fetchRepoLanguages, fetchRepoReadme } from '@/lib/github/client'
import { callAI } from '@/lib/ai/client'
import { buildGithubReadmeSummaryPrompt } from '@/lib/ai/prompts'
import { createServerClient } from '@/lib/supabase/server'
import type { GithubRepo } from './types'

// Helper to get auth user
async function requireAuth() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    return user.id
}

export async function syncGithubReposAction(formData?: FormData) {
    try {
        const userId = await requireAuth()

        // 1. Get user's github username from profile
        const supabase = await createServerClient()
        const { data: profile } = await supabase
            .from('profiles')
            .select('github_username')
            .eq('user_id', userId)
            .single()

        if (!profile?.github_username) {
            return { error: 'Please set your GitHub username in your profile first.', code: 'GITHUB_NOT_CONNECTED' }
        }

        const username = profile.github_username

        // 2. Fetch repos from GitHub
        const githubRepos = await fetchUserRepos(username)
        if (!Array.isArray(githubRepos)) {
            return { error: 'Invalid response from GitHub API', code: 'GITHUB_API_ERROR' }
        }

        // 3. Process repos
        const processedRepos: Partial<GithubRepo>[] = []

        // We only process the top 30 most recently updated repos to save AI/API resources
        const reposToProcess = githubRepos.slice(0, 30)

        for (const repo of reposToProcess) {
            // Avoid processing forks unless they have significant engagement
            if (repo.fork && repo.stargazers_count < 5) continue

            const [languages, readmeContent] = await Promise.all([
                fetchRepoLanguages(username, repo.name),
                fetchRepoReadme(username, repo.name)
            ])

            let readme_summary = null
            if (readmeContent && readmeContent.length > 50) {
                try {
                    // Truncate README to avoid token limits on huge readmes
                    const truncatedReadme = readmeContent.substring(0, 4000)
                    const prompt = buildGithubReadmeSummaryPrompt(truncatedReadme)
                    readme_summary = await callAI({ prompt, model: 'fast' })
                } catch (aiError) {
                    console.error(`Failed to summarize README for ${repo.name}`, aiError)
                }
            }

            processedRepos.push({
                repo_id: repo.id,
                repo_name: repo.name,
                full_name: repo.full_name,
                description: repo.description,
                languages: languages || {},
                topics: repo.topics || [],
                stars: repo.stargazers_count || 0,
                forks: repo.forks_count || 0,
                is_private: repo.private || false,
                html_url: repo.html_url,
                readme_summary
            })
        }

        // 4. Save to DB
        if (processedRepos.length > 0) {
            await upsertStoredRepos(userId, processedRepos)
        }

        revalidatePath('/dashboard/github')

        return {
            data: { synced_count: processedRepos.length },
            message: `Successfully synced ${processedRepos.length} repositories`
        }

    } catch (error: any) {
        console.error('[/features/github/actions.ts:syncGithubReposAction]', error)
        return { error: error.message || 'Failed to sync GitHub repositories', code: 'SYNC_FAILED' }
    }
}

export async function fetchStoredReposAction() {
    try {
        const userId = await requireAuth()
        const repos = await getStoredRepos(userId)
        return { data: repos, message: 'Repositories fetched successfully' }
    } catch (error) {
        console.error('[/features/github/actions.ts:fetchStoredReposAction]', error)
        return { error: 'Failed to fetch repositories', code: 'FETCH_FAILED' }
    }
}

export async function toggleFeaturedRepoAction(repoId: string, isFeatured: boolean) {
    try {
        const userId = await requireAuth()
        const updated = await toggleRepoFeatured(userId, repoId, isFeatured)
        revalidatePath('/dashboard/github')
        return { data: updated, message: `Repository ${isFeatured ? 'featured' : 'unfeatured'} successfully` }
    } catch (error) {
        console.error('[/features/github/actions.ts:toggleFeaturedRepoAction]', error)
        return { error: 'Failed to update repository', code: 'UPDATE_FAILED' }
    }
}
