/**
 * CodeCraft AI - Feedback Display Component
 * 
 * This component displays the AI feedback in a structured, categorized format.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

const FeedbackDisplay = ({ feedback }) => {
  const categories = [
    { key: 'logic', label: 'Logic Errors', icon: '🔍', color: 'error' },
    { key: 'efficiency', label: 'Efficiency', icon: '⚡', color: 'warning' },
    { key: 'style', label: 'Code Style', icon: '🎨', color: 'info' },
    { key: 'security', label: 'Security', icon: '🔒', color: 'error' },
  ]

  const colorClasses = {
    error: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    info: 'border-blue-200 bg-blue-50 text-blue-700',
  }

  // Get severity badge color
  const getSeverityColor = (severity) => {
    const map = {
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
    }
    return map[severity] || 'bg-gray-100 text-gray-800'
  }

  // Get feedback items or empty array
  const getItems = (key) => {
    const items = feedback?.[key]
    if (!items) return []
    if (typeof items === 'string') return [{ message: items }]
    if (Array.isArray(items)) return items
    return []
  }

  const totalIssues = categories.reduce((acc, cat) => acc + getItems(cat.key).length, 0)

  // Display overall score if available
  const score = feedback?.score

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-700">Review Summary</span>
          <span className="text-sm text-gray-500">
            ({totalIssues} issue{totalIssues !== 1 ? 's' : ''} found)
          </span>
        </div>
        {score !== undefined && score !== null && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Score:</span>
            <span className={`font-bold ${
              score >= 80 ? 'text-green-600' :
              score >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {score}/100
            </span>
          </div>
        )}
      </div>

      {/* Summary text */}
      {feedback?.summary && (
        <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm text-gray-700 border border-gray-200">
          {feedback.summary}
        </div>
      )}

      {/* Category feedback */}
      {categories.map(({ key, label, icon, color }) => {
        const items = getItems(key)
        const hasItems = items.length > 0

        return (
          <div key={key} className="space-y-2">
            <h3 className="font-medium text-gray-700 flex items-center">
              <span className="mr-2">{icon}</span>
              {label}
              <span className="ml-2 text-sm text-gray-400">
                ({items.length})
              </span>
            </h3>
            {hasItems ? (
              <ul className={`border rounded-md p-3 space-y-2 ${colorClasses[color]}`}>
                {items.map((item, index) => {
                  const message = typeof item === 'string' ? item : item.message || JSON.stringify(item)
                  const severity = typeof item === 'object' ? item.severity : 'info'
                  const suggestion = typeof item === 'object' ? item.suggestion : null
                  const line = typeof item === 'object' ? item.line : null

                  return (
                    <li key={index} className="text-sm space-y-1">
                      <div className="flex items-start">
                        <span className="mr-2">•</span>
                        <span className="flex-1">{message}</span>
                        {severity && (
                          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(severity)}`}>
                            {severity}
                          </span>
                        )}
                      </div>
                      {line && (
                        <div className="text-xs text-gray-500 ml-6">
                          Line {line}
                        </div>
                      )}
                      {suggestion && (
                        <div className="text-xs text-gray-600 ml-6 mt-1 bg-white rounded p-2 border border-gray-200">
                          💡 <span className="font-medium">Suggestion:</span> {suggestion}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-400 italic px-3 py-2 bg-gray-50 rounded-md">
                ✓ No issues found in this category
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default FeedbackDisplay
