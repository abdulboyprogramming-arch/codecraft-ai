/**
 * CodeCraft AI - Keyboard Shortcuts Component
 * 
 * Displays available keyboard shortcuts and handles global shortcuts.
 */

import { useState, useEffect } from 'react'
import { Keyboard, X } from 'lucide-react'

export default function KeyboardShortcuts({ onClose }) {
  const shortcuts = [
    { key: 'Ctrl/Cmd + R', description: 'Submit code for review' },
    { key: 'Ctrl/Cmd + I', description: 'Improve code with AI' },
    { key: 'Ctrl/Cmd + D', description: 'Detect language' },
    { key: 'Ctrl/Cmd + /', description: 'Show keyboard shortcuts' },
    { key: 'Ctrl/Cmd + K', description: 'Focus code editor' },
    { key: 'Ctrl/Cmd + H', description: 'Go to history' },
    { key: 'Ctrl/Cmd + N', description: 'New review (clear code)' },
    { key: 'Escape', description: 'Close dialogs' },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Keyboard Shortcuts</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-dark-muted">{shortcut.description}</span>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded text-xs font-mono text-gray-700 dark:text-dark-text">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function useKeyboardShortcuts({ onReview, onImprove, onDetectLanguage, onShowShortcuts, onFocusEditor, onGoToHistory, onNewReview }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modifier = isMac ? event.metaKey : event.ctrlKey

      if (modifier) {
        switch (event.key.toLowerCase()) {
          case 'r':
            event.preventDefault()
            onReview?.()
            break
          case 'i':
            event.preventDefault()
            onImprove?.()
            break
          case 'd':
            event.preventDefault()
            onDetectLanguage?.()
            break
          case '/':
            event.preventDefault()
            onShowShortcuts?.()
            break
          case 'k':
            event.preventDefault()
            onFocusEditor?.()
            break
          case 'h':
            event.preventDefault()
            onGoToHistory?.()
            break
          case 'n':
            event.preventDefault()
            onNewReview?.()
            break
          default:
            break
        }
      }

      if (event.key === 'Escape') {
        onShowShortcuts?.(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onReview, onImprove, onDetectLanguage, onShowShortcuts, onFocusEditor, onGoToHistory, onNewReview])
}
