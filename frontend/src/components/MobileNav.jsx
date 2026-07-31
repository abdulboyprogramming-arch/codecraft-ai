/**
 * CodeCraft AI - Mobile Bottom Navigation
 * 
 * Provides bottom navigation for mobile devices.
 */

import Link from 'next/link'
import { useRouter } from 'next/router'
import { Code2, History, BarChart3, Settings } from 'lucide-react'

export default function MobileNav() {
  const router = useRouter()

  const navItems = [
    { href: '/dashboard', label: 'Workspace', icon: Code2 },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = router.pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 flex-1 h-full ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-dark-muted'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
