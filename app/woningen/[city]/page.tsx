"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertyGrid } from '@/components/marketplace/property-grid'
import { StructuredData } from '@/components/seo/structured-data'
import { 
  MapPin, 
  TrendingUp, 
  Home, 
  Euro, 
  Calendar,
  Users,
  BarChart3,
  Search
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Metadata } from 'next'

// City data for SEO and content
const cityData: Record<string, any> = {
  'amsterdam': {
    name: 'Amsterdam',
    province: 'Noord-Holland',
    population: '872.000',
    averagePrice: 675000,
    priceChange: '+6.8%',
    activeListings: 847,
    averageDays: 16,
    description: 'Amsterdam is de hoofdstad van Nederland en een van de meest gewilde woningmarkten van Europa. Met zijn historische grachtengordel, bruisende cultuur en sterke economie trekt de stad kopers uit de hele wereld.',
    neighborhoods: ['Centrum', 'Jordaan', 'De Pijp', 'Oud-Zuid', 'Noord', 'Oost'],
    highlights: [
      'Historische grachtengordel',
      'Uitstekende openbaar vervoer',
      'Internationale bedrijven',
      'Culturele hotspot',
      'Sterke huurmarkt'
    ],
    marketTrends: {
      yearOverYear: '+6.8%',
      quarterOverQuarter: '+2.1%',
      forecast: 'Stabiele groei verwacht'
    }
  },
  'rotterdam': {
    name: 'Rotterdam',
    province: 'Zuid-Holland',
    population: '651.000',
    averagePrice: 385000,
    priceChange: '+8.2%',
    activeListings: 523,
    averageDays: 24,
    description: 'Rotterdam is de tweede stad van Nederland en staat bekend om zijn moderne architectuur en grote haven. De woningmarkt groeit snel met veel nieuwe ontwikkelingen.',
    neighborhoods: ['Centrum', 'Kralingen', 'Hillegersberg', 'Blijdorp', 'Feijenoord', 'Delfshaven'],
    highlights: [
      'Moderne architectuur',
      'Grootste haven van Europa',
      'Betaalbare woningmarkt',
      'Snelle ontwikkeling',
      'Goede bereikbaarheid'
    ],
    marketTrends: {
      yearOverYear: '+8.2%',
      quarterOverQuarter: '+3.1%',
      forecast: 'Sterke groei verwacht'
    }
  },
  'den-haag': {
    name: 'Den Haag',
    province: 'Zuid-Holland',
    population: '548.000',
    averagePrice: 485000,
    priceChange: '+7.8%',
    activeListings: 412,
    averageDays: 22,
    description: 'Den Haag is de regeringszetel van Nederland en internationaal centrum. De woningmarkt profiteert van de aanwezigheid van overheidsinstellingen en internationale organisaties.',
    neighborhoods: ['Centrum', 'Scheveningen', 'Benoordenhout', 'Voorburg', 'Wassenaar', 'Leidschenveen'],
    highlights: [
      'Regeringszetel',
      'Internationale organisaties',
      'Strand van Scheveningen',
      'Groene wijken',
      'Stabiele werkgelegenheid'
    ],
    marketTrends: {
      yearOverYear: '+7.8%',
      quarterOverQuarter: '+2.8%',
      forecast: 'Gestage groei'
    }
  },
  'utrecht': {
    name: 'Utrecht',
    province: 'Utrecht',
    population: '361.000',
    averagePrice: 525000,
    priceChange: '+8.5%',
    activeListings: 389,
    averageDays: 18,
    description: 'Utrecht ligt in het hart van Nederland en is een belangrijke studentenstad. De centrale ligging en universiteit zorgen voor een dynamische woningmarkt.',
    neighborhoods: ['Centrum', 'Wittevrouwen', 'Lombok', 'Zuilen', 'Leidsche Rijn', 'Nieuwegein'],
    highlights: [
      'Centrale ligging Nederland',
      'Universiteitsstad',
      'Historisch centrum',
      'Uitstekende bereikbaarheid',
      'Jonge bevolking'
    ],
    marketTrends: {
      yearOverYear: '+8.5%',
      quarterOverQuarter: '+3.2%',
      forecast: 'Zeer sterke groei'
    }
  }
}

