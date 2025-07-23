"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddressInput } from '@/components/ui/address-input'
import { 
  Home, 
  TrendingUp, 
  Euro, 
  Eye, 
  Heart, 
  Plus,
  BarChart3,
  Settings,
  ArrowRight,
  MapPin,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Fetch real user properties
  const { data: userProperties, isLoading: propertiesLoading } = useQuery({
    queryKey: ['user-properties', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return { properties: [] }
      const response = await fetch(`/api/users/${session.user.id}/properties`)
      if (!response.ok) throw new Error('Failed to fetch properties')
      return response.json()
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Calculate stats from real user properties
  const stats = {
    totalViews: userProperties?.properties?.reduce((sum: number, p: any) => sum + (p.views || 0), 0) || 0,
    totalFavorites: userProperties?.properties?.reduce((sum: number, p: any) => sum + (p.favorites || 0), 0) || 0,
    activeListings: userProperties?.properties?.filter((p: any) => p.status === 'AVAILABLE').length || 0,
    totalRevenue: userProperties?.properties?.reduce((sum: number, p: any) => sum + (p.status === 'SOLD' ? Number(p.askingPrice) : 0), 0) || 0,
  }

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/dashboard'))
      return
    }
  }, [session, status, router])

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

  // Handle address search for new property
  const handleAddressSearch = async (address: string, postalCode: string) => {
    setLoading(true)
    try {
      // Get property valuation first
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, postalCode }),
      })
      
      if (res.ok) {
        const data = await res.json()
        // Redirect to list-property with valuation data
        router.push(`/list-property?address=${encodeURIComponent(address)}&postal=${encodeURIComponent(postalCode)}&value=${encodeURIComponent(data.valuation.estimatedValue)}`)
      } else {
        const errorData = await res.json()
        alert(`Fout bij het ophalen van woninggegevens: ${errorData.error}`)
      }
    } catch (error: any) {
      alert(`Fout bij het ophalen van woninggegevens: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Dashboard laden...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welkom terug, {session.user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Beheer je woningen en bekijk je prestaties
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Totaal bekeken',
              value: stats.totalViews.toLocaleString(),
              icon: Eye,
              color: 'text-blue-600',
              bgColor: 'bg-blue-100'
            },
            {
              label: 'Favorieten',
              value: stats.totalFavorites.toString(),
              icon: Heart,
              color: 'text-red-600',
              bgColor: 'bg-red-100'
            },
            {
              label: 'Actieve advertenties',
              value: stats.activeListings.toString(),
              icon: Home,
              color: 'text-green-600',
              bgColor: 'bg-green-100'
            },
            {
              label: 'Totale waarde',
              value: formatPrice(stats.totalRevenue),
              icon: Euro,
              color: 'text-purple-600',
              bgColor: 'bg-purple-100'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add New Property */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <span>Nieuwe woning toevoegen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Voer het adres van je woning in om te beginnen met een gratis taxatie
                </p>
                <AddressInput
                  onSearch={handleAddressSearch}
                  placeholder="Voer je adres in voor een gratis taxatie..."
                  className="w-full"
                  loading={loading}
                />
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>Automatische taxatie</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>Marktanalyse</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>WOZ gegevens</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Properties */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Home className="w-5 h-5 text-primary" />
                    <span>Mijn woningen ({userProperties?.properties?.length || 0})</span>
                  </CardTitle>
                  {userProperties?.properties?.length > 0 && (
                    <Button variant="outline" size="sm">
                      Alles beheren
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {propertiesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : !userProperties?.properties?.length ? (
                  <div className="text-center py-8">
                    <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nog geen woningen
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Voeg je eerste woning toe om te beginnen met verkopen
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userProperties.properties.slice(0, 3).map((property: any) => (
                      <div key={property.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <img
                          src={property.images?.[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                          alt={property.address}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {property.address}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={getStatusColor(property.status)}>
                              {getStatusText(property.status)}
                            </Badge>
                            <span className="text-sm text-gray-600"> 
                              {property.views || 0} weergaven
                            </span>
                            <span className="text-sm text-gray-600">
                              {Math.floor((Date.now() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dagen online
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatPrice(Number(property.askingPrice))}
                          </div>
                          <Link href={`/properties/${property.id}`}>
                            <Button variant="outline" size="sm" className="mt-2">
                              Bekijk
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    
                    {userProperties.properties.length > 3 && (
                      <div className="text-center pt-4">
                        <Button variant="outline" size="sm">
                          Bekijk alle {userProperties.properties.length} woningen
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Snelle acties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/buy">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Zoek woningen
                  </Button>
                </Link>
                <Link href="/finance">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Hypotheek calculator
                  </Button>
                </Link>
                <Link href="/instant-offer">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Gratis taxatie
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Account */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-sm text-gray-600">{session.user?.email}</p>
                  </div>
                </div>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Instellingen
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Hulp nodig?
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  Bekijk onze gids voor het verkopen van je woning zonder makelaar.
                </p>
                <Link href="/gids/huis-verkopen-zonder-makelaar">
                  <Button variant="outline" size="sm" className="w-full border-blue-300 text-blue-700 hover:bg-blue-100">
                    Bekijk gids
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}