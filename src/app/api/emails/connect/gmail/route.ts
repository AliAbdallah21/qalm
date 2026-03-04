import { NextResponse } from 'next/server'
import { connectGmailAction } from '@/features/email-intel/actions'

export async function GET() {
    const url = await connectGmailAction()
    return NextResponse.json({ url })
}
