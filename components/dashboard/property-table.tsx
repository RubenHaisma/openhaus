"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  Trash2, 
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Heart,
  Calendar,
  MapPin
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Property {
  id: string
  address: string
  status: string
  askingPrice: number
  views: number
  favorites: number
  daysOnMarket: number
  images: string[]
  bedrooms: number
  bathrooms: number
  squareMeters: number
  energyLabel: string
  createdAt: string
}

interface PropertyTableProps {
  userId: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export function PropertyTable({ userId, onEdit, onDelete, onView }: PropertyTableProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'views'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)

  // Fetch real properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/properties`)
        if (response.ok) {
          const data = await response.json()
          setProperties(data.properties || [])
        }
      } catch (error) {
        console.error('Failed to fetch properties:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (userId) {
      fetchProperties()
    }
  }, [userId])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'SOLD': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Beschikbaar'
      case 'PENDING': return 'In behandeling'
      case 'SOLD': return 'Verkocht'
      default: return status
    }
  }

  const getEnergyLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      'A+++': 'bg-green-600', 'A++': 'bg-green-500', 'A+': 'bg-green-400', 'A': 'bg-green-300',
      'B': 'bg-yellow-400', 'C': 'bg-orange-400', 'D': 'bg-orange-500',
      'E': 'bg-red-400', 'F': 'bg-red-500', 'G': 'bg-red-600'
    }
    return colors[label] || 'bg-gray-400'
  }

  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    let aValue: any, bValue: any
    
    switch (sortBy) {
      case 'price':
        aValue = a.askingPrice
        bValue = b.askingPrice
        break
      case 'views':
        aValue = a.views
        bValue = b.views
        break
      case 'date':
      default:
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle className="flex items-center space-x-2">
            <span>Mijn woningen ({properties.length})</span>
          </CardTitle>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Zoek adres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white dark:bg-gray-800"
              />
            </div>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field as any)
                setSortOrder(order as any)
              }}
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="date-desc">Nieuwste eerst</option>
              <option value="date-asc">Oudste eerst</option>
              <option value="price-desc">Prijs: hoog naar laag</option>
              <option value="price-asc">Prijs: laag naar hoog</option>
              <option value="views-desc">Meeste weergaven</option>
              <option value="views-asc">Minste weergaven</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Laden van woningen...</p>
          </div>
        ) : sortedProperties.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Geen woningen gevonden
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Probeer een andere zoekterm' : 'Je hebt nog geen woningen geplaatst'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {sortedProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer ${
                    selectedProperty === property.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  onClick={() => setSelectedProperty(selectedProperty === property.id ? null : property.id)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Property Image */}
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 group">
                      <img
                        src={property.images[0]}
                        alt={property.address}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Property Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                            {property.address}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={`${getStatusColor(property.status)} text-xs font-medium`}>
                              {getStatusText(property.status)}
                            </Badge>
                            <Badge className={`${getEnergyLabelColor(property.energyLabel)} text-white text-xs`}>
                              Label {property.energyLabel}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>{property.bedrooms} kamers</span>
                            <span>•</span>
                            <span>{property.squareMeters} m²</span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{property.daysOnMarket} dagen online</span>
                            </span>
                          </div>
                        </div>

                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(property.askingPrice)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {formatPrice(Math.round(property.askingPrice / property.squareMeters))}/m²
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {property.views}
                            </span>
                            <span className="text-xs text-gray-500">weergaven</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {property.favorites}
                            </span>
                            <span className="text-xs text-gray-500">favorieten</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {property.views > 100 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-orange-600" />
                            )}
                            <span className="text-xs text-gray-500">
                              {property.views > 100 ? 'Populair' : 'Gemiddeld'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onView(property.id)
                            }}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Bekijk
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                                className="hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => onEdit(property.id)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Bewerken
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onView(property.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Bekijk advertentie
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => onDelete(property.id)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Verwijderen
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedProperty === property.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Prestaties</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Weergaven vandaag</span>
                                <span className="font-medium">12</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Gemiddeld per dag</span>
                                <span className="font-medium">{Math.round(property.views / property.daysOnMarket)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Conversie ratio</span>
                                <span className="font-medium">{((property.favorites / property.views) * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Geplaatst op</span>
                                <span className="font-medium">{formatDate(property.createdAt)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Laatste update</span>
                                <span className="font-medium">2 dagen geleden</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Prijs per m²</span>
                                <span className="font-medium">{formatPrice(Math.round(property.askingPrice / property.squareMeters))}</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Acties</h4>
                            <div className="space-y-2">
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <Edit3 className="w-4 h-4 mr-2" />
                                Bewerk advertentie
                              </Button>
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Boost advertentie
                              </Button>
                              <Button variant="outline" size="sm" className="w-full justify-start">
                                <MapPin className="w-4 h-4 mr-2" />
                                Deel advertentie
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}