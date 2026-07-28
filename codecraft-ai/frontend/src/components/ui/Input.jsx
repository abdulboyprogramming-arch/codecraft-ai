/**
 * CodeCraft AI - Input Component
 * 
 * A reusable input component with label and error handling.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  icon: Icon,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1 w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-3 py-2 border rounded-md 
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            transition duration-150 ease-in-out
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
