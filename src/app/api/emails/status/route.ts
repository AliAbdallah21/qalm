import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getGmailTokens } from '@/features/email-intel/queries'

export async function GET() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ tokens: null })

        const tokens = await getGmailTokens(user.id)
        return NextResponse.json({ tokens })
    } catch (error) {
        return NextResponse.json({ tokens: null })
    }
}
