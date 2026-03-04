'use client'

import { useState, useEffect } from 'react'
import { Mail, RefreshCw, LogOut, CheckCircle, Clock, AlertCircle, ArrowLeft, Zap } from 'lucide-react'
import Link from 'next/link'

export default function EmailsPage() {
    const [tokens, setTokens] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [scanResult, setScanResult] = useState<any>(null)
    const [limits, setLimits] = useState<any>(null)

    useEffect(() => {
        async function loadData() {
            try {
                const [statusRes, limitsRes] = await Promise.all([
                    fetch('/api/emails/status'),
                    fetch('/api/user/limits')
                ])

                if (statusRes.ok) {
                    const data = await statusRes.json()
                    setTokens(data.tokens)
                }

                if (limitsRes.ok) {
                    const { data } = await limitsRes.json()
                    setLimits(data)
                }
            } catch (error) {
                console.error('Failed to load email data', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const handleConnect = async () => {
        if (limits?.tier === 'free') return; // Should be handled by UI button state
        const res = await fetch('/api/emails/connect/gmail')
        if (res.ok) {
            const { url } = await res.json()
            window.location.href = url
        }
    }

    const handleSync = async () => {
        setSyncing(true)
        try {
            const res = await fetch('/api/emails/sync', { method: 'POST' })
            if (res.ok) {
                const result = await res.json()
                setScanResult(result)
            }
        } catch (error) {
            console.error('Sync failed', error)
        } finally {
            setSyncing(false)
        }
    }

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[400px]">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
    )

    if (!tokens) {
        const isFree = limits?.tier === 'free'

        return (
            <div className="p-8 max-w-2xl mx-auto space-y-6">
                <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors">
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm relative overflow-hidden">
                    {isFree && (
                        <div className="absolute top-0 right-0 p-6">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Zap size={12} />
                                Pro Feature
                            </span>
                        </div>
                    )}

                    <div className="mx-auto w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                        <Mail className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Intelligence</h1>
                    <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                        Connect your Gmail to automatically track job application updates.
                        We'll sync interviews, rejections, and offers for you.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <h3 className="font-bold flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Smart Tracking
                            </h3>
                            <p className="text-xs text-gray-500">Automatically update your application status when you get an email.</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <h3 className="font-bold flex items-center gap-2 mb-2">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                Privacy First
                            </h3>
                            <p className="text-xs text-gray-500">Read-only access. We never send or delete your emails.</p>
                        </div>
                    </div>

                    {isFree ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm text-indigo-900 font-medium">
                                Email sync is a Pro feature. Upgrade to unlock automated tracking.
                            </div>
                            <Link
                                href="/settings"
                                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
                            >
                                <Zap size={22} />
                                Upgrade to Unlock
                            </Link>
                        </div>
                    ) : (
                        <button
                            onClick={handleConnect}
                            className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
                        >
                            <Mail size={22} />
                            Connect Gmail Account
                        </button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Email Intelligence</h1>
                    <p className="text-gray-500 mt-1">Monitoring <span className="font-semibold text-black">{tokens.email}</span></p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {/* disconnect logic */ }}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        Disconnect
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-6 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Emails Now'}
                    </button>
                </div>
            </div>

            {/* Scan Stats */}
            {scanResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 mb-1">Emails Scanned</p>
                        <p className="text-3xl font-bold text-gray-900">{scanResult.scanned}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-green-500">
                        <p className="text-sm font-medium text-gray-500 mb-1">Tracker Updates</p>
                        <p className="text-3xl font-bold text-green-600">+{scanResult.updated}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                        <p className="text-3xl font-bold text-gray-900">Live</p>
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 font-bold text-gray-900">Recent Automated Updates</div>
                <div className="divide-y divide-gray-50">
                    {!scanResult || scanResult.results.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <Clock className="w-12 h-12 text-gray-200 mx-auto" />
                            <p className="text-gray-400">No updates found yet. Try syncing manually.</p>
                        </div>
                    ) : (
                        scanResult.results.map((res: any, i: number) => (
                            <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-900">{res.company}</p>
                                    <p className="text-sm text-gray-500">{res.subject}</p>
                                </div>
                                <div className="text-right space-y-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${res.classification === 'interview_invite' ? 'bg-blue-50 text-blue-700' :
                                        res.classification === 'offer' ? 'bg-emerald-50 text-green-700' :
                                            res.classification === 'rejection' ? 'bg-red-50 text-red-700' :
                                                'bg-gray-100 text-gray-600'
                                        }`}>
                                        {res.classification.replace('_', ' ')}
                                    </span>
                                    <p className="text-xs text-gray-400">{new Date(res.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
