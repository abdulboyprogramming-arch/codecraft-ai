/**
 * CodeCraft AI - Hello API Route
 * 
 * This is a simple API route for testing Next.js API functionality.
 * 
 * Developer: Abdulrahman Adeeyo
 * Hackathon: Prometheus July AI Challenge
 */

export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello from CodeCraft AI API!',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  })
}
