    'use client'

import { useState, useEffect } from 'react'
import { FileCode2, CheckCircle2, X, Loader2 } from 'lucide-react'
import { TEMPLATE_METADATA } from '@/lib/cv-templates/metadata'
import { updateProfileAction } from '@/features/profile/actions'

export default function TemplatesPage() {
    const [preferred, setPreferred] = useState<string>('experienced')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetch('/api/profile')
                if (res.ok) {
                    const json = await res.json()
                    if (json.data?.profile?.preferred_template) {
                        setPreferred(json.data.profile.preferred_template)
                    }
                }
            } catch (err) {
                console.error('Failed to load profile for preferred template:', err)
            } finally {
                setIsLoading(false)
            }
        }
        loadProfile()
    }, [])

    const handleSelect = async (id: string) => {
        if (id === preferred) return
        setIsSaving(true)
        setError(null)
        setSuccess(null)
        try {
            const res = await updateProfileAction({ preferred_template: id })
            if (res.error) throw new Error(res.error)
            setPreferred(id)
            setSuccess('Template updated successfully')
            setTimeout(() => setSuccess(null), 3000)
        } catch (err: any) {
            setError(err.message)
            setTimeout(() => setError(null), 5000)
        } finally {
            setIsSaving(false)
        }
    }

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
                {success && (
                    <div className="p-4 bg-success/10 border border-success/20 text-success rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl animate-in fade-in slide-in-from-right-8">
                        <CheckCircle2 size={16} />
                        {success}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-bg-surface border border-border-default rounded-xl text-text-main">
                        <FileCode2 size={20} />
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter">
                        CV Templates
                    </h1>
                </div>
                <p className="text-text-muted font-bold ml-1">
                    Select your preferred layout for CV generation.
                </p>
            </div>

            {isLoading ? (
                <div className="p-12 flex justify-center border border-border-default border-dashed rounded-[2rem]">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.values(TEMPLATE_METADATA).map((template) => {
                        const isActive = preferred === template.id
                        return (
                            <div 
                                key={template.id}
                                className={`p-8 bg-surface-card border rounded-[2rem] flex flex-col gap-6 transition-all ${
                                    isActive 
                                        ? 'border-accent-blue shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-accent-blue' 
                                        : 'border-border-default hover:border-border-hover'
                                }`}
                            >
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-[var(--text-primary)] italic">
                                            {template.name}
                                        </h3>
                                        {isActive && (
                                            <span className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm shadow-accent-blue/10">
                                                <CheckCircle2 size={12} />
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[var(--text-primary)] font-medium">
                                        {template.description}
                                    </p>
                                    <div className="pt-4 border-t border-border-subtle">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                                            Best for:
                                        </p>
                                        <p className="text-sm font-semibold text-text-secondary">
                                            "{template.whoItsFor}"
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleSelect(template.id)}
                                    disabled={isActive || isSaving}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${
                                        isActive 
                                            ? 'bg-transparent text-text-muted cursor-default'
                                            : 'bg-surface-hover hover:bg-bg-surface border border-border-default hover:border-accent-blue hover:text-accent-blue text-[var(--text-primary)]'
                                    }`}
                                >
                                    {isSaving && !isActive ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        isActive ? 'Current Selection' : 'Select Template'
                                    )}
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="text-center pt-8">
                <p className="text-xs font-black uppercase tracking-widest text-text-muted">
                    More templates coming soon...
                </p>
            </div>
        </div>
    )
}
