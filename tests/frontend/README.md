cat > /c/Users/USER/Documents/dev-testing/codecraft-ai/tests/frontend/README.md << 'EOF'
# CodeCraft AI - Frontend Tests

## Overview

This directory contains tests for the CodeCraft AI frontend application.

---

## 📋 Table of Contents

1. [Setup](#setup)
2. [Test Structure](#test-structure)
3. [Writing Tests](#writing-tests)
4. [Running Tests in CI](#running-tests-in-ci)
5. [Common Test Patterns](#common-test-patterns)
6. [Coverage Requirements](#coverage-requirements)
7. [Continuous Integration](#continuous-integration)
8. [Debugging Tests](#debugging-tests)

---

## Setup

### Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install test dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest

# Install additional testing utilities
npm install --save-dev @testing-library/react-hooks jest-environment-jsdom
```
### Run test

```
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode (for development)
npm test -- --watch

# Run tests with verbose output
npm test -- --verbose
```

### Test structure

```
tests/frontend/
├── components/                    # Component tests
│   ├── CodeEditor.test.jsx        # Code editor component tests
│   ├── FeedbackDisplay.test.jsx   # Feedback display component tests
│   └── ReviewHistory.test.jsx     # Review history component tests
├── pages/                         # Page tests
│   ├── login.test.jsx             # Login page tests
│   ├── signup.test.jsx            # Signup page tests
│   └── dashboard.test.jsx         # Dashboard page tests
├── services/                      # Service tests
│   ├── apiClient.test.js          # API client tests
│   └── reviewService.test.js      # Review service tests
└── utils/                         # Utility tests
    ├── constants.test.js          # Constants tests
    └── validators.test.js         # Validators tests
```

--- 
## Writing tests

### Component Test Example

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CodeEditor from '../../../frontend/src/components/CodeEditor'

describe('CodeEditor', () => {
  test('renders with default code', () => {
    render(<CodeEditor code="console.log('test')" onChange={() => {}} />)
    expect(screen.getByText(/console.log/)).toBeInTheDocument()
  })

  test('calls onChange when code changes', async () => {
    const handleChange = jest.fn()
    render(<CodeEditor code="" onChange={handleChange} />)
    
    const textarea = screen.getByRole('textbox')
    await userEvent.type(textarea, 'Hello')
    
    expect(handleChange).toHaveBeenCalled()
  })
})
```

### Page Test Example

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '../../../frontend/src/pages/login'
import { AuthProvider } from '../../../frontend/src/context/AuthContext'

// Mock the useAuth hook
jest.mock('../../../frontend/src/context/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }) => <div>{children}</div>
}))

describe('Login Page', () => {
  test('renders login form', () => {
    render(<Login />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  test('handles form submission', async () => {
    const mockLogin = jest.fn()
    require('../../../frontend/src/context/AuthContext').useAuth.mockReturnValue({
      login: mockLogin,
      loading: false
    })

    render(<Login />)
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'Password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'Password123')
    })
  })
})
```

### Service Test Example

```js
import { reviewService } from '../../../frontend/src/services/reviewService'
import apiClient from '../../../frontend/src/services/apiClient'

jest.mock('../../../frontend/src/services/apiClient')

describe('reviewService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('submitReview sends correct request', async () => {
    const mockData = { code: 'test', language: 'javascript' }
    const mockResponse = { data: { id: '123', feedback: {} } }
    apiClient.post.mockResolvedValue(mockResponse)

    const result = await reviewService.submitReview('test', 'javascript')
    
    expect(apiClient.post).toHaveBeenCalledWith('/reviews/', mockData)
    expect(result).toEqual(mockResponse.data)
  })

  test('getHistory returns review history', async () => {
    const mockHistory = [{ id: '1', code: 'test' }]
    apiClient.get.mockResolvedValue({ data: mockHistory })

    const result = await reviewService.getHistory()
    
    expect(apiClient.get).toHaveBeenCalledWith('/reviews/history', { params: { skip: 0, limit: 50 } })
    expect(result).toEqual(mockHistory)
  })

  test('handles API errors gracefully', async () => {
    const error = new Error('Network error')
    apiClient.post.mockRejectedValue(error)

    await expect(reviewService.submitReview('test')).rejects.toThrow('Network error')
  })
})
```

### Utility Test Example

```js
import { validateEmail, validatePassword, validateCode } from '../../../frontend/src/utils/validators'

describe('Validators', () => {
  describe('validateEmail', () => {
    test('returns null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull()
      expect(validateEmail('user.name@domain.co.uk')).toBeNull()
    })

    test('returns error for invalid email', () => {
      expect(validateEmail('invalid')).toBe('Please enter a valid email address')
      expect(validateEmail('test@')).toBe('Please enter a valid email address')
      expect(validateEmail('')).toBe('Email is required')
    })
  })

  describe('validatePassword', () => {
    test('returns null for valid password', () => {
      expect(validatePassword('Password123')).toBeNull()
      expect(validatePassword('StrongP@ssw0rd')).toBeNull()
    })

    test('returns error for weak password', () => {
      expect(validatePassword('')).toBe('Password is required')
      expect(validatePassword('123')).toBe('Password must be at least 8 characters')
      expect(validatePassword('password')).toBe('Password must contain at least one uppercase letter')
      expect(validatePassword('PASSWORD')).toBe('Password must contain at least one lowercase letter')
      expect(validatePassword('Password')).toBe('Password must contain at least one number')
    })
  })

  describe('validateCode', () => {
    test('returns null for valid code', () => {
      expect(validateCode('console.log("test")')).toBeNull()
      expect(validateCode('def hello(): print("world")')).toBeNull()
    })

    test('returns error for invalid code', () => {
      expect(validateCode('')).toBe('Code is required')
      expect(validateCode('   ')).toBe('Code is required')
    })
  })
})
```

---
## Running Tests in CI

### GitHub Actions Configuration

```yaml
# .github/workflows/test.yml
name: Frontend Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: Run tests
        run: |
          cd frontend
          npm test -- --ci --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          directory: frontend/coverage
          flags: frontend-tests
```

### GitLab CI Configuration

```yaml
# .gitlab-ci.yml
frontend-tests:
  stage: test
  image: node:18
  script:
    - cd frontend
    - npm ci
    - npm test -- --ci --coverage
  artifacts:
    paths:
      - frontend/coverage/
```

---
## Common Test Patterns

### Testing Authentication

```jsx
import { AuthProvider } from '../../../frontend/src/context/AuthContext'
import { useAuth } from '../../../frontend/src/hooks/useAuth'

// Wrapper for auth context
const renderWithAuth = (ui, { user = null } = {}) => {
  const mockAuth = {
    user,
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    loading: false,
  }

  return render(
    <AuthProvider>
      {ui}
    </AuthProvider>
  )
}

// Mock useAuth hook
jest.mock('../../../frontend/src/hooks/useAuth', () => ({
  useAuth: jest.fn()
}))

describe('Authenticated Component', () => {
  test('shows user info when authenticated', () => {
    const mockUser = { email: 'test@example.com', full_name: 'Test User' }
    useAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      logout: jest.fn()
    })

    render(<Dashboard />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
  })

  test('redirects when not authenticated', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
      logout: jest.fn()
    })

    render(<Dashboard />)
    expect(screen.getByText('Please login')).toBeInTheDocument()
  })
})
```

### Testing API Calls

```jsx
import { render, waitFor, screen } from '@testing-library/react'
import { reviewService } from '../../../frontend/src/services/reviewService'
import ReviewList from '../../../frontend/src/components/ReviewList'

