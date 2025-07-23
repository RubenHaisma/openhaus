"use client"

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { StructuredData } from '@/components/seo/structured-data'
import { SEOUrlGenerator } from '@/lib/seo/url-generator'
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

export default function SEOPropertyDetailPage() {
  const params = useParams();
  const city = typeof params.city === 'string' ? params.city : Array.isArray(params.city) ? params.city[0] : '';
  const property = typeof params.property === 'string' ? params.property : Array.isArray(params.property) ? params.property[0] : '';

  // Extract address from property slug (assumes address is first part, separated by '-')
  const addressName = property.split('-')[0];
  const cityName = city;

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [propertyData, setPropertyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buurtMetrics, setBuurtMetrics] = useState<any>(null)
  const [buurtMetricsLoading, setBuurtMetricsLoading] = useState(false)

  // Extract property ID from the URL slug
  const extractPropertyId = (propertySlug: string): string | null => {
    // Property slug format: address-bedrooms-kamers-price-euro
    // We need to find the property by matching address and city
    // For now, return a mock ID - in production, you'd query the database
    return 'mock-property-id'
  }

  useEffect(() => {
    const loadProperty = async () => {
      try {
        // Extract the property ID from the URL slug and query the REAL database
        let propertyId = extractPropertyId(property)
        
        if (!propertyId) {
          // Try to find property by address and city in database
          const searchResponse = await fetch(`/api/properties/search?city=${encodeURIComponent(cityName)}&limit=100`)
          if (searchResponse.ok) {
            const searchData = await searchResponse.json()
            const matchingProperty = searchData.properties?.find((p: any) => 
              p.address.toLowerCase().includes(addressName.toLowerCase()) ||
              addressName.toLowerCase().includes(p.address.toLowerCase())
            )
            if (matchingProperty) {
              propertyId = matchingProperty.id
            }
          }
        }
        
        if (!propertyId) {
          setError('Property not found in database')
          setLoading(false)
          return
        }

        // Get REAL property data from database
        const response = await fetch(`/api/properties/${propertyId}`)
        if (!response.ok) {
          throw new Error('Property not found in database')
        }
        
        const realProperty = await response.json()
        
        // Validate that we have real data
        if (!realProperty || !realProperty.address || !realProperty.askingPrice) {
          throw new Error('Invalid property data - missing required fields')
        }

        setPropertyData(realProperty)
      } catch (error) {
        console.error('Failed to load property:', error)
        setError(`Failed to load property: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [city, property])

  // Load neighborhood metrics
  useEffect(() => {
    if (!propertyData) return
    
    const addressQuery = `${propertyData.address}, ${propertyData.postalCode} ${propertyData.city}`
    setBuurtMetricsLoading(true)
    
    fetch(`/api/properties/city-stats/metrics?q=${encodeURIComponent(addressQuery)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        setBuurtMetrics(data)
      })
      .catch(() => {
        setBuurtMetrics(null)
      })
      .finally(() => setBuurtMetricsLoading(false))
  }, [propertyData])

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
    notFound()
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": `${propertyData.address}, ${propertyData.city}`,
    "description": propertyData.description,
    "url": `https://openhaus.nl/huis-te-koop/${city}/${property}`,
    "image": propertyData.images,
    "price": {
      "@type": "PriceSpecification",
      "price": propertyData.askingPrice,
      "priceCurrency": "EUR"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": propertyData.address,
      "addressLocality": propertyData.city,
      "postalCode": propertyData.postalCode,
      "addressCountry": "NL"
    },
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": propertyData.squareMeters,
      "unitCode": "MTK"
    },
    "numberOfRooms": propertyData.bedrooms,
    "numberOfBathroomsTotal": propertyData.bathrooms,
    "yearBuilt": propertyData.constructionYear,
    "energyEfficiencyRating": propertyData.energyLabel
  }

  const breadcrumbs = SEOUrlGenerator.generateBreadcrumbs(`/huis-te-koop/${city}/${property}`)

  return (
    <>
      <StructuredData type="RealEstateListing" data={structuredData} />
      <StructuredData type="BreadcrumbList" data={{ items: breadcrumbs }} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Image Gallery */}
        <div className="relative h-96 md:h-[500px] bg-gray-900">
          <Image
            src={propertyData.images?.[currentImageIndex] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
            alt={`${propertyData.address}, ${propertyData.city} - Te koop voor ${formatPrice(propertyData.askingPrice)}`}
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
          {/* Breadcrumbs */}
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-medium">{crumb.name}</span>
                  ) : (
                    <Link href={crumb.url} className="hover:text-primary">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

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
                            {propertyData.city}, {propertyData.province}, {propertyData.postalCode}
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
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Beschrijving van {propertyData.address}
                      </h2>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {propertyData.description}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="mt-6">
                  <Card>
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Kenmerken</h2>
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
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Buurt: {propertyData.city}
                      </h2>
                      {buurtMetricsLoading ? (
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Loader2 className="animate-spin w-5 h-5" />
                          <span>Laden buurtdata...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Bereikbaarheid</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>OV-verbindingen</span>
                                <span className="font-semibold">
                                  {buurtMetrics?.transitStops || 'Laden...'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fietsinfrastructuur</span>
                                <span className="font-semibold">
                                  {buurtMetrics?.bikeInfra || 'Laden...'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-3">Voorzieningen</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Scholen</span>
                                <span className="font-semibold">
                                  {buurtMetrics?.schools || 'Laden...'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Restaurants</span>
                                <span className="font-semibold">
                                  {buurtMetrics?.restaurants || 'Laden...'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Winkels</span>
                                <span className="font-semibold">
                                  {buurtMetrics?.shops || 'Laden...'}
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
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Juridische informatie</h2>
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card className="sticky top-8">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Interesse in deze woning?
                    </h3>
                    <p className="text-gray-600">
                      Neem contact op voor meer informatie of een bezichtiging
                    </p>
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
                    <Link href={`/huis-te-koop/${city}/${property}/contact`}>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
                        <Euro className="w-5 h-5 mr-2" />
                        Contact opnemen
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Related Properties */}
              <Card>
                <CardHeader>
                  <CardTitle>Vergelijkbare woningen in {propertyData.city}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link 
                      href={`/huizen-te-koop/${city}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        Alle woningen in {propertyData.city}
                      </div>
                      <div className="text-sm text-gray-600">
                        Bekijk meer woningen in deze stad
                      </div>
                    </Link>
                    
                    <Link 
                      href={`/huizen-te-koop/${city}/onder-${Math.round(propertyData.askingPrice / 1000)}k-euro`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        Woningen onder {formatPrice(propertyData.askingPrice)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Vergelijkbare prijsklasse
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}