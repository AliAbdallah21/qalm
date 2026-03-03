import { createServerClient } from '@/lib/supabase/server'
import type { GithubRepo } from './types'

export async function getStoredRepos(userId: string): Promise<GithubRepo[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('github_repos')
        .select('id, user_id, repo_id, repo_name, full_name, description, languages, topics, stars, forks, is_private, is_featured, readme_summary, html_url, created_at, last_synced_at')
        .eq('user_id', userId)
        .order('stars', { ascending: false })

    if (error) throw error
    return data as GithubRepo[]
}

export async function upsertStoredRepos(userId: string, repos: Partial<GithubRepo>[]): Promise<void> {
    const supabase = await createServerClient()

    const reposToUpsert = repos.map(repo => ({
        ...repo,
        user_id: userId,
        last_synced_at: new Date().toISOString()
    }))

    const { error } = await supabase
        .from('github_repos')
        .upsert(reposToUpsert, { onConflict: 'repo_id' })

    if (error) throw error
}

export async function toggleRepoFeatured(userId: string, repoId: string, isFeatured: boolean): Promise<GithubRepo> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('github_repos')
        .update({ is_featured: isFeatured })
        .eq('id', repoId)
        .eq('user_id', userId)
        .select('id, user_id, repo_id, repo_name, full_name, description, languages, topics, stars, forks, is_private, is_featured, readme_summary, html_url, created_at, last_synced_at')
        .single()

    if (error) throw error
    return data as GithubRepo
}
