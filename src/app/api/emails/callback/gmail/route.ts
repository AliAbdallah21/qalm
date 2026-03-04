import { NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/email-providers/gmail'
import { saveGmailTokens } from '@/features/email-intel/queries'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
        return NextResponse.redirect(new URL('/dashboard?error=gmail_no_code', request.url))
    }

    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const tokens = await exchangeCodeForTokens(code)
        await saveGmailTokens(user.id, tokens)

        return NextResponse.redirect(new URL('/dashboard?gmail=connected', request.url))
    } catch (error) {
        console.error('Gmail OAuth Callback Error:', error)
        return NextResponse.redirect(new URL('/dashboard?error=gmail_auth_failed', request.url))
    }
}
