export interface GithubRepo {
    id: string
    user_id: string
    repo_id: number
    repo_name: string
    full_name: string
    description: string | null
    languages: Record<string, number> | null
    topics: string[] | null
    stars: number
    forks: number
    is_private: boolean
    is_featured: boolean
    readme_summary: string | null
    html_url: string | null
    created_at: string
    last_synced_at: string
}
