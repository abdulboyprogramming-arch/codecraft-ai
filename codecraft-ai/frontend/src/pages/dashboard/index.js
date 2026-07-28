/**
 * CodeCraft AI - Dashboard Page
 * 
 * This is the main dashboard where users can submit code for review,
 * view feedback, and access their review history.
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
import { History, Code2, LogOut, Loader2 } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [code, setCode] = useState('// Write or paste your code here\nconsole.log("Hello, World!");')
  const [language, setLanguage] = useState('javascript')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('review')
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

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Please enter some code to review.')
      return
    }

    setLoading(true)
    setFeedback(null)
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

  const handleHistoryItemClick = async (reviewId) => {
    try {
      const review = await reviewService.getReview(reviewId)
      setCode(review.code)
      setFeedback(review.feedback)
      setActiveTab('review')
      toast.success('Loaded review from history')
    } catch (error) {
      toast.error('Failed to load review details.')
    }
  }

  return (
    <Layout title="Dashboard - CodeCraft AI">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <nav className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-primary-600">CodeCraft AI</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user?.full_name}
                </span>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

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
                <span>Code Review</span>
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
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary text-sm px-4 py-2 flex items-center justify-center"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        {loading ? 'Reviewing...' : 'Review Code'}
                      </button>
                    </div>
                  </div>
                  <CodeEditor
                    code={code}
                    onChange={setCode}
                    language={language}
                  />
                </div>
              </div>

              {/* Right column: Feedback */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm p-4 min-h-[400px]">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Feedback</h2>
                  {loading ? (
                    <div className="flex flex-col justify-center items-center h-64">
                      <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
                      <p className="mt-4 text-gray-500">Analyzing your code...</p>
                    </div>
                  ) : feedback ? (
                    <FeedbackDisplay feedback={feedback} />
                  ) : (
                    <div className="text-center text-gray-500 py-16">
                      <Code2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p>Submit your code to get AI-powered feedback</p>
                      <p className="text-sm mt-2">Our AI will analyze logic, efficiency, style, and security</p>
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
                <ReviewHistory history={history} onItemClick={handleHistoryItemClick} />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
