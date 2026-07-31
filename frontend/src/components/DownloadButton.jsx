/**
 * CodeCraft AI - Download Button Component
 * 
 * Generic download button for exporting files as text/markdown.
 */

import { Download } from 'lucide-react'

export default function DownloadButton({ content, filename = 'export.md', mimeType = 'text/markdown' }) {
  const handleDownload = () => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      title="Download report"
    >
      <Download className="h-4 w-4" />
      <span>Download</span>
    </button>
  )
}
