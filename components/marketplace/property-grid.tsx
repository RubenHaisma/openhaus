"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, Bed, Bath, Square, Euro, Eye, Share2 } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Property {
  id: string
  address: string
  city: string
  asking_price: number
  bedrooms: number
  bathrooms: number
  square_meters: number
  images: string[]
  status: 'AVAILABLE' | 'SOLD' | 'PENDING'
  energy_label: string
  description: string
  features: string[]
}

interface PropertyGridProps {
  properties: Property[]
  loading?: boolean
  onFavorite?: (propertyId: string) => void
  favorites?: string[]
}

export function PropertyGrid({ properties, loading, onFavorite, favorites = [] }: PropertyGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getEnergyLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      'A+++': 'bg-green-600', 'A++': 'bg-green-500', 'A+': 'bg-green-400', 'A': 'bg-green-300',
      'B': 'bg-yellow-400', 'C': 'bg-orange-400', 'D': 'bg-orange-500',
      'E': 'bg-red-400', 'F': 'bg-red-500', 'G': 'bg-red-600'
    }
    return colors[label] || 'bg-gray-400'
  }

  const handleImageError = (propertyId: string) => {
    setImageErrors(prev => new Set([...prev, propertyId]))
  }

  const handleShare = async (property: Property) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${property.address} - ${formatPrice(property.asking_price)}`,
          text: property.description,
          url: `${window.location.origin}/properties/${property.id}`,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/properties/${property.id}`)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Geen woningen gevonden</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Er zijn geen woningen die voldoen aan je zoekcriteria. 
            Probeer je filters aan te passen of zoek in een andere locatie.
          </p>
          <Button variant="outline">
            Pas filters aan
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property, index) => (
        <motion.div
          key={property.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
            <div className="relative">
              {/* Property Image */}
              <div className="h-48 overflow-hidden">
                {property.images.length > 0 && !imageErrors.has(property.id) ? (
                  <img
                    src={property.images[0]}
                    alt={property.address}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(property.id)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Overlay Actions */}
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-white/90 hover:bg-white backdrop-blur-sm"
                  onClick={() => handleShare(property)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`backdrop-blur-sm ${
                    favorites.includes(property.id)
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-white/90 hover:bg-white'
                  }`}
                  onClick={() => onFavorite?.(property.id)}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(property.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Energy Label */}
              <Badge 
                className={`absolute bottom-2 left-2 ${getEnergyLabelColor(property.energy_label)} text-white`}
              >
                {property.energy_label}
              </Badge>

              {/* Status Badge */}
              {property.status !== 'AVAILABLE' && (
                <Badge 
                  variant="destructive"
                  className="absolute top-2 left-2"
                >
                  {property.status === 'SOLD' ? 'Verkocht' : 
                   property.status === 'PENDING' ? 'Onder bod' : property.status}
                </Badge>
              )}
            </div>

            <CardContent className="p-6">
              {/* Address and City */}
              <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                  {property.address}
                </h3>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{property.city}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {property.description}
              </p>

              {/* Property Details */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Square className="w-4 h-4" />
                  <span>{property.square_meters} m²</span>
                </div>
              </div>

              {/* Features */}
              {property.features.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {property.features.slice(0, 3).map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {property.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.features.length - 3} meer
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Price and Action */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(property.asking_price)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatPrice(Math.round(property.asking_price / property.square_meters))}/m²
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Link href={`/properties/${property.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Bekijk
                    </Button>
                  </Link>
                  
                  <Link href={`/properties/${property.id}/offer`}>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Bod uitbrengen
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}