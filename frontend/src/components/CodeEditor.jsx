/**
 * CodeCraft AI - Code Editor Component
 * 
 * A syntax-highlighted code editor with line numbers and dark mode support.
 */

import React, { useState, useEffect, useCallback } from 'react'
import Editor from 'react-simple-code-editor'

export default function CodeEditor({ code, onChange, language, fontSize = 14, wordWrap = false }) {
  const [isClient, setIsClient] = useState(false)
  const [highlightedCode, setHighlightedCode] = useState('')
  const [lineCount, setLineCount] = useState(1)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const highlightCode = async () => {
      try {
        const Prism = (await import('prismjs')).default
        
        await import('prismjs/themes/prism.css')
        
        const languageModules = [
          'prism-clike',
          'prism-javascript',
          'prism-python',
          'prism-java',
          'prism-cpp',
          'prism-typescript',
          'prism-go',
          'prism-rust',
          'prism-bash',
          'prism-json',
          'prism-markdown',
          'prism-sql',
        ]
        
        for (const module of languageModules) {
          try {
            await import(`prismjs/components/${module}`)
          } catch {
            // Ignore missing language modules
          }
        }
        
        const languageMap = {
          javascript: Prism.languages.javascript,
          python: Prism.languages.python,
          java: Prism.languages.java,
          cpp: Prism.languages.cpp,
          typescript: Prism.languages.typescript,
          go: Prism.languages.go,
          rust: Prism.languages.rust,
          bash: Prism.languages.bash,
          shell: Prism.languages.bash,
          json: Prism.languages.json,
          markdown: Prism.languages.markdown,
          sql: Prism.languages.sql,
        }
        
        const prismLanguage = languageMap[language] || Prism.languages.javascript
        const langName = language || 'javascript'
        
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

    highlightCode()
  }, [code, language, isClient])

  useEffect(() => {
    if (code) {
      const lines = code.split('\n').length
      setLineCount(lines)
    } else {
      setLineCount(1)
    }
  }, [code])

  const renderLineNumbers = useCallback(() => {
    const numbers = []
    for (let i = 1; i <= lineCount; i++) {
      numbers.push(
        <div
          key={i}
          className="text-right pr-3 text-gray-400 select-none text-xs leading-6"
          style={{ fontSize: fontSize - 1 }}
        >
          {i}
        </div>
      )
    }
    return numbers
  }, [lineCount, fontSize])

  if (!isClient) {
    return (
      <div className="border rounded-md overflow-hidden bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border">
        <Editor
          value={code}
          onValueChange={onChange}
          highlight={(code) => code}
          padding={16}
          className="font-mono text-sm min-h-[300px] focus:outline-none"
          style={{
            backgroundColor: '#f8f9fa',
            fontFamily: '"Fira Code", "Fira Mono", monospace',
            fontSize: fontSize,
            lineHeight: 1.6,
            minHeight: '300px',
          }}
        />
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border">
      <div className="flex">
        <div className="bg-gray-100 dark:bg-dark-bg py-4 select-none border-r border-gray-200 dark:border-dark-border">
          {renderLineNumbers()}
        </div>
        <div className="flex-1 overflow-x-auto">
          <Editor
            value={code}
            onValueChange={onChange}
            highlight={() => highlightedCode}
            padding={16}
            className="font-mono text-sm min-h-[300px] focus:outline-none"
            style={{
              backgroundColor: 'transparent',
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: fontSize,
              lineHeight: 1.6,
              minHeight: '300px',
              whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              wordWrap: wordWrap ? 'break-word' : 'normal',
            }}
          />
        </div>
      </div>
    </div>
  )
}
