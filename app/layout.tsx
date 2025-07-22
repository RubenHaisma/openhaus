import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OpenHaus – Direct je huis verkopen of kopen in Nederland',
  description: 'Ontvang een bod op je woning binnen enkele minuten. Regel je verkoop of aankoop volledig digitaal – van taxatie tot notaris.',
  keywords: 'huis verkopen, huis kopen, woningtaxatie, Nederland, direct bod, hypotheek, notaris',
  authors: [{ name: 'OpenHaus' }],
  openGraph: {
    title: 'OpenHaus – Direct je huis verkopen of kopen in Nederland',
    description: 'Ontvang een bod op je woning binnen enkele minuten. Regel je verkoop of aankoop volledig digitaal – van taxatie tot notaris.',
    url: 'https://openhaus.nl',
    siteName: 'OpenHaus',
    locale: 'nl_NL',
    type: 'website',
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
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="nl">
        <body className={inter.className}>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}