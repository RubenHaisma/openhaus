"use client"

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
  canonical?: string
}

export function SEOHead({ 
  title, 
  description, 
  keywords = [], 
  image,
  noIndex = false,
  canonical 
}: SEOHeadProps) {
  const pathname = usePathname()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openhaus.nl'
  const fullUrl = `${baseUrl}${pathname}`
  
  const defaultTitle = 'OpenHaus – Huis Verkopen & Kopen Zonder Makelaar'
  const defaultDescription = 'Verkoop je huis direct aan kopers zonder makelaarskosten. Gratis woningtaxatie, veilige transacties en persoonlijke begeleiding.'
  const defaultImage = `${baseUrl}/og-image.jpg`

  const seoTitle = title ? `${title} | OpenHaus` : defaultTitle
  const seoDescription = description || defaultDescription
  const seoImage = image || defaultImage
  const seoCanonical = canonical || fullUrl

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="author" content="OpenHaus" />
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={seoCanonical} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="OpenHaus" />
      <meta property="og:locale" content="nl_NL" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
      <meta name="twitter:creator" content="@openhaus" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#dc2626" />
      <meta name="msapplication-TileColor" content="#dc2626" />
      
      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="NL" />
      <meta name="geo.placename" content="Netherlands" />
      <meta name="geo.position" content="52.3676;4.9041" />
      <meta name="ICBM" content="52.3676, 4.9041" />

      {/* Hreflang for International SEO */}
      <link rel="alternate" hrefLang="nl" href={`${baseUrl}${pathname}`} />
      <link rel="alternate" hrefLang="en" href={`${baseUrl}/en${pathname}`} />
      <link rel="alternate" hrefLang="de" href={`${baseUrl}/de${pathname}`} />
      <link rel="alternate" hrefLang="fr" href={`${baseUrl}/fr${pathname}`} />
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${pathname}`} />
    </Head>
  )
}