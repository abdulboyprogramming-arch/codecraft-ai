/**
 * CodeCraft AI - Theme Context
 * 
 * Manages dark/light/system theme with localStorage persistence.
 */

import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(undefined)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('system')
  const [resolvedTheme, setResolvedTheme] = useState('light')

  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  const resolveTheme = (selectedTheme) => {
    return selectedTheme === 'system' ? getSystemTheme() : selectedTheme
  }

  const setTheme = (newTheme) => {
    setThemeState(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('codecraft-theme', newTheme)
    }
  }

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('codecraft-theme') : null
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored)
    }

    const resolved = resolveTheme(stored ? stored : 'system')
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  useEffect(() => {
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [theme])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = getSystemTheme()
        setResolvedTheme(resolved)
        applyTheme(resolved)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

function applyTheme(resolved) {
  if (typeof window === 'undefined') return
  const root = window.document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.setAttribute('data-theme', resolved)
}
