'use client'

import { useState } from 'react'
import {
    User,
    Briefcase,
    GraduationCap,
    Wrench,
    Award,
    Globe,
    Plus,
    Trash2,
    Check,
    X,
    Loader2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Code,
    Languages
} from 'lucide-react'
import type {
    FullProfileData,
    Experience,
    Education,
    Skill,
    Certificate,
    Language,
    Profile
} from '@/features/profile/types'

interface ProfileFormsProps {
    initialData: FullProfileData
}

export default function ProfileForms({ initialData }: ProfileFormsProps) {
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState<string | null>(null)
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 3000)
    }

    return (
        <div className="space-y-6 pb-20">
            {notification && (
                <div className={`fixed bottom-8 right-8 z-50 p-5 rounded-[1.5rem] shadow-2xl border animate-in fade-in slide-in-from-bottom-8 ${notification.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${notification.type === 'success' ? 'bg-success/20' : 'bg-danger/20'}`}>
                            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest italic">{notification.message}</span>
                    </div>
                </div>
            )}

            <BasicInfoSection
                profile={data.profile}
                onUpdate={(p: Profile) => setData({ ...data, profile: p })}
                loading={loading === 'basic'}
                setLoading={(l: boolean) => setLoading(l ? 'basic' : null)}
                showNotification={showNotification}
            />

            <ExperienceSection
                experiences={data.experiences}
                onUpdate={(exps: Experience[]) => setData({ ...data, experiences: exps })}
                loading={loading === 'experience'}
                setLoading={(l: boolean) => setLoading(l ? 'experience' : null)}
                showNotification={showNotification}
            />

            <EducationSection
                education={data.education}
                onUpdate={(edu: Education[]) => setData({ ...data, education: edu })}
                loading={loading === 'education'}
                setLoading={(l: boolean) => setLoading(l ? 'education' : null)}
                showNotification={showNotification}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SkillsSection
                    skills={data.skills}
                    onUpdate={(s: Skill[]) => setData({ ...data, skills: s })}
                    loading={loading === 'skills'}
                    setLoading={(l: boolean) => setLoading(l ? 'skills' : null)}
                    showNotification={showNotification}
                />
                <LanguagesSection
                    languages={data.languages}
                    onUpdate={(l: Language[]) => setData({ ...data, languages: l })}
                    loading={loading === 'languages'}
                    setLoading={(isL: boolean) => setLoading(isL ? 'languages' : null)}
                    showNotification={showNotification}
                />
            </div>

            <CertificatesSection
                certificates={data.certificates}
                onUpdate={(c: Certificate[]) => setData({ ...data, certificates: c })}
                loading={loading === 'certificates'}
                setLoading={(l: boolean) => setLoading(l ? 'certificates' : null)}
                showNotification={showNotification}
            />
        </div>
    )
}

// --- Sub-components ---

function Section({ title, icon: Icon, children, defaultOpen = true }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    return (
        <div className="bg-surface-card rounded-[2rem] border border-border-subtle overflow-hidden transition-all hover:border-accent-blue/20">
            <button
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

interface SectionProps {
    onUpdate: (data: any) => void
    loading: boolean
    setLoading: (loading: boolean) => void
    showNotification: (msg: string, type: 'success' | 'error') => void
}

function BasicInfoSection({ profile, onUpdate, loading, setLoading, showNotification }: { profile: Profile | null } & SectionProps) {
    const [formData, setFormData] = useState<Partial<Profile>>(profile || {})

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate(result.data)
            showNotification('Basic info updated!', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Failed to update', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Section title="Basic Information" icon={User}>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Full Name</label>
                    <input
                        type="text"
                        value={formData.full_name || ''}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium"
                        placeholder="John Doe"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Email Address</label>
                    <input
                        type="email"
                        value={formData.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium"
                        placeholder="john@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Phone Number</label>
                    <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium"
                        placeholder="+1 234 567 890"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Age (Optional)</label>
                    <input
                        type="number"
                        value={formData.age || ''}
                        onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || null })}
                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium"
                        placeholder="25"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Professional Headline</label>
                    <input
                        type="text"
                        value={formData.headline || ''}
                        onChange={e => setFormData({ ...formData, headline: e.target.value })}
                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium italic"
                        placeholder="AI/ML Engineer | LangChain | Python"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">City</label>
                    <input
                        type="text"
                        value={formData.city || ''}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium"
                        placeholder="San Francisco"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Country</label>
                    <input
                        type="text"
                        value={formData.country || ''}
                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium"
                        placeholder="USA"
                    />
                </div>
                <div className="col-span-full space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Professional Core Summary</label>
                    <textarea
                        rows={5}
                        value={formData.summary || ''}
                        onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        className="w-full px-5 py-4 bg-surface-main border border-border-subtle rounded-[1.5rem] focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium resize-none leading-relaxed"
                        placeholder="Write a brief summary of your professional background..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">LinkedIn Platform URL</label>
                    <input
                        type="url"
                        value={formData.linkedin_url || ''}
                        onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium"
                        placeholder="https://linkedin.com/in/..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">GitHub Workspace Username</label>
                    <input
                        type="text"
                        value={formData.github_username || ''}
                        onChange={e => setFormData({ ...formData, github_username: e.target.value })}
                        className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all text-sm outline-none text-[var(--text-primary)] font-medium"
                        placeholder="johndoe"
                    />
                </div>
                <div className="col-span-full flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-white hover:bg-gray-100 text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin text-accent-blue" />}
                        Commit Sync Changes
                    </button>
                </div>
            </form>
        </Section>
    )
}

