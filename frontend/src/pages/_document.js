/**
 * CodeCraft AI - Next.js Document Component
 * 
 * This component customizes the HTML document structure.
 * It adds fonts, meta tags, and other global elements.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  const currentYear = new Date().getFullYear()

  return (
    <Html lang="en">
      <Head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fira+Code:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="CodeCraft AI - AI-Powered Code Review" />
        <meta property="og:description" content="Get instant, detailed feedback on your code from an AI senior developer." />
        <meta property="og:image" content="/logo.png" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CodeCraft AI - AI-Powered Code Review" />
        <meta name="twitter:description" content="Get instant, detailed feedback on your code from an AI senior developer." />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* Copyright notice with dynamic year */}
        <meta name="copyright" content={`CodeCraft AI ${currentYear}`} />
      </Head>
      <body>
        <Main />
        <NextScript />
        
        {/* Dynamic copyright footer script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                const year = new Date().getFullYear();
                const copyrightElements = document.querySelectorAll('[data-copyright-year]');
                copyrightElements.forEach(el => {
                  el.textContent = year;
                });
              });
            `,
          }}
        />
      </body>
    </Html>
  )
}
