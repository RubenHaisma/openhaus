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
  Building,
  Search
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ApartmentCityPage() {
  const params = useParams();
  const cityParam = typeof params.city === 'string' ? params.city : Array.isArray(params.city) ? params.city[0] : '';

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  const cityName = cityParam.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetch(`/api/properties/search?city=${cityName}&propertyType=APARTMENT&limit=20`)
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
  }, [cityName])

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

  const breadcrumbs = SEOUrlGenerator.generateBreadcrumbs(`/appartementen-te-koop/${cityParam}`)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Appartementen te koop in ${cityName}`,
    "description": `Ontdek appartementen te koop in ${cityName}. Bekijk het actuele aanbod van particuliere verkopers zonder makelaarskosten. Van studio's tot penthouses.`,
    "url": `https://openhaus.nl/appartementen-te-koop/${cityParam}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": properties.length
    }
  }

  return (
    <>
      {/* Remove unsupported CollectionPage structured data */}
      <StructuredData type="BreadcrumbList" data={{ items: breadcrumbs }} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16">
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
              <div className="flex items-center justify-center mb-4">
                <Building className="w-12 h-12 text-purple-600 mr-3" />
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  Appartementen te koop in {cityName}
                </h1>
              </div>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Ontdek appartementen in {cityName} van particuliere verkopers. 
                Van compacte studio's tot ruime penthouses, allemaal zonder makelaarskosten.
              </p>
              
              <div className="flex flex-wrap justify-center gap-8 text-lg">
                <div className="flex items-center space-x-2">
                  <Building className="w-6 h-6 text-purple-600" />
                  <span><strong>{properties.length}</strong> appartementen beschikbaar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Euro className="w-6 h-6 text-green-600" />
                  <span>Geen <strong>makelaarskosten</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <span>Direct contact met <strong>eigenaren</strong></span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Filters */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Zoek op prijsklasse
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link 
                href={`/appartementen-te-koop/${cityParam}/onder-300k-euro`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Onder €300k</div>
                <div className="text-sm text-gray-600">Startersappartementen</div>
              </Link>
              
              <Link 
                href={`/appartementen-te-koop/${cityParam}/tussen-300k-500k-euro`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">€300k - €500k</div>
                <div className="text-sm text-gray-600">Middensegment</div>
              </Link>
              
              <Link 
                href={`/appartementen-te-koop/${cityParam}/tussen-500k-750k-euro`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">€500k - €750k</div>
                <div className="text-sm text-gray-600">Luxe appartementen</div>
              </Link>
              
              <Link 
                href={`/appartementen-te-koop/${cityParam}/vanaf-750k-euro`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-gray-900">Vanaf €750k</div>
                <div className="text-sm text-gray-600">Premium segment</div>
              </Link>
            </div>
          </section>

          {/* Property Listings */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {properties.length} appartementen in {cityName}
              </h2>
              <Link href={`/search?location=${cityName}&propertyType=APARTMENT`}>
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
                  <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Geen appartementen gevonden
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Er zijn momenteel geen appartementen beschikbaar in {cityName}.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href={`/huizen-te-koop/${cityParam}`}>
                      <Button>Alle woningtypes</Button>
                    </Link>
                    <Link href="/buy">
                      <Button variant="outline">Andere steden</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Apartment-specific Information */}
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-6 h-6 text-purple-600" />
                  <span>Waarom een appartement in {cityName}?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Voordelen van appartement wonen</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-gray-700">Minder onderhoud dan eengezinswoning</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-gray-700">Vaak centraler gelegen</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-gray-700">Betere beveiliging</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-gray-700">Gedeelde voorzieningen mogelijk</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Let op bij aankoop</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">VvE-bijdrage en reservefonds</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">Huisreglement en statuten</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">Erfpacht of eigendom</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-gray-700">Parkeerplaats en berging</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Appartement verkopen in {cityName}?
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Krijg een gratis taxatie van je appartement en plaats je advertentie zonder makelaarskosten
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/huis-verkopen/${cityParam}`}>
                  <Button 
                    size="lg" 
                    className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    Verkoop je appartement
                  </Button>
                </Link>
                <Link href="/instant-offer">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg font-bold"
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