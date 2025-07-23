"use client"

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertyGrid } from '@/components/marketplace/property-grid'
import { StructuredData } from '@/components/seo/structured-data'
import { SEOUrlGenerator } from '@/lib/seo/url-generator'
import { 
  MapPin, 
  TrendingUp, 
  Home, 
  Euro, 
  Filter,
  Search
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface PriceRangePageProps {
  params: {
    city: string
    priceRange: string
  }
}

export default function PriceRangePropertyPage({ params }: PriceRangePageProps) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  // Parse price range from URL
  const parsePriceRange = (priceRangeSlug: string): { min?: number; max?: number; title: string } => {
    if (priceRangeSlug.startsWith('onder-')) {
      const maxPrice = parseInt(priceRangeSlug.replace('onder-', '').replace('k-euro', '')) * 1000
      return { max: maxPrice, title: `Onder €${maxPrice.toLocaleString()}` }
    }
    
    if (priceRangeSlug.startsWith('vanaf-')) {
      const minPrice = parseInt(priceRangeSlug.replace('vanaf-', '').replace('k-euro', '')) * 1000
      return { min: minPrice, title: `Vanaf €${minPrice.toLocaleString()}` }
    }
    
    if (priceRangeSlug.startsWith('tussen-')) {
      const parts = priceRangeSlug.replace('tussen-', '').replace('-euro', '').split('-')
      if (parts.length === 2) {
        const minPrice = parseInt(parts[0].replace('k', '')) * 1000
        const maxPrice = parseInt(parts[1].replace('k', '')) * 1000
        return { 
          min: minPrice, 
          max: maxPrice, 
          title: `€${minPrice.toLocaleString()} - €${maxPrice.toLocaleString()}` 
        }
      }
    }
    
    return { title: 'Alle prijzen' }
  }

  const cityName = params.city.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  const priceRange = parsePriceRange(params.priceRange)

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const searchParams = new URLSearchParams({
          city: cityName,
          limit: '20'
        })
        
        if (priceRange.min) searchParams.append('minPrice', priceRange.min.toString())
        if (priceRange.max) searchParams.append('maxPrice', priceRange.max.toString())

        const response = await fetch(`/api/properties/search?${searchParams}`)
        if (response.ok) {
          const data = await response.json()
          setProperties(data.properties || [])
        }
      } catch (error) {
        console.error('Failed to load properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [cityName, priceRange.min, priceRange.max])

  const handleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const breadcrumbs = SEOUrlGenerator.generateBreadcrumbs(`/huizen-te-koop/${params.city}/${params.priceRange}`)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Huizen te koop in ${cityName} ${priceRange.title}`,
    "description": `Ontdek huizen te koop in ${cityName} in de prijsklasse ${priceRange.title}. Bekijk het actuele aanbod van particuliere verkopers zonder makelaarskosten.`,
    "url": `https://openhaus.nl/huizen-te-koop/${params.city}/${params.priceRange}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": properties.length
    }
  }

  return (
    <>
      <StructuredData type="CollectionPage" data={structuredData} />
      <StructuredData type="BreadcrumbList" data={{ items: breadcrumbs }} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs */}
            <nav className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-gray-900 font-medium">{crumb.name}</span>
                    ) : (
                      <Link href={crumb.url} className="hover:text-primary">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Huizen te koop in {cityName}
              </h1>
              <div className="text-2xl text-primary font-semibold mb-4">
                Prijsklasse: {priceRange.title}
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Ontdek woningen in {cityName} binnen jouw budget. 
                Alle advertenties van particuliere verkopers zonder makelaarskosten.
              </p>
              
              <div className="flex flex-wrap justify-center gap-8 text-lg">
                <div className="flex items-center space-x-2">
                  <Home className="w-6 h-6 text-blue-600" />
                  <span><strong>{properties.length}</strong> woningen gevonden</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Euro className="w-6 h-6 text-green-600" />
                  <span>Prijsklasse <strong>{priceRange.title}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-purple-600" />
                  <span>Locatie <strong>{cityName}</strong></span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filter Summary */}
          <div className="mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Actieve filters:</span>
                  </div>
                  
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {cityName}
                  </Badge>
                  
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Euro className="w-3 h-3" />
                    {priceRange.title}
                  </Badge>
                  
                  <Link href={`/huizen-te-koop/${params.city}`}>
                    <Button variant="outline" size="sm">
                      Alle prijzen tonen
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Listings */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {properties.length} woningen gevonden
              </h2>
              <Link href={`/search?location=${cityName}&minPrice=${priceRange.min || ''}&maxPrice=${priceRange.max || ''}`}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Verfijn zoeken</span>
                </Button>
              </Link>
            </div>

            <PropertyGrid
              properties={properties}
              loading={loading}
              onFavorite={handleFavorite}
              favorites={favorites}
            />

            {properties.length === 0 && !loading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Geen woningen gevonden
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Er zijn momenteel geen woningen beschikbaar in {cityName} 
                    binnen de prijsklasse {priceRange.title}.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href={`/huizen-te-koop/${params.city}`}>
                      <Button>Alle prijzen bekijken</Button>
                    </Link>
                    <Link href="/buy">
                      <Button variant="outline">Andere steden</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Related Searches */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Gerelateerde zoekopdrachten
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link 
                href={`/appartementen-te-koop/${params.city}/${params.priceRange}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">
                  Appartementen {priceRange.title}
                </div>
                <div className="text-sm text-gray-600">In {cityName}</div>
              </Link>
              
              <Link 
                href={`/rijtjeshuizen-te-koop/${params.city}/${params.priceRange}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">
                  Rijtjeshuizen {priceRange.title}
                </div>
                <div className="text-sm text-gray-600">In {cityName}</div>
              </Link>
              
              <Link 
                href={`/huis-verkopen/${params.city}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">
                  Huis verkopen in {cityName}
                </div>
                <div className="text-sm text-gray-600">Zonder makelaarskosten</div>
              </Link>
            </div>
          </section>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Wil je je huis verkopen in {cityName}?
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Krijg een gratis taxatie en plaats je advertentie zonder makelaarskosten
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/huis-verkopen/${params.city}`}>
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    Verkoop in {cityName}
                  </Button>
                </Link>
                <Link href="/instant-offer">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                  >
                    Gratis taxatie
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}