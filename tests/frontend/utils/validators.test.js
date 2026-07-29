import { validateEmail, validatePassword, validateName, validateCode, validatePasswordMatch, validateUrl, validatePhone, validateNumber, validateForm, isFormValid } from '../../../frontend/src/utils/validators'

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

  describe('validatePasswordMatch', () => {
    test('returns null when passwords match', () => {
      expect(validatePasswordMatch('Password123', 'Password123')).toBeNull()
    })

    test('returns error when passwords do not match', () => {
      expect(validatePasswordMatch('Password123', 'Different123')).toBe('Passwords do not match')
    })
  })

  describe('validateName', () => {
    test('returns null for valid name', () => {
      expect(validateName('John Doe')).toBeNull()
      expect(validateName("Mary O'Brien")).toBeNull()
      expect(validateName('Anne-Marie')).toBeNull()
    })

    test('returns error for invalid name', () => {
      expect(validateName('')).toBe('Name is required')
      expect(validateName('A')).toBe('Name must be at least 2 characters')
      expect(validateName('John123')).toBe('Name can only contain letters, spaces, hyphens, and apostrophes')
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
      expect(validateCode('x'.repeat(50001))).toBe('Code exceeds maximum length of 50,000 characters')
    })
  })

  describe('validateUrl', () => {
    test('returns null for valid URL or empty input', () => {
      expect(validateUrl('')).toBeNull()
      expect(validateUrl('https://example.com')).toBeNull()
      expect(validateUrl('http://localhost:3000')).toBeNull()
    })

    test('returns error for invalid URL', () => {
      expect(validateUrl('not-a-url')).toBe('Please enter a valid URL')
    })
  })

  describe('validatePhone', () => {
    test('returns null for valid phone or empty input', () => {
      expect(validatePhone('')).toBeNull()
      expect(validatePhone('+1234567890')).toBeNull()
      expect(validatePhone('123-456-7890')).toBeNull()
    })

    test('returns error for invalid phone', () => {
      expect(validatePhone('abc')).toBe('Please enter a valid phone number')
    })
  })

  describe('validateNumber', () => {
    test('returns null for valid number', () => {
      expect(validateNumber(5, { min: 1, max: 10 })).toBeNull()
      expect(validateNumber('5', { min: 1, max: 10 })).toBeNull()
    })

    test('returns error for invalid number', () => {
      expect(validateNumber('', { required: true })).toBe('This field is required')
      expect(validateNumber(0, { min: 1 })).toBe('Value must be at least 1')
      expect(validateNumber(20, { max: 10 })).toBe('Value must be at most 10')
      expect(validateNumber('abc', { required: true })).toBe('Please enter a valid number')
    })

    test('returns null for optional empty value', () => {
      expect(validateNumber('', { required: false })).toBeNull()
    })
  })

  describe('validateForm', () => {
    test('returns empty object when all fields are valid', () => {
      const values = { email: 'test@example.com', password: 'Password123' }
      const validators = { email: validateEmail, password: validatePassword }
      expect(validateForm(values, validators)).toEqual({})
    })

    test('returns errors for invalid fields', () => {
      const values = { email: 'invalid', password: '' }
      const validators = { email: validateEmail, password: validatePassword }
      const errors = validateForm(values, validators)
      expect(errors.email).toBeDefined()
      expect(errors.password).toBeDefined()
    })
  })

  describe('isFormValid', () => {
    test('returns true for empty errors object', () => {
      expect(isFormValid({})).toBe(true)
    })

    test('returns false when errors exist', () => {
      expect(isFormValid({ email: 'Invalid email' })).toBe(false)
    })
  })
})
