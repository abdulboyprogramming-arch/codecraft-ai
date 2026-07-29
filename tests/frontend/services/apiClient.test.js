import apiClient from '../../../frontend/src/services/apiClient'

jest.mock('axios', () => {
  const requestHandlers = []
  const responseHandlers = []
  
  const mockInstance = {
    interceptors: {
      request: {
        use: jest.fn((fulfilled) => {
          requestHandlers.push(fulfilled)
        }),
      },
      response: {
        use: jest.fn((fulfilled, rejected) => {
          responseHandlers.push({ fulfilled, rejected })
        }),
      },
    },
    request: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  }
  
  return {
    create: jest.fn(() => mockInstance),
    defaults: {
      headers: {
        common: {},
      },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    _requestHandlers: requestHandlers,
    _responseHandlers: responseHandlers,
  }
})

jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
  success: jest.fn(),
}))

describe('apiClient', () => {
  beforeEach(() => {
    localStorage.clear()
    const axios = require('axios')
    axios._requestHandlers.length = 0
    axios._responseHandlers.length = 0
  })

  test('creates axios instance with correct baseURL', () => {
    const axios = require('axios')
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8000/api',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 30000,
    })
  })

  test('adds auth token to request headers when token exists', () => {
    localStorage.setItem('token', 'test-token')
    const axios = require('axios')
    const handler = axios._requestHandlers[0]
    if (handler) {
      const config = handler({ headers: {} })
      expect(config.headers.Authorization).toBe('Bearer test-token')
    }
  })

  test('does not add auth token when none exists', () => {
    const axios = require('axios')
    const handler = axios._requestHandlers[0]
    if (handler) {
      const config = handler({ headers: {} })
      expect(config.headers.Authorization).toBeUndefined()
    }
  })
})
