import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReviewHistory from '../../../frontend/src/components/ReviewHistory'

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 hours ago'),
}))

describe('ReviewHistory', () => {
  const mockHistory = [
    {
      id: '1',
      title: 'Test Review 1',
      code: 'def hello(): print("world")',
      language: 'python',
      created_at: '2024-01-01T12:00:00Z',
      feedback: {
        logic: [{ message: 'Issue 1' }],
        efficiency: [],
        style: [{ message: 'Style issue' }],
        security: [],
      },
    },
    {
      id: '2',
      code: 'console.log("test")',
      language: 'javascript',
      created_at: '2024-01-02T10:00:00Z',
      feedback: {
        logic: [],
        efficiency: [],
        style: [],
        security: [],
      },
    },
  ]

  test('renders empty state when no history', () => {
    render(<ReviewHistory history={[]} onItemClick={jest.fn()} />)
    
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
    expect(screen.getByText('Submit your first code review to get started')).toBeInTheDocument()
  })

  test('renders review count', () => {
    render(<ReviewHistory history={mockHistory} onItemClick={jest.fn()} />)
    
    expect(screen.getByText('Review History')).toBeInTheDocument()
    expect(screen.getByText('2 reviews')).toBeInTheDocument()
  })

  test('renders review items with title', () => {
    render(<ReviewHistory history={mockHistory} onItemClick={jest.fn()} />)
    
    expect(screen.getByText('Test Review 1')).toBeInTheDocument()
  })

  test('renders code preview when no title', () => {
    render(<ReviewHistory history={[mockHistory[1]]} onItemClick={jest.fn()} />)
    
    expect(screen.getByText(/console.log/)).toBeInTheDocument()
  })

  test('renders language badges', () => {
    render(<ReviewHistory history={mockHistory} onItemClick={jest.fn()} />)
    
    expect(screen.getByText('python')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  test('renders issue count badges', () => {
    render(<ReviewHistory history={mockHistory} onItemClick={jest.fn()} />)
    
    expect(screen.getByText('2 issues')).toBeInTheDocument()
    expect(screen.getByText('javascript')).toBeInTheDocument()
  })

  test('calls onItemClick when review is clicked', async () => {
    const handleClick = jest.fn()
    render(<ReviewHistory history={mockHistory} onItemClick={handleClick} />)
    
    const reviewButton = screen.getByText('Test Review 1').closest('button')
    await userEvent.click(reviewButton)
    
    expect(handleClick).toHaveBeenCalledWith('1')
  })

  test('renders timestamp for each review', () => {
    render(<ReviewHistory history={mockHistory} onItemClick={jest.fn()} />)
    
    expect(screen.getAllByText('2 hours ago').length).toBe(2)
  })
})
