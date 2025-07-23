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
  Calendar,
  Users,
  BarChart3,
  Search,
  Filter
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Metadata } from 'next'

export default function SEOCityPropertyPage() {
  const params = useParams();
  const citySlug = typeof params.city === 'string' ? params.city : Array.isArray(params.city) ? params.city[0] : '';
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [cityData, setCityData] = useState<any>(null)

  // Fetch real city data from API
  useEffect(() => {
    const loadCityData = async () => {
      try {
        const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1)
        
        const [propertiesRes, cityStatsRes] = await Promise.all([
          fetch(`/api/properties/search?city=${cityName}&limit=12&status=AVAILABLE`),
          fetch(`/api/properties/city-stats?cities=${cityName}`)
        ])
        
        if (propertiesRes.ok) {
          const data = await propertiesRes.json()
          setProperties(data.properties || [])
        }
        
        if (cityStatsRes.ok) {
          const stats = await cityStatsRes.json()
          const cityStats = stats.find((s: any) => s.city.toLowerCase() === cityName.toLowerCase())
          
          if (cityStats) {
            setCityData({
              name: cityName,
              activeListings: cityStats.count,
              averagePrice: cityStats.avgPrice,
              description: `${cityName} biedt een diverse woningmarkt met uitstekende mogelijkheden voor kopers en verkopers.`,
              // Add default price ranges and property types
              priceRanges: [
                { name: 'Onder €400k', slug: 'onder-400k-euro', min: 0, max: 400000 },
                { name: '€400k - €600k', slug: 'tussen-400k-600k-euro', min: 400000, max: 600000 },
                { name: '€600k - €800k', slug: 'tussen-600k-800k-euro', min: 600000, max: 800000 },
                { name: 'Boven €800k', slug: 'vanaf-800k-euro', min: 800000, max: null }
              ],
              propertyTypes: [
                { name: 'Eengezinswoningen', slug: 'huizen', type: 'HOUSE' },
                { name: 'Appartementen', slug: 'appartementen', type: 'APARTMENT' },
                { name: 'Rijtjeshuizen', slug: 'rijtjeshuizen', type: 'TOWNHOUSE' }
              ]
            })
          }
        }
      } catch (error) {
        console.error('Failed to load properties:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCityData()
  }, [citySlug])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laden van stadsgegevens...</p>
        </div>
      </div>
    )
  }

  if (!cityData) {
    notFound()
  }

  const breadcrumbs = SEOUrlGenerator.generateBreadcrumbs(`/huizen-te-koop/${citySlug}`)

  return (
    <>
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
                Huizen te koop in {cityData.name}
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
                {cityData.description}
              </p>
              
              <div className="flex flex-wrap justify-center gap-8 text-lg">
                <div className="flex items-center space-x-2">
                  <Home className="w-6 h-6 text-blue-600" />
                  <span><strong>{cityData.activeListings}</strong> woningen beschikbaar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Euro className="w-6 h-6 text-green-600" />
                  <span>Gemiddeld <strong>{formatPrice(cityData.averagePrice || 0)}</strong></span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Navigation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Zoek op type en prijsklasse
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* Property Types */}
              {cityData.propertyTypes.map((type: any, index: number) => (
                <Link 
                  key={index}
                  href={`/${type.slug}-te-koop/${citySlug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{type.name} in {cityData.name}</div>
                  <div className="text-sm text-gray-600">Bekijk alle {type.name.toLowerCase()}</div>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Ranges */}
              {cityData.priceRanges.map((range: any, index: number) => (
                <Link 
                  key={index}
                  href={`/huizen-te-koop/${citySlug}/${range.slug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{range.name}</div>
                  <div className="text-sm text-gray-600">Woningen in {cityData.name}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Market Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
               <div className="text-3xl font-bold text-gray-900 mb-2">{cityData.activeListings}</div>
                <div className="text-gray-600">Actieve advertenties</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
               <div className="text-3xl font-bold text-green-600 mb-2">{formatPrice(cityData.averagePrice || 0)}</div>
                <div className="text-gray-600">Gemiddelde prijs</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
               <div className="text-3xl font-bold text-blue-600 mb-2">-</div>
                <div className="text-gray-600">Dagen op markt</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
               <div className="text-3xl font-bold text-purple-600 mb-2">-</div>
                <div className="text-gray-600">Prijsstijging (1 jaar)</div>
              </CardContent>
            </Card>
          </div>

          {/* Property Listings */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Beschikbare woningen in {cityData.name}
              </h2>
              <Link href={`/search?location=${cityData.name}`}>
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
          </div>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Wil je je huis verkopen in {cityData.name}?
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Krijg een gratis taxatie en plaats je advertentie zonder makelaarskosten
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/huis-verkopen/${citySlug}`}>
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    Verkoop in {cityData.name}
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