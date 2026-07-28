/**
 * CodeCraft AI - Validators
 * 
 * This module contains validation functions for forms and data.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

// ============================================
// Email Validation
// ============================================

export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

// ============================================
// Password Validation
// ============================================

export const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
  return null
}

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

// ============================================
// Name Validation
// ============================================

export const validateName = (name) => {
  if (!name) return 'Name is required'
  if (name.length < 2) return 'Name must be at least 2 characters'
  if (!/^[a-zA-Z\s\-']+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes'
  return null
}

// ============================================
// Code Validation
// ============================================

export const validateCode = (code) => {
  if (!code || !code.trim()) return 'Code is required'
  if (code.length > 50000) return 'Code exceeds maximum length of 50,000 characters'
  return null
}

// ============================================
// URL Validation
// ============================================

export const validateUrl = (url) => {
  if (!url) return null
  try {
    new URL(url)
    return null
  } catch {
    return 'Please enter a valid URL'
  }
}

// ============================================
// Phone Validation
// ============================================

export const validatePhone = (phone) => {
  if (!phone) return null
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
  if (!phoneRegex.test(phone)) return 'Please enter a valid phone number'
  return null
}

// ============================================
// Number Validation
// ============================================

export const validateNumber = (value, options = {}) => {
  const { min, max, required = true } = options
  
  if (required && (value === undefined || value === null || value === '')) {
    return 'This field is required'
  }
  
  if (!required && (value === undefined || value === null || value === '')) {
    return null
  }
  
  const num = Number(value)
  if (isNaN(num)) return 'Please enter a valid number'
  
  if (min !== undefined && num < min) return `Value must be at least ${min}`
  if (max !== undefined && num > max) return `Value must be at most ${max}`
  
  return null
}

// ============================================
// Form Validation Helpers
// ============================================

export const validateForm = (values, validators) => {
  const errors = {}
  
  for (const [key, value] of Object.entries(values)) {
    const validator = validators[key]
    if (validator) {
      const error = validator(value)
      if (error) errors[key] = error
    }
  }
  
  return errors
}

export const isFormValid = (errors) => {
  return Object.keys(errors).length === 0
}

// ============================================
// Export
// ============================================

export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateCode,
  validateUrl,
  validatePhone,
  validateNumber,
  validateForm,
  isFormValid,
}
