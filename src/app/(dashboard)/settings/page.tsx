'use client'

import { useState, useEffect } from 'react'
import {
    CreditCard,
    Check,
    Zap,
    Shield,
    ArrowRight,
    Loader2,
    AlertCircle,
    Clock,
    Lock,
    Sparkles,
    Settings
} from 'lucide-react'
import { getSubscriptionAction } from '@/features/subscriptions/actions'
import type { UserSubscription, UserLimits } from '@/features/subscriptions/types'

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [sub, setSub] = useState<UserSubscription | null>(null)
    const [limits, setLimits] = useState<UserLimits | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadData() {
            try {
                const subscription = await getSubscriptionAction()
                setSub(subscription)

                const limitsRes = await fetch('/api/user/limits')
                if (limitsRes.ok) {
                    const { data } = await limitsRes.json()
                    setLimits(data)
                }
            } catch (err) {
                console.error('Failed to load settings', err)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleUpgrade = async () => {
        setIsActionLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId: 'pro' })
            })
            const { data, error } = await res.json()
            if (error) throw new Error(error)
            window.location.href = data.url
        } catch (err: any) {
            setError(err.message)
            setIsActionLoading(false)
        }
    }

    const handleManage = async () => {
        setIsActionLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/stripe/portal')
            const { data, error } = await res.json()
            if (error) throw new Error(error)
            window.location.href = data.url
        } catch (err: any) {
            setError(err.message)
            setIsActionLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
                <Loader2 className="w-10 h-10 animate-spin text-accent-blue" />
                <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Loading Core Configurations...</p>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)]">
                        <Settings size={20} />
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter">
                        Nexus Settings
                    </h1>
                </div>
                <p className="text-[var(--text-muted)] font-bold ml-1">
                    Configure your neural interface permissions and subscription level.
                </p>
            </div>

            {error && (
                <div className="p-6 bg-danger/10 border border-danger/20 text-danger rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                    <AlertCircle size={16} />
                    Configuration Fault: {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Current Plan */}
                <div className="bg-[var(--bg-surface)] p-10 rounded-[3rem] border border-[var(--border-subtle)] space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-blue/5 blur-[80px] -mr-32 -mt-32" />

                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black text-[var(--text-primary)] italic tracking-tight uppercase">Current Tier</h2>
                            <p className="text-xs font-bold text-[var(--text-muted)]">Active Subscription Status</p>
                        </div>
                        <span className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest italic border ${sub?.tier === 'pro'
                            ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                            : 'bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                            }`}>
                            {sub?.tier === 'pro' ? 'Elite Pro' : 'Explorer Free'}
                        </span>
                    </div>

                    <div className="space-y-5 py-6 border-y border-[var(--border-subtle)] relative z-10">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 p-1 bg-success/10 rounded-lg border border-success/20">
                                <Check size={14} className="text-success" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-black text-[var(--text-primary)] italic uppercase tracking-widest">
                                        Sequence Generations
                                    </p>
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase italic">
                                        {limits?.usage.cv_generations_this_month} / {limits?.features.cv_generations_per_month}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-[var(--bg-primary)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                                    <div
                                        className="h-full bg-accent-blue shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (limits?.usage.cv_generations_this_month || 0) / (typeof limits?.features.cv_generations_per_month === 'number' ? limits.features.cv_generations_per_month : 1) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <FeatureItem enabled={limits?.features.linkedin_import} label="LinkedIn Neural Import" />
                            <FeatureItem enabled={limits?.features.ats_breakdown} label="Advanced ATS Analysis" />
                            <FeatureItem enabled={limits?.features.email_sync} label="Automated Intelligence Sync" />
                            <FeatureItem enabled={limits?.features.cover_letters} label="Cover Letter Generation" />
                        </div>
                    </div>

                    <div className="relative z-10 pt-4">
                        {sub?.tier === 'free' ? (
                            <button
                                onClick={handleUpgrade}
                                disabled={isActionLoading}
                                className="w-full py-5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isActionLoading ? <Loader2 className="animate-spin text-accent-blue" /> : <Zap size={18} fill="currentColor" />}
                                Initialize Pro Upgrade
                            </button>
                        ) : (
                            <button
                                onClick={handleManage}
                                disabled={isActionLoading}
                                className="w-full py-5 bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[var(--bg-surface)] hover:border-accent-blue/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isActionLoading ? <Loader2 className="animate-spin text-accent-blue" /> : <CreditCard size={18} />}
                                Manage Neural Billing
                            </button>
                        )}
                    </div>
                </div>

                {/* Pro Benefits / Upgrade Card */}
                {sub?.tier === 'free' ? (
                    <div className="bg-accent-blue p-12 rounded-[3.5rem] text-white space-y-8 shadow-2xl shadow-accent-blue/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-all duration-700">
                            <Zap size={180} fill="currentColor" />
                        </div>

                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/20 blur-[100px] rounded-full" />

                        <div className="space-y-3 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--bg-surface-hover)] rounded-full text-[10px] font-black uppercase tracking-widest italic mb-2">
                                <Sparkles size={12} />
                                Elite Level Access
                            </div>
                            <h2 className="text-5xl font-black italic tracking-tighter">Qalm Pro</h2>
                            <p className="text-[var(--text-primary)]/80 font-bold uppercase tracking-widest text-sm">$9.99 / Sequence Cycle</p>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <ProBenefit icon={Shield} text="Unlimited AI Tailored Sequences" />
                            <ProBenefit icon={Check} text="Instant Cover Letter Matrix" />
                            <ProBenefit icon={Clock} text="24/7 Neural Sync & Alerts" />
                            <ProBenefit icon={ArrowRight} text="Deep ATS Gap Analysis" />
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={isActionLoading}
                            className="group w-full py-6 bg-white text-accent-blue rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 relative z-10 mt-8"
                        >
                            Deploy Pro Matrix
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                ) : (
                    <div className="bg-[var(--bg-primary)]/30 p-12 rounded-[3rem] border border-[var(--border-subtle)] flex flex-col items-center justify-center text-center space-y-6">
                        <div className="p-6 bg-accent-blue/5 border border-accent-blue/10 rounded-full">
                            <Shield className="w-16 h-16 text-accent-blue" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-[var(--text-primary)] italic tracking-tighter">Pro Status Secured</h2>
                            <p className="text-[var(--text-muted)] font-bold max-w-xs mx-auto">All neural interfaces are fully operational and verified.</p>
                        </div>
                        <div className="px-6 py-2 bg-success/10 border border-success/20 rounded-full text-[10px] font-black text-success uppercase tracking-widest italic">
                            Subscription Verified
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function FeatureItem({ enabled, label }: { enabled?: boolean, label: string }) {
    return (
        <div className={`flex items-center gap-4 p-4 bg-[var(--bg-primary)]/50 rounded-2xl border transition-all ${enabled ? 'border-[var(--border-subtle)]' : 'border-transparent opacity-40'}`}>
            <div className={`p-1.5 rounded-lg border ${enabled ? 'bg-success/5 border-success/20 text-success' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
                {enabled ? <Check size={14} /> : <Lock size={14} />}
            </div>
            <p className={`text-xs font-black uppercase tracking-widest italic ${enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>{label}</p>
        </div>
    )
}

function ProBenefit({ icon: Icon, text }: { icon: any, text: string }) {
    return (
        <div className="flex items-center gap-4 group/benefit">
            <div className="p-3 bg-[var(--bg-surface-hover)] rounded-xl group-hover/benefit:bg-white/20 transition-all border border-[var(--border)]">
                <Icon size={18} className="text-[var(--text-primary)]" />
            </div>
            <p className="font-black italic text-sm tracking-tight">{text}</p>
        </div>
    )
}
