import { createServerClient } from '@/lib/supabase/server'
import type { GmailTokens, EmailClassification } from './types'
import type { ApplicationStatus } from '@/features/job-tracker/types'

export async function saveGmailTokens(userId: string, tokens: GmailTokens) {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from('gmail_tokens')
        .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_expiry: new Date(tokens.expires_at).toISOString(),
            email: tokens.email,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

    if (error) throw error
}

export async function getGmailTokens(userId: string): Promise<GmailTokens | null> {
    const supabase = await createServerClient()

    const { data, error } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error || !data) return null

    return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(data.token_expiry).getTime(),
        email: data.email
    }
}

export async function deleteGmailTokens(userId: string): Promise<void> {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from('gmail_tokens')
        .delete()
        .eq('user_id', userId)

    if (error) throw error
}

export async function updateJobApplicationFromEmail(
    userId: string,
    applicationId: string,
    status: ApplicationStatus,
    emailData: { subject: string; date: string }
) {
    const supabase = await createServerClient()

    const { error } = await supabase
        .from('job_applications')
        .update({
            status,
            notes: `Auto-updated via Gmail sync: ${emailData.subject} (${emailData.date})`,
            updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .eq('user_id', userId)

    if (error) throw error
}
