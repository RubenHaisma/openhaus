"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Home, 
  TrendingUp, 
  Calendar, 
  Euro, 
  Eye, 
  Heart, 
  Bell,
  Settings,
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'

// Mock data - in production, fetch from API
const mockUserData = {
  properties: [
    {
      id: '1',
      address: 'Keizersgracht 123, Amsterdam',
      status: 'offer_received',
      offer_amount: 875000,
      market_value: 920000,
      created_at: '2024-01-15',
      views: 45,
      favorites: 12,
      images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg']
    }
  ],
  favorites: [
    {
      id: '2',
      address: 'Herengracht 456, Amsterdam',
      price: 750000,
      bedrooms: 2,
      bathrooms: 1,
      square_meters: 95,
      images: ['https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg']
    },
    {
      id: '3',
      address: 'Prinsengracht 789, Amsterdam',
      price: 650000,
      bedrooms: 3,
      bathrooms: 2,
      square_meters: 110,
      images: ['https://images.pexels.com/photos/323772/pexels-photo-323772.jpeg']
    }
  ],
  searches: [
    {
      id: '1',
      name: 'Amsterdam Centrum',
      criteria: 'Amsterdam, 2-3 kamers, €500k-€800k',
      results: 23,
      created_at: '2024-01-10'
    },
    {
      id: '2',
      name: 'Utrecht Binnenstad',
      criteria: 'Utrecht, 3+ kamers, €400k-€600k',
      results: 15,
      created_at: '2024-01-08'
    }
  ],
  notifications: [
    {
      id: '1',
      type: 'offer',
      title: 'Nieuw bod ontvangen',
      message: 'Je hebt een bod van €875.000 ontvangen op Keizersgracht 123',
      created_at: '2024-01-15T10:30:00Z',
      read: false
    },
    {
      id: '2',
      type: 'price_change',
      title: 'Prijswijziging in je zoekgebied',
      message: 'Een woning in Amsterdam Centrum is €25.000 in prijs verlaagd',
      created_at: '2024-01-14T15:45:00Z',
      read: false
    },
    {
      id: '3',
      type: 'new_listing',
      title: 'Nieuwe woning beschikbaar',
      message: 'Er is een nieuwe woning die voldoet aan je zoekcriteria',
      created_at: '2024-01-13T09:15:00Z',
      read: true
    }
  ],
  stats: {
    total_views: 156,
    total_favorites: 28,
    active_searches: 2,
    offers_made: 3
  }
}

export default function DashboardPage() {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('overview')

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
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'offer_received':
        return <Badge className="bg-green-100 text-green-800">Bod ontvangen</Badge>
      case 'for_sale':
        return <Badge className="bg-blue-100 text-blue-800">Te koop</Badge>
      case 'sold':
        return <Badge className="bg-gray-100 text-gray-800">Verkocht</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer':
        return <Euro className="w-5 h-5 text-green-600" />
      case 'price_change':
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      case 'new_listing':
        return <Home className="w-5 h-5 text-purple-600" />
      default:
        return <Bell className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welkom terug, {user?.firstName}!
          </h1>
          <p className="text-xl text-gray-600">
            Hier is een overzicht van je vastgoedactiviteiten
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Totaal bekeken</p>
                    <p className="text-3xl font-bold text-gray-900">{mockUserData.stats.total_views}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Favorieten</p>
                    <p className="text-3xl font-bold text-gray-900">{mockUserData.stats.total_favorites}</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Heart className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Actieve zoekopdrachten</p>
                    <p className="text-3xl font-bold text-gray-900">{mockUserData.stats.active_searches}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Biedingen gedaan</p>
                    <p className="text-3xl font-bold text-gray-900">{mockUserData.stats.offers_made}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Euro className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overzicht</TabsTrigger>
            <TabsTrigger value="properties">Mijn woningen</TabsTrigger>
            <TabsTrigger value="favorites">Favorieten</TabsTrigger>
            <TabsTrigger value="searches">Zoekopdrachten</TabsTrigger>
            <TabsTrigger value="notifications">Meldingen</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>Recente activiteit</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockUserData.notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Snelle acties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <Link href="/instant-offer">
                      <Button className="w-full justify-start h-auto p-4 bg-primary hover:bg-primary/90">
                        <div className="flex items-center space-x-3">
                          <Home className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-semibold">Verkoop je huis</div>
                            <div className="text-sm opacity-90">Ontvang een direct bod</div>
                          </div>
                        </div>
                      </Button>
                    </Link>

                    <Link href="/kopen">
                      <Button variant="outline" className="w-full justify-start h-auto p-4">
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-semibold">Zoek woningen</div>
                            <div className="text-sm text-gray-600">Vind je droomhuis</div>
                          </div>
                        </div>
                      </Button>
                    </Link>

                    <Link href="/financiering">
                      <Button variant="outline" className="w-full justify-start h-auto p-4">
                        <div className="flex items-center space-x-3">
                          <Euro className="w-6 h-6" />
                          <div className="text-left">
                            <div className="font-semibold">Hypotheek berekenen</div>
                            <div className="text-sm text-gray-600">Bereken je mogelijkheden</div>
                          </div>
                        </div>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Mijn woningen</h2>
              <Link href="/instant-offer">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Woning toevoegen
                </Button>
              </Link>
            </div>

            {mockUserData.properties.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {mockUserData.properties.map((property) => (
                  <Card key={property.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                          <img
                            src={property.images[0]}
                            alt={property.address}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{property.address}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              {getStatusBadge(property.status)}
                              <span className="text-sm text-gray-600">
                                Toegevoegd op {formatDate(property.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end space-y-2">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(property.offer_amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Marktwaarde: {formatPrice(property.market_value)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{property.views} weergaven</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{property.favorites} favorieten</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen woningen gevonden</h3>
                  <p className="text-gray-600 mb-6">
                    Je hebt nog geen woningen toegevoegd. Start met het verkopen van je huis.
                  </p>
                  <Link href="/instant-offer">
                    <Button className="bg-primary hover:bg-primary/90">
                      Verkoop je huis
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Favoriete woningen</h2>
              <Link href="/kopen">
                <Button variant="outline">
                  Meer woningen zoeken
                </Button>
              </Link>
            </div>

            {mockUserData.favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockUserData.favorites.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={property.images[0]}
                        alt={property.address}
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">{property.address}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <span>{property.bedrooms} kamers</span>
                        <span>{property.square_meters} m²</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          {formatPrice(property.price)}
                        </div>
                        <Link href={`/properties/${property.id}`}>
                          <Button size="sm">Bekijk</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen favorieten</h3>
                  <p className="text-gray-600 mb-6">
                    Je hebt nog geen woningen als favoriet gemarkeerd.
                  </p>
                  <Link href="/kopen">
                    <Button className="bg-primary hover:bg-primary/90">
                      Woningen zoeken
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="searches" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Opgeslagen zoekopdrachten</h2>
              <Link href="/kopen">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuwe zoekopdracht
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {mockUserData.searches.map((search) => (
                <Card key={search.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{search.name}</h3>
                        <p className="text-gray-600">{search.criteria}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Aangemaakt op {formatDate(search.created_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{search.results}</div>
                        <div className="text-sm text-gray-600">resultaten</div>
                        <Button size="sm" className="mt-2">
                          Bekijk resultaten
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Meldingen</h2>
              <Button variant="outline" size="sm">
                Alles als gelezen markeren
              </Button>
            </div>

            <div className="space-y-4">
              {mockUserData.notifications.map((notification) => (
                <Card key={notification.id} className={notification.read ? 'opacity-60' : ''}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{notification.message}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}