export interface GmailTokens {
    access_token: string
    refresh_token?: string
    expires_at: number // timestamp in ms
    email?: string
}

export interface GmailMessage {
    id: string
    threadId: string
    from: string
    subject: string
    snippet: string
    date: string
    body: string
}

export type EmailClassification =
    | 'interview_invite'
    | 'rejection'
    | 'offer'
    | 'assessment'
    | 'follow_up'
    | 'auto_reply'
    | 'unknown'

export interface EmailScanResult {
    scanned: number
    updated: number
    results: {
        company: string
        subject: string
        classification: EmailClassification
        date: string
        applicationId?: string
    }[]
}
