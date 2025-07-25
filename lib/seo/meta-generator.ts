import { Metadata } from 'next'

interface SEOData {
  title: string
  description: string
  keywords?: string[]
  image?: string
  canonical?: string
  noIndex?: boolean
  type?: 'website' | 'article'
}

export function generateMetadata(data: SEOData): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openhaus.nl'
  
  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    robots: {
      index: !data.noIndex,
      follow: !data.noIndex,
      googleBot: {
        index: !data.noIndex,
        follow: !data.noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: data.type || 'website',
      title: data.title,
      description: data.description,
      images: data.image ? [data.image] : [`${baseUrl}/og-image.jpg`],
      url: data.canonical || baseUrl,
      siteName: 'OpenHaus',
      locale: 'nl_NL',
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description,
      images: data.image ? [data.image] : [`${baseUrl}/og-image.jpg`],
      creator: '@openhaus',
    },
    alternates: {
      canonical: data.canonical,
    },
  }
}

// Property-specific metadata generator
export function generatePropertyMetadata(property: any): Metadata {
  const title = `${property.address} - ${formatPrice(property.askingPrice)} | ${property.bedrooms} Kamers ${property.city}`
  const description = `${property.description.substring(0, 150)}... ${property.bedrooms} kamers, ${property.squareMeters}m², energielabel ${property.energyLabel}. Bekijk foto's en doe direct een bod zonder makelaar.`
  
  return generateMetadata({
    title,
    description,
    keywords: [
      `${property.address}`,
      `huis kopen ${property.city}`,
      `woning te koop ${property.city}`,
      `${property.bedrooms} kamers ${property.city}`,
      `${property.propertyType} ${property.city}`,
      'particuliere verkoop',
      'zonder makelaar'
    ],
    image: property.images?.[0],
    type: 'website'
  })
}

// City page metadata generator
export function generateCityMetadata(city: string, type: 'buy' | 'sell' = 'buy'): Metadata {
  const cityName = city.charAt(0).toUpperCase() + city.slice(1)
  
  if (type === 'sell') {
    return generateMetadata({
      title: `Huis Verkopen ${cityName} Zonder Makelaar | Bespaar Makelaarskosten`,
      description: `Verkoop je huis in ${cityName} zonder makelaar en bespaar duizenden euro's. Gratis taxatie, lokale marktkennis en persoonlijke begeleiding.`,
      keywords: [
        `huis verkopen ${city}`,
        `woning verkopen ${city}`,
        `${city} huis verkopen zonder makelaar`,
        `makelaarskosten besparen ${city}`,
        `particuliere verkoop ${city}`,
        `woningtaxatie ${city}`
      ]
    })
  }
  
  return generateMetadata({
    title: `Huizen te Koop ${cityName} | Particuliere Verkoop Zonder Makelaar`,
    description: `Ontdek ${cityName} woningen te koop van particulieren. Geen makelaarskosten, direct contact met eigenaren. Bekijk het actuele aanbod.`,
    keywords: [
      `huizen te koop ${city}`,
      `woningen ${city}`,
      `huis kopen ${city}`,
      `${city} particuliere verkoop`,
      `woning kopen ${city} zonder makelaar`,
      `vastgoed ${city}`
    ]
  })
}

// Guide page metadata generator
export function generateGuideMetadata(guide: string): Metadata {
  const guides: Record<string, SEOData> = {
    'huis-verkopen-zonder-makelaar': {
      title: 'Huis Verkopen Zonder Makelaar: Complete Gids 2025',
      description: 'Leer hoe je je huis verkoopt zonder makelaar en duizenden euro\'s bespaart. Complete stap-voor-stap gids met tips, valkuilen en juridische aspecten.',
      keywords: [
        'huis verkopen zonder makelaar',
        'woning verkopen particulier',
        'makelaarskosten besparen',
        'huis verkopen zelf',
        'particuliere verkoop gids',
        'verkoop zonder commissie'
      ]
    },
    'huis-kopen-particulier': {
      title: 'Huis Kopen van Particulier: Voordelen & Proces 2025',
      description: 'Ontdek hoe je een huis koopt van particulieren zonder makelaar. Bespaar kosten en krijg direct contact met eigenaren.',
      keywords: [
        'huis kopen particulier',
        'woning kopen zonder makelaar',
        'particuliere verkoop kopen',
        'huis kopen direct eigenaar',
        'makelaarskosten vermijden'
      ]
    },
    'hypotheek-aanvragen': {
      title: 'Hypotheek Aanvragen 2025: Complete Gids & Calculator',
      description: 'Alles over hypotheek aanvragen in 2025. Bereken je maximale hypotheek, vergelijk rentes en krijg expert advies.',
      keywords: [
        'hypotheek aanvragen',
        'hypotheek berekenen',
        'maximale hypotheek',
        'hypotheek rente',
        'hypotheekadvies',
        'hypotheek calculator'
      ]
    }
  }
  
  return generateMetadata(guides[guide] || guides['huis-verkopen-zonder-makelaar'])
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}