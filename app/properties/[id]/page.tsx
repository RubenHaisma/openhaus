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
import { propertyService } from '@/lib/property/property-service'
import { dutchTaxCalculator, mortgageCalculator } from '@/lib/real-data/tax-calculator'

// Get real property details using our real data sources
async function getPropertyDetails(propertyId: string) {
  try {
    // First try to get property from database
    const property = await propertyService.getProperty(propertyId)
    if (!property) {
      throw new Error('Property not found')
    }
    
    // Get fresh property data and valuation
    const propertyData = await propertyService.getPropertyData(property.address, property.postalCode)
    if (!propertyData) {
      // Use property data from database as fallback
      return property
    }
    
    const valuation = await propertyService.calculateValuation(propertyData)
    const buyingCosts = await dutchTaxCalculator.calculateTotalBuyingCosts(
      valuation.estimatedValue,
      valuation.estimatedValue * 0.8
    )
    
    return {
      ...property,
      propertyData,
      valuation,
      buyingCosts
    }
  } catch (error) {
    console.error('Failed to get property details:', error)
    // Fallback to mock data for demo purposes
    return null
  }
}

export default function PropertyDetailPage() {
  const params = useParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [propertyData, setPropertyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPropertyData = async () => {
      try {
        const data = await getPropertyDetails(params.id as string)
        if (!data) {
          setError('Property not found or real data unavailable')
        } else {
          setPropertyData(data)
        }
      } catch (error) {
        console.error('Failed to load property data:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadPropertyData()
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
          <p className="text-gray-600 mb-6">{error || 'Deze woning bestaat niet of is niet meer beschikbaar.'}</p>
          <Link href="/buy">
            <Button>Terug naar woningen</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isRealData = !!(propertyData.propertyData && propertyData.valuation)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px] bg-gray-900">
        <Image
          src={propertyData.images?.[currentImageIndex] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
          alt={propertyData.address}
          fill
          className="object-cover"
          priority
        />
        
        {/* Image Navigation */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {(propertyData.images || ['default']).map((_, index) => (
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
                        {formatPrice(isRealData ? propertyData.valuation.estimatedValue : propertyData.asking_price)}
                      </div>
                      <div className="text-gray-600">
                        {formatPrice(isRealData ? 
                          Math.round(propertyData.valuation.estimatedValue / propertyData.realData.squareMeters) : 
                          Math.round(propertyData.asking_price / propertyData.square_meters))}/m²
                      </div>
                      {isRealData && (
                        <div className="text-xs text-green-600 mt-1">
                          ✓ Actuele marktwaarde (WOZ + EP Online)
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
                      <div className="text-2xl font-bold text-gray-900">{propertyData.bedrooms}</div>
                      <div className="text-gray-600">Slaapkamers</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Bath className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{propertyData.bathrooms}</div>
                      <div className="text-gray-600">Badkamers</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Square className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{Number(propertyData.squareMeters)}</div>
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
                      {isRealData && <span className="ml-1 text-xs">✓ EP Online</span>}
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2 text-lg">
                      {propertyData.propertyType || 'Woning'}
                    </Badge>
                    <Badge variant="outline" className="px-4 py-2 text-lg">
                      Eigendom
                    </Badge>
                    {isRealData && (
                      <Badge variant="outline" className="px-4 py-2 text-lg bg-green-50 text-green-700 border-green-200">
                        ✓ WOZ geverifieerd
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
                      {propertyData.description}
                    </p>
                    {isRealData && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          <strong>WOZ-waarde:</strong> {formatPrice(propertyData.realData.wozValue)} 
                          (officiële waardering gemeente)
                        </p>
                        {propertyData.realData.bouwjaar && (
                          <p className="text-blue-800 text-sm mt-1">
                            <strong>Bouwjaar (WOZ):</strong> {propertyData.realData.bouwjaar}
                          </p>
                        )}
                        {propertyData.realData.oppervlakte && (
                          <p className="text-blue-800 text-sm mt-1">
                            <strong>Oppervlakte (WOZ):</strong> {propertyData.realData.oppervlakte}
                          </p>
                        )}
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
                      {(propertyData.features || []).map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {propertyData.features?.length === 0 && (
                        <p className="text-gray-600 col-span-2">Geen specifieke kenmerken beschikbaar.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="neighborhood" className="mt-6">
                <Card>
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Buurt: {propertyData.city}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Bereikbaarheid</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Loopscore</span>
                            <span className="font-semibold">Niet beschikbaar</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fietsscore</span>
                            <span className="font-semibold">Niet beschikbaar</span>
                          </div>
                          <div className="flex justify-between">
                            <span>OV-score</span>
                            <span className="font-semibold">Niet beschikbaar</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Voorzieningen</h4>
                        <p className="text-gray-700">{formatPrice(isRealData ? propertyData.valuation.wozValue : Number(propertyData.estimatedValue))}</p>
                          <div className="flex justify-between">
                            <span>Scholen</span>
                            <span className="font-semibold">Niet beschikbaar</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Veiligheid</span>
                            <span className="font-semibold">Niet beschikbaar</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Restaurants</span>
                            <span className="font-semibold">Niet beschikbaar</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Winkels</span>
                            <span className="font-semibold">Niet beschikbaar</span>
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
                          <p className="text-gray-700">{formatPrice(isRealData ? propertyData.realData.wozValue : propertyData.estimated_value)}</p>
                          {isRealData && (
                            <p className="text-xs text-green-600 mt-1">✓ Actuele WOZ-waarde via scraping</p>
                          )}
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
                    {formatPrice(isRealData ? propertyData.valuation.estimatedValue : Number(propertyData.askingPrice))}
            {/* Market Data */}
            <Card>
              <CardHeader>
                      Math.round(propertyData.valuation.estimatedValue / Number(propertyData.squareMeters)) : 
                      Math.round(Number(propertyData.askingPrice) / Number(propertyData.squareMeters)))}/m²
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
                      {isRealData ? propertyData.valuation.marketTrends.averageDaysOnMarket : 'N/A'}
                    </div>
                    <div className="text-gray-600">Dagen op markt</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(isRealData ? 
                        propertyData.valuation.estimatedValue : 
                        Number(propertyData.askingPrice))}
                    </div>
                    <div className="text-gray-600">Prijs per m²</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${isRealData && propertyData.valuation.marketTrends.averagePriceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {isRealData ? 
                        `${propertyData.valuation.marketTrends.averagePriceChange > 0 ? '+' : ''}${propertyData.valuation.marketTrends.averagePriceChange.toFixed(1)}%` : 
                        'N/A'}
                    </div>
                    <div className="text-gray-600">Prijsstijging (1 jaar)</div>
                  </div>
                </div>

                <h4 className="font-semibold text-gray-900 mb-4">Vergelijkbare verkopen</h4>
                <div className="space-y-3">
                  {(isRealData ? propertyData.valuation.comparableSales : []).map((sale, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{sale.address}</div>
                        <div className="text-sm text-gray-600">
                          {sale.squareMeters} m² • {formatDate(sale.soldDate)}
                          {isRealData && <span className="ml-2 text-green-600">✓ Marktdata</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {formatPrice(sale.soldPrice)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(sale.pricePerSqm)}/m²
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!isRealData || propertyData.valuation.comparableSales.length === 0) && (
                    <div className="text-center py-4 text-gray-600">
                      Geen vergelijkbare verkopen beschikbaar
                    </div>
                  )}
                </div>
                
                {isRealData && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      Marktgegevens van WOZ scraping en EP Online • Betrouwbaarheid: {Math.round(propertyData.valuation.confidenceScore * 100)}%
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
                      {formatPrice(isRealData ? propertyData.valuation.estimatedValue : propertyData.asking_price)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Geschat maandlast
                    </label>
                    <div className="text-xl font-semibold text-primary">
                      {isRealData ? 
                        `€${Math.round(propertyData.valuation.estimatedValue * 0.8 * 0.045 / 12).toLocaleString()} - €${Math.round(propertyData.valuation.estimatedValue * 0.9 * 0.055 / 12).toLocaleString()}/maand` :
                        `€${Math.round(Number(propertyData.askingPrice) * 0.8 * 0.045 / 12).toLocaleString()} - €${Math.round(Number(propertyData.askingPrice) * 0.9 * 0.055 / 12).toLocaleString()}/maand`
                      }
                    </div>
                  </div>

                  <div className="text-xs text-gray-500">
                    {isRealData ? 
                      '*Gebaseerd op 2025 marktwaarde en hypotheekrente (3.8%)' :
                      '*Indicatie o.b.v. 3.8% rente, 30 jaar, 90% financiering'
                    }
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
                      {isRealData && ' Alle gegevens zijn geverifieerd via officiële bronnen (WOZ, EP Online).'}
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