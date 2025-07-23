"use client"

import { PropertyCard } from '@/components/property/property-card'
import { Card, CardContent } from '@/components/ui/card'
import { Home } from 'lucide-react'
import { motion } from 'framer-motion'

interface Property {
  id: string
  address: string
  city: string
  askingPrice: number
  bedrooms: number
  bathrooms: number
  squareMeters: number
  images: string[]
  status: 'AVAILABLE' | 'SOLD' | 'PENDING'
  energyLabel: string
  description: string
  features: string[]
}

interface PropertyGridProps {
  properties: Property[]
  loading?: boolean
  onFavorite?: (propertyId: string) => void
  favorites?: string[]
}

export function PropertyGrid({ 
  properties, 
  loading = false, 
  onFavorite, 
  favorites = [] 
}: PropertyGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Geen woningen gevonden
          </h3>
          <p className="text-gray-600">
            Probeer je zoekopdracht aan te passen of bekijk alle beschikbare woningen.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property, index) => (
        <motion.div
          key={property.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <PropertyCard 
            property={property}
            onFavorite={onFavorite}
            isFavorite={favorites.includes(property.id)}
          />
        </motion.div>
      ))}
    </div>
  )
}