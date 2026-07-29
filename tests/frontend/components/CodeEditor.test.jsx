import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('prismjs', () => ({
  highlight: jest.fn(() => 'highlighted'),
  languages: {
    clike: {},
    javascript: {},
    python: {},
    java: {},
    cpp: {},
    typescript: {},
    go: {},
    rust: {},
  },
}))

jest.mock('prismjs/components/prism-core', () => ({
  highlight: jest.fn(() => 'highlighted'),
  languages: {
    clike: {},
    javascript: {},
    python: {},
    java: {},
    cpp: {},
    typescript: {},
    go: {},
    rust: {},
  },
}))

jest.mock('prismjs/components/prism-clike', () => ({}))
jest.mock('prismjs/components/prism-javascript', () => ({}))
jest.mock('prismjs/components/prism-python', () => ({}))
jest.mock('prismjs/components/prism-java', () => ({}))
jest.mock('prismjs/components/prism-cpp', () => ({}))
jest.mock('prismjs/components/prism-typescript', () => ({}))
jest.mock('prismjs/components/prism-go', () => ({}))
jest.mock('prismjs/components/prism-rust', () => ({}))
jest.mock('prismjs/themes/prism.css', () => ({}))
import CodeEditor from '../../../frontend/src/components/CodeEditor'

describe('CodeEditor', () => {
  test('renders with default code', () => {
    const handleChange = jest.fn()
    render(<CodeEditor code="console.log('test')" onChange={handleChange} language="javascript" />)
    
    expect(screen.getByText(/console.log/)).toBeInTheDocument()
  })

  test('calls onChange when code changes', async () => {
    const handleChange = jest.fn()
    render(<CodeEditor code="" onChange={handleChange} language="javascript" />)
    
    const textarea = screen.getByRole('textbox')
    await userEvent.type(textarea, 'Hello')
    
    expect(handleChange).toHaveBeenCalled()
  })

  test('falls back to javascript when language is not supported', () => {
    const handleChange = jest.fn()
    render(<CodeEditor code="test" onChange={handleChange} language="unknown" />)
    
    expect(screen.getByText(/test/)).toBeInTheDocument()
  })

  test('renders empty code', () => {
    const handleChange = jest.fn()
    render(<CodeEditor code="" onChange={handleChange} language="python" />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
  })
})
