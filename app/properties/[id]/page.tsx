"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar, 
  Euro, 
  Heart, 
  Share2, 
  Phone, 
  Mail,
  Car,
  Zap,
  Thermometer,
  Home,
  TrendingUp,
  Info,
  Shield,
  FileText,
  Calculator,
  Loader2
} from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { propertyService } from '@/lib/property/property-service'
import { dutchTaxCalculator, mortgageCalculator } from '@/lib/real-data/tax-calculator'

export default function PropertyDetailPage() {
  const params = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [propertyData, setPropertyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Add state for buurt metrics
  const [buurtMetrics, setBuurtMetrics] = useState<any>(null)
  const [buurtMetricsLoading, setBuurtMetricsLoading] = useState(false)
  const [buurtMetricsError, setBuurtMetricsError] = useState(false)

  useEffect(() => {
    if (!params?.id) return
    setLoading(true)
    setError(null)
    fetch(`/api/properties/${params.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Woning niet gevonden')
        const data = await res.json()
        setPropertyData(data)
      })
      .catch((err) => {
        setError(err.message)
        setPropertyData(null)
      })
      .finally(() => setLoading(false))
  }, [params.id])

  useEffect(() => {
    // Use full address for geocoding if available
    const addressQuery = propertyData?.address && propertyData?.postalCode && propertyData?.city
      ? `${propertyData.address}, ${propertyData.postalCode} ${propertyData.city}`
      : propertyData?.city
    if (!addressQuery) return
    setBuurtMetricsLoading(true)
    setBuurtMetricsError(false)
    fetch(`/api/properties/city-stats/metrics?q=${encodeURIComponent(addressQuery)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        setBuurtMetrics(data)
      })
      .catch(() => {
        setBuurtMetrics(null)
        setBuurtMetricsError(true)
      })
      .finally(() => setBuurtMetricsLoading(false))
  }, [propertyData?.address, propertyData?.postalCode, propertyData?.city])

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEnergyLabelColor = (label?: string): string => {
    const colors: Record<string, string> = {
      'A+++': 'bg-green-600', 'A++': 'bg-green-500', 'A+': 'bg-green-400', 'A': 'bg-green-300',
      'B': 'bg-yellow-400', 'C': 'bg-orange-400', 'D': 'bg-orange-500',
      'E': 'bg-red-400', 'F': 'bg-red-500', 'G': 'bg-red-600'
    }
    return label ? colors[label] : 'bg-gray-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laden van woninggegevens...</p>
        </div>
      </div>
    )
  }

  if (error || !propertyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Woning niet gevonden</h1>
          <p className="text-gray-600 mb-6">Deze woning bestaat niet of is niet meer beschikbaar.</p>
          <Link href="/buy">
            <Button>Terug naar woningen</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] bg-gray-900">
        <Image
          src={propertyData.images?.[currentImageIndex] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
          alt={propertyData.address || 'Woning'}
          fill
          className="object-cover"
          priority
        />
        
        {/* Image Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {(propertyData.images?.length ? propertyData.images : ['default']).map((_: string, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 hover:bg-white backdrop-blur-sm"
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 hover:bg-white backdrop-blur-sm"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {propertyData.address || 'Onbekend adres'}
                      </h1>
                      <div className="flex items-center space-x-2 text-gray-600 mb-4">
                        <MapPin className="w-5 h-5" />
                        <span className="text-lg">
                          {(propertyData.city || 'Onbekende stad')}, {(propertyData.province || 'Nederland')}, {propertyData.postalCode || ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {formatPrice(propertyData.askingPrice)}
                      </div>
                      <div className="text-gray-600">
                        {formatPrice(Math.round(propertyData.askingPrice / propertyData.squareMeters))}
                        /m²
                      </div>
                    </div>
                  </div>

                  {/* Property Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Bed className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{propertyData.bedrooms ?? '-'}</div>
                      <div className="text-gray-600">Slaapkamers</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Bath className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{propertyData.bathrooms ?? '-'}</div>
                      <div className="text-gray-600">Badkamers</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Square className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{propertyData.squareMeters}</div>
                      <div className="text-gray-600">m² woonoppervlak</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Calendar className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{propertyData.constructionYear}</div>
                      <div className="text-gray-600">Bouwjaar</div>
                    </div>
                  </div>

                  {/* Energy Label & Key Info */}
                  <div className="flex flex-wrap gap-4">
                    <Badge className={`${getEnergyLabelColor(propertyData.energyLabel)} text-white px-4 py-2 text-lg`}>
                      Energielabel {propertyData.energyLabel}
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2 text-lg">
                      {propertyData.propertyType}
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2 text-lg">
                      Eigendom
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tabs Content */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Beschrijving</TabsTrigger>
                <TabsTrigger value="features">Kenmerken</TabsTrigger>
                <TabsTrigger value="neighborhood">Buurt</TabsTrigger>
                <TabsTrigger value="legal">Juridisch</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Beschrijving</h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {propertyData.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Kenmerken</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {propertyData.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="neighborhood" className="mt-6">
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Buurt: {propertyData.city}</h3>
                    {buurtMetricsLoading ? (
                      <div className="flex items-center space-x-2 text-gray-500"><Loader2 className="animate-spin w-5 h-5" /> <span>Laden buurtdata...</span></div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Bereikbaarheid</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Loopscore</span>
                              <span className="font-semibold">
                                {buurtMetrics && typeof buurtMetrics.shops === 'number' && typeof buurtMetrics.restaurants === 'number' 
                                  ? Math.min(100, (buurtMetrics.shops + buurtMetrics.restaurants) * 2) 
                                  : buurtMetricsError ? 'Niet beschikbaar' : 'Laden...'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Fietsscore</span>
                              <span className="font-semibold">
                                {buurtMetrics && typeof buurtMetrics.bikeInfra === 'number' 
                                  ? Math.min(100, buurtMetrics.bikeInfra * 10) 
                                  : buurtMetricsError ? 'Niet beschikbaar' : 'Laden...'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>OV-score</span>
                              <span className="font-semibold">
                                {buurtMetrics && typeof buurtMetrics.transitStops === 'number' 
                                  ? Math.min(100, buurtMetrics.transitStops * 5) 
                                  : buurtMetricsError ? 'Niet beschikbaar' : 'Laden...'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Voorzieningen</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Scholen</span>
                              <span className="font-semibold">
                                {buurtMetrics && typeof buurtMetrics.schools === 'number' 
                                  ? buurtMetrics.schools 
                                  : buurtMetricsError ? 'Niet beschikbaar' : 'Laden...'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Veiligheid</span>
                              <span className="font-semibold">Laden...</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Restaurants</span>
                              <span className="font-semibold">
                                {buurtMetrics && typeof buurtMetrics.restaurants === 'number' 
                                  ? buurtMetrics.restaurants 
                                  : buurtMetricsError ? 'Niet beschikbaar' : 'Laden...'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Winkels</span>
                              <span className="font-semibold">
                                {buurtMetrics && typeof buurtMetrics.shops === 'number' 
                                  ? buurtMetrics.shops 
                                  : buurtMetricsError ? 'Niet beschikbaar' : 'Laden...'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="legal" className="mt-6">
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Juridische informatie</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Eigendom</h4>
                          <p className="text-gray-700">Eigendom</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Erfpacht</h4>
                          <p className="text-gray-700">Nee</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">VvE bijdrage</h4>
                          <p className="text-gray-700">Niet van toepassing</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Overdrachtsbelasting</h4>
                          <p className="text-gray-700">2%</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">WOZ-waarde</h4>
                          <p className="text-gray-700">{formatPrice(propertyData.askingPrice * 0.85)}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Energiecertificaat</h4>
                          <p className="text-gray-700">Geldig tot 2034</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">Notaris verplicht</h4>
                          <p className="text-blue-800 text-sm">
                            In Nederland is een notaris verplicht voor de overdracht van onroerend goed. 
                            Wij helpen je bij het vinden van een geschikte notaris in de buurt.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Market Data */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <span>Marktgegevens {propertyData.city}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(Math.round(propertyData.askingPrice / propertyData.squareMeters))}
                    </div>
                    <div className="text-sm text-gray-600">Prijs per m²</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {propertyData.energyLabel}
                    </div>
                    <div className="text-sm text-gray-600">Energielabel</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {propertyData.constructionYear}
                    </div>
                    <div className="text-sm text-gray-600">Bouwjaar</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Interesse in deze woning?</h3>
                  <p className="text-gray-600">Neem contact op voor meer informatie of een bezichtiging</p>
                </div>
                <div className="space-y-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg">
                    <Phone className="w-5 h-5 mr-2" />
                    Bel direct
                  </Button>
                  <Button variant="outline" className="w-full py-3 text-lg">
                    <Mail className="w-5 h-5 mr-2" />
                    Stuur bericht
                  </Button>
                  <Link href={`/properties/${propertyData.id ?? ''}/offer`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
                      <Euro className="w-5 h-5 mr-2" />
                      Contact opnemen
                    </Button>
                  </Link>
                  <Link href="/finance">
                    <Button variant="outline" className="w-full py-3 text-lg">
                      <Calculator className="w-5 h-5 mr-2" />
                      Hypotheek berekenen
                    </Button>
                  </Link>
                </div>
                <Separator className="my-6" />
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Makelaar</div>
                  <div className="font-semibold text-gray-900">WattVrij</div>
                  <div className="text-sm text-gray-600">Particuliere verkoop platform</div>
                </div>
              </CardContent>
            </Card>
            {/* Mortgage Calculator Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  <span>Hypotheek calculator</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Koopprijs
                    </label>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(propertyData.askingPrice)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geschat maandlast
                    </label>
                    <div className="text-xl font-semibold text-primary">
                      €{Math.round(propertyData.askingPrice * 0.8 * 0.045 / 12).toLocaleString()} - €{Math.round(propertyData.askingPrice * 0.9 * 0.055 / 12).toLocaleString()}/maand
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    *Indicatie o.b.v. 3.8% rente, 30 jaar, 90% financiering
                  </div>
                  <Link href="/finance">
                    <Button variant="outline" className="w-full">
                      Bereken exacte hypotheek
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            {/* GDPR Compliance Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">Privacy beschermd</h4>
                    <p className="text-blue-800 text-sm">
                      Jouw gegevens worden veilig behandeld conform AVG/GDPR wetgeving. 
                      Zie ons <Link href="/privacy" className="underline">privacybeleid</Link>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}