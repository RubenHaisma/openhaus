import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/auth-provider'
import { Providers } from '@/components/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Toaster } from '@/components/ui/sonner'
import { ErrorBoundary } from '@/components/error-boundary'
import Script from 'next/script'

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
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#16a34a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://energieplatform.nl'),
  title: {
    default: 'EnergiePlatform – Energietransitie voor Nederlandse woningen | Subsidies & Installateurs',
    template: '%s | EnergiePlatform',
  },
  description: 'Maak je woning energieneutraal voor 2030. Gratis energieadvies, subsidie tot €25.000 en gecertificeerde installateurs. Officiële RVO partner.',
  keywords: [
    'energietransitie',
    'energieadvies',
    'subsidie warmtepomp',
    'energielabel verbeteren',
    'isolatie subsidie',
    'zonnepanelen',
    'energieneutraal 2030',
    'RVO subsidie',
    'ISDE subsidie',
    'energiebesparing',
    'duurzame energie',
    'klimaatakkoord',
    'energierekening verlagen',
    'CO2 neutraal'
  ],
  authors: [{ name: 'EnergiePlatform', url: 'https://energieplatform.nl' }],
  creator: 'EnergiePlatform',
  publisher: 'EnergiePlatform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: 'https://energieplatform.nl',
    siteName: 'EnergiePlatform',
    title: 'EnergiePlatform – Energietransitie voor Nederlandse woningen | Subsidies & Installateurs',
    description: 'Maak je woning energieneutraal voor 2030. Gratis energieadvies, subsidie tot €25.000 en gecertificeerde installateurs. Officiële RVO partner.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EnergiePlatform - Energietransitie voor Nederlandse woningen',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EnergiePlatform – Energietransitie voor Nederlandse woningen | Subsidies & Installateurs',
    description: 'Maak je woning energieneutraal voor 2030. Gratis energieadvies, subsidie tot €25.000 en gecertificeerde installateurs.',
    images: ['/og-image.jpg'],
    creator: '@energieplatform',
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
    canonical: 'https://energieplatform.nl',
    languages: {
      'nl-NL': 'https://energieplatform.nl',
    },
  },
  category: 'Energy & Sustainability',
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
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-1NCEXRW2R0"
            strategy="afterInteractive"
            async
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1NCEXRW2R0');
            `}
          </Script>
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