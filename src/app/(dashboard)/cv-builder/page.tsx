'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Sparkles, Loader2, Target, AlertCircle, Briefcase, ArrowRight, CheckCircle, X, Copy, Mail, ChevronDown, ChevronUp, Check, Lightbulb, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import type { Project } from '@/features/projects/types'
import type { Certificate } from '@/features/profile/types'

interface GeneratedResult {
    pdf_url: string
    ats_score: number
    cv_id: string
    ats_breakdown?: {
        score: number
        matched_keywords: string[]
        missing_keywords: string[]
        matched_phrases: string[]
        missing_phrases: string[]
        improvement_tips: string[]
    }
}

interface SaveFormState {
    company: string
    role: string
    job_url: string
    expected_salary: string
    notes: string
}

export default function CvBuilderPage() {
    const [jobDescription, setJobDescription] = useState('')
    const [jobTitle, setJobTitle] = useState('')
    const [companyName, setCompanyName] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [result, setResult] = useState<GeneratedResult | null>(null)
    const [cvId, setCvId] = useState<string | null>(null)
    const [pdfStatus, setPdfStatus] = useState<'idle' | 'pending' | 'compiling' | 'ready' | 'failed'>('idle')
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)

    // Template and Category state
    const [templateId, setTemplateId] = useState<string>('experienced')
    const [category, setCategory] = useState<string>('AI/ML')

    // Projects and Certs Data
    const [allProjects, setAllProjects] = useState<Project[]>([])
    const [allCerts, setAllCerts] = useState<Certificate[]>([])

    // Generation Options state
    const [allowAiProjects, setAllowAiProjects] = useState(true)
    const [allowAiCerts, setAllowAiCerts] = useState(true)
    const [forcedProjectIds, setForcedProjectIds] = useState<string[]>([])
    const [forcedProjectDescriptions, setForcedProjectDescriptions] = useState<Record<string, string>>({})
    const [forcedCertIds, setForcedCertIds] = useState<string[]>([])

    const fetchProfileData = async () => {
        try {
            const [profileRes, projectRes] = await Promise.all([
                fetch('/api/profile'),
                fetch('/api/profile/projects')
            ])

            if (profileRes.ok) {
                const { data } = await profileRes.json()
                if (data?.profile?.preferred_template) {
                    setTemplateId(data.profile.preferred_template)
                }
                if (data?.certificates) {
                    setAllCerts(data.certificates)
                }
            }

            if (projectRes.ok) {
                const { data } = await projectRes.json()
                setAllProjects(data)
            }
        } catch (e) {
            console.error('Failed to fetch profile data:', e)
        }
    }

    useEffect(() => {
        fetchProfileData()
    }, [])

    useEffect(() => {
        if (!cvId || pdfStatus === 'ready' || pdfStatus === 'failed' || pdfStatus === 'idle') return
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/cv/${cvId}/status`)
                const data = await res.json()
                setPdfStatus(data.pdf_status)
                if (data.pdf_status === 'ready') {
                    setPdfUrl(data.pdf_url)
                    setResult(prev => prev ? { ...prev, pdf_url: data.pdf_url } : prev)
                    clearInterval(interval)
                }
                if (data.pdf_status === 'failed') {
                    setError('PDF compilation failed. Please try again.')
                    clearInterval(interval)
                }
            } catch (e) {
                console.error('Polling error:', e)
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [cvId, pdfStatus])

    const compilingMessages = [
        'Tailoring your experience to match the JD...',
        'Optimizing ATS keywords for this role...',
        'Formatting your professional LaTeX PDF...',
        'Running final quality checks...',
        'Almost there...'
    ]

    const careerTips = [
        '💡 CVs with quantified achievements get 40% more callbacks',
        '⚡ Apply within 48 hours of posting for 3x higher response rate',
        '📊 Tailored CVs get 6x more interviews than generic ones',
        '🔑 Recruiters spend 7 seconds on a CV — yours is optimized',
        '📈 Adding metrics to bullet points increases interview rate by 38%'
    ]

    const [msgIndex, setMsgIndex] = useState(0)
    const [tipIndex, setTipIndex] = useState(0)

    useEffect(() => {
        if (pdfStatus !== 'pending' && pdfStatus !== 'compiling') return
        const msgInterval = setInterval(() => {
            setMsgIndex(i => (i + 1) % compilingMessages.length)
        }, 6000)
        const tipInterval = setInterval(() => {
            setTipIndex(i => (i + 1) % careerTips.length)
        }, 9000)
        return () => {
            clearInterval(msgInterval)
            clearInterval(tipInterval)
        }
    }, [pdfStatus])

    // Save as application state
    const [showSaveForm, setShowSaveForm] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [savedApplicationId, setSavedApplicationId] = useState<string | null>(null)
    const [saveForm, setSaveForm] = useState<SaveFormState>({
        company: '',
        role: '',
        job_url: '',
        expected_salary: '',
        notes: '',
    })

    // Cover Letter state
    const [isGeneratingCL, setIsGeneratingCL] = useState(false)
    const [coverLetter, setCoverLetter] = useState<string | null>(null)
    const [clCopied, setClCopied] = useState(false)

    // ATS Breakdown state
    const [showAtsBreakdown, setShowAtsBreakdown] = useState(false)

    // User Limits
    const [limits, setLimits] = useState<any>(null)

    const fetchLimits = async () => {
        try {
            const res = await fetch('/api/user/limits')
            if (res.ok) {
                const { data } = await res.json()
                setLimits(data)
            }
        } catch (e) {
            console.error('Failed to fetch limits', e)
        }
    }

    useState(() => {
        fetchLimits()
    })

    const handleGenerate = async () => {
        if (!jobDescription || !jobTitle || !companyName) {
            setError('Please provide Job Title, Company Name, and Job Description')
            return
        }

        setIsGenerating(true)
        setError(null)
        setResult(null)
        setSavedApplicationId(null)
        setCvId(null)
        setPdfStatus('idle')
        setPdfUrl(null)

        try {
            const response = await fetch('/api/cv/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_description: jobDescription,
                    job_title: jobTitle,
                    company_name: companyName,
                    template_id: templateId,
                    category: category,
                    forcedProjectIds,
                    forcedProjectDescriptions,
                    allowAiProjects,
                    forcedCertIds,
                    allowAiCerts
                }),
            })

            const json = await response.json()

            if (!response.ok) {
                if (response.status === 403 || json.code === 'LIMIT_REACHED') {
                    setError(json.error || 'Monthly limit reached. Upgrade to Pro for unlimited generations.')
                } else {
                    throw new Error(json.error || 'Failed to generate CV')
                }
                return
            }

            setResult({
                pdf_url: json.data.pdf_url,
                ats_score: json.data.ats_score,
                cv_id: json.data.cv_id,
                ats_breakdown: json.data.ats_breakdown,
            })
            setCvId(json.data.cv_id)
            setPdfStatus(json.data.pdf_status || 'pending')

            // Refresh limits after generation
            fetchLimits()

            // Pre-fill the save form
            setSaveForm(prev => ({
                ...prev,
                company: companyName || '',
                role: jobTitle || '',
            }))
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to generate CV')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSaveApplication = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!result) return

        setIsSaving(true)
        try {
            const response = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company: saveForm.company,
                    role: saveForm.role,
                    job_url: saveForm.job_url || null,
                    expected_salary: saveForm.expected_salary || null,
                    notes: saveForm.notes || null,
                    cv_generation_id: result.cv_id,
                    status: 'applied',
                    applied_date: new Date().toISOString().split('T')[0],
                    category: category // added category
                }),
            })
            const json = await response.json()
            if (!response.ok) throw new Error(json.error || 'Failed to save')
            setSavedApplicationId(json.data.id as string)
            setShowSaveForm(false)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to save application')
        } finally {
            setIsSaving(false)
        }
    }

    const handleGenerateCL = async () => {
        if (!result || !jobDescription) return

        setIsGeneratingCL(true)
        setCoverLetter(null)
        setClCopied(false)

        try {
            const response = await fetch('/api/cover-letter/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_description: jobDescription,
                    company: companyName || saveForm.company || 'the company',
                    role: jobTitle || saveForm.role || 'the role',
                    cv_generation_id: result.cv_id,
                }),
            })

            const json = await response.json()
            if (!response.ok) throw new Error(json.error || 'Failed to generate')

            setCoverLetter(json.data.content)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to generate cover letter')
        } finally {
            setIsGeneratingCL(false)
        }
    }

    const copyToClipboard = () => {
        if (!coverLetter) return
        navigator.clipboard.writeText(coverLetter)
        setClCopied(true)
        setTimeout(() => setClCopied(false), 2000)
    }

    const getAtsColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
        if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-[var(--text-primary)] italic flex items-center gap-3">
                        <Sparkles className="text-accent-blue" />
                        AI CV Builder
                    </h1>
                    <p className="text-text-secondary font-medium max-w-xl">
                        Tailor your profile to any job description in seconds. Our AI optimizes your technical impact and GitHub highlights for maximum ATS performance.
                    </p>
                </div>

                {limits && limits.tier === 'free' && (
                    <div className="bg-accent-blue-muted border border-accent-blue/20 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-10 h-10 bg-accent-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-accent-blue/20">
                            <Zap size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest leading-none mb-1">
                                {limits.usage.cv_generations_this_month} / {limits.features.cv_generations_per_month} Free
                            </p>
                            <Link href="/settings" className="text-[10px] font-bold text-accent-blue hover:underline">
                                Upgrade for unlimited
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Input */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-surface-card border border-border-subtle rounded-3xl p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Job Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Senior Machine Learning Engineer"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full bg-surface-hover border border-border-subtle rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all font-bold"
                                    disabled={isGenerating}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Company</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Google DeepMind"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full bg-surface-hover border border-border-subtle rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder:text-text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all font-bold"
                                    disabled={isGenerating}
                                />
                            </div>
                        </div>

                            <div className="space-y-4 md:col-span-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">CV Template</label>
                                    <Link href="/templates" className="text-[10px] font-bold text-accent-blue hover:underline">
                                        View details →
                                    </Link>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { id: 'experienced', name: 'Professional', desc: 'Experience-first layout' },
                                        { id: 'student', name: 'Student', desc: 'Education-first layout' }
                                    ].map(t => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setTemplateId(t.id)}
                                            disabled={isGenerating}
                                            className={`p-4 rounded-xl border text-left transition-all ${
                                                templateId === t.id 
                                                    ? 'border-accent-blue bg-accent-blue/5 shadow-[0_0_15px_rgba(59,130,246,0.1)] ring-1 ring-accent-blue' 
                                                    : 'border-border-subtle bg-surface-hover hover:border-border-hover'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`text-sm font-black italic tracking-tight ${templateId === t.id ? 'text-accent-blue' : 'text-[var(--text-primary)]'}`}>
                                                    {t.name}
                                                </span>
                                                {templateId === t.id && <CheckCircle size={14} className="text-accent-blue" />}
                                            </div>
                                            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{t.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-1">Category</label>
                                <div className="relative">
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-surface-hover border border-border-subtle rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all font-bold appearance-none cursor-pointer"
                                        disabled={isGenerating}
                                    >
                                        {['Frontend', 'Backend', 'Full Stack', 'AI/ML', 'Data Science', 'DevOps', 'Mobile', 'Security', 'Other'].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                </div>
                            </div>

                            {/* Featured Projects Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Featured Projects</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-text-muted uppercase">Let AI pick extras</span>
                                        <button
                                            type="button"
                                            onClick={() => setAllowAiProjects(!allowAiProjects)}
                                            className={`w-8 h-4 rounded-full transition-all relative ${allowAiProjects ? 'bg-accent-blue' : 'bg-border-subtle'}`}
                                        >
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${allowAiProjects ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {[...allProjects].sort((a, b) => (b.is_hero ? 1 : 0) - (a.is_hero ? 1 : 0)).map(project => (
                                        <div key={project.id} className="space-y-2">
                                            <div 
                                                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                                                    forcedProjectIds.includes(project.id)
                                                        ? 'border-accent-blue bg-accent-blue/5' 
                                                        : 'border-border-subtle bg-surface-hover hover:border-border-hover'
                                                }`}
                                                onClick={() => {
                                                    if (forcedProjectIds.includes(project.id)) {
                                                        setForcedProjectIds(forcedProjectIds.filter(id => id !== project.id))
                                                    } else {
                                                        setForcedProjectIds([...forcedProjectIds, project.id])
                                                    }
                                                }}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                                    forcedProjectIds.includes(project.id) ? 'bg-accent-blue border-accent-blue' : 'border-text-muted'
                                                }`}>
                                                    {forcedProjectIds.includes(project.id) && <Check size={10} className="text-white" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-[var(--text-primary)] truncate">{project.name}</span>
                                                        {project.is_hero && (
                                                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 rounded text-[8px] font-black uppercase tracking-tighter">
                                                                <Star size={8} fill="currentColor" /> Hero
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-text-muted truncate">{project.technologies.join(', ')}</p>
                                                </div>
                                            </div>
                                            {forcedProjectIds.includes(project.id) && (
                                                <div className="pl-7 pb-2 animate-in slide-in-from-top-1 duration-200">
                                                    <textarea
                                                        placeholder="Custom description (leave blank for AI to write)"
                                                        value={forcedProjectDescriptions[project.id] || ''}
                                                        onChange={(e) => setForcedProjectDescriptions({...forcedProjectDescriptions, [project.id]: e.target.value})}
                                                        className="w-full bg-surface-main border border-border-subtle rounded-lg px-3 py-2 text-[10px] font-medium text-[var(--text-primary)] placeholder:text-text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all h-16 resize-none"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {allProjects.length === 0 && (
                                        <p className="text-[10px] text-text-muted text-center py-4 bg-surface-hover rounded-xl border border-dashed border-border-subtle italic">
                                            No projects found. Add them in your profile.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Featured Certifications Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Featured Certifications</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-text-muted uppercase">Let AI pick extras</span>
                                        <button
                                            type="button"
                                            onClick={() => setAllowAiCerts(!allowAiCerts)}
                                            className={`w-8 h-4 rounded-full transition-all relative ${allowAiCerts ? 'bg-accent-blue' : 'bg-border-subtle'}`}
                                        >
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${allowAiCerts ? 'right-0.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {[...allCerts].map(cert => (
                                        <div 
                                            key={cert.id}
                                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                                                forcedCertIds.includes(cert.id)
                                                    ? 'border-accent-blue bg-accent-blue/5' 
                                                    : 'border-border-subtle bg-surface-hover hover:border-border-hover'
                                            }`}
                                            onClick={() => {
                                                if (forcedCertIds.includes(cert.id)) {
                                                    setForcedCertIds(forcedCertIds.filter(id => id !== cert.id))
                                                } else {
                                                    setForcedCertIds([...forcedCertIds, cert.id])
                                                }
                                            }}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center font-black transition-all ${
                                                forcedCertIds.includes(cert.id) ? 'bg-accent-blue border-accent-blue' : 'border-text-muted'
                                            }`}>
                                                {forcedCertIds.includes(cert.id) && <Check size={10} className="text-white" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <span className="text-[10px] font-bold text-[var(--text-primary)] truncate block">{cert.title}</span>
                                                <span className="text-[9px] text-text-muted truncate block">{cert.issuer}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {allCerts.length === 0 && (
                                        <p className="text-[10px] text-text-muted text-center py-4 bg-surface-hover rounded-xl border border-dashed border-border-subtle italic col-span-2">
                                            No certifications found. Add them in your profile.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Job Description</label>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${jobDescription.length > 500 ? 'text-accent-blue' : 'text-text-muted'}`}>
                                    {jobDescription.length} characters
                                </span>
                            </div>
                            <textarea
                                rows={15}
                                placeholder="Paste the job requirements and description here..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                className="w-full bg-surface-hover border border-border-subtle rounded-2xl px-5 py-5 text-[var(--text-primary)] placeholder:text-text-muted focus:border-accent-blue focus:ring-1 focus:ring-accent-blue outline-none transition-all font-mono text-sm leading-relaxed resize-none custom-scrollbar"
                                disabled={isGenerating}
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 text-danger animate-in slide-in-from-top-2">
                                <AlertCircle size={18} />
                                <p className="text-sm font-bold">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !jobDescription || !jobTitle || !companyName}
                            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all relative overflow-hidden group
                                ${isGenerating
                                    ? 'bg-surface-hover text-text-muted cursor-wait'
                                    : 'bg-white text-black hover:bg-gray-100 hover:scale-[1.01] active:scale-100'
                                }
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                                    <Loader2 className="animate-spin" size={20} />
                                    Tailoring Profile...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                                    Generate Optimized CV
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Column: Output/Status */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                    {(pdfStatus === 'pending' || pdfStatus === 'compiling' || isGenerating) ? (
                        <div className="bg-surface-card border border-border-subtle rounded-3xl p-12 text-center space-y-10 animate-in fade-in duration-500 relative overflow-hidden">
                            <div className="absolute top-0 left-0 h-1 bg-accent-blue/20 w-full overflow-hidden">
                                <div className="h-full bg-accent-blue transition-all duration-[50000ms] ease-out w-[90%]" style={{ width: pdfStatus === 'compiling' || pdfStatus === 'pending' ? '90%' : '0%' }} />
                            </div>
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 rounded-full border-4 border-surface-hover" />
                                <div className="absolute inset-0 rounded-full border-4 border-accent-blue border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center text-accent-blue font-black text-[10px] uppercase tracking-widest animate-pulse">
                                    AI
                                </div>
                            </div>
                            <div className="space-y-3 h-16">
                                <h3 className="text-xl font-bold text-[var(--text-primary)] animate-in slide-in-from-bottom-4 fade-in duration-500" key={msgIndex}>
                                    {compilingMessages[msgIndex]}
                                </h3>
                                <p className="text-xs text-text-muted font-medium uppercase tracking-[0.2em]">
                                    Usually takes 30-60 seconds
                                </p>
                            </div>
                            <div className="pt-8 border-t border-border-subtle/50">
                                <p className="text-sm font-medium text-text-secondary italic animate-in fade-in zoom-in-95 duration-700" key={tipIndex}>
                                    {careerTips[tipIndex]}
                                </p>
                            </div>
                        </div>
                    ) : !result ? (
                        <div className="bg-surface-card border border-border-subtle border-dashed rounded-3xl p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center mx-auto text-text-muted">
                                <FileText size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Results Area</h3>
                                <p className="text-text-secondary text-sm font-medium">
                                    Fill in the job details and generate to see your tailored CV and ATS optimization breakdown.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                            {/* Score & Main Actions */}
                            <div className="bg-surface-card border border-border-subtle rounded-3xl p-8 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">ATS Match Score</h3>
                                        <p className="text-xs text-text-secondary font-medium">Optimization performance index</p>
                                    </div>
                                    <div className="relative w-24 h-24">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border-subtle" />
                                            <circle
                                                cx="48" cy="48" r="42"
                                                stroke="currentColor" strokeWidth="8" fill="transparent"
                                                strokeDasharray={263.8}
                                                strokeDashoffset={263.8 - (263.8 * (result?.ats_score || 0)) / 100}
                                                className={`transition-all duration-1000 ease-out ${(result?.ats_score || 0) >= 80 ? 'text-success' : (result?.ats_score || 0) >= 60 ? 'text-warning' : 'text-danger'
                                                    }`}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl font-black text-[var(--text-primary)]">{result?.ats_score}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <a
                                        href={pdfUrl || result?.pdf_url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-3 p-5 bg-surface-hover border border-border-subtle rounded-2xl hover:border-accent-blue transition-all group"
                                    >
                                        <Download size={24} className="text-text-muted group-hover:text-accent-blue transition-colors" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-[var(--text-primary)] transition-colors">Download PDF</span>
                                    </a>
                                    <button
                                        onClick={handleGenerateCL}
                                        disabled={isGeneratingCL}
                                        className="flex flex-col items-center gap-3 p-5 bg-surface-hover border border-border-subtle rounded-2xl hover:border-accent-blue transition-all group"
                                    >
                                        {isGeneratingCL ? <Loader2 className="animate-spin text-accent-blue" size={24} /> : <Mail size={24} className="text-text-muted group-hover:text-accent-blue transition-colors" />}
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-[var(--text-primary)] transition-colors">Cover Letter</span>
                                    </button>
                                </div>

                                {savedApplicationId ? (
                                    <Link
                                        href="/jobs"
                                        className="w-full py-4 bg-accent-blue-muted text-accent-blue border border-accent-blue/30 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-accent-blue-muted/80 transition-all"
                                    >
                                        <CheckCircle size={16} />
                                        Application Saved
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setShowSaveForm(true)}
                                        className="w-full py-4 bg-accent-blue text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-accent-blue/20"
                                    >
                                        <Briefcase size={16} />
                                        Save Application
                                    </button>
                                )}
                            </div>

                            {/* Optimization Breakdown */}
                            {result?.ats_breakdown && (
                                <div className="bg-surface-card border border-border-subtle rounded-3xl p-8 space-y-6">
                                    <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                                        <h3 className="text-sm font-black uppercase tracking-[0.15em] text-[var(--text-primary)]">Market Fit Analysis</h3>
                                        <div className="flex items-center gap-1.5 text-success">
                                            <Target size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">High Impact</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Matched Strengths</p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.ats_breakdown.matched_keywords.slice(0, 8).map((kw, i) => (
                                                    <span key={i} className="px-3 py-1 bg-success/10 text-success border border-success/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Missing Opportunities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.ats_breakdown.missing_keywords.slice(0, 8).map((kw, i) => (
                                                    <span key={i} className="px-3 py-1 bg-danger/10 text-danger border border-danger/20 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-warning/10 border border-warning/20 p-5 rounded-2xl space-y-3">
                                            <div className="flex items-center gap-2 text-warning">
                                                <Lightbulb size={16} />
                                                <p className="text-xs font-black uppercase tracking-widest">Growth Recommendation</p>
                                            </div>
                                            <p className="text-xs text-text-secondary font-medium leading-relaxed">
                                                {result.ats_breakdown.improvement_tips[0] || 'Optimize your professional summary with missing technical keywords.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Save Application Modal */}
            {showSaveForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in transition-all">
                    <div className="bg-surface-card border border-border-subtle w-full max-w-lg rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black italic text-[var(--text-primary)]">Save Application</h2>
                            <button onClick={() => setShowSaveForm(false)} className="text-text-muted hover:text-[var(--text-primary)] transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveApplication} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Company</label>
                                    <input
                                        required
                                        type="text"
                                        value={saveForm.company}
                                        onChange={e => setSaveForm(p => ({ ...p, company: e.target.value }))}
                                        className="w-full bg-surface-hover border border-border-subtle rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-accent-blue transition-all text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Role</label>
                                    <input
                                        required
                                        type="text"
                                        value={saveForm.role}
                                        onChange={e => setSaveForm(p => ({ ...p, role: e.target.value }))}
                                        className="w-full bg-surface-hover border border-border-subtle rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-accent-blue transition-all text-sm font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Expect Salary</label>
                                <input
                                    type="text"
                                    placeholder="e.g. $140,000"
                                    value={saveForm.expected_salary}
                                    onChange={e => setSaveForm(p => ({ ...p, expected_salary: e.target.value }))}
                                    className="w-full bg-surface-hover border border-border-subtle rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-accent-blue transition-all text-sm font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Notes</label>
                                <textarea
                                    rows={3}
                                    value={saveForm.notes}
                                    onChange={e => setSaveForm(p => ({ ...p, notes: e.target.value }))}
                                    className="w-full bg-surface-hover border border-border-subtle rounded-xl px-4 py-2 text-[var(--text-primary)] outline-none focus:border-accent-blue transition-all text-sm font-bold resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                            >
                                {isSaving && <Loader2 className="animate-spin" size={16} />}
                                Confirm & Save
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Cover Letter Modal */}
            {coverLetter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in transition-all">
                    <div className="bg-surface-card border border-border-subtle w-full max-w-2xl rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-accent-blue">
                                <Mail size={24} />
                                <h2 className="text-2xl font-black italic text-[var(--text-primary)] uppercase tracking-tight">Cover Letter</h2>
                            </div>
                            <button onClick={() => setCoverLetter(null)} className="text-text-muted hover:text-[var(--text-primary)] transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="relative group">
                            <button
                                onClick={copyToClipboard}
                                className="absolute top-4 right-4 p-2 bg-surface-hover rounded-xl border border-border-subtle text-text-secondary hover:text-[var(--text-primary)] transition-all transition-opacity"
                            >
                                {clCopied ? <Check size={18} className="text-success" /> : <Copy size={18} />}
                            </button>
                            <div className="bg-surface-main/50 p-8 border border-border-subtle rounded-2xl text-text-secondary text-sm leading-relaxed whitespace-pre-wrap font-mono max-h-[50vh] overflow-y-auto no-scrollbar">
                                {coverLetter}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Generated by Qalm AI</p>
                            <button
                                onClick={copyToClipboard}
                                className="px-6 py-2 bg-accent-blue text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-accent-blue/10"
                            >
                                {clCopied ? 'Copied' : 'Copy Letter'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
