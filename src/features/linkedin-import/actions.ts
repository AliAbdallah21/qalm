'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { createProject } from '@/features/projects/queries'
import { parseLinkedInZip, parseLinkedInDate } from './parser'
import type { LinkedInImportPreview } from './types'

async function requireAuth(): Promise<string> {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    return user.id
}

/** Parse the uploaded ZIP and return a preview. No data is saved yet. */
export async function parseLinkedInAction(formData: FormData): Promise<{
    data?: LinkedInImportPreview
    error?: string
    code?: string
}> {
    try {
        const userId = await requireAuth()
        void userId // auth check only

        const file = formData.get('file') as File | null
        if (!file) return { error: 'No file uploaded', code: 'BAD_REQUEST' }
        if (!file.name.endsWith('.zip')) return { error: 'File must be a .zip archive', code: 'BAD_REQUEST' }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const preview = parseLinkedInZip(buffer)

        return { data: preview }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Parse failed'
        console.error('[/features/linkedin-import/actions.ts:parseLinkedInAction]', error)
        return { error: message, code: 'PARSE_FAILED' }
    }
}

/** Save the parsed preview to the database, skipping duplicates. */
export async function confirmImportAction(preview: LinkedInImportPreview): Promise<{
    data?: { imported: Record<string, number> }
    error?: string
    code?: string
}> {
    try {
        const userId = await requireAuth()
        const supabase = await createServerClient()
        const imported: Record<string, number> = {
            experiences: 0,
            education: 0,
            skills: 0,
            certifications: 0,
            projects: 0,
        }

        // ── 1. Update basic profile info if profile CSV was found ────────────
        if (preview.profile) {
            const fullName = `${preview.profile.firstName} ${preview.profile.lastName}`.trim()
            await supabase
                .from('profiles')
                .upsert({
                    user_id: userId,
                    full_name: fullName || undefined,
                    headline: preview.profile.headline || undefined,
                    summary: preview.profile.summary || undefined,
                    city: preview.profile.geoLocation || undefined,
                }, { onConflict: 'user_id', ignoreDuplicates: false })
        }

        // ── 2. Experiences (positions) — skip duplicates by company+title ────
        if (preview.positions.length > 0) {
            const { data: existingExp } = await supabase
                .from('experiences')
                .select('company, title')
                .eq('user_id', userId)

            const existingSet = new Set(
                (existingExp ?? []).map(e => `${e.company}|${e.title}`.toLowerCase())
            )

            const toInsert = preview.positions
                .filter(p => !existingSet.has(`${p.companyName}|${p.title}`.toLowerCase()))
                .map(p => ({
                    user_id: userId,
                    company: p.companyName,
                    title: p.title,
                    description: p.description || null,
                    location: p.location || null,
                    start_date: parseLinkedInDate(p.startedOn),
                    end_date: p.isCurrent ? null : parseLinkedInDate(p.finishedOn),
                    is_current: p.isCurrent,
                }))

            if (toInsert.length > 0) {
                const { data: inserted } = await supabase
                    .from('experiences')
                    .insert(toInsert)
                    .select('id')
                imported.experiences = inserted?.length ?? 0
            }
        }

        // ── 3. Education — skip duplicates by institution name ───────────────
        if (preview.education.length > 0) {
            const { data: existingEdu } = await supabase
                .from('education')
                .select('institution')
                .eq('user_id', userId)

            const existingSet = new Set(
                (existingEdu ?? []).map(e => e.institution.toLowerCase())
            )

            const toInsert = preview.education
                .filter(e => !existingSet.has(e.schoolName.toLowerCase()))
                .map(e => ({
                    user_id: userId,
                    institution: e.schoolName,
                    degree: e.degreeName || null,
                    field: null,
                    start_date: parseLinkedInDate(e.startDate),
                    end_date: parseLinkedInDate(e.endDate),
                    grade: null,
                    description: e.notes || null,
                }))

            if (toInsert.length > 0) {
                const { data: inserted } = await supabase
                    .from('education')
                    .insert(toInsert)
                    .select('id')
                imported.education = inserted?.length ?? 0
            }
        }

        // ── 4. Skills — skip duplicates by name ─────────────────────────────
        if (preview.skills.length > 0) {
            const { data: existingSkills } = await supabase
                .from('skills')
                .select('name')
                .eq('user_id', userId)

            const existingSet = new Set(
                (existingSkills ?? []).map(s => s.name.toLowerCase())
            )

            const toInsert = preview.skills
                .filter(s => !existingSet.has(s.name.toLowerCase()))
                .map(s => ({
                    user_id: userId,
                    name: s.name,
                    category: 'imported',
                    level: null,
                    years_experience: null,
                }))

            if (toInsert.length > 0) {
                const { data: inserted } = await supabase
                    .from('skills')
                    .insert(toInsert)
                    .select('id')
                imported.skills = inserted?.length ?? 0
            }
        }

        // ── 5. Certifications — skip by title ────────────────────────────────
        if (preview.certifications.length > 0) {
            const { data: existingCerts } = await supabase
                .from('certificates')
                .select('title')
                .eq('user_id', userId)

            const existingSet = new Set(
                (existingCerts ?? []).map(c => c.title.toLowerCase())
            )

            const toInsert = preview.certifications
                .filter(c => !existingSet.has(c.name.toLowerCase()))
                .map(c => ({
                    user_id: userId,
                    title: c.name,
                    issuer: c.authority || 'Unknown',
                    credential_url: c.url || null,
                    issue_date: parseLinkedInDate(c.startedOn),
                    expiry_date: parseLinkedInDate(c.finishedOn) || null,
                    description: c.licenseNumber ? `License: ${c.licenseNumber}` : null,
                }))

            if (toInsert.length > 0) {
                const { data: inserted } = await supabase
                    .from('certificates')
                    .insert(toInsert)
                    .select('id')
                imported.certifications = inserted?.length ?? 0
            }
        }

        // ── 6. Projects ───────────────────────────────────────────────────
        if (preview.projects.length > 0) {
            const { data: existingProj } = await supabase
                .from('projects')
                .select('name')
                .eq('user_id', userId)

            const existingSet = new Set(
                (existingProj ?? []).map(p => p.name.toLowerCase())
            )

            const toInsert = preview.projects
                .filter(p => !existingSet.has(p.title.toLowerCase()))

            for (const p of toInsert) {
                await createProject(userId, {
                    user_id: userId,
                    name: p.title,
                    description: p.description || null,
                    technologies: [],
                    url: p.url || null,
                    github_repo_id: null,
                    is_hero: false,
                    start_date: parseLinkedInDate(p.startedOn),
                    end_date: parseLinkedInDate(p.finishedOn),
                })
            }
            
            imported.projects = toInsert.length
        }

        revalidatePath('/profile')
        revalidatePath('/dashboard')

        return {
            data: { imported },
            // cast to string to satisfy the Record type, but keep numbers for UI
        }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Import failed'
        console.error('[/features/linkedin-import/actions.ts:confirmImportAction]', error)
        return { error: message, code: 'IMPORT_FAILED' }
    }
}
