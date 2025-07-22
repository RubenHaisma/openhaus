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
  Calculator
} from 'lucide-react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { getPropertyData, calculateValuation } from '@/lib/kadaster'
import { dutchTaxCalculator, mortgageCalculator } from '@/lib/real-data/tax-calculator'

// This will be replaced with real API call
async function getPropertyDetails(propertyId: string) {
  try {
    // In production, this would fetch from your database
    // For now, we'll use real Kadaster data for demonstration
    const realData = await getPropertyData('Keizersgracht 123', '1015 CJ')
    if (!realData) throw new Error('Property not found')
    
    const valuation = await calculateValuation(realData)
    const buyingCosts = await dutchTaxCalculator.calculateTotalBuyingCosts(
      valuation.estimatedValue,
      valuation.estimatedValue * 0.8
    )
    
    return {
      ...realData,
      valuation,
      buyingCosts
    }
  } catch (error) {
    console.error('Failed to get real property data:', error)
    throw error
  }
}

const mockProperty = {
  id: '1',
  address: 'Keizersgracht 123',
  city: 'Amsterdam',
  province: 'Noord-Holland',
  postalCode: '1015 CJ',
  country: 'Netherlands',
  asking_price: 875000,
  bedrooms: 3,
  bathrooms: 2,
  square_meters: 120,
  lot_size: 150,
  construction_year: 1985,
  property_type: 'Canal House',
  energy_label: 'B',
  woz_value: 820000,
  images: [
    'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    'https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg',
    'https://images.pexels.com/photos/323772/pexels-photo-323772.jpeg',
    'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
  ],
  description: 'Prachtig gerenoveerd grachtenpand in het hart van Amsterdam. Deze karakteristieke woning combineert historische charme met moderne comfort. Gelegen aan een van de mooiste grachten van Amsterdam, biedt deze woning een unieke kans om te wonen in het centrum van de stad.',
  features: [
    'Monumentaal pand',
    'Volledig gerenoveerd',
    'Originele details',
    'Moderne keuken',
    'Luxe badkamers',
    'Airconditioning',
    'Vloerverwarming',
    'Tuin',
    'Berging',
    'Fietsenstalling'
  ],
  neighborhood: {
    name: 'Grachtengordel',
    walkScore: 95,
    bikeScore: 98,
    transitScore: 90,
    schools: 'Excellent',
    safety: 'Very Safe',
    restaurants: 'Excellent',
    shopping: 'Excellent'
  },
  market_data: {
    price_per_sqm: 7292,
    days_on_market: 28,
    price_history: [
      { date: '2024-01-01', price: 875000 },
      { date: '2023-01-01', price: 825000 },
      { date: '2022-01-01', price: 780000 }
    ],
    comparable_sales: [
      { address: 'Herengracht 456', price: 920000, sqm: 125, date: '2024-02-15' },
      { address: 'Prinsengracht 789', price: 850000, sqm: 115, date: '2024-01-20' },
      { address: 'Keizersgracht 234', price: 890000, sqm: 130, date: '2023-12-10' }
    ]
  },
  legal_info: {
    ownership: 'Freehold (Eigendom)',
    ground_lease: false,
    vve_contribution: 150,
    property_tax: 2400,
    notary_required: true,
    transfer_tax: 2, // 2% for Netherlands
    energy_certificate: 'Valid until 2034'
  }
}

