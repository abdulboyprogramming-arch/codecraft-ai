import AppNav from '../components/AppNav'
import { HelpCircle, ChevronRight } from 'lucide-react'

const faqs = [
  {
    question: 'How does CodeCraft AI work?',
    answer: 'CodeCraft AI uses advanced AI models to analyze your code and provide detailed feedback on logic, efficiency, style, and security. Simply paste your code into the editor and click "Review Code" to get started.',
  },
  {
    question: 'What programming languages are supported?',
    answer: 'CodeCraft AI supports many popular languages including JavaScript, Python, Java, C++, TypeScript, Go, Rust, and more. The AI can also auto-detect the language from your code.',
  },
  {
    question: 'Is my code secure?',
    answer: 'Yes, your code is processed securely. We do not store your code longer than necessary for the review session, and all data is encrypted in transit.',
  },
  {
    question: 'Can I improve my code with AI?',
    answer: 'Yes! Use the "Improve" mode to get AI-powered refactoring suggestions. You can focus on specific areas like readability, performance, or security.',
  },
  {
    question: 'How do I export my reviews?',
    answer: 'Click the download icon on any review in your history to export it as a Markdown file. You can also export AI improvements from the workspace.',
  },
  {
    question: 'What is the code improvement feature?',
    answer: 'The code improvement feature uses AI to refactor and enhance your code while preserving behavior. It provides an explanation of changes and a summary of improvements.',
  },
]

export default function Help() {
  return (
    <div className="min-h-screen">
      <AppNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-8">
          <HelpCircle className="h-8 w-8 text-primary-500" />
          <h1 className="text-2xl font-bold">Help & FAQ</h1>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Need more help?</h3>
          <p className="text-blue-700 mb-4">
            If you have questions or need assistance, please reach out to our support team.
          </p>
          <a
            href="mailto:support@codecraft.ai"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            Contact Support <ChevronRight className="h-4 w-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  )
}
