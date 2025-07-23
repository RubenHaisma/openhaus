import { NextRequestWithAuth, withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle old property URLs and redirect to SEO-friendly URLs
  if (pathname.startsWith('/properties/')) {
    const propertyId = pathname.split('/')[2]
    // In production, you'd query your database to get the property details
    // and redirect to the proper SEO URL
    return NextResponse.redirect(new URL(`/huis-te-koop/amsterdam/property-${propertyId}`, request.url))
  }

  // Handle old city URLs
  if (pathname.startsWith('/woningen/') && !pathname.includes('-te-koop')) {
    const city = pathname.split('/')[2]
    return NextResponse.redirect(new URL(`/huizen-te-koop/${city}`, request.url))
  }

  // Auth middleware for protected routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/list-property')) {
    return withAuth(request as NextRequestWithAuth, {
      callbacks: {
        authorized: ({ token, req }) => {
          return !!token
        },
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/properties/:path*',
    '/woningen/:path*',
    '/dashboard/:path*',
    '/list-property/:path*',
    '/profile/:path*',
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)'
  ]
}

// Legacy auth middleware for specific routes
const authMiddleware = withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect these routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        if (req.nextUrl.pathname.startsWith('/list-property')) {
          return !!token
        }
        return true
      },
    },
  }
)