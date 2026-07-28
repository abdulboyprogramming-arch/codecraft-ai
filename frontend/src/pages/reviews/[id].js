/**
 * CodeCraft AI - Review Detail Page
 * 
 * This page displays a specific review with full code and feedback.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../../components/Layout'
import FeedbackDisplay from '../../components/FeedbackDisplay'
import { reviewService } from '../../services/reviewService'
import toast from 'react-hot-toast'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function ReviewDetail() {
  const router = useRouter()
  const { id } = router.query
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadReview()
    }
  }, [id])

  const loadReview = async () => {
    try {
      const data = await reviewService.getReview(id)
      setReview(data)
    } catch (error) {
      toast.error('Failed to load review details')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout title="Loading Review - CodeCraft AI">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin" />
        </div>
      </Layout>
    )
  }

  if (!review) {
    return (
      <Layout title="Review Not Found - CodeCraft AI">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Review Not Found</h2>
          <Link href="/dashboard" className="btn-primary inline-block mt-4">
            Back to Dashboard
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={`Review ${review.id.substring(0, 8)} - CodeCraft AI`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link 
            href="/dashboard" 
            className="text-primary-600 hover:text-primary-700 flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviewed Code</h2>
            <div className="bg-gray-50 rounded-md p-4 font-mono text-sm overflow-x-auto border border-gray-200">
              <pre className="whitespace-pre-wrap break-all">{review.code}</pre>
            </div>
            {review.language && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {review.language}
                </span>
              </div>
            )}
          </div>

          {/* Feedback */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Feedback</h2>
            <FeedbackDisplay feedback={review.feedback} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
