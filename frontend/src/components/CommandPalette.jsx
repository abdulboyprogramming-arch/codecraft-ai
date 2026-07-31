/**
 * CodeCraft AI - Command Palette
 * 
 * Simple command palette for quick actions.
 */

import { useState, useEffect } from 'react'
import { Search, Command } from 'lucide-react'

export default function CommandPalette({ isOpen, onClose, actions }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      setQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const filteredActions = actions?.filter((action) =>
    action.label.toLowerCase().includes(query.toLowerCase())
  ) || []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50 p-4">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center px-4 border-b border-gray-200 dark:border-dark-border">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="w-full px-4 py-4 text-sm outline-none bg-transparent text-gray-900 dark:text-dark-text placeholder-gray-500"
            autoFocus
          />
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded text-xs font-mono text-gray-500">
            ESC
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No results found
            </div>
          ) : (
            filteredActions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.action()
                  onClose()
                }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg flex items-center space-x-3 transition-colors"
              >
                <Command className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900 dark:text-dark-text">{action.label}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
