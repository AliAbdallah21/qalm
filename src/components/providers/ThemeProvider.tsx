'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
    theme: Theme
    toggleTheme: () => void
}>({ theme: 'light', toggleTheme: () => { } })

export function ThemeProvider({
    children
}: {
    children: React.ReactNode
}) {
    const [theme, setTheme] = useState<Theme>('light')

    useEffect(() => {
        const stored = localStorage.getItem('qalm-theme') as Theme
        if (stored) {
            setTheme(stored)
            document.documentElement.setAttribute('data-theme', stored)
        }
    }, [])

    const toggleTheme = () => {
        const next = theme === 'light' ? 'dark' : 'light'
        setTheme(next)
        localStorage.setItem('qalm-theme', next)
        document.documentElement.setAttribute('data-theme', next)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)
