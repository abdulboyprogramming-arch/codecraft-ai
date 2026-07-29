import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../../../frontend/src/pages/login'

const mockLogin = jest.fn()
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

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
    })
  })

  test('renders login form', () => {
    render(<Login />)
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('renders signup link', () => {
    render(<Login />)
    
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument()
    expect(screen.getByText('Create one now')).toBeInTheDocument()
  })

  test('handles form submission with valid data', async () => {
    mockLogin.mockResolvedValue(true)
    render(<Login />)
    
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123')
    })
  })

  test('shows loading state during submission', async () => {
    let resolveLogin
    mockLogin.mockImplementation(() => new Promise(resolve => {
      resolveLogin = resolve
    }))
    render(<Login />)
    
    await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument()
    
    resolveLogin(true)
    await waitFor(() => {
      expect(screen.queryByText('Signing in...')).not.toBeInTheDocument()
    })
  })

  test('toggles password visibility', async () => {
    render(<Login />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    const toggleButton = screen.getByRole('button', { name: '' })
    await userEvent.click(toggleButton)
    
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('submitting with empty fields calls login with empty values', async () => {
    mockLogin.mockResolvedValue(true)
    render(<Login />)
    
    const form = document.querySelector('form')
    fireEvent.submit(form)
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('', '')
    })
  })
})