export default function CityPropertyPage() {
  const params = useParams()
  const citySlug = params.city as string
  const city = cityData[citySlug]
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetch(`/api/properties/search?city=${city?.name}&limit=12`)
        if (response.ok) {
          const data = await response.json()
          setProperties(data.properties || [])
        }
      } catch (error) {
        console.error('Failed to load properties:', error)
      } finally {
        setLoading(false)
      }
    }

    if (city) {
      loadProperties()
    } else {
      setLoading(false)
    }
  }, [city])

  const handleFavorite = (propertyId: string) => {
    setFavorites(prev => 
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    )
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (!city) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stad niet gevonden</h1>
          <p className="text-gray-600 mb-6">Deze stad is nog niet beschikbaar op ons platform.</p>
          <Link href="/buy">
            <Button>Bekijk alle woningen</Button>
          </Link>
        </div>
      </div>
    )
  }

  const breadcrumbData = {
    items: [
      { name: 'Home', url: '/' },
      { name: 'Woningen', url: '/buy' },
      { name: city.name, url: `/woningen/${citySlug}` }
    ]
  }

  return (
    <>
      <StructuredData type="BreadcrumbList" data={breadcrumbData} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Woningen te koop in {city.name}
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                {city.description}
              </p>
              
              <div className="flex flex-wrap justify-center gap-8 text-lg">
                <div className="flex items-center space-x-2">
                  <Home className="w-6 h-6 text-blue-600" />
                  <span><strong>{city.activeListings}</strong> woningen beschikbaar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Euro className="w-6 h-6 text-green-600" />
                  <span>Gemiddeld <strong>{formatPrice(city.averagePrice)}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <span><strong>{city.priceChange}</strong> prijsstijging</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Market Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{city.activeListings}</div>
                <div className="text-gray-600">Actieve advertenties</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{formatPrice(city.averagePrice)}</div>
                <div className="text-gray-600">Gemiddelde prijs</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{city.averageDays}</div>
                <div className="text-gray-600">Dagen op markt</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{city.priceChange}</div>
                <div className="text-gray-600">Prijsstijging (1 jaar)</div>
              </CardContent>
            </Card>
          </div>

          {/* Property Listings */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Beschikbare woningen in {city.name}
              </h2>
              <Link href={`/search?location=${city.name}`}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Verfijn zoeken</span>
                </Button>
              </Link>
            </div>

            <PropertyGrid
              properties={properties}
              loading={loading}
              onFavorite={handleFavorite}
              favorites={favorites}
            />

            {properties.length === 0 && !loading && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Geen woningen beschikbaar
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Er zijn momenteel geen woningen beschikbaar in {city.name}. 
                    Probeer het later opnieuw of bekijk andere steden.
                  </p>
                  <Link href="/buy">
                    <Button>Bekijk alle woningen</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* City Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Neighborhoods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  <span>Populaire wijken in {city.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {city.neighborhoods.map((neighborhood: string, index: number) => (
                    <Link 
                      key={index} 
                      href={`/woningen/${citySlug}/${neighborhood.toLowerCase().replace(/\s+/g, '-')}`}
                      className="p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{neighborhood}</div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* City Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-6 h-6 text-primary" />
                  <span>Waarom wonen in {city.name}?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {city.highlights.map((highlight: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Market Trends */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                <span>Woningmarkt trends {city.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {city.marketTrends.yearOverYear}
                  </div>
                  <div className="text-gray-600">Jaar-op-jaar groei</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {city.marketTrends.quarterOverQuarter}
                  </div>
                  <div className="text-gray-600">Kwartaal groei</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 mb-2">
                    {city.marketTrends.forecast}
                  </div>
                  <div className="text-gray-600">Vooruitzichten 2024</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Wil je je huis verkopen in {city.name}?
              </h3>
              <p className="text-lg opacity-90 mb-6">
                Krijg een gratis taxatie en plaats je advertentie zonder makelaarskosten
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/list-property">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    Plaats je woning
                  </Button>
                </Link>
                <Link href="/instant-offer">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                  >
                    Gratis taxatie
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}