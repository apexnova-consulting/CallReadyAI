import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CallReady AI - AI-Powered Sales Call Briefs',
  description: 'Generate comprehensive, actionable sales call briefs in seconds. Never go into a sales call unprepared again. AI-powered insights for sales professionals.',
  keywords: 'sales call briefs, AI sales tools, sales preparation, call planning, sales automation',
  authors: [{ name: 'CallReady AI' }],
  creator: 'CallReady AI',
  publisher: 'CallReady AI',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://callreadyai.com',
    siteName: 'CallReady AI',
    title: 'CallReady AI - AI-Powered Sales Call Briefs',
    description: 'Generate comprehensive, actionable sales call briefs in seconds. Never go into a sales call unprepared again.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CallReady AI - AI-Powered Sales Call Briefs',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CallReady AI - AI-Powered Sales Call Briefs',
    description: 'Generate comprehensive, actionable sales call briefs in seconds. Never go into a sales call unprepared again.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#667eea" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {children}
      </body>
    </html>
  )
}