'use client'

import { useState, useEffect, useCallback } from 'react'
import { Mail, RefreshCw, LogOut, Clock, ArrowLeft, Zap, ShieldCheck, MailSearch, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { GmailTokens, EmailScanResult } from '@/features/email-intel/types'

interface Notification {
    message: string
    type: 'success' | 'error'
}

interface UserLimits {
    tier: string
}

export default function EmailsPage() {
    const [tokens, setTokens] = useState<GmailTokens & { email?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [disconnecting, setDisconnecting] = useState(false)
    const [scanResult, setScanResult] = useState<EmailScanResult | null>(null)
    const [limits, setLimits] = useState<UserLimits | null>(null)
    const [notification, setNotification] = useState<Notification | null>(null)

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 3500)
    }, [])

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
        if (limits?.tier === 'free') return
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

    const handleDisconnect = async () => {
        setDisconnecting(true)
        try {
            const res = await fetch('/api/emails/disconnect', { method: 'DELETE' })
            if (res.ok) {
                setTokens(null)
                setScanResult(null)
                showNotification('Gmail disconnected successfully', 'success')
            } else {
                showNotification('Failed to disconnect Gmail. Please try again.', 'error')
            }
        } catch (error) {
            console.error('Disconnect failed', error)
            showNotification('Failed to disconnect Gmail. Please try again.', 'error')
        } finally {
            setDisconnecting(false)
        }
    }

    if (loading) return (
        <div className="p-8 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-accent-blue" />
        </div>
    )

    if (!tokens) {
        const isFree = limits?.tier === 'free'

        return (
            <div className="p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Notification Banner */}
                {notification && (
                    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
                        notification.type === 'success'
                            ? 'bg-success/10 border-success/30 text-success'
                            : 'bg-danger/10 border-danger/30 text-danger'
                    }`}>
                        {notification.type === 'success'
                            ? <CheckCircle size={18} />
                            : <XCircle size={18} />
                        }
                        {notification.message}
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="group flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-text-muted hover:text-[var(--text-primary)] transition-all">
                        <div className="p-2 rounded-lg bg-surface-card border border-border-subtle group-hover:border-accent-blue/30 transition-all">
                            <ArrowLeft size={14} />
                        </div>
                        Back to Intelligence
                    </Link>
                </div>

                <div className="relative p-12 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[3rem] overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-accent-blue/5 blur-[100px] -mr-48 -mt-48 transition-all group-hover:bg-accent-blue/10" />

                    <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-accent-blue/20 blur-2xl rounded-full animate-pulse" />
                            <div className="relative w-24 h-24 bg-surface-main border border-accent-blue/20 rounded-[2rem] flex items-center justify-center shadow-2xl">
                                <Mail className="w-10 h-10 text-accent-blue" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2 bg-success rounded-xl border-4 border-surface-card shadow-lg">
                                <ShieldCheck className="w-4 h-4 text-[var(--text-primary)]" />
                            </div>
                        </div>

                        {isFree && (
                            <div className="mb-6 px-4 py-1.5 bg-accent-blue rounded-full text-[10px] font-black text-white uppercase tracking-widest italic shadow-lg shadow-accent-blue/20 flex items-center gap-2">
                                <Zap size={12} fill="currentColor" />
                                PRO NEURAL INTERFACE
                            </div>
                        )}

                        <h1 className="text-5xl font-black text-[var(--text-primary)] italic tracking-tighter mb-4">
                            Email <span className="text-accent-blue">Intelligence</span>
                        </h1>
                        <p className="text-[var(--text-secondary)] text-lg font-medium leading-relaxed mb-12">
                            Deploy our autonomous agents to monitor your inbox.
                            We extract interview timelines and offer data automatically.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-12 text-left">
                            <div className="p-6 bg-[var(--bg-primary)]/50 rounded-2xl border border-[var(--border)] hover:border-accent-blue/30 transition-all group/card">
                                <div className="p-2.5 w-fit bg-accent-blue/10 rounded-xl mb-4 group-hover/card:bg-accent-blue/20 transition-all">
                                    <Sparkles className="w-5 h-5 text-accent-blue" />
                                </div>
                                <h3 className="text-sm font-black text-[var(--text-primary)] italic uppercase tracking-widest mb-2">Autonomous Sync</h3>
                                <p className="text-xs text-[var(--text-muted)] font-bold leading-normal">Our agents detect application status changes and update your tracker in real-time.</p>
                            </div>
                            <div className="p-6 bg-[var(--bg-primary)]/50 rounded-2xl border border-[var(--border)] hover:border-accent-blue/30 transition-all group/card">
                                <div className="p-2.5 w-fit bg-success/10 rounded-xl mb-4 group-hover/card:bg-success/20 transition-all">
                                    <ShieldCheck className="w-5 h-5 text-success" />
                                </div>
                                <h3 className="text-sm font-black text-[var(--text-primary)] italic uppercase tracking-widest mb-2">Zero-Storage Privacy</h3>
                                <p className="text-xs text-[var(--text-muted)] font-bold leading-normal">We never store your actual emails. Only the extracted intelligence survives the transit.</p>
                            </div>
                        </div>

                        {isFree ? (
                            <Link
                                href="/settings"
                                className="group w-full max-w-sm py-5 bg-[var(--text-primary)] text-[var(--bg-primary)] font-black rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                            >
                                <Zap size={18} fill="currentColor" />
                                Unlock Intelligence
                            </Link>
                        ) : (
                            <button
                                onClick={handleConnect}
                                className="group w-full max-w-sm py-5 bg-[var(--text-primary)] text-[var(--bg-primary)] font-black rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3"
                            >
                                <Mail size={18} fill="currentColor" />
                                Connect Production Inbox
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Notification Banner */}
            {notification && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-bold transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
                    notification.type === 'success'
                        ? 'bg-success/10 border-success/30 text-success'
                        : 'bg-danger/10 border-danger/30 text-danger'
                }`}>
                    {notification.type === 'success'
                        ? <CheckCircle size={18} />
                        : <XCircle size={18} />
                    }
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full text-[10px] font-black text-success uppercase tracking-widest italic mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        Neural Connection Active
                    </div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] italic tracking-tighter">Email Intelligence</h1>
                    <p className="text-[var(--text-secondary)] mt-2 font-bold flex items-center gap-2">
                        Monitoring: <span className="italic">{tokens.email}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleDisconnect}
                        disabled={disconnecting}
                        className="px-6 py-3 border border-[var(--border)] rounded-2xl text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest hover:text-[var(--text-primary)] hover:border-danger/30 hover:bg-danger/5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {disconnecting
                            ? <Loader2 size={16} className="animate-spin" />
                            : <LogOut size={16} />
                        }
                        {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {syncing ? <Loader2 size={16} className="animate-spin text-accent-blue" /> : <RefreshCw size={16} />}
                        {syncing ? 'Analyzing Stream...' : 'Initialize Sync'}
                    </button>
                </div>
            </div>

            {/* Scan Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border)] group hover:border-accent-blue/30 transition-all">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Total Packets Scanned</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-[var(--text-primary)] italic">{scanResult?.scanned ?? 0}</p>
                        <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Inboxes</span>
                    </div>
                </div>
                <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border)] group hover:border-success/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
                        <Sparkles className="w-12 h-12 text-success" />
                    </div>
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Neural Updates Generated</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-black text-success italic">+{scanResult?.updated ?? 0}</p>
                        <span className="text-xs font-bold text-success uppercase tracking-widest">Modified</span>
                    </div>
                </div>
                <div className="bg-[var(--bg-surface)] p-8 rounded-[2rem] border border-[var(--border)] group hover:border-accent-blue/30 transition-all">
                    <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4">Monitor Status</p>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        <p className="text-2xl font-black text-[var(--text-primary)] italic uppercase tracking-tighter">Operational</p>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden">
                <div className="px-8 py-6 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-3 italic">
                        <MailSearch className="w-4 h-4 text-accent-blue" />
                        Intelligence Extraction History
                    </h2>
                    {scanResult && (
                        <div className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                            Session ID: <span className="text-accent-blue">#QK-{Math.floor(Math.random() * 9999)}</span>
                        </div>
                    )}
                </div>
                <div className="divide-y divide-border-subtle">
                    {!scanResult || scanResult.results.length === 0 ? (
                        <div className="p-24 text-center space-y-6">
                            <div className="p-6 w-fit bg-[var(--bg-primary)] border border-[var(--border)] rounded-[2rem] mx-auto opacity-50">
                                <Clock className="w-12 h-12 text-[var(--text-muted)]" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest italic">Waiting for Stream Analysis</p>
                                <p className="text-xs font-bold text-[var(--text-muted)]">Initiate a manual sync to start extracting job intelligence from your inbox.</p>
                            </div>
                        </div>
                    ) : (
                        scanResult.results.map((res, i) => (
                            <div key={i} className="p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-[var(--bg-primary)] group-hover:bg-[var(--bg-surface-hover)] border border-[var(--border)] rounded-2xl transition-all">
                                        <Mail className="w-5 h-5 text-accent-blue" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-black text-[var(--text-primary)] italic tracking-tight">{res.company}</p>
                                        <p className="text-sm text-[var(--text-muted)] font-medium">{res.subject}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-3">
                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] italic ${
                                        res.classification === 'interview_invite' ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20' :
                                        res.classification === 'offer' ? 'bg-success/10 text-success border border-success/20' :
                                        res.classification === 'rejection' ? 'bg-danger/10 text-danger border border-danger/20' :
                                        'bg-surface-main text-text-secondary border border-border-subtle'
                                    }`}>
                                        {res.classification.replace('_', ' ')}
                                    </span>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                        {new Date(res.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {scanResult && scanResult.results.length > 0 && (
                    <div className="p-6 bg-surface-main/30 text-center">
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">End of Transmission</p>
                    </div>
                )}
            </div>
        </div>
    )
}
