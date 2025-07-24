import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/error-boundary'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0ea5e9' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://openhaus.nl'),
  title: {
    default: 'OpenHaus – Huizen te koop en verkopen zonder makelaar | Nederland',
    template: '%s | OpenHaus',
  },
  description: 'Huizen te koop van particulieren in Amsterdam, Rotterdam, Utrecht en Den Haag. Verkoop je huis zonder makelaarskosten. Gratis woningtaxatie.',
  keywords: [
    'huis verkopen',
    'huis kopen',
    'huizen te koop',
    'appartementen te koop',
    'woningtaxatie',
    'Nederland',
    'zonder makelaar',
    'particuliere verkoop',
    'hypotheek',
    'notaris',
    'vastgoed',
    'amsterdam',
    'rotterdam',
    'utrecht',
    'den haag'
  ],
  authors: [{ name: 'OpenHaus', url: 'https://openhaus.nl' }],
  creator: 'OpenHaus',
  publisher: 'OpenHaus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://openhaus.nl',
    siteName: 'OpenHaus',
    title: 'OpenHaus – Huizen te koop en verkopen zonder makelaar | Nederland',
    description: 'Huizen te koop van particulieren in Amsterdam, Rotterdam, Utrecht en Den Haag. Verkoop je huis zonder makelaarskosten. Gratis woningtaxatie.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OpenHaus - Huizen te koop en verkopen zonder makelaar',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenHaus – Huizen te koop en verkopen zonder makelaar | Nederland',
    description: 'Huizen te koop van particulieren in Amsterdam, Rotterdam, Utrecht en Den Haag. Verkoop je huis zonder makelaarskosten.',
    images: ['/og-image.jpg'],
    creator: '@openhaus',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
  },
  alternates: {
    canonical: 'https://openhaus.nl',
    languages: {
      'nl-NL': 'https://openhaus.nl',
    },
  },
  category: 'Real Estate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <html lang="nl" className={inter.variable} suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">
          <ErrorBoundary>
            <Providers>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster />
            </Providers>
          </ErrorBoundary>
        </body>
      </html>
    </AuthProvider>
  )
}