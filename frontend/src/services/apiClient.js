/**
 * CodeCraft AI - API Client
 * 
 * This module provides a configured axios instance for making API calls.
 * It handles authentication headers, request/response interceptors, and error handling.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import axios from 'axios'
import toast from 'react-hot-toast'

// ============================================
// Create Axios Instance
// ============================================

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// ============================================
// Request Interceptor
// ============================================

apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// ============================================
// Response Interceptor
// ============================================

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        delete apiClient.defaults.headers.common['Authorization']
        
        // Don't redirect if already on login page
        const currentPath = window.location.pathname
        if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
          toast.error('Session expired. Please login again.')
          window.location.href = '/login'
        }
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment.')
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config,
      })
    }

    return Promise.reject(error)
  }
)

// ============================================
// Export
// ============================================

export default apiClient
