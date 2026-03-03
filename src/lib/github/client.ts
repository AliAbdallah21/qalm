export async function fetchUserRepos(username: string) {
    const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Qalm-App'
        },
        // Don't strongly cache this since we want fresh data on sync
        cache: 'no-store'
    })

    if (!res.ok) {
        if (res.status === 404) throw new Error('GitHub user not found')
        throw new Error(`GitHub API error: ${res.statusText}`)
    }

    return res.json()
}

export async function fetchRepoLanguages(username: string, repo: string) {
    const res = await fetch(`https://api.github.com/repos/${username}/${repo}/languages`, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Qalm-App'
        }
    })

    if (!res.ok) return null
    return res.json()
}

export async function fetchRepoReadme(username: string, repo: string): Promise<string | null> {
    const res = await fetch(`https://api.github.com/repos/${username}/${repo}/readme`, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Qalm-App'
        }
    })

    if (!res.ok) return null
    const data = await res.json()

    if (data.content && data.encoding === 'base64') {
        return Buffer.from(data.content, 'base64').toString('utf-8')
    }

    return null
}
