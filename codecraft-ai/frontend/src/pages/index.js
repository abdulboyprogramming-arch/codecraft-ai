/**
 * CodeCraft AI - Landing Page
 * 
 * This is the main landing page that showcases the product.
 * It includes a hero section, features, and call-to-action buttons.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import Link from 'next/link'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const currentYear = new Date().getFullYear()

  return (
    <Layout title="CodeCraft AI - Smart Code Review">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">CodeCraft AI</span>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="btn-primary"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-primary"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900">
              CodeCraft AI
              <span className="block text-primary-600 mt-2">Smart Code Reviews</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
              Get instant, detailed feedback on your code from an AI senior developer.
              Learn better, code faster, and write cleaner code.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="btn-primary px-8 py-3 text-lg"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="btn-secondary px-8 py-3 text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900">Logic Analysis</h3>
              <p className="mt-2 text-sm text-gray-500">
                Catch bugs and edge cases before they become problems
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
              <p className="mt-2 text-sm text-gray-500">
                Optimize your code for better efficiency
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900">Code Style</h3>
              <p className="mt-2 text-sm text-gray-500">
                Write clean, readable, maintainable code
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition-shadow duration-200">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              <p className="mt-2 text-sm text-gray-500">
                Identify and fix security vulnerabilities
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-500">
                © <span data-copyright-year>{currentYear}</span> CodeCraft AI. All Rights Reserved.
              </p>
              <p className="text-sm text-gray-500">
                Built with ❤️ for the Prometheus July AI Challenge
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  )
}
