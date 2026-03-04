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
    Clock
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
                // We'll add a helper to fetch limits via API or server action
                const res = await fetch('/api/analytics') // Reuse analytics for basic stats if needed, or create new
                // For now, let's fetch subscription directly via action
                const subscription = await getSubscriptionAction()
                setSub(subscription)

                // Fetch limits
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
            <div className="p-8 flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your subscription and usage limits.</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Current Plan */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Current Plan</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${sub?.tier === 'pro' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {sub?.tier} Tier
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 p-1 bg-green-50 rounded-full">
                                <Check size={14} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {limits?.features.cv_generations_per_month === 'unlimited'
                                        ? 'Unlimited CV Generations'
                                        : `${limits?.features.cv_generations_per_month} CV Generations / month`}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {limits?.usage.cv_generations_this_month} used this month
                                </p>
                            </div>
                        </div>

                        <FeatureItem enabled={limits?.features.cover_letters} label="Cover Letter Generation" />
                        <FeatureItem enabled={limits?.features.email_sync} label="Automated Email Sync" />
                        <FeatureItem enabled={limits?.features.ats_breakdown} label="Advanced ATS Analysis" />
                        <FeatureItem enabled={limits?.features.linkedin_import} label="LinkedIn Profile Import" />
                    </div>

                    {sub?.tier === 'free' ? (
                        <button
                            onClick={handleUpgrade}
                            disabled={isActionLoading}
                            className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
                        >
                            {isActionLoading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                            Upgrade to Pro
                        </button>
                    ) : (
                        <button
                            onClick={handleManage}
                            disabled={isActionLoading}
                            className="w-full py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isActionLoading ? <Loader2 className="animate-spin" /> : <CreditCard size={18} />}
                            Manage Billing
                        </button>
                    )}
                </div>

                {/* Pro Benefits */}
                {sub?.tier === 'free' && (
                    <div className="bg-indigo-600 p-8 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap size={120} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">Qalm Pro</h2>
                            <p className="text-indigo-100">$9.99 / per month</p>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <ProBenefit icon={Shield} text="Unlimited AI Tailored CVs" />
                            <ProBenefit icon={Check} text="One-click Cover Letters" />
                            <ProBenefit icon={Clock} text="24/7 Gmail Sync & Alerts" />
                            <ProBenefit icon={ArrowRight} text="Deep ATS Skill Gap Insights" />
                        </div>

                        <button
                            onClick={handleUpgrade}
                            disabled={isActionLoading}
                            className="w-full py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            Go Pro Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function FeatureItem({ enabled, label }: { enabled?: boolean, label: string }) {
    return (
        <div className="flex items-center gap-3 opacity-80">
            <div className={`mt-1 p-1 rounded-full ${enabled ? 'bg-green-50' : 'bg-gray-50'}`}>
                {enabled ? <Check size={14} className="text-green-600" /> : <Zap size={14} className="text-gray-300" />}
            </div>
            <p className={`text-sm ${enabled ? 'font-medium text-gray-900' : 'text-gray-400 line-through'}`}>{label}</p>
        </div>
    )
}

function ProBenefit({ icon: Icon, text }: { icon: any, text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-lg">
                <Icon size={16} />
            </div>
            <p className="font-medium">{text}</p>
        </div>
    )
}
