import { NextResponse } from 'next/server'
import { syncEmailsAction } from '@/features/email-intel/actions'

export async function POST() {
    try {
        const result = await syncEmailsAction()
        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Gmail Sync Error:', error)
        return NextResponse.json(
            { error: error.message || 'Sync failed' },
            { status: 500 }
        )
    }
}
