/**
 * CodeCraft AI - Review Service
 * 
 * This module handles all code review related API calls.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import apiClient from './apiClient'

// ============================================
// Review Service
// ============================================

export const reviewService = {
  /**
   * Submit code for AI review
   */
  async submitReview(code, language = null, title = null) {
    try {
      const response = await apiClient.post('/reviews/', {
        code,
        language,
        title,
      })
      return response.data
    } catch (error) {
      console.error('Failed to submit review:', error)
      throw error
    }
  },

  /**
   * Get user's review history
   */
  async getHistory(skip = 0, limit = 50) {
    try {
      const response = await apiClient.get('/reviews/history', {
        params: { skip, limit },
      })
      return response.data
    } catch (error) {
      console.error('Failed to get history:', error)
      throw error
    }
  },

  /**
   * Get a specific review by ID
   */
  async getReview(id) {
    try {
      const response = await apiClient.get(`/reviews/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to get review:', error)
      throw error
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(id) {
    try {
      const response = await apiClient.delete(`/reviews/${id}`)
      return response.data
    } catch (error) {
      console.error('Failed to delete review:', error)
      throw error
    }
  },

  /**
   * Get review statistics
   */
  async getStats() {
    try {
      const response = await apiClient.get('/reviews/stats/summary')
      return response.data
    } catch (error) {
      console.error('Failed to get stats:', error)
      throw error
    }
  },
}

// ============================================
// Export
// ============================================

export default reviewService