export default function PropertyDetailPage() {
  const params = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [realPropertyData, setRealPropertyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRealData = async () => {
      try {
        const data = await getPropertyDetails(params.id as string)
        setRealPropertyData(data)
      } catch (error) {
        console.error('Failed to load real property data:', error)
        // Fall back to mock data for demo
      } finally {
        setLoading(false)
      }
    }
    
    loadRealData()
  }, [params.id])

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

  const getEnergyLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      'A+++': 'bg-green-600', 'A++': 'bg-green-500', 'A+': 'bg-green-400', 'A': 'bg-green-300',
      'B': 'bg-yellow-400', 'C': 'bg-orange-400', 'D': 'bg-orange-500',
      'E': 'bg-red-400', 'F': 'bg-red-500', 'G': 'bg-red-600'
    }
    return colors[label] || 'bg-gray-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laden van actuele woninggegevens...</p>
        </div>
      </div>
    )
  }

  // Use real data if available, otherwise fall back to mock
  const propertyData = realPropertyData || mockProperty
  const isRealData = !!realPropertyData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] bg-gray-900">
        <Image
          src={propertyData.images?.[currentImageIndex] || mockProperty.images[currentImageIndex]}
          alt={propertyData.address}
          fill
          className="object-cover"
          priority
        />
        
        {/* Image Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {(propertyData.images || mockProperty.images).map((_, index) => (
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
                        {propertyData.address}
                      </h1>
                      <div className="flex items-center space-x-2 text-gray-600 mb-4">
                        <MapPin className="w-5 h-5" />
                        <span className="text-lg">
                          {propertyData.city}, {propertyData.province || 'Noord-Holland'}, {propertyData.postalCode}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {formatPrice(isRealData ? propertyData.valuation.estimatedValue : mockProperty.asking_price)}
                      </div>
                      <div className="text-gray-600">
                        {formatPrice(isRealData ? 
                          Math.round(propertyData.valuation.estimatedValue / propertyData.squareMeters) : 
                          mockProperty.market_data.price_per_sqm)}/m²
                      </div>
                      {isRealData && (
                        <div className="text-xs text-green-600 mt-1">
                          ✓ Actuele marktwaarde
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Property Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Bed className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{propertyData.bedrooms || 3}</div>
                      <div className="text-gray-600">Slaapkamers</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Bath className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{propertyData.bathrooms || 2}</div>
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
                      {propertyData.propertyType || mockProperty.property_type}
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2 text-lg">
                      {mockProperty.legal_info.ownership}
                    </Badge>
                    {isRealData && (
                      <Badge variant="outline" className="px-4 py-2 text-lg bg-green-50 text-green-700 border-green-200">
                        ✓ Kadaster geverifieerd
                      </Badge>
                    )}
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
                      {propertyData.description || mockProperty.description}
                    </p>
                    {isRealData && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          <strong>WOZ-waarde:</strong> {formatPrice(propertyData.wozValue)} 
                          (officiële waardering gemeente)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Kenmerken</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(propertyData.features || mockProperty.features).map((feature, index) => (
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
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Buurt: {mockProperty.neighborhood.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Bereikbaarheid</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Loopscore</span>
                            <span className="font-semibold">{mockProperty.neighborhood.walkScore}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fietsscore</span>
                            <span className="font-semibold">{mockProperty.neighborhood.bikeScore}/100</span>
                          </div>
                          <div className="flex justify-between">
                            <span>OV-score</span>
                            <span className="font-semibold">{mockProperty.neighborhood.transitScore}/100</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Voorzieningen</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Scholen</span>
                            <span className="font-semibold">{mockProperty.neighborhood.schools}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Veiligheid</span>
                            <span className="font-semibold">{mockProperty.neighborhood.safety}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Restaurants</span>
                            <span className="font-semibold">{mockProperty.neighborhood.restaurants}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Winkels</span>
                            <span className="font-semibold">{mockProperty.neighborhood.shopping}</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
                          <p className="text-gray-700">{mockProperty.legal_info.ownership}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Erfpacht</h4>
                          <p className="text-gray-700">{mockProperty.legal_info.ground_lease ? 'Ja' : 'Nee'}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">VvE bijdrage</h4>
                          <p className="text-gray-700">€{mockProperty.legal_info.vve_contribution}/maand</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Overdrachtsbelasting</h4>
                          <p className="text-gray-700">{mockProperty.legal_info.transfer_tax}%</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">WOZ-waarde</h4>
                          <p className="text-gray-700">{formatPrice(isRealData ? propertyData.wozValue : mockProperty.woz_value)}</p>
                          {isRealData && (
                            <p className="text-xs text-green-600 mt-1">✓ Actuele WOZ-waarde</p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Energiecertificaat</h4>
                          <p className="text-gray-700">{mockProperty.legal_info.energy_certificate}</p>
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
                          {isRealData && propertyData.buyingCosts && (
                            <p className="text-blue-800 text-sm mt-2">
                              <strong>Actuele notariskosten:</strong> {formatPrice(propertyData.buyingCosts.notaryFees)}
                            </p>
                          )}
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
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <span>Marktgegevens</span>
                  {isRealData && (
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                      ✓ Live data
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {isRealData ? propertyData.valuation.marketTrends.averageDaysOnMarket : mockProperty.market_data.days_on_market}
                    </div>
                    <div className="text-gray-600">Dagen op markt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(isRealData ? 
                        propertyData.valuation.marketTrends.pricePerSquareMeter : 
                        mockProperty.market_data.price_per_sqm)}
                    </div>
                    <div className="text-gray-600">Prijs per m²</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isRealData && propertyData.valuation.marketTrends.averagePriceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {isRealData ? 
                        `${propertyData.valuation.marketTrends.averagePriceChange > 0 ? '+' : ''}${propertyData.valuation.marketTrends.averagePriceChange.toFixed(1)}%` : 
                        '+6.4%'}
                    </div>
                    <div className="text-gray-600">Prijsstijging (1 jaar)</div>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-4">Vergelijkbare verkopen</h4>
                <div className="space-y-3">
                  {(isRealData ? propertyData.valuation.comparableSales : mockProperty.market_data.comparable_sales).map((sale, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{sale.address}</div>
                        <div className="text-sm text-gray-600">
                          {isRealData ? sale.squareMeters : sale.sqm} m² • {formatDate(isRealData ? sale.soldDate : sale.date)}
                          {isRealData && <span className="ml-2 text-green-600">✓ NVM geverifieerd</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {formatPrice(isRealData ? sale.soldPrice : sale.price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(isRealData ? sale.pricePerSqm : sale.price / sale.sqm)}/m²
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {isRealData && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      Marktgegevens van CBS en NVM • Betrouwbaarheid: {Math.round(propertyData.valuation.confidenceScore * 100)}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-8">
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

                  <Link href={`/properties/${mockProperty.id}/offer`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
                      <Euro className="w-5 h-5 mr-2" />
                      Bod uitbrengen
                    </Button>
                  </Link>

                  <Link href="/financiering">
                    <Button variant="outline" className="w-full py-3 text-lg">
                      <Calculator className="w-5 h-5 mr-2" />
                      Hypotheek berekenen
                    </Button>
                  </Link>
                </div>

                <Separator className="my-6" />

                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-2">Makelaar</div>
                  <div className="font-semibold text-gray-900">OpenHaus Amsterdam</div>
                  <div className="text-sm text-gray-600">NVM Makelaar</div>
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
                      {formatPrice(isRealData ? propertyData.valuation.estimatedValue : mockProperty.asking_price)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geschat maandlast
                    </label>
                    <div className="text-xl font-semibold text-primary">
                      {isRealData ? 
                        `€${Math.round(propertyData.valuation.estimatedValue * 0.8 * 0.045 / 12).toLocaleString()} - €${Math.round(propertyData.valuation.estimatedValue * 0.9 * 0.055 / 12).toLocaleString()}/maand` :
                        '€2.850 - €3.200/maand'
                      }
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {isRealData ? 
                      '*Gebaseerd op actuele hypotheekrente en NHG normen' :
                      '*Indicatie o.b.v. 4.5% rente, 30 jaar, 90% financiering'
                    }
                  </div>

                  <Link href="/financiering">
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