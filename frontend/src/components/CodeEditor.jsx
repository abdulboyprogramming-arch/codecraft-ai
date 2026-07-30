/**
 * CodeCraft AI - Code Editor Component
 * 
 * A syntax-highlighted code editor for entering code to review.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import React, { useState, useEffect } from 'react'
import Editor from 'react-simple-code-editor'

const CodeEditor = ({ code, onChange, language }) => {
  const [isClient, setIsClient] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState(code)

  // Load Prism.js ONLY on the client side
  useEffect(() => {
    setIsClient(true)
    
    const loadAndHighlight = async () => {
      try {
        // Dynamic import of Prism.js
        const Prism = (await import('prismjs')).default
        
        // Import CSS
        await import('prismjs/themes/prism.css')
        
        // Import all languages you support
        await import('prismjs/components/prism-clike')
        await import('prismjs/components/prism-javascript')
        await import('prismjs/components/prism-python')
        await import('prismjs/components/prism-java')
        await import('prismjs/components/prism-cpp')
        await import('prismjs/components/prism-typescript')
        await import('prismjs/components/prism-go')
        await import('prismjs/components/prism-rust')
        
        // Map language to Prism language
        const languageMap = {
          javascript: Prism.languages.javascript,
          python: Prism.languages.python,
          java: Prism.languages.java,
          cpp: Prism.languages.cpp,
          typescript: Prism.languages.typescript,
          go: Prism.languages.go,
          rust: Prism.languages.rust,
        }
        
        const prismLanguage = languageMap[language] || Prism.languages.javascript
        const langName = language || 'javascript'
        
        // Highlight the code
        try {
          const highlighted = Prism.highlight(
            code || '',
            prismLanguage,
            langName
          )
          setHighlightedCode(highlighted)
        } catch (error) {
          console.warn('Failed to highlight code:', error)
          setHighlightedCode(code || '')
        }
      } catch (error) {
        console.warn('Failed to load Prism.js:', error)
        setHighlightedCode(code || '')
      }
    }
    
    loadAndHighlight()
  }, [code, language]) // Re-run when code or language changes

  // During SSR or before Prism loads, show a simple textarea
  if (!isClient) {
    return (
      <div className="border rounded-md overflow-hidden bg-gray-50">
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={(code) => code}
          padding={16}
          className="font-mono text-sm min-h-[300px] focus:outline-none"
          style={{
            backgroundColor: '#f8f9fa',
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: 14,
            lineHeight: 1.6,
            minHeight: '300px',
          }}
        />
      </div>
    )
  }

  // Client-side rendering with syntax highlighting
  return (
    <div className="border rounded-md overflow-hidden bg-gray-50">
      <Editor
        value={code}
        onValueChange={onChange}
        highlight={() => highlightedCode}
        padding={16}
        className="font-mono text-sm min-h-[300px] focus:outline-none"
        style={{
          backgroundColor: '#f8f9fa',
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: 14,
          lineHeight: 1.6,
          minHeight: '300px',
        }}
      />
    </div>
  )
}

export default CodeEditor