'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="w-9 h-9 rounded-xl border border-border-default bg-bg-surface" />

    return (
        <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-border-default bg-bg-surface text-text-sub hover:text-text-main hover:bg-bg-surface-hover transition-all group"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon size={18} className="group-hover:rotate-[15deg] transition-transform" />
            ) : (
                <Sun size={18} className="group-hover:rotate-[15deg] transition-transform" />
            )}
        </button>
    )
}
