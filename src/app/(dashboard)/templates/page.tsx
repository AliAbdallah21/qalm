'use client'

import { useState, useEffect } from 'react'
import { FileCode2, Plus, Code2, AlertTriangle, Check, Loader2, X, Trash2, CheckCircle2 } from 'lucide-react'

interface CVTemplate {
    id: string
    name: string
    latex_code: string
    is_active: boolean
    created_at: string
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<CVTemplate[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [showVars, setShowVars] = useState(false)
    
    // Form state
    const [name, setName] = useState('')
    const [latexCode, setLatexCode] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    const fetchTemplates = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/templates')
            const json = await res.json()
            if (!res.ok) throw new Error(json.error || 'Failed to fetch templates')
            setTemplates(json.data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg)
        setTimeout(() => setSuccessMessage(null), 3000)
    }

    const showError = (msg: string) => {
        setError(msg)
        setTimeout(() => setError(null), 5000)
    }

    const handleSaveTemplate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setSuccessMessage(null)
        setIsSaving(true)

        try {
            const res = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, latex_code: latexCode })
            })
            const json = await res.json()
            
            if (!res.ok) throw new Error(json.error || 'Failed to save template')
            
            showSuccess('Template saved successfully')
            setName('')
            setLatexCode('')
            fetchTemplates()
        } catch (err: any) {
            showError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    const handleActivate = async (id: string) => {
        try {
            const res = await fetch(`/api/templates/${id}/activate`, {
                method: 'PATCH'
            })
            const json = await res.json()
            
            if (!res.ok) throw new Error(json.error || 'Failed to activate template')
            
            showSuccess(id === 'default' ? 'Default template activated' : 'Template activated')
            fetchTemplates()
        } catch (err: any) {
            showError(err.message)
        }
    }

    const handleDelete = async (id: string, templateName: string) => {
        if (!confirm(`Are you sure you want to delete template "${templateName}"?`)) return

        try {
            const res = await fetch(`/api/templates/${id}`, {
                method: 'DELETE'
            })
            const json = await res.json()
            
            if (!res.ok) throw new Error(json.error || 'Failed to delete template')
            
            showSuccess('Template deleted')
            fetchTemplates()
        } catch (err: any) {
            showError(err.message)
        }
    }

    const hasActiveUserTemplate = templates.some(t => t.is_active)

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            
            {/* Notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {error && (
                    <div className="p-4 bg-danger/10 border border-danger/20 text-danger rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-right-8">
                        <X size={16} />
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-success/10 border border-success/20 text-success rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-right-8">
                        <CheckCircle2 size={16} />
                        {successMessage}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-bg-surface border border-border-default rounded-xl text-text-main">
                        <FileCode2 size={20} />
                    </div>
                    <h1 className="text-4xl font-black text-text-main italic tracking-tighter">
                        CV Templates
                    </h1>
                </div>
                <p className="text-text-muted font-bold ml-1">
                    Manage your LaTeX templates for CV generation.
                </p>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <h2 className="text-xl font-black text-text-main italic tracking-tight uppercase flex items-center gap-3">
                    <Code2 size={20} />
                    Your Templates
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    {/* Default Template Card */}
                    <div className={`p-6 bg-bg-surface border ${!hasActiveUserTemplate ? 'border-accent shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-border-default'} rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all`}>
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-black text-text-main italic">Default (Built-in)</h3>
                                {!hasActiveUserTemplate && (
                                    <span className="px-2.5 py-1 bg-accent/10 border border-accent/20 text-accent rounded-lg text-[9px] font-black uppercase tracking-widest">
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-text-muted font-medium">The Qalm standard template — clean, ATS-optimized, banking style.</p>
                        </div>
                        
                        {hasActiveUserTemplate && (
                            <button
                                onClick={() => handleActivate('default')}
                                className="shrink-0 px-6 py-3 bg-bg-primary border border-border-default hover:border-accent hover:text-accent text-text-main rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                                Use Default
                            </button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="p-12 flex justify-center border border-border-default border-dashed rounded-[2rem]">
                            <Loader2 className="w-8 h-8 animate-spin text-accent" />
                        </div>
                    ) : templates.length === 0 ? (
                        <div className="p-12 text-center border border-border-default border-dashed rounded-[2rem] text-text-muted font-medium">
                            No custom templates yet. Add one below.
                        </div>
                    ) : (
                        templates.map(t => (
                            <div key={t.id} className={`p-6 bg-bg-surface border ${t.is_active ? 'border-accent shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-border-default'} rounded-[2rem] flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all group`}>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black text-text-main italic">{t.name}</h3>
                                        {t.is_active && (
                                            <span className="px-2.5 py-1 bg-accent/10 border border-accent/20 text-accent rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-text-muted font-medium uppercase tracking-widest">
                                        Added on {new Date(t.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleDelete(t.id, t.name)}
                                        className="p-3 text-text-muted hover:text-danger hover:bg-danger/10 rounded-xl transition-colors"
                                        title="Delete Template"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    
                                    {!t.is_active && (
                                        <button
                                            onClick={() => handleActivate(t.id)}
                                            className="px-6 py-3 bg-bg-primary border border-border-default hover:border-accent hover:text-accent text-text-main rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                        >
                                            Set Active
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Template Section */}
            <div className="space-y-6 pt-8 border-t border-border-subtle">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-text-main text-bg-primary rounded-lg">
                        <Plus size={16} />
                    </div>
                    <h2 className="text-xl font-black text-text-main italic tracking-tight uppercase">
                        Add New Template
                    </h2>
                </div>

                <div className="p-6 bg-warning/5 border border-warning/20 rounded-2xl flex items-start gap-4">
                    <AlertTriangle className="text-warning shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-sm font-bold text-warning mb-1">Requirement Check</h4>
                        <p className="text-xs text-warning/80">
                            Template must include <code className="bg-warning/10 px-1 py-0.5 rounded">\documentclass</code>, <code className="bg-warning/10 px-1 py-0.5 rounded">\begin{`{document}`}</code>, <code className="bg-warning/10 px-1 py-0.5 rounded">\end{`{document}`}</code>, at least <code className="bg-warning/10 px-1 py-0.5 rounded">{`{{NAME}}`}</code> and at least one section placeholder.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSaveTemplate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-text-sub ml-1">
                            Template Name
                        </label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Minimalist Academic"
                            className="w-full bg-bg-surface border border-border-default rounded-2xl px-5 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium disabled:opacity-50"
                            disabled={isSaving}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-end justify-between ml-1 mb-2">
                            <label className="text-xs font-black uppercase tracking-widest text-text-sub">
                                LaTeX Code
                            </label>
                            <button 
                                type="button"
                                onClick={() => setShowVars(!showVars)}
                                className="text-[10px] font-black uppercase tracking-widest text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
                            >
                                {showVars ? 'Hide' : 'Show'} Variable Reference
                            </button>
                        </div>
                        
                        {showVars && (
                            <div className="mb-4 p-5 bg-bg-surface border border-border-subtle rounded-2xl animate-in fade-in slide-in-from-top-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                                    {[
                                        { v: '{{NAME}}', d: 'Full name' },
                                        { v: '{{EMAIL}}', d: 'Email address' },
                                        { v: '{{PHONE}}', d: 'Phone number' },
                                        { v: '{{LOCATION}}', d: 'City, Country' },
                                        { v: '{{LINKEDIN}}', d: 'LinkedIn URL' },
                                        { v: '{{GITHUB}}', d: 'GitHub username' },
                                        { v: '{{SUMMARY}}', d: 'Professional summary' },
                                        { v: '{{EXPERIENCE}}', d: 'Work experience section' },
                                        { v: '{{EDUCATION}}', d: 'Education section' },
                                        { v: '{{SKILLS}}', d: 'Skills section' },
                                        { v: '{{PROJECTS}}', d: 'GitHub projects section' },
                                        { v: '{{CERTIFICATES}}', d: 'Certifications section' }
                                    ].map(item => (
                                        <div key={item.v} className="flex justify-between items-center py-1.5 border-b border-border-subtle/50 last:border-0">
                                            <code className="text-xs text-accent font-mono bg-accent/5 px-2 py-1 rounded">{item.v}</code>
                                            <span className="text-xs text-text-muted font-medium">{item.d}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <textarea
                            required
                            value={latexCode}
                            onChange={(e) => setLatexCode(e.target.value)}
                            rows={20}
                            placeholder="Paste your full Overleaf LaTeX document here..."
                            className="w-full bg-bg-surface border border-border-default rounded-2xl px-5 py-4 text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono text-xs leading-relaxed disabled:opacity-50 resize-y"
                            disabled={isSaving}
                            spellCheck={false}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving || !name.trim() || !latexCode.trim()}
                        className="w-full py-4 bg-text-main text-bg-primary rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Check size={18} className="group-hover:scale-110 transition-transform" />
                                Save Template
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
