"use client"

import { useState, useEffect } from 'react'
import { PropertySearch } from '@/components/marketplace/property-search'
import { PropertyGrid } from '@/components/marketplace/property-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, MapPin, Home, Users, Star } from 'lucide-react'

export default function MarketplacePage() {
  const [searchResults, setSearchResults] = useState<any>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [marketStats, setMarketStats] = useState<any>(null)
  const [popularLocations, setPopularLocations] = useState<any[]>([])

  const handleSearchResults = (results: any) => {
    setSearchResults(results)
  }

  const handleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  // Fetch real market statistics
  useEffect(() => {
    const fetchMarketStats = async () => {
      try {
        const [statsRes, locationsRes] = await Promise.all([
          fetch('/api/properties/market-stats'),
          fetch('/api/properties/city-stats?cities=Amsterdam,Rotterdam,Den Haag,Utrecht,Eindhoven,Groningen')
        ])
        
        if (statsRes.ok) {
          const stats = await statsRes.json()
          setMarketStats([
            {
              label: 'Actieve woningen',
              value: stats.activeListings?.toLocaleString() || '0',
              change: `+${stats.growthRate || 0}%`,
              icon: Home,
              color: 'text-blue-600'
            },
            {
              label: 'Gemiddelde prijs',
              value: formatPrice(stats.averagePrice || 0),
              change: `+${stats.priceGrowth || 0}%`,
              icon: TrendingUp,
              color: 'text-green-600'
            },
            {
              label: 'Verkocht deze maand',
              value: stats.soldThisMonth?.toLocaleString() || '0',
              change: `+${stats.salesGrowth || 0}%`,
              icon: Users,
              color: 'text-purple-600'
            },
            {
              label: 'Gemiddelde tijd op markt',
              value: `${stats.averageDaysOnMarket || 0} dagen`,
              change: `${stats.timeChange || 0}%`,
              icon: Star,
              color: 'text-orange-600'
            }
          ])
        }
        
        if (locationsRes.ok) {
          const locations = await locationsRes.json()
          setPopularLocations(locations)
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error)
      }
    }
    
    fetchMarketStats()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Woningen Marktplaats
        </h1>
        <p className="text-xl text-gray-600">
          Ontdek duizenden woningen van particulieren en makelaars
        </p>
      </div>

      {/* Market Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {marketStats?.map((stat: any, index: number) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                <span>Plaats je woning op ons platform en kom direct in contact met kopers. Geen makelaarskosten, geen tussenpersonen.</span>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{stat.change} vs vorige maand</p>
                <div className={`p-3 rounded-full bg-gray-100 self-start ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Component */}
      <PropertySearch onResults={handleSearchResults} />

      {/* Popular Locations */}
      {!searchResults && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Populaire locaties
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularLocations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-medium text-gray-900">{location.city}</h3>
                      <p className="text-sm text-gray-600">{location.count} woningen</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(location.avgPrice || 0)}
                    </p>
                    <p className="text-sm text-gray-600">gemiddeld</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-6">
          <PropertyGrid
            properties={searchResults.properties || []}
            loading={false}
            onFavorite={handleFavorite}
            favorites={favorites}
          />

          {/* Pagination */}
          {searchResults.total > (searchResults.properties?.length || 0) && (
            <div className="flex justify-center">
              <Button variant="outline" size="lg">
                Meer woningen laden
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Call to Action */}
      {!searchResults && (
        <Card className="bg-blue-50 border-blue-200 mt-12">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Wil je je woning verkopen?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Krijg binnen 2 minuten een gratis taxatie en een direct bod op je woning. 
              Geen makelaarskosten, geen gedoe met bezichtigingen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Gratis taxatie aanvragen
              </Button>
              <Button variant="outline" size="lg">
                Meer informatie
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}