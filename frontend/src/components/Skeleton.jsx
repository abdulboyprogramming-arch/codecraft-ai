/**
 * CodeCraft AI - Skeleton Loading Components
 * 
 * Reusable skeleton loaders for various UI elements.
 */

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-dark-border rounded ${className}`} />
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-6">
      <Skeleton className="h-6 w-1/2 mb-4" />
      <SkeletonText lines={3} />
    </div>
  )
}

export function SkeletonButton() {
  return <Skeleton className="h-10 w-32 rounded-md" />
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}
