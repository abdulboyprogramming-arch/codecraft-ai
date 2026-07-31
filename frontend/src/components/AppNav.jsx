/**
 * CodeCraft AI - App Navigation
 * 
 * Main navigation component for authenticated pages.
 */

import Link from 'next/link'
import { useRouter } from 'next/router'
import { Code2, History, BarChart3, Settings, HelpCircle, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'
import Notifications from './Notifications'

export default function AppNav({ children }) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const navItems = [
    { href: '/dashboard', label: 'Workspace', icon: Code2 },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help', icon: HelpCircle },
  ]

  return (
    <nav className="bg-white dark:bg-dark-surface shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-xl font-bold text-primary-600 dark:text-primary-400">
              CodeCraft AI
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = router.pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-dark-text'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {user && (
              <>
                <span className="text-sm text-gray-700 dark:text-dark-text hidden sm:inline">
                  {user.full_name}
                </span>
                <ThemeToggle />
                <Notifications userId={user.id} />
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
