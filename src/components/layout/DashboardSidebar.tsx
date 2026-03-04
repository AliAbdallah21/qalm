'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    User,
    Github,
    FileText,
    BarChart3,
    TrendingUp,
    Briefcase,
    Mail,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const navGroups = [
    {
        title: 'Core',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Profile', href: '/profile', icon: User },
            { name: 'GitHub Repos', href: '/github', icon: Github },
        ]
    },
    {
        title: 'Documents',
        items: [
            { name: 'CV Builder', href: '/cv-builder', icon: FileText },
            { name: 'CV History', href: '/cv-history', icon: BarChart3 },
        ]
    },
    {
        title: 'Intelligence',
        items: [
            { name: 'Job Tracker', href: '/jobs', icon: Briefcase },
            { name: 'Email Intel', href: '/emails', icon: Mail },
            { name: 'Analytics', href: '/analytics', icon: TrendingUp },
        ]
    },
    {
        title: 'System',
        items: [
            { name: 'Settings', href: '/settings', icon: Settings },
        ]
    }
]

export default function DashboardSidebar({ userEmail }: { userEmail?: string }) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Get initials for avatar
    const initials = userEmail ? userEmail.slice(0, 2).toUpperCase() : '??'

    return (
        <>
            {/* Mobile Menu Button - Dark Themed */}
            <div className="lg:hidden fixed top-4 right-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2.5 rounded-xl bg-bg-surface border border-border-default text-text-sub hover:text-text-main transition-all shadow-md"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-40 w-64 bg-bg-primary border-r border-border-default 
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-20 flex items-center px-6">
                        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <span className="text-black font-black italic text-xl">Q</span>
                            </div>
                            <div className="flex items-baseline">
                                <span className="font-bold text-xl tracking-tight text-text-main">Qalm</span>
                                <div className="w-1.5 h-1.5 bg-accent rounded-full ml-1" />
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Groups */}
                    <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto no-scrollbar">
                        {navGroups.map((group) => (
                            <div key={group.title} className="space-y-1">
                                <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.15em] text-text-muted mb-3">
                                    {group.title}
                                </h3>
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`
                                                    flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative overflow-hidden
                                                    ${isActive
                                                        ? 'bg-accent-subtle text-accent'
                                                        : 'text-text-sub hover:bg-bg-surface-hover hover:text-text-main'}
                                                `}
                                            >
                                                {isActive && (
                                                    <div className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-accent rounded-r-full shadow-sm" />
                                                )}
                                                <item.icon size={18} className={`flex-shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-main'}`} />
                                                <span className="truncate">{item.name}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* User Profile / Logout footer */}
                    <div className="p-4 bg-bg-secondary border-t border-border-subtle">
                        <div className="flex items-center justify-between px-2 mb-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-full bg-bg-surface-hover border border-border-default flex items-center justify-center text-xs font-bold text-text-sub">
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-text-main truncate">{userEmail?.split('@')[0]}</p>
                                    <p className="text-[10px] text-text-muted truncate">{userEmail}</p>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>

                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-text-muted hover:bg-danger/10 hover:text-danger transition-all group"
                            >
                                <LogOut size={16} className="text-text-muted group-hover:text-danger transition-colors" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </aside>
        </>
    )
}
