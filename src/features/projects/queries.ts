import { createServerClient } from '@/lib/supabase/server'
import { Project, ProjectInsert, ProjectUpdate } from './types'

export async function getUserProjects(userId: string): Promise<Project[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('projects')
        .select('id, user_id, name, description, technologies, url, github_repo_id, is_hero, start_date, end_date, created_at')
        .eq('user_id', userId)
        .order('start_date', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
}

export async function getHeroProjects(userId: string): Promise<Project[]> {
    const supabase = await createServerClient()
    const { data, error } = await supabase
        .from('projects')
        .select('id, user_id, name, description, technologies, url, github_repo_id, is_hero, start_date, end_date, created_at')
        .eq('user_id', userId)
        .eq('is_hero', true)
        .order('start_date', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
}

export async function createProject(userId: string, data: ProjectInsert): Promise<Project> {
    const supabase = await createServerClient()
    const { data: project, error } = await supabase
        .from('projects')
        .insert({ ...data, user_id: userId })
        .select()
        .single()

    if (error) throw new Error(error.message)
    return project
}

export async function updateProject(id: string, data: ProjectUpdate): Promise<Project> {
    const supabase = await createServerClient()
    const { data: project, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', id)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return project
}

export async function deleteProject(id: string): Promise<void> {
    const supabase = await createServerClient()
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
}

export async function toggleProjectHero(id: string, isHero: boolean): Promise<void> {
    const supabase = await createServerClient()
    
    if (isHero) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')
            
        const { count, error: countError } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_hero', true)
            
        if (countError) throw new Error(countError.message)
        if (count !== null && count >= 4) {
            throw new Error('Maximum 4 hero projects allowed')
        }
    }

    const { error } = await supabase
        .from('projects')
        .update({ is_hero: isHero })
        .eq('id', id)

    if (error) throw new Error(error.message)
}
