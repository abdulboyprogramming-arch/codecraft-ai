import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Signup from '../../../frontend/src/pages/signup'

const mockSignup = jest.fn()
const mockPush = jest.fn()

jest.mock('../../../frontend/src/context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => <div>{children}</div>,
}))

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const { useAuth } = require('../../../frontend/src/context/AuthContext')

describe('Signup Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      signup: mockSignup,
    })
  })

  test('renders signup form', () => {
    render(<Signup />)
    
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  test('renders login link', () => {
    render(<Signup />)
    
    expect(screen.getByText("Already have an account?")).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  test('handles form submission with valid data', async () => {
    mockSignup.mockResolvedValue(true)
    render(<Signup />)
    
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
    await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('john@example.com', 'Password123', 'John Doe')
    })
  })

  test('shows loading state during submission', async () => {
    let resolveSignup
    mockSignup.mockImplementation(() => new Promise(resolve => {
      resolveSignup = resolve
    }))
    render(<Signup />)
    
    await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
    await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    
    expect(screen.getByText('Creating account...')).toBeInTheDocument()
    
    resolveSignup(true)
    await waitFor(() => {
      expect(screen.queryByText('Creating account...')).not.toBeInTheDocument()
    })
  })

  test('toggles password visibility', async () => {
    render(<Signup />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    const toggleButton = screen.getByRole('button', { name: '' })
    await userEvent.click(toggleButton)
    
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('submitting with empty fields calls signup with empty values', async () => {
    mockSignup.mockResolvedValue(true)
    render(<Signup />)
    
    const form = document.querySelector('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('', '', '')
    })
  })
})
