/**
 * CodeCraft AI - Code Editor Component
 * 
 * A syntax-highlighted code editor for entering code to review.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import React from 'react'
import Editor from 'react-simple-code-editor'
import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/themes/prism.css'

const CodeEditor = ({ code, onChange, language }) => {
  // Map language to Prism language
  const getLanguage = (lang) => {
    const map = {
      javascript: languages.javascript,
      python: languages.python,
      java: languages.java,
      cpp: languages.cpp,
      typescript: languages.typescript,
      go: languages.go,
      rust: languages.rust,
    }
    return map[lang] || languages.javascript
  }

  return (
    <div className="border rounded-md overflow-hidden bg-gray-50">
      <Editor
        value={code}
        onValueChange={onChange}
        highlight={(code) => highlight(code, getLanguage(language), language)}
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
