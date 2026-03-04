import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getUserLimits } from '@/lib/access/permissions'

export async function GET() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await getUserLimits(user.id)
        return NextResponse.json({ data })
    } catch (error: any) {
        console.error('[/api/user/limits GET]', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error', code: 'SERVER_ERROR' },
            { status: 500 }
        )
    }
}
