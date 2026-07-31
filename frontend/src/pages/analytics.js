import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AppNav from '../components/AppNav'
import { reviewService } from '../services/reviewService'
import toast from 'react-hot-toast'
import { BarChart3, TrendingUp, Code2, Award, Loader2 } from 'lucide-react'

export default function Analytics() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await reviewService.getStats()
      setStats(data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  const totalIssues = stats?.total_issues || 0
  const totalReviews = stats?.total_reviews || 0
  const avgIssues = stats?.average_issues_per_review || 0

  return (
    <div className="min-h-screen">
      <AppNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-8">Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="text-3xl font-bold">{totalReviews}</p>
              </div>
              <Code2 className="h-8 w-8 text-primary-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Issues Found</p>
                <p className="text-3xl font-bold">{totalIssues}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg Issues per Review</p>
                <p className="text-3xl font-bold">{avgIssues}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Languages Used</h2>
          <div className="flex flex-wrap gap-2">
            {stats?.languages?.length > 0 ? (
              stats.languages.map((lang) => (
                <span key={lang} className="px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                  {lang}
                </span>
              ))
            ) : (
              <p className="text-gray-500">No reviews yet. Start reviewing code to see analytics.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
