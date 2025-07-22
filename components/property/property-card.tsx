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
  status: 'AVAILABLE' | 'SOLD' | 'PENDING'
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
    <Card className={cn("property-card opendoor-card", className)}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <div className="property-card-image relative">
          {/* Property Image */}
          {property.images.length > 0 && !imageError ? (
            <Image
              src={property.images[0]}
              alt={property.address}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
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
              variant="ghost"
              size="sm"
              className="bg-white/95 hover:bg-white backdrop-blur-sm shadow-lg rounded-full w-10 h-10 p-0"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            
            {onFavorite && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "backdrop-blur-sm shadow-lg transition-colors rounded-full w-10 h-10 p-0",
                  isFavorite
                    ? 'bg-red-500/95 hover:bg-red-600 text-white'
                    : 'bg-white/95 hover:bg-white'
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
              "absolute bottom-3 left-3 text-white font-bold px-3 py-1",
              getEnergyLabelColor(property.energy_label)
            )}
          >
            {property.energy_label}
          </Badge>

          {/* Status Badge */}
          {property.status !== 'AVAILABLE' && (
            <Badge 
              className="absolute top-3 left-3 bg-red-500 text-white font-bold px-3 py-1"
            >
              {property.status === 'SOLD' ? 'Verkocht' : 
               property.status === 'PENDING' ? 'Onder bod' : property.status}
            </Badge>
          )}
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Address and City */}
          <div>
            <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1">
              {property.address}
            </h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{property.city}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed line-clamp-2">
            {property.description}
          </p>

          {/* Property Details */}
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center space-x-1">
              <Bed className="w-5 h-5" />
              <span className="font-medium">{property.bedrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bath className="w-5 h-5" />
              <span className="font-medium">{property.bathrooms}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Square className="w-5 h-5" />
              <span className="font-medium">{property.square_meters} m²</span>
            </div>
          </div>

          {/* Features */}
          {property.features.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-1">
                {property.features.slice(0, 3).map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-sm font-medium">
                    {feature}
                  </Badge>
                ))}
                {property.features.length > 3 && (
                  <Badge variant="outline" className="text-sm font-medium">
                    +{property.features.length - 3} meer
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Price and Action */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(property.asking_price)}
              </div>
              <div className="text-gray-600">
                {formatPrice(Math.round(property.asking_price / property.square_meters))}/m²
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Link href={`/properties/${property.id}`}>
                <Button variant="outline" className="opendoor-button-secondary text-sm px-4 py-2">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>Bekijk</span>
                </Button>
              </Link>
              
              <Link href={`/properties/${property.id}/offer`}>
                <Button className="opendoor-button-primary text-sm px-4 py-2">
                  Bod uitbrengen
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </motion.div>
    </Card>
  )
}