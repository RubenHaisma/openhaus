"use client"

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, MapPin, Bed, Bath, Square, Euro, Heart, SlidersHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PropertySearchProps {
  onResults?: (results: any) => void
  initialQuery?: string
  initialLocation?: string
}

interface SearchFilters {
  query?: string
  city?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  minSquareMeters?: number
  maxSquareMeters?: number
  energyLabel?: string
  features?: string[]
  sortBy?: string
  sortOrder?: string
}

export function PropertySearch({ onResults }: PropertySearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [sizeRange, setSizeRange] = useState([0, 500])

  const { data: results, isLoading, error, refetch } = useQuery({
    queryKey: ['property-search', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            params.append(key, value.join(','))
          } else {
            params.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/properties/search?${params}`)
      if (!response.ok) throw new Error('Search failed')
      return response.json()
    },
    enabled: false, // Only run when explicitly triggered
  })

  useEffect(() => {
    if (results && onResults) {
      onResults(results)
    }
  }, [results, onResults])

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1000000 ? priceRange[1] : undefined,
      minSquareMeters: sizeRange[0] > 0 ? sizeRange[0] : undefined,
      maxSquareMeters: sizeRange[1] < 500 ? sizeRange[1] : undefined,
    }
    setFilters(searchFilters)
    refetch()
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({ sortBy: 'date', sortOrder: 'desc' })
    setPriceRange([0, 1000000])
    setSizeRange([0, 500])
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* Main Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Zoek op adres, stad of postcode..."
                  value={filters.query || ''}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
              
              <Button 
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-8"
              >
                {isLoading ? 'Zoeken...' : 'Zoeken'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Geavanceerde filters</span>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Wis filters
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Stad</Label>
                    <Input
                      id="city"
                      placeholder="Amsterdam, Rotterdam, etc."
                      value={filters.city || ''}
                      onChange={(e) => handleFilterChange('city', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="propertyType">Type woning</Label>
                    <Select
                      value={filters.propertyType || ''}
                      onValueChange={(value) => handleFilterChange('propertyType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Alle types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Alle types</SelectItem>
                        <SelectItem value="HOUSE">Eengezinswoning</SelectItem>
                        <SelectItem value="APARTMENT">Appartement</SelectItem>
                        <SelectItem value="TOWNHOUSE">Rijtjeshuis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <Label>Prijsrange</Label>
                  <div className="mt-2 mb-4">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={1000000}
                      min={0}
                      step={10000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                {/* Bedrooms and Bathrooms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Slaapkamers</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Button
                          key={num}
                          variant={filters.minBedrooms === num ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('minBedrooms', num)}
                        >
                          {num}+
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Badkamers</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4].map((num) => (
                        <Button
                          key={num}
                          variant={filters.minBathrooms === num ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFilterChange('minBathrooms', num)}
                        >
                          {num}+
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Size Range */}
                <div>
                  <Label>Oppervlakte (m²)</Label>
                  <div className="mt-2 mb-4">
                    <Slider
                      value={sizeRange}
                      onValueChange={setSizeRange}
                      max={500}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{sizeRange[0]} m²</span>
                    <span>{sizeRange[1]} m²</span>
                  </div>
                </div>

                {/* Energy Label */}
                <div>
                  <Label>Energielabel</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'].map((label) => (
                      <Button
                        key={label}
                        variant={filters.energyLabel === label ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleFilterChange('energyLabel', label)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <Label>Kenmerken</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {[
                      'Tuin', 'Balkon', 'Garage', 'Parkeerplaats', 'Lift', 'Airconditioning',
                      'Vloerverwarming', 'Open keuken', 'Inbouwkeuken', 'Zonnepanelen'
                    ].map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={feature}
                          checked={filters.features?.includes(feature) || false}
                          onCheckedChange={(checked) => {
                            const currentFeatures = filters.features || []
                            if (checked) {
                              handleFilterChange('features', [...currentFeatures, feature])
                            } else {
                              handleFilterChange('features', currentFeatures.filter(f => f !== feature))
                            }
                          }}
                        />
                        <Label htmlFor={feature} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Sorteren op</Label>
                    <Select
                      value={filters.sortBy || 'date'}
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">Datum</SelectItem>
                        <SelectItem value="price">Prijs</SelectItem>
                        <SelectItem value="size">Oppervlakte</SelectItem>
                        <SelectItem value="relevance">Relevantie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Volgorde</Label>
                    <Select
                      value={filters.sortOrder || 'desc'}
                      onValueChange={(value) => handleFilterChange('sortOrder', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Hoog naar laag</SelectItem>
                        <SelectItem value="asc">Laag naar hoog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {(filters.city || filters.propertyType || filters.minPrice || filters.energyLabel || filters.features?.length) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600">Actieve filters:</span>
              
              {filters.city && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {filters.city}
                  <button
                    onClick={() => handleFilterChange('city', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.propertyType && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {filters.propertyType === 'HOUSE' ? 'Eengezinswoning' : 
                   filters.propertyType === 'APARTMENT' ? 'Appartement' : 'Rijtjeshuis'}
                  <button
                    onClick={() => handleFilterChange('propertyType', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Euro className="w-3 h-3" />
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  <button
                    onClick={() => setPriceRange([0, 1000000])}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.energyLabel && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Label {filters.energyLabel}
                  <button
                    onClick={() => handleFilterChange('energyLabel', '')}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              )}
              
              {filters.features?.map((feature) => (
                <Badge key={feature} variant="secondary" className="flex items-center gap-1">
                  {feature}
                  <button
                    onClick={() => {
                      const newFeatures = filters.features?.filter(f => f !== feature) || []
                      handleFilterChange('features', newFeatures)
                    }}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results Summary */}
      {results && (
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {results.total} woningen gevonden
          </p>
          
          {results.total > 0 && (
            <div className="text-sm text-gray-500">
              Resultaten {((filters.offset || 0) + 1)} - {Math.min((filters.offset || 0) + (filters.limit || 20), results.total)} van {results.total}
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">
              Er is een fout opgetreden bij het zoeken. Probeer het opnieuw.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}