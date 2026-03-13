'use client'

import { useState, useEffect, useMemo } from 'react'
import { FolderGit2, Plus, Trash2, Check, ExternalLink, Loader2, ChevronUp, Star, Github } from 'lucide-react'
import type { Project } from '@/features/projects/types'
import type { GithubRepo } from '@/features/github/types'

function Section({ title, icon: Icon, children, defaultOpen = true }: any) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    return (
        <div className="bg-surface-card rounded-[2rem] border border-border-subtle overflow-hidden transition-all hover:border-accent-blue/20">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-8 hover:bg-white/[0.02] transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent-blue/10 text-accent-blue rounded-xl border border-accent-blue/10">
                        <Icon size={20} />
                    </div>
                    <h2 className="text-xl font-black text-[var(--text-primary)] italic tracking-tight">{title}</h2>
                </div>
                <div className={`p-2 rounded-lg bg-surface-main border border-border-subtle text-text-muted transition-transform duration-300 ${isOpen ? '' : 'rotate-180'}`}>
                    <ChevronUp size={16} />
                </div>
            </button>
            {isOpen && (
                <div className="p-8 pt-0 border-t border-border-subtle animate-in fade-in slide-in-from-top-2 duration-300">
                    {children}
                </div>
            )}
        </div>
    )
}

interface ProjectsSectionProps {
    projects: Project[]
    githubRepos: GithubRepo[]
    onUpdate: (projects: Project[]) => void
    loading: boolean
    setLoading: (l: boolean) => void
    showNotification: (msg: string, type: 'success' | 'error') => void
}

