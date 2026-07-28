/**
 * CodeCraft AI - Review History Component
 * 
 * This component displays a list of past code reviews.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import { formatDistanceToNow } from 'date-fns'
import { ChevronRight, Code2, Calendar } from 'lucide-react'

const ReviewHistory = ({ history, onItemClick }) => {
  if (!history || history.length === 0) {
    return (
      <div className="text-center text-gray-500 py-16">
        <Code2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <p className="text-lg font-medium">No reviews yet</p>
        <p className="text-sm mt-2">Submit your first code review to get started</p>
      </div>
    )
  }

  // Calculate total issues from feedback
  const getTotalIssues = (feedback) => {
    if (!feedback) return 0
    const categories = ['logic', 'efficiency', 'style', 'security']
    return categories.reduce((total, cat) => {
      const items = feedback[cat]
      if (Array.isArray(items)) {
        return total + items.length
      }
      return total
    }, 0)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Review History</h2>
        <span className="text-sm text-gray-500">{history.length} reviews</span>
      </div>

      <div className="divide-y divide-gray-200">
        {history.map((review) => {
          const totalIssues = getTotalIssues(review.feedback)
          const codePreview = review.code?.substring(0, 100) || ''
          const title = review.title || codePreview || 'Untitled Review'

          return (
            <button
              key={review.id}
              onClick={() => onItemClick(review.id)}
              className="w-full text-left py-4 hover:bg-gray-50 transition-colors duration-150 rounded-md px-3 group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </span>
                    {totalIssues > 0 && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
                      </span>
                    )}
                    {review.language && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {review.language}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ReviewHistory