jest.mock('../../../frontend/src/services/reviewService')

describe('ReviewList', () => {
  test('loads and displays reviews', async () => {
    const mockReviews = [
      { id: '1', code: 'console.log("test")', created_at: '2024-01-01' },
      { id: '2', code: 'def hello(): print("world")', created_at: '2024-01-02' }
    ]
    
    reviewService.getHistory.mockResolvedValue(mockReviews)

    render(<ReviewList />)

    // Show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Wait for reviews to load
    await waitFor(() => {
      expect(screen.getByText('console.log("test")')).toBeInTheDocument()
      expect(screen.getByText('def hello(): print("world")')).toBeInTheDocument()
    })

    // Verify loading state is gone
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  test('shows error state on API failure', async () => {
    reviewService.getHistory.mockRejectedValue(new Error('Failed to load'))

    render(<ReviewList />)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
    })
  })
})
```

### Testing Form Validation

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Signup from '../../../frontend/src/pages/signup'

describe('Signup Form Validation', () => {
  test('shows validation errors for invalid input', async () => {
    render(<Signup />)

    // Submit form without filling fields
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    // Check for validation messages
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument()
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
  })

  test('validates password strength', async () => {
    render(<Signup />)

    // Enter weak password
    await userEvent.type(screen.getByLabelText(/password/i), 'weak')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText(/password must be at least 8 characters/i)).toBeInTheDocument()
  })
})
```

## Coverage Requirements
Metric	Requirement
Statements	80%
Branches	70%
Functions	80%
Lines	80%

## Generate Coverage Report
```bash
# Run tests with coverage
npm test -- --coverage

# View coverage report
# Open coverage/lcov-report/index.html in browser
```

---
## Continuous Integration
- Pull requests to `main` branch

- Push to `develop` branch

- Nightly builds (scheduled)

## Test Environment
- Node.js 18.x

- Jest with jsdom

- GitHub Actions / GitLab CI

---
## Debugging Tests

### Run in Debug Mode
```bash
# Node.js debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Chrome DevTools
# Open chrome://inspect and attach to process
```

### Common Debugging Commands
```bash
# Show verbose output
npm test -- --verbose

# Run specific test file
npm test -- CodeEditor.test.jsx

# Run tests matching pattern
npm test -- --testNamePattern="renders with default code"

# Run tests with more details
npm test -- --debug

# Run tests and keep watching
npm test -- --watch

# Run tests without cache
npm test -- --no-cache
```

### Debugging Tips
1. Use `screen.debug()` to see rendered output

```jsx
render(<Component />)
screen.debug() // Prints DOM tree
```

2. Use `console.log` inside tests

```jsx
test('test something', () => {
  const result = someFunction()
  console.log('Result:', result) // Shows in terminal
  expect(result).toBe(expected)
})
```

3. Use `waitFor` for async operations
```jsx
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})
```

---

## 📝 Quick Reference

Command	Description
`npm test`	Run all tests
`npm test -- --watch`	Run tests in watch mode
`npm test -- --coverage`	Run tests with coverage
`npm test -- --verbose`	Run tests with verbose output
`npm test -- CodeEditor.test.jsx`	Run specific test file
`npm test -- --testNamePattern="pattern"`	Run tests matching pattern

**Developer:** Abdulrahman Adeeyo
**Hackathon:** Prometheus July AI Challenge
**Repository:** https://github.com/abdulboyprogramming-arch/codecraft-ai.git
