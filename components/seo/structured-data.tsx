"use client"

import { usePathname } from 'next/navigation'

interface StructuredDataProps {
  type: 'RealEstateListing' | 'LocalBusiness' | 'WebSite' | 'BreadcrumbList' | 'FAQPage'
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const pathname = usePathname()

  const generateSchema = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://openhaus.nl'
    
    switch (type) {
      case 'RealEstateListing':
        return {
          "@context": "https://schema.org",
          "@type": "RealEstateListing",
          "name": data.address,
          "description": data.description,
          "url": `${baseUrl}/properties/${data.id}`,
          "image": data.images,
          "price": {
            "@type": "PriceSpecification",
            "price": data.askingPrice,
            "priceCurrency": "EUR"
          },
          "address": {
            "@type": "PostalAddress",
            "streetAddress": data.address,
            "addressLocality": data.city,
            "postalCode": data.postalCode,
            "addressCountry": "NL"
          },
          "geo": data.coordinates ? {
            "@type": "GeoCoordinates",
            "latitude": data.coordinates.lat,
            "longitude": data.coordinates.lng
          } : undefined,
          "floorSize": {
            "@type": "QuantitativeValue",
            "value": data.squareMeters,
            "unitCode": "MTK"
          },
          "numberOfRooms": data.bedrooms,
          "numberOfBathroomsTotal": data.bathrooms,
          "yearBuilt": data.constructionYear,
          "energyEfficiencyRating": data.energyLabel,
          "availableFrom": data.availableFrom,
          "listingAgent": {
            "@type": "RealEstateAgent",
            "name": "OpenHaus",
            "url": baseUrl,
            "telephone": "+31-20-123-4567",
            "email": "info@openhaus.nl"
          }
        }

      case 'LocalBusiness':
        return {
          "@context": "https://schema.org",
          "@type": "RealEstateAgent",
          "name": "OpenHaus",
          "description": "P2P vastgoedmarktplaats - Koop en verkoop huizen direct van particulier zonder makelaarskosten",
          "url": baseUrl,
          "logo": `${baseUrl}/logo.png`,
          "image": `${baseUrl}/og-image.jpg`,
          "telephone": "+31-20-123-4567",
          "email": "info@openhaus.nl",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Herengracht 1",
            "addressLocality": "Amsterdam",
            "postalCode": "1000 AA",
            "addressCountry": "NL"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 52.3676,
            "longitude": 4.9041
          },
          "openingHours": "Mo-Fr 09:00-18:00",
          "priceRange": "€€",
          "areaServed": {
            "@type": "Country",
            "name": "Netherlands"
          },
          "serviceType": "Real Estate Services",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "2847",
            "bestRating": "5",
            "worstRating": "1"
          },
          "sameAs": [
            "https://www.facebook.com/openhaus",
            "https://www.linkedin.com/company/openhaus",
            "https://twitter.com/openhaus"
          ]
        }

      case 'WebSite':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "OpenHaus",
          "description": "P2P vastgoedmarktplaats - Direct huis verkopen en kopen zonder makelaar",
          "url": baseUrl,
          "potentialAction": [
            {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/search?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          ],
          "publisher": {
            "@type": "Organization",
            "name": "OpenHaus",
            "logo": {
              "@type": "ImageObject",
              "url": `${baseUrl}/logo.png`
            }
          }
        }

      case 'BreadcrumbList':
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items.map((item: any, index: number) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `${baseUrl}${item.url}`
          }))
        }

      case 'FAQPage':
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.faqs.map((faq: any) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        }

      default:
        return null
    }
  }

  const schema = generateSchema()
  
  if (!schema) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}