export default function ProjectsSection({ projects, githubRepos, onUpdate, loading, setLoading, showNotification }: ProjectsSectionProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempData, setTempData] = useState<Partial<Project>>({})
    const [techInput, setTechInput] = useState('')
    const [linkedRepoIds, setLinkedRepoIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        const ids = new Set(projects.map(p => p.github_repo_id).filter(Boolean) as string[])
        setLinkedRepoIds(ids)
    }, [projects])

    const availableRepos = useMemo(() => 
        githubRepos.filter(repo => !linkedRepoIds.has(repo.id)),
    [githubRepos, linkedRepoIds])

    const heroProjects = projects.filter(p => p.is_hero)
    const otherProjects = projects.filter(p => !p.is_hero)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                ...tempData,
                technologies: techInput.split(',').map(t => t.trim()).filter(Boolean)
            }

            const url = editingId ? `/api/profile/projects/${editingId}` : '/api/profile/projects'
            const method = editingId ? 'PATCH' : 'POST'
            
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)

            const newProjects = editingId
                ? projects.map(p => p.id === editingId ? result.data : p)
                : [result.data, ...projects]

            onUpdate(newProjects)
            showNotification(editingId ? 'Project updated!' : 'Project added!', 'success')
            setIsAdding(false)
            setEditingId(null)
            setTempData({})
            setTechInput('')
        } catch (err: any) {
            showNotification(err.message || 'Action failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        setLoading(true)
        try {
            const res = await fetch(`/api/profile/projects/${id}`, { method: 'DELETE' })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate(projects.filter(p => p.id !== id))
            showNotification('Project deleted', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Delete failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleHero = async (project: Project) => {
        if (!project.is_hero && heroProjects.length >= 4) {
            showNotification('Maximum 4 hero projects allowed. Remove one first.', 'error')
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/profile/projects/${project.id}/hero`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_hero: !project.is_hero })
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            
            onUpdate(projects.map(p => 
                p.id === project.id ? { ...p, is_hero: !p.is_hero } : p
            ))
            showNotification(project.is_hero ? 'Removed from Hero Projects' : 'Added to Hero Projects', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Toggle failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handlePromoteRepo = (repoId: string) => {
        const repo = githubRepos.find(r => r.id === repoId)
        if (!repo) return
        setTempData({
            name: repo.repo_name,
            description: repo.description,
            url: repo.html_url,
            github_repo_id: repo.id,
            start_date: repo.created_at ? new Date(repo.created_at).toISOString().split('T')[0] : undefined
        })
        const langs = repo.languages ? Object.keys(repo.languages) : []
        setTechInput(langs.join(', '))
    }

    const renderProjectCard = (project: Project) => (
        <div key={project.id} className="p-6 bg-surface-main/50 rounded-2xl border border-border-subtle flex flex-col gap-4 group hover:border-accent-blue/30 transition-all">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-[var(--text-primary)] italic tracking-tight">{project.name}</h3>
                        {project.github_repo_id && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-text-muted">
                                <Github size={12} />
                                From GitHub
                            </span>
                        )}
                    </div>
                    {project.description && (
                        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
                            {project.description}
                        </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        {(project.start_date || project.end_date) && (
                            <div className="bg-surface-card px-3 py-1 rounded-lg border border-border-subtle">
                                {project.start_date || 'N/A'} - {project.end_date || 'Present'}
                            </div>
                        )}
                        {project.url && (
                            <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-accent-blue hover:underline">
                                <ExternalLink size={12} />
                                View Project
                            </a>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleToggleHero(project)}
                        className={`p-2 rounded-xl border transition-all ${project.is_hero ? 'bg-warning/10 text-warning border-warning/20' : 'bg-surface-card text-text-muted border-border-subtle hover:text-warning'}`}
                        title={project.is_hero ? "Remove Hero Status" : "Make Hero Project"}
                    >
                        <Star size={18} className={project.is_hero ? "fill-warning" : ""} />
                    </button>
                    <button
                        onClick={() => { 
                            setEditingId(project.id); 
                            setTempData(project); 
                            setTechInput(project.technologies?.join(', ') || ''); 
                            setIsAdding(true); 
                        }}
                        className="px-4 py-2 rounded-xl bg-surface-card border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-[var(--text-primary)] hover:border-accent-blue/50 transition-all"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
            
            {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-border-subtle/50">
                    {project.technologies.map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-accent-blue/5 text-accent-blue text-[10px] font-bold border border-accent-blue/10">
                            {tech}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <Section title="Projects Showcase" icon={FolderGit2}>
            <div className="space-y-8">

                {heroProjects.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                            <Star size={14} className="text-warning fill-warning" />
                            Hero Projects
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                            {heroProjects.map(renderProjectCard)}
                        </div>
                    </div>
                )}

                {otherProjects.length > 0 && (
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Other Projects</h4>
                        <div className="grid grid-cols-1 gap-4">
                            {otherProjects.map(renderProjectCard)}
                        </div>
                    </div>
                )}

                {!isAdding ? (
                    <button
                        onClick={() => { setIsAdding(true); setEditingId(null); setTempData({}); setTechInput(''); }}
                        className="w-full py-8 border-2 border-dashed border-border-subtle rounded-[2rem] flex flex-col items-center justify-center gap-3 text-text-muted hover:border-accent-blue/50 hover:text-accent-blue hover:bg-accent-blue/5 transition-all group"
                    >
                        <div className="p-3 bg-surface-card rounded-2xl border border-border-subtle group-hover:border-accent-blue/20 transition-all">
                            <Plus size={24} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Append Project Node</span>
                    </button>
                ) : (
                    <form onSubmit={handleSave} className="p-8 bg-surface-card border border-accent-blue/20 rounded-[2rem] space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[var(--text-primary)] italic">{editingId ? 'Modify' : 'Initialize'} Project</h3>
                            <div className="px-4 py-1.5 bg-accent-blue rounded-full text-[10px] font-black text-white uppercase tracking-widest italic shadow-lg shadow-accent-blue/20">
                                ACTIVE BRANCH
                            </div>
                        </div>

                        {!editingId && (
                            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                                <div className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                                    <Github size={18} />
                                    Promote from GitHub
                                </div>
                                {availableRepos.length > 0 ? (
                                    <select 
                                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-xl text-sm outline-none [color-scheme:dark]"
                                        onChange={e => handlePromoteRepo(e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select a repository to import details...</option>
                                        {availableRepos.map(repo => (
                                            <option key={repo.id} value={repo.id}>{repo.full_name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-accent-blue/5 border border-accent-blue/10 rounded-xl text-xs font-black text-accent-blue uppercase tracking-widest">
                                        <Check size={14} />
                                        All repositories have been promoted
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Project Name</label>
                                <input
                                    required
                                    type="text"
                                    value={tempData.name || ''}
                                    onChange={e => setTempData({ ...tempData, name: e.target.value })}
                                    className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Project URL</label>
                                <input
                                    type="url"
                                    value={tempData.url || ''}
                                    onChange={e => setTempData({ ...tempData, url: e.target.value })}
                                    className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                    placeholder="https://..."
                                />
                            </div>
                            
                            <div className="col-span-full space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Technologies (comma separated)</label>
                                <input
                                    type="text"
                                    value={techInput}
                                    onChange={e => setTechInput(e.target.value)}
                                    className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner flex-1"
                                    placeholder="React, TypeScript, Next.js..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 col-span-full">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Start Date</label>
                                    <input
                                        type="date"
                                        value={tempData.start_date || ''}
                                        onChange={e => setTempData({ ...tempData, start_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">End Date</label>
                                    <input
                                        type="date"
                                        value={tempData.end_date || ''}
                                        onChange={e => setTempData({ ...tempData, end_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Description</label>
                                <textarea
                                    rows={4}
                                    value={tempData.description || ''}
                                    onChange={e => setTempData({ ...tempData, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-surface-main border border-border-subtle rounded-[1.5rem] focus:ring-1 focus:ring-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium resize-none shadow-inner"
                                    placeholder="What did you build?"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-border-subtle">
                            <button
                                type="button"
                                onClick={() => { setIsAdding(false); setEditingId(null); setTempData({}); setTechInput(''); }}
                                className="px-8 py-3 text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !tempData.name}
                                className="bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin text-accent-blue" />}
                                {editingId ? 'Modify Entry' : 'Commit Entry'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Section>
    )
}
