"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PropertySearch } from '@/components/marketplace/property-search'
import { PropertyGrid } from '@/components/marketplace/property-grid'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Filter, SlidersHorizontal, Map, Grid3X3 } from 'lucide-react'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [searchResults, setSearchResults] = useState<any>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [loading, setLoading] = useState(false)

  // Get initial search parameters from URL
  const initialQuery = searchParams.get('q') || ''
  const initialLocation = searchParams.get('location') || ''

  useEffect(() => {
    // If there are URL parameters, trigger initial search
    if (initialQuery || initialLocation) {
      // Simulate search with URL parameters
      handleSearchResults({
        properties: [], // Would be populated from API
        total: 0,
        query: initialQuery,
        location: initialLocation
      })
    }
  }, [initialQuery, initialLocation])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Zoek je droomhuis
          </h1>
          <p className="text-xl text-gray-600">
            Vind de perfecte woning uit duizenden aanbiedingen
          </p>
        </div>

        {/* Search Component */}
        <div className="mb-8">
          <PropertySearch 
            onResults={handleSearchResults}
            initialQuery={initialQuery}
            initialLocation={initialLocation}
          />
        </div>

        {/* Results Header */}
        {searchResults && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                {searchResults.total > 0 
                  ? `${searchResults.total} woningen gevonden`
                  : 'Geen woningen gevonden'
                }
              </h2>
              {searchResults.query && (
                <p className="text-gray-600">
                  voor "{searchResults.query}"
                  {searchResults.location && ` in ${searchResults.location}`}
                </p>
              )}
            </div>

            {searchResults.total > 0 && (
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
        )}

        {/* Search Results */}
        {searchResults ? (
          <div className="space-y-6">
            {viewMode === 'grid' ? (
              <PropertyGrid
                properties={searchResults.properties || []}
                loading={loading}
                onFavorite={handleFavorite}
                favorites={favorites}
              />
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

            {/* Load More */}
            {searchResults.properties && searchResults.properties.length > 0 && 
             searchResults.total > searchResults.properties.length && (
              <div className="text-center">
                <Button variant="outline" size="lg">
                  Meer woningen laden
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* No Search Results - Show Popular Searches */
          <div className="space-y-8">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Populaire zoekopdrachten</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { location: 'Amsterdam', count: '2,847 woningen', avgPrice: '€675.000' },
                    { location: 'Rotterdam', count: '1,523 woningen', avgPrice: '€385.000' },
                    { location: 'Den Haag', count: '1,412 woningen', avgPrice: '€485.000' },
                    { location: 'Utrecht', count: '1,089 woningen', avgPrice: '€525.000' },
                    { location: 'Eindhoven', count: '867 woningen', avgPrice: '€365.000' },
                    { location: 'Groningen', count: '598 woningen', avgPrice: '€285.000' }
                  ].map((city, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => {
                        // Trigger search for this city
                        handleSearchResults({
                          properties: [], // Would be populated from API
                          total: parseInt(city.count.split(' ')[0].replace(',', '')),
                          location: city.location
                        })
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{city.location}</h4>
                          <p className="text-sm text-gray-600">{city.count}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-right">
                        <p className="font-semibold text-primary">{city.avgPrice}</p>
                        <p className="text-xs text-gray-500">gemiddeld</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Zoektips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Gebruik specifieke locaties</h4>
                    <p className="text-gray-600">
                      Zoek op stadsnaam, wijk of postcode voor de beste resultaten.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Stel filters in</h4>
                    <p className="text-gray-600">
                      Gebruik prijsfilters, aantal kamers en andere criteria om je zoekopdracht te verfijnen.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Bewaar zoekopdrachten</h4>
                    <p className="text-gray-600">
                      Maak een account aan om zoekopdrachten op te slaan en meldingen te ontvangen.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Stel prijsalerts in</h4>
                    <p className="text-gray-600">
                      Ontvang een melding wanneer er nieuwe woningen beschikbaar komen die voldoen aan je criteria.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-8 max-w-4xl w-full mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}