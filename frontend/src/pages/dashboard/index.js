/**
 * CodeCraft AI - Dashboard Page
 * 
 * This is the main dashboard where users can submit code for review,
 * view feedback, improve code with AI, and access their review history.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Layout from '../../components/Layout'
import CodeEditor from '../../components/CodeEditor'
import FeedbackDisplay from '../../components/FeedbackDisplay'
import ReviewHistory from '../../components/ReviewHistory'
import { reviewService } from '../../services/reviewService'
import toast from 'react-hot-toast'
import { History, Code2, LogOut, Loader2, Wand2, SearchCode } from 'lucide-react'
import AppNav from '../../components/AppNav'
import MobileNav from '../../components/MobileNav'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [code, setCode] = useState('// Write or paste your code here\nconsole.log("Hello, World!");')
  const [language, setLanguage] = useState('javascript')
  const [feedback, setFeedback] = useState(null)
  const [improvement, setImprovement] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('review')
  const [mode, setMode] = useState('review')
  const [focusArea, setFocusArea] = useState('all')
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (user) {
      loadHistory()
    }
  }, [user])

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const data = await reviewService.getHistory()
      setHistory(data)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleDetectLanguage = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code first.')
      return
    }
    try {
      const result = await reviewService.detectLanguage(code)
      if (result.language) {
        setLanguage(result.language)
        toast.success(`Detected language: ${result.language}`)
      } else {
        toast.error('Could not detect language. Please select manually.')
      }
    } catch (error) {
      toast.error('Failed to detect language.')
    }
  }

  const handleReview = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to review.')
      return
    }

    setLoading(true)
    setFeedback(null)
    setImprovement(null)
    try {
      const result = await reviewService.submitReview(code, language)
      setFeedback(result.feedback)
      toast.success('✨ Code review complete!')
      loadHistory()
    } catch (error) {
      toast.error('Failed to get code review. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleImprove = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to improve.')
      return
    }

    setLoading(true)
    setImprovement(null)
    try {
      const result = await reviewService.improveCode(code, language, focusArea)
      setImprovement(result)
      toast.success('✨ Code improved!')
    } catch (error) {
      toast.error('Failed to improve code. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReview = async (reviewId) => {
    try {
      const content = await reviewService.exportReview(reviewId)
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `review-${reviewId}.md`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('Review exported successfully')
    } catch (error) {
      toast.error('Failed to export review')
    }
  }

  const handleHistoryItemClick = async (reviewId) => {
    try {
      const review = await reviewService.getReview(reviewId)
      setCode(review.code)
      setFeedback(review.feedback)
      setImprovement(null)
      setActiveTab('review')
      setMode('review')
      toast.success('Loaded review from history')
    } catch (error) {
      toast.error('Failed to load review details.')
    }
  }

  const focusAreas = [
    { value: 'all', label: 'All Around' },
    { value: 'readability', label: 'Readability' },
    { value: 'performance', label: 'Performance' },
    { value: 'security', label: 'Security' },
    { value: 'maintainability', label: 'Maintainability' },
  ]

  return (
    <Layout title="Dashboard - CodeCraft AI">
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-16 md:pb-0">
        <AppNav />

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('review')}
                className={`${
                  activeTab === 'review'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Code2 className="h-4 w-4" />
                <span>Workspace</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <History className="h-4 w-4" />
                <span>History ({history.length})</span>
              </button>
            </nav>
          </div>

          {/* Tab content */}
          {activeTab === 'review' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left column: Code Editor */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Your Code</h2>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                        <option value="typescript">TypeScript</option>
                        <option value="go">Go</option>
                        <option value="rust">Rust</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleDetectLanguage}
                        className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white hover:bg-gray-50 flex items-center"
                        title="Auto-detect language"
                      >
                        <SearchCode className="h-4 w-4" />
                      </button>
                      {mode === 'improve' && (
                        <select
                          value={focusArea}
                          onChange={(e) => setFocusArea(e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white"
                        >
                          {[
                            { value: 'all', label: 'All Around' },
                            { value: 'readability', label: 'Readability' },
                            { value: 'performance', label: 'Performance' },
                            { value: 'security', label: 'Security' },
                            { value: 'maintainability', label: 'Maintainability' },
                          ].map((area) => (
                            <option key={area.value} value={area.value}>
                              {area.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Mode toggle */}
                  <div className="flex rounded-md shadow-sm mb-4" role="group">
                    <button
                      type="button"
                      onClick={() => { setMode('review'); setFeedback(null); setImprovement(null) }}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-l-lg border ${
                        mode === 'review'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Code2 className="h-4 w-4 inline mr-2" />
                      Review
                    </button>
                    <button
                      type="button"
                      onClick={() => { setMode('improve'); setFeedback(null); setImprovement(null) }}
                      className={`flex-1 px-4 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r ${
                        mode === 'improve'
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Wand2 className="h-4 w-4 inline mr-2" />
                      Improve
                    </button>
                  </div>

                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    language={language}
                  />

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={mode === 'review' ? handleReview : handleImprove}
                      disabled={loading}
                      className="btn-primary text-sm px-6 py-2 flex items-center justify-center"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        mode === 'review' ? (
                          <Code2 className="h-4 w-4 mr-2" />
                        ) : (
                          <Wand2 className="h-4 w-4 mr-2" />
                        )
                      )}
                      {loading ? (mode === 'review' ? 'Reviewing...' : 'Improving...') : (mode === 'review' ? 'Review Code' : 'Improve Code')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right column: Result */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-4 min-h-[400px]">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {mode === 'review' ? 'AI Feedback' : 'Improved Code'}
                  </h2>
                  {loading ? (
                    <div className="flex flex-col justify-center items-center h-64">
                      <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
                      <p className="mt-4 text-gray-500">
                        {mode === 'review' ? 'Analyzing your code...' : 'Refactoring your code...'}
                      </p>
                    </div>
                  ) : mode === 'review' && feedback ? (
                    <FeedbackDisplay feedback={feedback} />
                  ) : mode === 'improve' && improvement ? (
                    <div className="space-y-4">
                      {improvement.explanation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                          <span className="font-medium">Explanation:</span> {improvement.explanation}
                        </div>
                      )}
                      {improvement.changes_summary && improvement.changes_summary.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium text-gray-700">Changes Made</h3>
                          <ul className="space-y-1">
                            {improvement.changes_summary.map((change, index) => (
                              <li key={index} className="text-sm text-gray-600 bg-gray-50 rounded p-2 border border-gray-200">
                                <span className="font-medium text-gray-800">{change.change_type}:</span> {change.description}
                                <span className="ml-2 text-xs text-gray-500">(impact: {change.impact})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Improved Code</h3>
                        <div className="bg-gray-900 rounded-md p-4 overflow-x-auto">
                          <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap">
                            {improvement.improved_code}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-16">
                      {mode === 'review' ? (
                        <>
                          <Code2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                          <p>Submit your code to get AI-powered feedback</p>
                          <p className="text-sm mt-2">Our AI will analyze logic, efficiency, style, and security</p>
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                          <p>Submit your code to get AI-powered improvements</p>
                          <p className="text-sm mt-2">Our AI will refactor and enhance your code</p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {loadingHistory ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                </div>
              ) : (
                <ReviewHistory history={history} onItemClick={handleHistoryItemClick} onExport={handleExportReview} />
              )}
            </div>
          )}
        </div>
        <MobileNav />
      </div>
    </Layout>
  )
}
