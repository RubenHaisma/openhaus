"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertySearch } from '@/components/marketplace/property-search'
import { PropertyCard } from '@/components/property/property-card'
import { 
  MapPin, 
  TrendingUp, 
  Home, 
  Euro, 
  Calendar,
  Users,
  BarChart3,
  Search,
  Filter,
  Grid3X3,
  Map
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

// Remove mockProperties

export default function BuyPage() {
  const [searchResults, setSearchResults] = useState<any>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [loading, setLoading] = useState(false)
  const [properties, setProperties] = useState<any[]>([])

  // Fetch properties from API on mount
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/properties?limit=30')
        const data = await res.json()
        setProperties(data.properties || [])
      } catch (e) {
        setProperties([])
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const handleSearchResults = (results: any) => {
    setSearchResults(results)
    setLoading(false)
  }

  const handleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const clearSearch = () => {
    setSearchResults(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const displayProperties = searchResults?.properties || properties

  const POPULAR_CITIES = [
    { name: 'Amsterdam', slug: 'amsterdam' },
    { name: 'Rotterdam', slug: 'rotterdam' },
    { name: 'Den Haag', slug: 'den-haag' },
    { name: 'Utrecht', slug: 'utrecht' },
    { name: 'Eindhoven', slug: 'eindhoven' },
    { name: 'Groningen', slug: 'groningen' },
  ]

  const [cityStats, setCityStats] = useState<any[]>([])
  const [cityStatsLoading, setCityStatsLoading] = useState(true)

  useEffect(() => {
    const fetchCityStats = async () => {
      setCityStatsLoading(true)
      try {
        const res = await fetch(`/api/properties/city-stats?cities=${POPULAR_CITIES.map(c => c.name).join(',')}`)
        const data = await res.json()
        setCityStats(data)
      } catch (e) {
        setCityStats([])
      } finally {
        setCityStatsLoading(false)
      }
    }
    fetchCityStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Vind je droomhuis
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ontdek woningen van particulieren zonder makelaarskosten. 
              Direct contact met eigenaren voor de beste deals.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-lg mb-8">
              <div className="flex items-center space-x-2">
                <Home className="w-6 h-6 text-blue-600" />
                <span><strong>{properties.length}</strong> woningen beschikbaar</span>
              </div>
              <div className="flex items-center space-x-2">
                <Euro className="w-6 h-6 text-green-600" />
                <span>Geen <strong>makelaarskosten</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-purple-600" />
                <span><strong>Direct contact</strong> met eigenaren</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Component */}
        <div className="mb-8">
          <PropertySearch 
            onResults={handleSearchResults}
          />
        </div>

        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-900">
              {displayProperties.length > 0 
                ? `${displayProperties.length} woningen gevonden`
                : 'Geen woningen gevonden'
              }
            </h2>
            {searchResults?.query && (
              <p className="text-gray-600">
                voor "{searchResults.query}"
                {searchResults.location && ` in ${searchResults.location}`}
              </p>
            )}
          </div>

          {displayProperties.length > 0 && (
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('map')}
                  className="px-3"
                >
                  <Map className="w-4 h-4" />
                </Button>
              </div>

              {/* Sort Options */}
              <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm">
                <option value="relevance">Relevantie</option>
                <option value="price-low">Prijs: laag naar hoog</option>
                <option value="price-high">Prijs: hoog naar laag</option>
                <option value="date">Nieuwste eerst</option>
                <option value="size">Oppervlakte</option>
              </select>
            </div>
          )}
        </div>

        {/* Property Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProperties.map((property: any, index: number) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <PropertyCard 
                  property={property}
                  onFavorite={handleFavorite}
                  isFavorite={favorites.includes(property.id)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Kaartweergave</h3>
              <p className="text-gray-600 mb-6">
                Kaartweergave wordt binnenkort geïmplementeerd met interactieve kaart van Nederland.
              </p>
              <Button
                variant="outline"
                onClick={() => setViewMode('grid')}
              >
                Terug naar lijst
              </Button>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {displayProperties.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Geen woningen gevonden
              </h3>
              <p className="text-gray-600 mb-6">
                Probeer je zoekopdracht aan te passen of bekijk alle beschikbare woningen.
              </p>
              <Button onClick={clearSearch}>
                Bekijk alle woningen
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Popular Cities */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Populaire steden
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityStatsLoading ? (
              <div className="col-span-3 text-center text-gray-500 py-8">Laden...</div>
            ) : cityStats.length > 0 ? (
              POPULAR_CITIES.map((city, index) => {
                const stat = cityStats.find((s: any) => s.city.toLowerCase() === city.name.toLowerCase())
                return (
                  <motion.div
                    key={city.slug}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link href={`/woningen/${city.slug}`}>
                      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <MapPin className="w-5 h-5 text-gray-400" />
                              <div>
                                <h4 className="font-semibold text-gray-900">{city.name}</h4>
                                <p className="text-sm text-gray-600">{stat ? `${stat.count} woningen` : 'Geen data'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-primary">{stat && stat.avgPrice ? formatPrice(stat.avgPrice) : '-'}</p>
                              <p className="text-xs text-gray-500">gemiddeld</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                )
              })
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-8">Geen data beschikbaar</div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16">
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Wil je je huis verkopen?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Plaats je woning gratis op ons platform en kom direct in contact met kopers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/list-property">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    Plaats je woning
                  </Button>
                </Link>
                <Link href="/instant-offer">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-red-600 hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                  >
                    Gratis taxatie
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}