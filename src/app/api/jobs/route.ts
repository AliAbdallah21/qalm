import { createServerClient } from '@/lib/supabase/server'
import { getApplicationsByUserId, createApplication } from '@/features/job-tracker/queries'
import type { CreateJobApplicationInput } from '@/features/job-tracker/types'

export async function GET() {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const applications = await getApplicationsByUserId(user.id)
        return Response.json({ data: applications, message: 'Applications fetched' }, { status: 200 })
    } catch (error) {
        console.error('[/api/jobs GET]', error)
        return Response.json({ error: 'Internal server error', code: 'SERVER_ERROR' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return Response.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
        }

        const body: CreateJobApplicationInput = await request.json()

        if (!body.company || !body.role) {
            return Response.json({ error: 'company and role are required', code: 'BAD_REQUEST' }, { status: 400 })
        }

        const application = await createApplication(user.id, body)
        
        // ML Instrumentation: capture snapshots atomically (awaited for serverless safety)
        try {
            const { captureMLSnapshots } = await import('@/features/job-tracker/queries')
            await captureMLSnapshots(user.id, application)
        } catch (mlError) {
            console.error('[ML] captureMLSnapshots trigger failed:', mlError)
        }

        // Activity Instrumentation: update application_sessions (awaited for serverless safety)
        try {
            const today = new Date().toISOString().split('T')[0]
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

            // 1. Get counts for last 7d and 30d
            const [{ count: count7d }, { count: count30d }] = await Promise.all([
                supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('applied_date', sevenDaysAgo),
                supabase.from('job_applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('applied_date', thirtyDaysAgo)
            ])

            // 2. Fetch today's current count to increment manually
            const { data: currentSession } = await supabase
                .from('application_sessions')
                .select('applications_submitted')
                .eq('user_id', user.id)
                .eq('session_date', today)
                .single()

            const newCount = (currentSession?.applications_submitted ?? 0) + 1

            // 3. Upsert
            await supabase.from('application_sessions').upsert({
                user_id: user.id,
                session_date: today,
                applications_submitted: newCount,
                applications_last_7d: count7d ?? 0,
                applications_last_30d: count30d ?? 0,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,session_date' })

        } catch (activityError) {
            console.error('[ML] application_sessions upsert failed:', activityError)
        }

        return Response.json({ data: application, message: 'Application saved successfully!' }, { status: 201 })
    } catch (error) {
        console.error('[/api/jobs POST]', error)
        return Response.json({ error: 'Failed to save application', code: 'SAVE_FAILED' }, { status: 500 })
    }
}
