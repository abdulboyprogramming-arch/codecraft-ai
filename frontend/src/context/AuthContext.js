/**
 * CodeCraft AI - Authentication Context
 * 
 * This context provides authentication state and methods to all components.
 * It handles login, signup, logout, and token management.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Set up axios defaults
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  axios.defaults.headers.common['Content-Type'] = 'application/json'

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Handle OAuth callback tokens from URL query params first
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken) {
      localStorage.setItem('token', accessToken)
      if (refreshToken) {
        localStorage.setItem('refresh_token', refreshToken)
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      window.history.replaceState({}, document.title, window.location.pathname)
      router.replace('/dashboard')
      return
    }

    // Check if user is logged in via stored token
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password })
      const { access_token, refresh_token } = response.data
      localStorage.setItem('token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      await fetchUser()
      router.push('/dashboard')
      toast.success('Welcome back!')
      return true
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.'
      toast.error(message)
      return false
    }
  }

  const signup = async (email, password, fullName) => {
    try {
      await axios.post('/auth/signup', { email, password, full_name: fullName })
      toast.success('Account created successfully! 🎉 Please log in.')
      router.push('/login')
      return true
    } catch (error) {
      const message = error.response?.data?.detail || 'Signup failed. Please try again.'
      toast.error(message)
      return false
    }
  }

  const loginWithOAuth = (provider) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    window.location.href = `${apiUrl}/auth/oauth/${provider}`
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
    router.push('/login')
    toast.success('Logged out successfully')
  }

  const refreshToken = async () => {
    const refreshTokenValue = localStorage.getItem('refresh_token')
    if (!refreshTokenValue) {
      logout()
      return false
    }
    try {
      const response = await axios.post('/auth/refresh', { refresh_token: refreshTokenValue })
      const { access_token, refresh_token } = response.data
      localStorage.setItem('token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      return true
    } catch {
      logout()
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshToken, loginWithOAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
