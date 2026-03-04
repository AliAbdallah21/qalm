import type { GmailTokens, GmailMessage } from '@/features/email-intel/types'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

export function getAuthUrl(): string {
    const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ]

    return `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI || '')}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scopes.join(' '))}&` +
        `access_type=offline&` +
        `prompt=consent`
}

export async function exchangeCodeForTokens(code: string): Promise<GmailTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID || '',
            client_secret: GOOGLE_CLIENT_SECRET || '',
            redirect_uri: GOOGLE_REDIRECT_URI || '',
            grant_type: 'authorization_code'
        })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error_description || 'Failed to exchange code')

    // Get user info to get email
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${data.access_token}` }
    })
    const userData = await userResponse.json()

    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in * 1000),
        email: userData.email
    }
}

export async function refreshAccessToken(refreshToken: string): Promise<GmailTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            refresh_token: refreshToken,
            client_id: GOOGLE_CLIENT_ID || '',
            client_secret: GOOGLE_CLIENT_SECRET || '',
            grant_type: 'refresh_token'
        })
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error_description || 'Failed to refresh token')

    return {
        access_token: data.access_token,
        expires_at: Date.now() + (data.expires_in * 1000)
    }
}

export async function searchEmails(accessToken: string, query: string): Promise<string[]> {
    const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const data = await response.json()
    return (data.messages || []).map((m: any) => m.id)
}

export async function getEmailById(accessToken: string, id: string): Promise<GmailMessage> {
    const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const data = await response.json()

    const headers = data.payload.headers
    const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject'
    const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown'
    const date = headers.find((h: any) => h.name === 'Date')?.value || ''

    // Extract body (simplified base64 decoding)
    let body = data.snippet

    function getPartBody(payload: any): string {
        if (payload.body?.data) {
            return Buffer.from(payload.body.data, 'base64').toString()
        }
        if (payload.parts) {
            for (const part of payload.parts) {
                const b = getPartBody(part)
                if (b) return b
            }
        }
        return ''
    }

    const fullBody = getPartBody(data.payload)
    if (fullBody) body = fullBody

    return {
        id: data.id,
        threadId: data.threadId,
        from,
        subject,
        snippet: data.snippet,
        date,
        body
    }
}
