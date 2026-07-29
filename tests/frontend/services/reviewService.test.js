import { reviewService } from '../../../frontend/src/services/reviewService'

jest.mock('../../../frontend/src/services/apiClient', () => ({
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
}))

import apiClient from '../../../frontend/src/services/apiClient'

describe('reviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('submitReview', () => {
    test('sends correct request and returns data', async () => {
      const mockData = { id: '123', feedback: { logic: [], efficiency: [], style: [], security: [], summary: 'Good', score: 90 } }
      apiClient.post.mockResolvedValue({ data: mockData })

      const result = await reviewService.submitReview('console.log("test")', 'javascript', 'Test Review')

      expect(apiClient.post).toHaveBeenCalledWith('/reviews/', {
        code: 'console.log("test")',
        language: 'javascript',
        title: 'Test Review',
      })
      expect(result).toEqual(mockData)
    })

    test('throws error on API failure', async () => {
      const error = new Error('Network error')
      apiClient.post.mockRejectedValue(error)

      await expect(reviewService.submitReview('test')).rejects.toThrow('Network error')
    })
  })

  describe('getHistory', () => {
    test('returns review history with default params', async () => {
      const mockHistory = [{ id: '1', code: 'test' }]
      apiClient.get.mockResolvedValue({ data: mockHistory })

      const result = await reviewService.getHistory()

      expect(apiClient.get).toHaveBeenCalledWith('/reviews/history', {
        params: { skip: 0, limit: 50 },
      })
      expect(result).toEqual(mockHistory)
    })

    test('returns review history with custom params', async () => {
      const mockHistory = [{ id: '2', code: 'test2' }]
      apiClient.get.mockResolvedValue({ data: mockHistory })

      const result = await reviewService.getHistory(10, 20)

      expect(apiClient.get).toHaveBeenCalledWith('/reviews/history', {
        params: { skip: 10, limit: 20 },
      })
      expect(result).toEqual(mockHistory)
    })

    test('throws error on API failure', async () => {
      const error = new Error('Failed to load')
      apiClient.get.mockRejectedValue(error)

      await expect(reviewService.getHistory()).rejects.toThrow('Failed to load')
    })
  })

  describe('getReview', () => {
    test('returns specific review by id', async () => {
      const mockReview = { id: '123', code: 'test', feedback: {} }
      apiClient.get.mockResolvedValue({ data: mockReview })

      const result = await reviewService.getReview('123')

      expect(apiClient.get).toHaveBeenCalledWith('/reviews/123')
      expect(result).toEqual(mockReview)
    })

    test('throws error on API failure', async () => {
      const error = new Error('Not found')
      apiClient.get.mockRejectedValue(error)

      await expect(reviewService.getReview('123')).rejects.toThrow('Not found')
    })
  })

  describe('deleteReview', () => {
    test('deletes review by id', async () => {
      apiClient.delete.mockResolvedValue({ data: {} })

      const result = await reviewService.deleteReview('123')

      expect(apiClient.delete).toHaveBeenCalledWith('/reviews/123')
      expect(result).toEqual({})
    })

    test('throws error on API failure', async () => {
      const error = new Error('Delete failed')
      apiClient.delete.mockRejectedValue(error)

      await expect(reviewService.deleteReview('123')).rejects.toThrow('Delete failed')
    })
  })

  describe('getStats', () => {
    test('returns review statistics', async () => {
      const mockStats = { total_reviews: 10, total_issues: 25, average_issues_per_review: 2.5, languages: ['python', 'javascript'] }
      apiClient.get.mockResolvedValue({ data: mockStats })

      const result = await reviewService.getStats()

      expect(apiClient.get).toHaveBeenCalledWith('/reviews/stats/summary')
      expect(result).toEqual(mockStats)
    })

    test('throws error on API failure', async () => {
      const error = new Error('Stats failed')
      apiClient.get.mockRejectedValue(error)

      await expect(reviewService.getStats()).rejects.toThrow('Stats failed')
    })
  })
})
