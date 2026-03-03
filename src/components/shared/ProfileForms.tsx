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
    ExternalLink
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
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border animate-in fade-in slide-in-from-top-4 ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <div className="flex items-center gap-2">
                        {notification.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span className="text-sm font-medium">{notification.message}</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            {isOpen && <div className="p-6 pt-0 border-t border-gray-50">{children}</div>}
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
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input
                        type="text"
                        value={formData.full_name || ''}
                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="John Doe"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                    <input
                        type="email"
                        value={formData.email || ''}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="john@example.com"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
                    <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="+1 234 567 890"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</label>
                    <input
                        type="number"
                        value={formData.age || ''}
                        onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) || null })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="25"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Headline</label>
                    <input
                        type="text"
                        value={formData.headline || ''}
                        onChange={e => setFormData({ ...formData, headline: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="AI/ML Engineer | LangChain | Python"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label>
                    <input
                        type="text"
                        value={formData.city || ''}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="San Francisco"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</label>
                    <input
                        type="text"
                        value={formData.country || ''}
                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="USA"
                    />
                </div>
                <div className="col-span-full space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Professional Summary</label>
                    <textarea
                        rows={4}
                        value={formData.summary || ''}
                        onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none resize-none"
                        placeholder="Write a brief summary of your professional background..."
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">LinkedIn URL</label>
                    <input
                        type="url"
                        value={formData.linkedin_url || ''}
                        onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="https://linkedin.com/in/..."
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">GitHub Username</label>
                    <input
                        type="text"
                        value={formData.github_username || ''}
                        onChange={e => setFormData({ ...formData, github_username: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm outline-none"
                        placeholder="johndoe"
                    />
                </div>
                <div className="col-span-full flex justify-end mt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
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
            <div className="space-y-4">
                {experiences.map((exp: Experience) => (
                    <div key={exp.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                            <p className="text-sm text-gray-600">{exp.company} • {exp.location}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingId(exp.id); setTempData(exp); setIsAdding(true); }}
                                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(exp.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {!isAdding ? (
                    <button
                        onClick={() => { setIsAdding(true); setEditingId(null); setTempData({ is_current: false }); }}
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Experience
                    </button>
                ) : (
                    <form onSubmit={handleSave} className="p-6 bg-blue-50/30 border border-blue-100 rounded-xl space-y-4">
                        <h3 className="font-semibold text-blue-900">{editingId ? 'Edit' : 'Add'} Experience</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Title</label>
                                <input
                                    required
                                    type="text"
                                    value={tempData.title || ''}
                                    onChange={e => setTempData({ ...tempData, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Company</label>
                                <input
                                    required
                                    type="text"
                                    value={tempData.company || ''}
                                    onChange={e => setTempData({ ...tempData, company: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Location</label>
                                <input
                                    type="text"
                                    value={tempData.location || ''}
                                    onChange={e => setTempData({ ...tempData, location: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
                                <input
                                    required
                                    type="date"
                                    value={tempData.start_date || ''}
                                    onChange={e => setTempData({ ...tempData, start_date: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
                                <input
                                    type="date"
                                    disabled={tempData.is_current}
                                    value={tempData.end_date || ''}
                                    onChange={e => setTempData({ ...tempData, end_date: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm disabled:opacity-50"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="curr-exp"
                                    checked={tempData.is_current}
                                    onChange={e => setTempData({ ...tempData, is_current: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="curr-exp" className="text-sm text-gray-700">I currently work here</label>
                            </div>
                            <div className="col-span-full space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                                <textarea
                                    rows={4}
                                    value={tempData.description || ''}
                                    onChange={e => setTempData({ ...tempData, description: e.target.value })}
                                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                type="button"
                                onClick={() => { setIsAdding(false); setEditingId(null); setTempData({}); }}
                                className="px-6 py-2 text-gray-600 text-sm font-medium hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingId ? 'Update' : 'Add'}
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
            <div className="space-y-4">
                {education.map((edu: Education) => (
                    <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
                            <p className="text-sm text-gray-600">{edu.degree} in {edu.field}</p>
                            <p className="text-xs text-gray-500 mt-1">{edu.start_date} - {edu.end_date}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingId(edu.id); setTempData(edu); setIsAdding(true); }}
                                className="text-gray-400 hover:text-blue-600 p-2"
                            >Edit</button>
                            <button onClick={() => handleDelete(edu.id)} className="text-gray-400 hover:text-red-600 p-2">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Add Education
                    </button>
                ) : (
                    <form onSubmit={handleSave} className="p-6 bg-blue-50/30 border border-blue-100 rounded-xl space-y-4">
                        <h3 className="font-semibold text-blue-900">{editingId ? 'Edit' : 'Add'} Education</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-full space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Institution</label>
                                <input required type="text" value={tempData.institution || ''} onChange={e => setTempData({ ...tempData, institution: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Degree</label>
                                <input required type="text" value={tempData.degree || ''} onChange={e => setTempData({ ...tempData, degree: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Field of Study</label>
                                <input type="text" value={tempData.field || ''} onChange={e => setTempData({ ...tempData, field: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
                                <input type="date" value={tempData.start_date || ''} onChange={e => setTempData({ ...tempData, start_date: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
                                <input type="date" value={tempData.end_date || ''} onChange={e => setTempData({ ...tempData, end_date: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Grade (GPA)</label>
                                <input type="text" value={tempData.grade || ''} onChange={e => setTempData({ ...tempData, grade: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" placeholder="e.g. 3.8/4.0" />
                            </div>
                            <div className="col-span-full space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                                <textarea value={tempData.description || ''} onChange={e => setTempData({ ...tempData, description: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm resize-none" rows={3} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-gray-600 text-sm font-medium hover:text-gray-900">Cancel</button>
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Section>
    )
}

function SkillsSection({ skills, onUpdate, loading, setLoading, showNotification }: { skills: Skill[] } & SectionProps) {
    const [newSkill, setNewSkill] = useState<Partial<Skill>>({ level: 'intermediate', category: 'Standard' })

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newSkill.name) return
        setLoading(true)
        try {
            const res = await fetch('/api/profile/skills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSkill)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate([...skills, result.data])
            setNewSkill({ level: 'intermediate', category: 'Standard' })
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
        <Section title="Skills" icon={Wrench}>
            <div className="space-y-6">
                <form onSubmit={handleAdd} className="flex gap-2">
                    <input
                        required
                        type="text"
                        placeholder="Skill name..."
                        value={newSkill.name || ''}
                        onChange={e => setNewSkill({ ...newSkill, name: e.target.value })}
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </form>
                <div className="flex flex-wrap gap-2">
                    {skills.map((skill: Skill) => (
                        <span key={skill.id} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium group transition-all hover:bg-red-50 hover:text-red-700">
                            {skill.name}
                            <button
                                onClick={() => handleDelete(skill.id)}
                                className="opacity-0 group-hover:opacity-100 ml-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        </Section>
    )
}

function LanguagesSection({ languages, onUpdate, loading, setLoading, showNotification }: { languages: Language[] } & SectionProps) {
    const [newData, setNewData] = useState<Partial<Language>>({ proficiency: 'fluent' })

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newData.name) return
        setLoading(true)
        try {
            const res = await fetch('/api/profile/languages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate([...languages, result.data])
            setNewData({ proficiency: 'fluent' })
            showNotification('Language added!', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Failed to add language', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/profile/languages/${id}`, { method: 'DELETE' })
            const result = await res.json()
            if (result.error) throw new Error(result.error)
            onUpdate(languages.filter((l: Language) => l.id !== id))
            showNotification('Language removed', 'success')
        } catch (err: any) {
            showNotification(err.message || 'Delete failed', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Section title="Languages" icon={Globe}>
            <div className="space-y-4">
                <form onSubmit={handleAdd} className="flex gap-2">
                    <input
                        required
                        type="text"
                        placeholder="e.g. English"
                        value={newData.name || ''}
                        onChange={e => setNewData({ ...newData, name: e.target.value })}
                        className="flex-1 min-w-0 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
                    />
                    <select
                        value={newData.proficiency}
                        onChange={e => setNewData({ ...newData, proficiency: e.target.value })}
                        className="px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    >
                        <option value="native">Native</option>
                        <option value="fluent">Fluent</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="basic">Basic</option>
                    </select>
                    <button type="submit" disabled={loading} className="p-2 bg-blue-600 text-white rounded-lg"><Plus className="w-5 h-5" /></button>
                </form>
                <div className="space-y-2">
                    {languages.map((l: Language) => (
                        <div key={l.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm group">
                            <div>
                                <span className="font-medium text-gray-900">{l.name}</span>
                                <span className="ml-2 text-xs text-gray-500 italic">({l.proficiency})</span>
                            </div>
                            <button
                                onClick={() => handleDelete(l.id)}
                                className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </Section>
    )
}

function CertificatesSection({ certificates, onUpdate, loading, setLoading, showNotification }: { certificates: Certificate[] } & SectionProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [tempData, setTempData] = useState<Partial<Certificate>>({})

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const url = editingId ? `/api/profile/certificates/${editingId}` : '/api/profile/certificates'
            const method = editingId ? 'PATCH' : 'POST'
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempData)
            })
            const result = await res.json()
            if (result.error) throw new Error(result.error)

            const newData = editingId
                ? certificates.map((c: Certificate) => c.id === editingId ? result.data : c)
                : [result.data, ...certificates]

            onUpdate(newData)
            showNotification(editingId ? 'Certificate updated!' : 'Certificate added!', 'success')
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
            <div className="space-y-4">
                {certificates.map((cert: Certificate) => (
                    <div key={cert.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                                {cert.credential_url && (
                                    <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                            </div>
                            <p className="text-sm text-gray-600">{cert.issuer}</p>
                            <p className="text-xs text-gray-500 mt-1">{cert.issue_date} {cert.expiry_date ? ` - ${cert.expiry_date}` : ''}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setEditingId(cert.id); setTempData(cert); setIsAdding(true); }}
                                className="text-gray-400 hover:text-blue-600 p-2"
                            >Edit</button>
                            <button onClick={() => handleDelete(cert.id)} className="text-gray-400 hover:text-red-600 p-2">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-4 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Add Certificate
                    </button>
                ) : (
                    <form onSubmit={handleSave} className="p-6 bg-blue-50/30 border border-blue-100 rounded-xl space-y-4">
                        <h3 className="font-semibold text-blue-900">{editingId ? 'Edit' : 'Add'} Certificate</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-full space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Certificate Title</label>
                                <input required type="text" value={tempData.title || ''} onChange={e => setTempData({ ...tempData, title: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Issuer</label>
                                <input required type="text" value={tempData.issuer || ''} onChange={e => setTempData({ ...tempData, issuer: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Credential URL</label>
                                <input type="url" value={tempData.credential_url || ''} onChange={e => setTempData({ ...tempData, credential_url: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Issue Date</label>
                                <input type="date" value={tempData.issue_date || ''} onChange={e => setTempData({ ...tempData, issue_date: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Expiry Date</label>
                                <input type="date" value={tempData.expiry_date || ''} onChange={e => setTempData({ ...tempData, expiry_date: e.target.value })} className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none text-sm" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-gray-600 text-sm font-medium hover:text-gray-900">Cancel</button>
                            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                Save
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Section>
    )
}
