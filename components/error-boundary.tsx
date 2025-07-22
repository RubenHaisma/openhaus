"use client"

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50">
            <AlertTriangle className="h-6 w-6 text-error-500" />
          </div>
          <CardTitle className="text-xl font-semibold text-neutral-900">
            Er is iets misgegaan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-neutral-600">
            We hebben een onverwachte fout ondervonden. Probeer het opnieuw of ga terug naar de homepage.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-3 bg-neutral-100 rounded-lg">
              <summary className="cursor-pointer text-sm font-medium text-neutral-700">
                Foutdetails (alleen zichtbaar in ontwikkeling)
              </summary>
              <pre className="mt-2 text-xs text-neutral-600 whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={resetErrorBoundary}
              className="flex-1 bg-primary-500 hover:bg-primary-600"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Probeer opnieuw
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Naar homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log error to monitoring service
        console.error('Error caught by boundary:', error, errorInfo)
        
        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
          // Example: Sentry.captureException(error)
        }
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}