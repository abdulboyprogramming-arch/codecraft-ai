import { render, screen } from '@testing-library/react'
import FeedbackDisplay from '../../../frontend/src/components/FeedbackDisplay'

describe('FeedbackDisplay', () => {
  const mockFeedback = {
    logic: [
      { message: 'Missing type hints', severity: 'warning', suggestion: 'Add type hints', line: 1 },
      { message: 'No error handling', severity: 'error', suggestion: 'Add try/catch' },
    ],
    efficiency: [
      { message: 'Use map instead of for loop', severity: 'info', suggestion: 'Use Array.map()' },
    ],
    style: [],
    security: [
      { message: 'SQL injection risk', severity: 'error', suggestion: 'Use parameterized queries' },
    ],
    summary: 'Overall good code with minor improvements needed.',
    score: 85,
  }

  test('renders feedback summary and score', () => {
    render(<FeedbackDisplay feedback={mockFeedback} />)
    
    expect(screen.getByText('Review Summary')).toBeInTheDocument()
    expect(screen.getByText(/4 issues found/)).toBeInTheDocument()
    expect(screen.getByText('85/100')).toBeInTheDocument()
    expect(screen.getByText('Overall good code with minor improvements needed.')).toBeInTheDocument()
  })

  test('renders category headers with issue counts', () => {
    render(<FeedbackDisplay feedback={mockFeedback} />)
    
    expect(screen.getByText('Logic Errors')).toBeInTheDocument()
    expect(screen.getByText('(2)')).toBeInTheDocument()
    expect(screen.getByText('Efficiency')).toBeInTheDocument()
    expect(screen.getAllByText('(1)').length).toBe(2)
    expect(screen.getByText('Code Style')).toBeInTheDocument()
    expect(screen.getByText('(0)')).toBeInTheDocument()
    expect(screen.getByText('Security')).toBeInTheDocument()
  })

  test('renders suggestions', () => {
    render(<FeedbackDisplay feedback={mockFeedback} />)
    
    const suggestions = screen.getAllByText('Suggestion:')
    expect(suggestions.length).toBeGreaterThan(0)
    expect(screen.getByText((content, element) => {
      return element.textContent === '💡 Suggestion: Add type hints'
    })).toBeInTheDocument()
  })

  test('handles null feedback gracefully', () => {
    render(<FeedbackDisplay feedback={null} />)
    
    expect(screen.getByText('Review Summary')).toBeInTheDocument()
    expect(screen.getByText(/0 issues found/)).toBeInTheDocument()
    expect(screen.getAllByText('✓ No issues found in this category').length).toBe(4)
  })

  test('handles empty feedback object', () => {
    render(<FeedbackDisplay feedback={{}} />)
    
    expect(screen.getByText('Review Summary')).toBeInTheDocument()
    expect(screen.getAllByText('(0)').length).toBe(4)
  })

  test('handles string feedback items', () => {
    const stringFeedback = {
      logic: ['Simple string issue'],
      efficiency: [],
      style: [],
      security: [],
    }
    render(<FeedbackDisplay feedback={stringFeedback} />)
    
    expect(screen.getByText('Simple string issue')).toBeInTheDocument()
  })

  test('score color changes based on value', () => {
    render(<FeedbackDisplay feedback={{ ...mockFeedback, score: 45 }} />)
    expect(screen.getByText('45/100')).toHaveClass('text-red-600')
    
    render(<FeedbackDisplay feedback={{ ...mockFeedback, score: 75 }} />)
    expect(screen.getByText('75/100')).toHaveClass('text-yellow-600')
    
    render(<FeedbackDisplay feedback={{ ...mockFeedback, score: 95 }} />)
    expect(screen.getByText('95/100')).toHaveClass('text-green-600')
  })
})
