/**
 * CodeCraft AI - Spinner Component
 * 
 * A reusable loading spinner with different sizes.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  }

  return (
    <div
      className={`
        inline-block animate-spin rounded-full 
        border-solid border-primary-500 border-t-transparent
        ${sizes[size] || sizes.md}
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Spinner
