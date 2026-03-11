import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { deleteGmailTokens } from '@/features/email-intel/queries'

export async function DELETE() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        await deleteGmailTokens(user.id)

        return NextResponse.json({ message: 'Gmail disconnected successfully' }, { status: 200 })
    } catch (error) {
        console.error('[DELETE /api/emails/disconnect]', error)
        return NextResponse.json({ error: 'Failed to disconnect Gmail', code: 'DISCONNECT_FAILED' }, { status: 500 })
    }
}
