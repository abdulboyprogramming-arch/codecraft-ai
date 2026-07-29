import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../../../frontend/src/context/AuthContext'
import axios from 'axios'

jest.mock('axios')
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

const mockPush = jest.fn()

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

const TestComponent = () => {
  const { user, loading, login, signup, logout } = useAuth()
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'ready'}</div>
      <div data-testid="user">{user?.email || 'no-user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>Login</button>
      <button onClick={() => signup('test@example.com', 'password', 'Test User')}>Signup</button>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    delete axios.defaults.headers.common.Authorization
  })

  test('renders children correctly', () => {
    render(
      <AuthProvider>
        <div data-testid="child">Child</div>
      </AuthProvider>
    )
    
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  test('throws error when useAuth is used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleError.mockRestore()
  })

  test('login calls API and updates user on success', async () => {
    axios.post.mockResolvedValue({
      data: { access_token: 'test-token' },
    })
    axios.get.mockResolvedValue({
      data: { email: 'test@example.com', full_name: 'Test User' },
    })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await userEvent.click(screen.getByText('Login'))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
    
    expect(axios.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password',
    })
  })

  test('logout clears token and redirects', async () => {
    localStorage.setItem('token', 'test-token')
    axios.defaults.headers.common.Authorization = 'Bearer test-token'

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await userEvent.click(screen.getByText('Logout'))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
    })
    
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  test('signup calls API and redirects on success', async () => {
    axios.post.mockResolvedValue({ data: {} })

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    await userEvent.click(screen.getByText('Signup'))

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/auth/signup', {
        email: 'test@example.com',
        password: 'password',
        full_name: 'Test User',
      })
    })
    
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
