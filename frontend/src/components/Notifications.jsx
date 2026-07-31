/**
 * CodeCraft AI - Notifications Component
 * 
 * Displays recent notifications for the user.
 */

import { useState, useEffect } from 'react'
import { Bell, X, Check } from 'lucide-react'

export default function Notifications({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('codecraft-notifications') : null
    if (stored) {
      try {
        setNotifications(JSON.parse(stored))
      } catch {
        setNotifications([])
      }
    }
  }, [])

  const dismissNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id)
    setNotifications(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('codecraft-notifications', JSON.stringify(updated))
    }
  }

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }))
    setNotifications(updated)
    if (typeof window !== 'undefined') {
      localStorage.setItem('codecraft-notifications', JSON.stringify(updated))
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-500 hover:text-gray-700 relative"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-surface rounded-lg shadow-lg border border-gray-200 dark:border-dark-border z-50">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-dark-border">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:text-primary-700">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 dark:border-dark-border last:border-b-0 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-dark-text">{notification.title}</p>
                      <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">{notification.message}</p>
                    </div>
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
