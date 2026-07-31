/**
 * CodeCraft AI - Next.js App Component
 * 
 * This is the main application component that wraps all pages.
 * It provides global context providers, styling, and toast notifications.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { ThemeProvider } from '../context/ThemeContext'
import { registerServiceWorker } from '../utils/registerServiceWorker'
import ErrorBoundary from '../components/ErrorBoundary'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
          <Component {...pageProps} />
        </ErrorBoundary>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 16px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default MyApp
