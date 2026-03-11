'use server'

import { createServerClient } from '@/lib/supabase/server'
import * as gmailProvider from '@/lib/email-providers/gmail'
import * as queries from './queries'

export async function disconnectGmailAction(): Promise<{ success: boolean }> {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    await queries.deleteGmailTokens(user.id)
    return { success: true }
}
import { callAI, parseAIJSON } from '@/lib/ai/client'
import { buildEmailClassificationPrompt } from '@/lib/ai/prompts'
import { getApplicationsByUserId } from '@/features/job-tracker/queries'
import type { EmailScanResult, EmailClassification, GmailTokens } from './types'
import type { ApplicationStatus } from '@/features/job-tracker/types'

export async function connectGmailAction() {
    return gmailProvider.getAuthUrl()
}

export async function syncEmailsAction(): Promise<EmailScanResult> {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const tokens = await queries.getGmailTokens(user.id)
    if (!tokens) throw new Error('Gmail not connected')

    // Handle token refresh if needed
    let accessToken = tokens.access_token
    if (Date.now() > tokens.expires_at) {
        if (!tokens.refresh_token) throw new Error('Refresh token missing')
        const newTokens = await gmailProvider.refreshAccessToken(tokens.refresh_token)
        await queries.saveGmailTokens(user.id, {
            ...tokens,
            ...newTokens
        })
        accessToken = newTokens.access_token
    }

    const applications = await getApplicationsByUserId(user.id)
    const scanResult: EmailScanResult = {
        scanned: 0,
        updated: 0,
        results: []
    }

    // For each application with a company name, try to find related emails
    for (const app of applications) {
        // Search query: from that company or mentioning company name
        const query = `${app.company}`
        const messageIds = await gmailProvider.searchEmails(accessToken, query)

        for (const id of messageIds) {
            scanResult.scanned++
            const email = await gmailProvider.getEmailById(accessToken, id)

            const prompt = buildEmailClassificationPrompt(email.subject, email.body, app.company)
            const aiResponse = await callAI({ prompt, model: 'fast' })

            try {
                const classificationData = parseAIJSON<{
                    classification: EmailClassification
                    confidence: number
                }>(aiResponse)

                if (classificationData.confidence > 0.7) {
                    let newStatus: ApplicationStatus | null = null

                    switch (classificationData.classification) {
                        case 'interview_invite': newStatus = 'interview'; break
                        case 'rejection': newStatus = 'rejected'; break
                        case 'offer': newStatus = 'offer'; break
                    }

                    if (newStatus && newStatus !== app.status) {
                        await queries.updateJobApplicationFromEmail(user.id, app.id, newStatus, {
                            subject: email.subject,
                            date: email.date
                        })
                        scanResult.updated++
                    }

                    scanResult.results.push({
                        company: app.company,
                        subject: email.subject,
                        classification: classificationData.classification,
                        date: email.date,
                        applicationId: app.id
                    })
                }
            } catch (e) {
                console.error('Failed to parse AI response for email classification', aiResponse)
            }
        }
    }

    return scanResult
}
