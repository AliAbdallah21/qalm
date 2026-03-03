'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    User,
    Github,
    FileText,
    BarChart3,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'GitHub Repos', href: '/github', icon: Github },
    { name: 'CV Builder', href: '/cv-builder', icon: FileText },
    { name: 'CV History', href: '/cv-history', icon: BarChart3 },
]

export default function DashboardSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-md bg-white shadow-md border border-gray-200 text-gray-600 hover:text-black transition-colors"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold italic text-xl">Q</span>
                            </div>
                            <span className="font-bold text-xl tracking-tight text-black">Qalm</span>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                    ${isActive
                                            ? 'bg-black text-white shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-black'}
                  `}
                                >
                                    <item.icon size={18} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-black'} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile / Logout footer */}
                    <div className="p-4 border-t border-gray-100">
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all group"
                            >
                                <LogOut size={18} className="text-gray-400 group-hover:text-red-600" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </aside>
        </>
    )
}
