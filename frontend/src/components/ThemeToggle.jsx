/**
 * CodeCraft AI - Theme Toggle Component
 * 
 * Allows users to switch between light, dark, and system themes.
 */

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun className="h-4 w-4" />
    } else if (theme === 'dark') {
      return <Moon className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const getLabel = () => {
    if (theme === 'light') {
      return 'Light'
    } else if (theme === 'dark') {
      return 'Dark'
    }
    return 'System'
  }

  return (
    <button
      onClick={cycleTheme}
      className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors"
      title={`Theme: ${getLabel()}`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  )
}