function ExperienceSection({ experiences, onUpdate, loading, setLoading, showNotification }: { experiences: Experience[] } & SectionProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempData, setTempData] = useState<Partial<Experience>>({})

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = editingId ? `/api/profile/experiences/${editingId}` : '/api/profile/experiences'
            const method = editingId ? 'PATCH' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempData)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)

            const newExps = editingId
                ? experiences.map((exp: Experience) => exp.id === editingId ? result.data : exp)
                : [result.data, ...experiences]

            onUpdate(newExps)
            showNotification(editingId ? 'Experience updated!' : 'Experience added!', 'success')
            setIsAdding(false)
            setEditingId(null)
            setTempData({})
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
            const res = await fetch(`/api/profile/experiences/${id}`, { method: 'DELETE' })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate(experiences.filter((e: Experience) => e.id !== id))
            showNotification('Experience deleted', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Delete failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Section title="Work Experience" icon={Briefcase}>
            <div className="space-y-6">
                {experiences.map((exp: Experience) => (
                    <div key={exp.id} className="p-6 bg-surface-main/50 rounded-2xl border border-border-subtle flex justify-between items-start group hover:border-accent-blue/30 transition-all">
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-[var(--text-primary)] italic tracking-tight">{exp.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-text-secondary font-bold">
                                <span>{exp.company}</span>
                                <span className="w-1 h-1 bg-border-subtle rounded-full" />
                                <span>{exp.location}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 text-[10px] font-black text-accent-blue uppercase tracking-widest bg-accent-blue/5 px-3 py-1 rounded-lg border border-accent-blue/10">
                                {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingId(exp.id); setTempData(exp); setIsAdding(true); }}
                                className="px-4 py-2 rounded-xl bg-surface-card border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-[var(--text-primary)] hover:border-accent-blue/50 transition-all"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(exp.id)}
                                className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {!isAdding ? (
                    <button
                        onClick={() => { setIsAdding(true); setEditingId(null); setTempData({ is_current: false }); }}
                        className="w-full py-8 border-2 border-dashed border-border-subtle rounded-[2rem] flex flex-col items-center justify-center gap-3 text-text-muted hover:border-accent-blue/50 hover:text-accent-blue hover:bg-accent-blue/5 transition-all group"
                    >
                        <div className="p-3 bg-surface-card rounded-2xl border border-border-subtle group-hover:border-accent-blue/20 transition-all">
                            <Plus size={24} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Append Experience Node</span>
                    </button>
                ) : (
                    <form onSubmit={handleSave} className="p-8 bg-surface-card border border-accent-blue/20 rounded-[2rem] space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[var(--text-primary)] italic">{editingId ? 'Modify' : 'Initialize'} Experience</h3>
                            <div className="px-4 py-1.5 bg-accent-blue rounded-full text-[10px] font-black text-white uppercase tracking-widest italic shadow-lg shadow-accent-blue/20">
                                ACTIVE BRANCH
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Job Title</label>
                                <input
                                    required
                                    type="text"
                                    value={tempData.title || ''}
                                    onChange={e => setTempData({ ...tempData, title: e.target.value })}
                                    className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Organization</label>
                                <input
                                    required
                                    type="text"
                                    value={tempData.company || ''}
                                    onChange={e => setTempData({ ...tempData, company: e.target.value })}
                                    className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Location</label>
                                <input
                                    type="text"
                                    value={tempData.location || ''}
                                    onChange={e => setTempData({ ...tempData, location: e.target.value })}
                                    className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Start Date</label>
                                    <input
                                        required
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
                                        disabled={tempData.is_current}
                                        value={tempData.end_date || ''}
                                        onChange={e => setTempData({ ...tempData, end_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium disabled:opacity-30 [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="curr-exp"
                                        checked={tempData.is_current}
                                        onChange={e => setTempData({ ...tempData, is_current: e.target.checked })}
                                        className="peer w-6 h-6 opacity-0 absolute cursor-pointer"
                                    />
                                    <div className="w-6 h-6 rounded-lg border border-border-subtle bg-surface-main peer-checked:bg-accent-blue peer-checked:border-accent-blue transition-all flex items-center justify-center">
                                        <Check size={14} className="text-[var(--text-primary)] opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <label htmlFor="curr-exp" className="text-[10px] font-black uppercase text-text-secondary tracking-widest cursor-pointer">Active Position</label>
                            </div>

                            <div className="col-span-full space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Impact Analysis / Description</label>
                                <textarea
                                    rows={5}
                                    value={tempData.description || ''}
                                    onChange={e => setTempData({ ...tempData, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-surface-main border border-border-subtle rounded-[1.5rem] focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium resize-none leading-relaxed shadow-inner"
                                    placeholder="Quantify your impact using the STAR method..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-border-subtle">
                            <button
                                type="button"
                                onClick={() => { setIsAdding(false); setEditingId(null); setTempData({}); }}
                                className="px-8 py-3 text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
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

function EducationSection({ education, onUpdate, loading, setLoading, showNotification }: { education: Education[] } & SectionProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempData, setTempData] = useState<Partial<Education>>({})

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = editingId ? `/api/profile/education/${editingId}` : '/api/profile/education'
            const method = editingId ? 'PATCH' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempData)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)

            const newData = editingId
                ? education.map((e: Education) => e.id === editingId ? result.data : e)
                : [result.data, ...education]

            onUpdate(newData)
            showNotification(editingId ? 'Education updated!' : 'Education added!', 'success')
            setIsAdding(false)
            setEditingId(null)
            setTempData({})
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
            const res = await fetch(`/api/profile/education/${id}`, { method: 'DELETE' })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate(education.filter((e: Education) => e.id !== id))
            showNotification('Education deleted', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Delete failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Section title="Education" icon={GraduationCap}>
            <div className="space-y-6">
                {education.map((edu: Education) => (
                    <div key={edu.id} className="p-6 bg-surface-main/50 rounded-2xl border border-border-subtle flex justify-between items-start group hover:border-accent-blue/30 transition-all">
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-[var(--text-primary)] italic tracking-tight">{edu.degree}</h3>
                            <div className="flex items-center gap-3 text-sm text-text-secondary font-bold">
                                <span>{edu.institution}</span>
                                <span className="w-1 h-1 bg-border-subtle rounded-full" />
                                <span>{edu.field}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 text-[10px] font-black text-accent-blue uppercase tracking-widest bg-accent-blue/5 px-3 py-1 rounded-lg border border-accent-blue/10">
                                {edu.start_date} - {edu.end_date || 'Present'}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingId(edu.id); setTempData(edu); setIsAdding(true); }}
                                className="px-4 py-2 rounded-xl bg-surface-card border border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-[var(--text-primary)] hover:border-accent-blue/50 transition-all"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(edu.id)}
                                className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}

                {!isAdding ? (
                    <button
                        onClick={() => { setIsAdding(true); setEditingId(null); setTempData({}); }}
                        className="w-full py-8 border-2 border-dashed border-border-subtle rounded-[2rem] flex flex-col items-center justify-center gap-3 text-text-muted hover:border-accent-blue/50 hover:text-accent-blue hover:bg-accent-blue/5 transition-all group"
                    >
                        <div className="p-3 bg-surface-card rounded-2xl border border-border-subtle group-hover:border-accent-blue/20 transition-all">
                            <Plus size={24} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Append Academic Node</span>
                    </button>
                ) : (
                    <form onSubmit={handleSave} className="p-8 bg-surface-card border border-accent-blue/20 rounded-[2rem] space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-[var(--text-primary)] italic">{editingId ? 'Modify' : 'Initialize'} Education</h3>
                            <div className="px-4 py-1.5 bg-accent-blue rounded-full text-[10px] font-black text-white uppercase tracking-widest italic shadow-lg shadow-accent-blue/20">
                                ACTIVE BRANCH
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Institution Name</label>
                                <input
                                    required
                                    type="text"
                                    value={tempData.institution || ''}
                                    onChange={e => setTempData({ ...tempData, institution: e.target.value })}
                                    className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Degree Level</label>
                                <input
                                    required
                                    type="text"
                                    value={tempData.degree || ''}
                                    onChange={e => setTempData({ ...tempData, degree: e.target.value })}
                                    className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Field of Study</label>
                                <input
                                    required
                                    type="text"
                                    value={tempData.field || ''}
                                    onChange={e => setTempData({ ...tempData, field: e.target.value })}
                                    className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Start Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={tempData.start_date || ''}
                                        onChange={e => setTempData({ ...tempData, start_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium [color-scheme:dark]"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">End Date (Literal/Expected)</label>
                                    <input
                                        type="date"
                                        value={tempData.end_date || ''}
                                        onChange={e => setTempData({ ...tempData, end_date: e.target.value })}
                                        className="w-full px-4 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium [color-scheme:dark]"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-border-subtle">
                            <button
                                type="button"
                                onClick={() => { setIsAdding(false); setEditingId(null); setTempData({}); }}
                                className="px-8 py-3 text-text-muted text-[10px] font-black uppercase tracking-widest hover:text-[var(--text-primary)] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
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

function SkillsSection({ skills, onUpdate, loading, setLoading, showNotification }: { skills: Skill[] } & SectionProps) {
    const [tempData, setTempData] = useState<Partial<Skill>>({ level: 'intermediate', category: 'Standard' })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!tempData.name) return
        setLoading(true)
        try {
            const res = await fetch('/api/profile/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempData)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate([...skills, result.data])
            setTempData({ level: 'intermediate', category: 'Standard' })
            showNotification('Skill added!', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Failed to add skill', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/profile/skills/${id}`, { method: 'DELETE' })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate(skills.filter((s: Skill) => s.id !== id))
            showNotification('Skill deleted', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Delete failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Section title="Expertise & Skills" icon={Code}>
            <div className="space-y-8">
                <div className="flex flex-wrap gap-3">
                    {skills.map((skill: Skill) => (
                        <div key={skill.id} className="group relative">
                            <div className="px-4 py-2 bg-surface-main border border-border-subtle rounded-xl flex items-center gap-3 transition-all hover:border-accent-blue/50 hover:bg-accent-blue/5">
                                <span className={`w-1.5 h-1.5 rounded-full ${skill.level === 'expert' ? 'bg-success' : skill.level === 'intermediate' ? 'bg-accent-blue' : 'bg-text-muted'}`} />
                                <span className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">{skill.name}</span>
                                <button
                                    onClick={() => handleDelete(skill.id)}
                                    className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSave} className="p-8 bg-surface-card border border-border-subtle rounded-[2rem] flex flex-col md:flex-row items-end gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Neural Competency</label>
                        <input
                            required
                            type="text"
                            value={tempData.name || ''}
                            onChange={e => setTempData({ ...tempData, name: e.target.value })}
                            className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium"
                            placeholder="e.g. LLM Orchestration"
                        />
                    </div>
                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Proficiency Level</label>
                        <select
                            value={tempData.level || 'intermediate'}
                            onChange={e => setTempData({ ...tempData, level: e.target.value })}
                            className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl focus:ring-1 focus:ring-accent-blue/50 focus:border-accent-blue/50 outline-none text-sm text-[var(--text-primary)] font-medium cursor-pointer [color-scheme:dark]"
                        >
                            <option value="beginner">Beginner / Awareness</option>
                            <option value="intermediate">Intermediate / Practitioner</option>
                            <option value="expert">Expert / Architect</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !tempData.name}
                        className="bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 h-[50px] shrink-0"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin text-accent-blue" /> : <Plus size={16} />}
                        Append
                    </button>
                </form>
            </div>
        </Section>
    )
}

function LanguagesSection({ languages, onUpdate, loading, setLoading, showNotification }: { languages: Language[] } & SectionProps) {
    const [tempData, setTempData] = useState<Partial<Language>>({ proficiency: 'fluent' })

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!tempData.name) return
        setLoading(true)
        try {
            const res = await fetch('/api/profile/languages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempData)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate([result.data, ...languages])
            setTempData({ proficiency: 'fluent' })
            showNotification('Language added!', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Failed to add language', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        setLoading(true)
        try {
            const res = await fetch(`/api/profile/languages/${id}`, { method: 'DELETE' })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate(languages.filter((l: Language) => l.id !== id))
            showNotification('Language deleted', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Delete failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Section title="Languages" icon={Languages}>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {languages.map((lang: Language) => (
                        <div key={lang.id} className="p-4 bg-surface-main/30 border border-border-subtle rounded-2xl flex justify-between items-center group hover:border-accent-blue/30 transition-all">
                            <div>
                                <h3 className="text-sm font-black text-[var(--text-primary)] italic tracking-widest uppercase">{lang.name}</h3>
                                <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mt-1 opacity-70">{lang.proficiency}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(lang.id)}
                                className="text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-2 bg-surface-card rounded-xl border border-border-subtle"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSave} className="p-8 bg-surface-card border border-border-subtle rounded-[2rem] flex flex-col md:flex-row items-end gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Dialect / Language</label>
                        <input
                            required
                            type="text"
                            value={tempData.name || ''}
                            onChange={e => setTempData({ ...tempData, name: e.target.value })}
                            className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium"
                            placeholder="e.g. English"
                        />
                    </div>
                    <div className="w-full md:w-64 space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Neural Fluency</label>
                        <select
                            value={tempData.proficiency || 'Full Professional'}
                            onChange={e => setTempData({ ...tempData, proficiency: e.target.value })}
                            className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium cursor-pointer [color-scheme:dark]"
                        >
                            <option value="native">Native</option>
                            <option value="fluent">Fluent</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="basic">Basic</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !tempData.name}
                        className="bg-white text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 h-[50px] shrink-0"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin text-accent-blue" /> : <Plus size={16} />}
                        Append
                    </button>
                </form>
            </div>
        </Section>
    )
}

function CertificatesSection({ certificates, onUpdate, loading, setLoading, showNotification }: { certificates: Certificate[] } & SectionProps) {
    const [tempData, setTempData] = useState<Partial<Certificate>>({})

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!tempData.title) return
        setLoading(true)
        try {
            const res = await fetch('/api/profile/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempData)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate([result.data, ...certificates])
            setTempData({})
            showNotification('Certificate added!', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Failed to add certificate', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return
        setLoading(true)
        try {
            const res = await fetch(`/api/profile/certificates/${id}`, { method: 'DELETE' })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate(certificates.filter((c: Certificate) => c.id !== id))
            showNotification('Certificate deleted', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Delete failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Section title="Certifications" icon={Award}>
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map((cert: Certificate) => (
                        <div key={cert.id} className="p-6 bg-surface-main/30 border border-border-subtle rounded-[1.5rem] flex justify-between items-start group hover:border-accent-blue/30 transition-all">
                            <div className="space-y-2">
                                <h3 className="text-md font-black text-[var(--text-primary)] italic tracking-tight">{cert.title}</h3>
                                <p className="text-xs font-bold text-text-secondary">{cert.issuer}</p>
                                <div className="text-[10px] font-black text-accent-blue uppercase tracking-widest bg-accent-blue/5 px-3 py-1 rounded-lg border border-accent-blue/10 inline-block mt-2">
                                    Issued: {cert.issue_date}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(cert.id)}
                                className="text-text-muted hover:text-danger hover:bg-danger/10 p-2 rounded-xl border border-border-subtle bg-surface-card transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSave} className="p-8 bg-surface-card border border-border-subtle rounded-[2rem] space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Credential Title</label>
                            <input
                                required
                                type="text"
                                value={tempData.title || ''}
                                onChange={e => setTempData({ ...tempData, title: e.target.value })}
                                className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                placeholder="AWS Certified Solutions Architect"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Issuing Entity</label>
                            <input
                                required
                                type="text"
                                value={tempData.issuer || ''}
                                onChange={e => setTempData({ ...tempData, issuer: e.target.value })}
                                className="w-full px-5 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium shadow-inner"
                                placeholder="Amazon Web Services"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Issuance Sequence Date</label>
                            <input
                                required
                                type="date"
                                value={tempData.issue_date || ''}
                                onChange={e => setTempData({ ...tempData, issue_date: e.target.value })}
                                className="w-full px-4 py-3 bg-surface-main border border-border-subtle rounded-2xl outline-none text-sm text-[var(--text-primary)] font-medium [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading || !tempData.title}
                                className="w-full bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 h-[52px]"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin text-accent-blue" /> : <Plus size={18} />}
                                Commit Credential
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Section>
    )
}
