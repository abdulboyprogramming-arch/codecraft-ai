/**
 * CodeCraft AI - Layout Component
 * 
 * This component provides the basic layout structure for pages.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import Head from 'next/head'

export default function Layout({ children, title = 'CodeCraft AI' }) {
  const currentYear = new Date().getFullYear()

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="AI-powered code review assistant" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">
        {children}
      </main>
    </>
  )
}
