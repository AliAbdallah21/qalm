export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  technologies: string[]
  url: string | null
  github_repo_id: string | null
  is_hero: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}
export type ProjectInsert = Omit<Project, 'id' | 'created_at'>
export type ProjectUpdate = Partial<Omit<Project, 'id' | 'user_id' | 'created_at'>>
