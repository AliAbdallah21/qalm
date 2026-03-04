'use client'

import { useState } from 'react'
import { FileText, Download, Sparkles, Loader2, Target, AlertCircle, Briefcase, ArrowRight, CheckCircle, X, Copy, Mail, ChevronDown, ChevronUp, Check, Lightbulb, Zap } from 'lucide-react'
import Link from 'next/link'

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

        try {
            const response = await fetch('/api/cv/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_description: jobDescription,
                    job_title: jobTitle,
                    company_name: companyName,
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-black" />
                    AI CV Builder
                </h1>
                <p className="text-gray-500">
                    Paste the job description below, and Qalm will tailor your experience and GitHub projects to match perfectly.
                </p>
            </div>

            {limits && limits.tier === 'free' && (
                <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Zap className="text-indigo-600 w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-indigo-900">
                                {limits.usage.cv_generations_this_month} of {limits.features.cv_generations_per_month} free generations used
                            </p>
                            <p className="text-xs text-indigo-600">Upgrade to Pro for unlimited tailored CVs</p>
                        </div>
                    </div>
                    <Link href="/settings" className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                        Upgrade
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full space-y-2">
                    <label className="text-sm font-medium text-gray-700">Target Job Title *</label>
                    <input
                        type="text"
                        placeholder="e.g. Senior AI Engineer"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                        disabled={isGenerating}
                        required
                    />
                </div>
                <div className="col-span-full space-y-2">
                    <label className="text-sm font-medium text-gray-700">Company Name *</label>
                    <input
                        type="text"
                        placeholder="e.g. OpenAI"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                        disabled={isGenerating}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Job Description *</label>
                <textarea
                    rows={10}
                    placeholder="Paste the raw job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all resize-none"
                    disabled={isGenerating}
                    required
                />
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="animate-spin" />
                        AI is tailoring your CV...
                    </>
                ) : (
                    <>
                        <Sparkles size={18} />
                        Generate Tailored CV
                    </>
                )}
            </button>

            {result && (
                <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-xl space-y-6 animate-in slide-in-from-bottom-5 duration-700">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white">
                                <FileText size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Your CV is Ready!</h3>
                                <p className="text-sm text-gray-500">Generated using your profile and top GitHub projects.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowAtsBreakdown(!showAtsBreakdown)}
                            className={`p-4 rounded-2xl border flex items-center gap-4 transition-all hover:shadow-md ${getAtsColor(result.ats_score)}`}
                        >
                            <Target size={32} />
                            <div className="text-left">
                                <p className="text-xs font-bold uppercase tracking-wider opacity-70">ATS Score</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold">{result.ats_score}%</p>
                                    {showAtsBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* ATS Breakdown Panel */}
                    {showAtsBreakdown && result.ats_breakdown && (
                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6 animate-in slide-in-from-top-4 duration-500">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Target size={18} />
                                    ATS Optimization Breakdown
                                </h4>
                                <span className="text-xs font-medium text-gray-500">Based on Job Description Analysis</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                    <span>Match Strength</span>
                                    <span>{result.ats_breakdown.score}%</span>
                                </div>
                                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${result.ats_breakdown.score >= 80 ? 'bg-emerald-500' :
                                            result.ats_breakdown.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${result.ats_breakdown.score}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Matched */}
                                <div className="space-y-3">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                                        <Check size={14} />
                                        Matched Keywords & Phrases
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {result.ats_breakdown.matched_keywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-medium border border-emerald-200">
                                                {kw}
                                            </span>
                                        ))}
                                        {result.ats_breakdown.matched_phrases.map((phrase, i) => (
                                            <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md text-xs font-medium border border-emerald-100 italic">
                                                "{phrase}"
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Missing */}
                                <div className="space-y-3">
                                    <h5 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1">
                                        <X size={14} />
                                        Missing Keywords & Phrases
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {result.ats_breakdown.missing_keywords.map((kw, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium border border-red-200">
                                                {kw}
                                            </span>
                                        ))}
                                        {result.ats_breakdown.missing_phrases.map((phrase, i) => (
                                            <span key={i} className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium border border-red-100 italic">
                                                "{phrase}"
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Improvement Tips */}
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-3">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-2">
                                    <Lightbulb size={14} />
                                    Critical Optimization Tips
                                </h5>
                                <ul className="space-y-2">
                                    {result.ats_breakdown.improvement_tips.map((tip, i) => (
                                        <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                                            <span className="flex-shrink-0 w-5 h-5 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5">
                                                {i + 1}
                                            </span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50">
                        {/* Download */}
                        <a
                            href={result.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                        >
                            <Download size={18} />
                            Download PDF
                        </a>

                        {/* Save as Application / View Application */}
                        {savedApplicationId ? (
                            <Link
                                href="/jobs"
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                View Application
                                <ArrowRight size={16} />
                            </Link>
                        ) : (
                            <button
                                onClick={() => setShowSaveForm(!showSaveForm)}
                                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Briefcase size={18} />
                                Save as Application
                            </button>
                        )}
                    </div>

                    {/* Inline save form */}
                    {showSaveForm && !savedApplicationId && (
                        <form
                            onSubmit={handleSaveApplication}
                            className="mt-2 p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-300"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">Save Application</h4>
                                <button type="button" onClick={() => setShowSaveForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Company *</label>
                                    <input
                                        required
                                        type="text"
                                        value={saveForm.company}
                                        onChange={e => setSaveForm(p => ({ ...p, company: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Role *</label>
                                    <input
                                        required
                                        type="text"
                                        value={saveForm.role}
                                        onChange={e => setSaveForm(p => ({ ...p, role: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Job URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={saveForm.job_url}
                                        onChange={e => setSaveForm(p => ({ ...p, job_url: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Expected Salary</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. $120,000"
                                        value={saveForm.expected_salary}
                                        onChange={e => setSaveForm(p => ({ ...p, expected_salary: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-full space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Notes</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Referral, notes about the role..."
                                        value={saveForm.notes}
                                        onChange={e => setSaveForm(p => ({ ...p, notes: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setShowSaveForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                                    Save Application
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Cover Letter Section */}
                    <div className="pt-8 border-t border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Mail className="text-blue-600" size={20} />
                                <h4 className="font-bold text-gray-900">Cover Letter</h4>
                            </div>
                            {!coverLetter && !isGeneratingCL && (
                                <button
                                    onClick={handleGenerateCL}
                                    className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                                >
                                    <Sparkles size={14} />
                                    Generate Now
                                </button>
                            )}
                        </div>

                        {!coverLetter && !isGeneratingCL && (
                            <div className="p-6 border-2 border-dashed border-gray-100 rounded-xl text-center">
                                <p className="text-sm text-gray-500 mb-4">Need a tailored cover letter for this role? AI can draft one based on your profile and this JD.</p>
                                <button
                                    onClick={handleGenerateCL}
                                    className="px-6 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all shadow-sm"
                                >
                                    Generate Cover Letter
                                </button>
                            </div>
                        )}

                        {isGeneratingCL && (
                            <div className="p-12 flex flex-col items-center justify-center gap-4 bg-gray-50 rounded-xl border border-gray-100 animate-pulse">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <p className="text-sm font-medium text-gray-600">Drafting your cover letter...</p>
                            </div>
                        )}

                        {coverLetter && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={copyToClipboard}
                                            className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-600 flex items-center gap-2 text-xs font-bold"
                                        >
                                            {clCopied ? (
                                                <><CheckCircle size={14} className="text-emerald-500" /> Copied!</>
                                            ) : (
                                                <><Copy size={14} /> Copy Text</>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-serif">
                                        {coverLetter}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={copyToClipboard}
                                        className="text-sm font-bold text-gray-400 hover:text-gray-900 flex items-center gap-2 transition-colors"
                                    >
                                        {clCopied ? 'Text Copied to Clipboard' : 'Copy Cover Letter'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
