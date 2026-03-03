'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { createApplication, updateApplication, deleteApplication } from './queries'
import type { CreateJobApplicationInput, UpdateJobApplicationInput, ApplicationStatus } from './types'

async function requireAuth(): Promise<string> {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    return user.id
}

export async function saveApplicationAction(input: CreateJobApplicationInput) {
    try {
        const userId = await requireAuth()
        const application = await createApplication(userId, input)
        revalidatePath('/jobs')
        revalidatePath('/dashboard')
        return { data: application, message: 'Application saved successfully!' }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to save application'
        console.error('[/features/job-tracker/actions.ts:saveApplicationAction]', error)
        return { error: message, code: 'SAVE_FAILED' }
    }
}

export async function updateStatusAction(id: string, status: ApplicationStatus) {
    try {
        const userId = await requireAuth()
        const application = await updateApplication(userId, id, { status })
        revalidatePath('/jobs')
        revalidatePath('/dashboard')
        return { data: application, message: 'Status updated' }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update status'
        console.error('[/features/job-tracker/actions.ts:updateStatusAction]', error)
        return { error: message, code: 'UPDATE_FAILED' }
    }
}

export async function deleteApplicationAction(id: string) {
    try {
        const userId = await requireAuth()
        await deleteApplication(userId, id)
        revalidatePath('/jobs')
        revalidatePath('/dashboard')
        return { data: null, message: 'Application deleted' }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to delete application'
        console.error('[/features/job-tracker/actions.ts:deleteApplicationAction]', error)
        return { error: message, code: 'DELETE_FAILED' }
    }
}

export async function updateApplicationAction(id: string, input: UpdateJobApplicationInput) {
    try {
        const userId = await requireAuth()
        const application = await updateApplication(userId, id, input)
        revalidatePath('/jobs')
        return { data: application, message: 'Application updated' }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update application'
        console.error('[/features/job-tracker/actions.ts:updateApplicationAction]', error)
        return { error: message, code: 'UPDATE_FAILED' }
    }
}
