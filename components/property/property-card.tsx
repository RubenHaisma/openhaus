"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MapPin, Bed, Bath, Square, Share2, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Property {
  id: string
  address: string
  city: string
  asking_price: number
  bedrooms: number
  bathrooms: number
  square_meters: number
  images: string[]
  status: string
  energy_label: string
  description: string
  features: string[]
}

interface PropertyCardProps {
  property: Property
  onFavorite?: (propertyId: string) => void
  isFavorite?: boolean
  className?: string
}

export function PropertyCard({ 
  property, 
  onFavorite, 
  isFavorite = false,
  className 
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

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
    return colors[label] || 'bg-neutral-400'
  }

  const handleShare = async () => {
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
      navigator.clipboard.writeText(`${window.location.origin}/properties/${property.id}`)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={cn("property-card", className)}>
        <div className="property-card-image relative">
          {/* Property Image */}
          {property.images.length > 0 && !imageError ? (
            <Image
              src={property.images[0]}
              alt={property.address}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-neutral-400" />
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            {onFavorite && (
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  "backdrop-blur-sm shadow-sm transition-colors",
                  isFavorite
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/90 hover:bg-white'
                )}
                onClick={() => onFavorite(property.id)}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
              </Button>
            )}
          </div>

          {/* Energy Label */}
          <Badge 
            className={cn(
              "absolute bottom-3 left-3 text-white font-medium",
              getEnergyLabelColor(property.energy_label)
            )}
          >
            {property.energy_label}
          </Badge>

          {/* Status Badge */}
          {property.status !== 'available' && (
            <Badge 
              variant="destructive"
              className="absolute top-3 left-3"
            >
              {property.status === 'sold' ? 'Verkocht' : 
               property.status === 'pending' ? 'Onder bod' : property.status}
            </Badge>
          )}
        </div>

        <CardContent className="p-6">
          {/* Address and City */}
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-neutral-900 mb-1 line-clamp-1">
              {property.address}
            </h3>
            <div className="flex items-center space-x-1 text-neutral-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{property.city}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>

          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-neutral-600 mb-4">
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
              <div className="text-2xl font-bold text-neutral-900">
                {formatPrice(property.asking_price)}
              </div>
              <div className="text-sm text-neutral-600">
                {formatPrice(Math.round(property.asking_price / property.square_meters))}/m²
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link href={`/properties/${property.id}`}>
                <Button variant="outline" size="sm" className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>Bekijk</span>
                </Button>
              </Link>
              
              <Link href={`/properties/${property.id}/offer`}>
                <Button size="sm" className="bg-primary-500 hover:bg-primary-600 text-white">
                  Bod uitbrengen
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}