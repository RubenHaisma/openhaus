/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Puppeteer in production builds
  env: {
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD: process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD || 'true',
  },

  // Next.js 15 optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Remove Puppeteer from production bundle
    ...(process.env.NODE_ENV === 'production' && {
      removeConsole: {
        exclude: ['error', 'warn'],
      },
    }),
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['images.pexels.com', 'via.placeholder.com', 'pub-275edbc3a5f04d919fc235d2b654481b.r2.dev'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Bundle analyzer
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')()
        config.plugins.push(new BundleAnalyzerPlugin())
      }
      return config
    },
  }),

  eslint: {
    ignoreDuringBuilds: false,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

  // Webpack configuration for production
  webpack: (config, { isServer, dev }) => {
    // Exclude Puppeteer from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      }
    }

    // Exclude Puppeteer in production
    if (!dev && process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD === 'true') {
      config.externals = config.externals || []
      config.externals.push('puppeteer')
    }

    return config
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // Redirect old property URLs to new SEO-friendly URLs
      {
        source: '/properties/:id',
        destination: '/huis-te-koop/amsterdam/:id', // Default to Amsterdam, will be handled by middleware
        permanent: true,
      },
      // Redirect old city URLs
      {
        source: '/woningen/:city',
        destination: '/huizen-te-koop/:city',
        permanent: true,
      },
    ]
  },

  // Rewrites for SEO-friendly URLs
  async rewrites() {
    return [
      // Property detail pages
      {
        source: '/huis-te-koop/:city/:property',
        destination: '/huis-te-koop/:city/:property',
      },
      // City property listings
      {
        source: '/huizen-te-koop/:city',
        destination: '/huizen-te-koop/:city',
      },
      // Price range pages
      {
        source: '/huizen-te-koop/:city/:priceRange',
        destination: '/huizen-te-koop/:city/:priceRange',
      },
      // Apartment listings
      {
        source: '/appartementen-te-koop/:city',
        destination: '/appartementen-te-koop/:city',
      },
      // Valuation pages
      {
        source: '/woningtaxatie/:city/:address',
        destination: '/woningtaxatie/:city/:address',
      },
    ]
  },
}

module.exports = nextConfig