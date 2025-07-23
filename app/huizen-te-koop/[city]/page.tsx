"use client"

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertyGrid } from '@/components/marketplace/property-grid'
import { StructuredData } from '@/components/seo/structured-data'
import { SEOUrlGenerator } from '@/lib/seo/url-generator'
import { 
  MapPin, 
  TrendingUp, 
  Home, 
  Euro, 
  Calendar,
  Users,
  BarChart3,
  Search,
  Filter
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Metadata } from 'next'

// Enhanced city data with SEO-optimized content
const cityData: Record<string, any> = {
  'amsterdam': {
    name: 'Amsterdam',
    province: 'Noord-Holland',
    population: '872.000',
    averagePrice: 675000,
    priceChange: '+6.8%',
    activeListings: 847,
    averageDays: 16,
    description: 'Amsterdam is de hoofdstad van Nederland en een van de meest gewilde woningmarkten van Europa. Met zijn historische grachtengordel, bruisende cultuur en sterke economie trekt de stad kopers uit de hele wereld. Huizen te koop in Amsterdam variëren van karakteristieke grachtenpanden tot moderne nieuwbouwprojecten.',
    seoDescription: 'Ontdek huizen te koop in Amsterdam. Van grachtenpanden tot moderne appartementen. Bekijk het actuele aanbod van particuliere verkopers zonder makelaarskosten.',
    neighborhoods: [
      { name: 'Centrum', slug: 'centrum', avgPrice: 850000, demand: 'Zeer hoog', description: 'Historisch centrum met grachtenpanden' },
      { name: 'Jordaan', slug: 'jordaan', avgPrice: 750000, demand: 'Hoog', description: 'Karakteristieke buurt met authentieke sfeer' },
      { name: 'De Pijp', slug: 'de-pijp', avgPrice: 650000, demand: 'Hoog', description: 'Trendy wijk met veel restaurants en cafés' },
      { name: 'Oud-Zuid', slug: 'oud-zuid', avgPrice: 900000, demand: 'Zeer hoog', description: 'Chique buurt met Vondelpark en musea' },
      { name: 'Noord', slug: 'noord', avgPrice: 550000, demand: 'Groeiend', description: 'Opkomende wijk met creatieve hotspots' },
      { name: 'Oost', slug: 'oost', avgPrice: 600000, demand: 'Hoog', description: 'Diverse buurt met Park Frankendael' }
    ],
    priceRanges: [
      { name: 'Onder €500k', slug: 'onder-500k-euro', min: 0, max: 500000 },
      { name: '€500k - €750k', slug: 'tussen-500k-750k-euro', min: 500000, max: 750000 },
      { name: '€750k - €1M', slug: 'tussen-750k-1000k-euro', min: 750000, max: 1000000 },
      { name: 'Boven €1M', slug: 'vanaf-1000k-euro', min: 1000000, max: null }
    ],
    propertyTypes: [
      { name: 'Eengezinswoningen', slug: 'huizen', type: 'HOUSE' },
      { name: 'Appartementen', slug: 'appartementen', type: 'APARTMENT' },
      { name: 'Rijtjeshuizen', slug: 'rijtjeshuizen', type: 'TOWNHOUSE' }
    ]
  },
  'rotterdam': {
    name: 'Rotterdam',
    province: 'Zuid-Holland',
    population: '651.000',
    averagePrice: 385000,
    priceChange: '+8.2%',
    activeListings: 523,
    averageDays: 24,
    description: 'Rotterdam is de tweede stad van Nederland en staat bekend om zijn moderne architectuur en grote haven. De woningmarkt groeit snel met veel nieuwe ontwikkelingen. Huizen te koop in Rotterdam bieden uitstekende waarde voor geld vergeleken met Amsterdam.',
    seoDescription: 'Huizen te koop in Rotterdam. Moderne architectuur en betaalbare prijzen. Ontdek woningen van particulieren in de Maasstad zonder makelaarskosten.',
    neighborhoods: [
      { name: 'Centrum', slug: 'centrum', avgPrice: 450000, demand: 'Hoog', description: 'Modern stadscentrum met skyline' },
      { name: 'Kralingen', slug: 'kralingen', avgPrice: 520000, demand: 'Hoog', description: 'Groene wijk met villa\'s en water' },
      { name: 'Hillegersberg', slug: 'hillegersberg', avgPrice: 650000, demand: 'Gemiddeld', description: 'Rustige woonwijk met veel groen' },
      { name: 'Blijdorp', slug: 'blijdorp', avgPrice: 380000, demand: 'Gemiddeld', description: 'Familievriendelijke buurt bij de dierentuin' },
      { name: 'Feijenoord', slug: 'feijenoord', avgPrice: 320000, demand: 'Groeiend', description: 'Opkomende wijk aan de Maas' },
      { name: 'Delfshaven', slug: 'delfshaven', avgPrice: 350000, demand: 'Groeiend', description: 'Historische haven met karakter' }
    ],
    priceRanges: [
      { name: 'Onder €300k', slug: 'onder-300k-euro', min: 0, max: 300000 },
      { name: '€300k - €450k', slug: 'tussen-300k-450k-euro', min: 300000, max: 450000 },
      { name: '€450k - €600k', slug: 'tussen-450k-600k-euro', min: 450000, max: 600000 },
      { name: 'Boven €600k', slug: 'vanaf-600k-euro', min: 600000, max: null }
    ],
    propertyTypes: [
      { name: 'Eengezinswoningen', slug: 'huizen', type: 'HOUSE' },
      { name: 'Appartementen', slug: 'appartementen', type: 'APARTMENT' },
      { name: 'Rijtjeshuizen', slug: 'rijtjeshuizen', type: 'TOWNHOUSE' }
    ]
  },
  'den-haag': {
    name: 'Den Haag',
    province: 'Zuid-Holland',
    population: '548.000',
    averagePrice: 485000,
    priceChange: '+7.8%',
    activeListings: 412,
    averageDays: 22,
    description: 'Den Haag is de regeringszetel van Nederland en internationaal centrum. De woningmarkt profiteert van de aanwezigheid van overheidsinstellingen en internationale organisaties. Huizen te koop in Den Haag combineren stedelijke voorzieningen met nabijheid van strand en natuur.',
    seoDescription: 'Huizen te koop in Den Haag. Van Scheveningen tot Benoordenhout. Ontdek woningen in de hofstad van particuliere verkopers.',
    neighborhoods: [
      { name: 'Centrum', slug: 'centrum', avgPrice: 550000, demand: 'Hoog', description: 'Politiek hart van Nederland' },
      { name: 'Scheveningen', slug: 'scheveningen', avgPrice: 620000, demand: 'Zeer hoog', description: 'Badplaats aan de Noordzee' },
      { name: 'Benoordenhout', slug: 'benoordenhout', avgPrice: 750000, demand: 'Hoog', description: 'Chique wijk met ambassades' },
      { name: 'Voorburg', slug: 'voorburg', avgPrice: 480000, demand: 'Gemiddeld', description: 'Rustige voorstad met goede verbindingen' },
      { name: 'Wassenaar', slug: 'wassenaar', avgPrice: 850000, demand: 'Gemiddeld', description: 'Exclusieve gemeente bij Den Haag' },
      { name: 'Leidschenveen', slug: 'leidschenveen', avgPrice: 420000, demand: 'Groeiend', description: 'Moderne nieuwbouwwijk' }
    ],
    priceRanges: [
      { name: 'Onder €400k', slug: 'onder-400k-euro', min: 0, max: 400000 },
      { name: '€400k - €600k', slug: 'tussen-400k-600k-euro', min: 400000, max: 600000 },
      { name: '€600k - €800k', slug: 'tussen-600k-800k-euro', min: 600000, max: 800000 },
      { name: 'Boven €800k', slug: 'vanaf-800k-euro', min: 800000, max: null }
    ],
    propertyTypes: [
      { name: 'Eengezinswoningen', slug: 'huizen', type: 'HOUSE' },
      { name: 'Appartementen', slug: 'appartementen', type: 'APARTMENT' },
      { name: 'Rijtjeshuizen', slug: 'rijtjeshuizen', type: 'TOWNHOUSE' }
    ]
  },
  'utrecht': {
    name: 'Utrecht',
    province: 'Utrecht',
    population: '361.000',
    averagePrice: 525000,
    priceChange: '+8.5%',
    activeListings: 389,
    averageDays: 18,
    description: 'Utrecht ligt in het hart van Nederland en is een belangrijke studentenstad. De centrale ligging en universiteit zorgen voor een dynamische woningmarkt. Huizen te koop in Utrecht profiteren van de uitstekende bereikbaarheid en groeiende economie.',
    seoDescription: 'Huizen te koop in Utrecht. Centrale ligging en universitaire sfeer. Bekijk woningen van particulieren in het hart van Nederland.',
    neighborhoods: [
      { name: 'Centrum', slug: 'centrum', avgPrice: 650000, demand: 'Zeer hoog', description: 'Historisch centrum met Domtoren' },
      { name: 'Wittevrouwen', slug: 'wittevrouwen', avgPrice: 580000, demand: 'Hoog', description: 'Gewilde woonwijk nabij centrum' },
      { name: 'Lombok', slug: 'lombok', avgPrice: 450000, demand: 'Hoog', description: 'Multiculturele buurt in opkomst' },
      { name: 'Zuilen', slug: 'zuilen', avgPrice: 380000, demand: 'Groeiend', description: 'Betaalbare wijk met potentieel' },
      { name: 'Leidsche Rijn', slug: 'leidsche-rijn', avgPrice: 520000, demand: 'Hoog', description: 'Moderne nieuwbouwwijk' },
      { name: 'Nieuwegein', slug: 'nieuwegein', avgPrice: 420000, demand: 'Gemiddeld', description: 'Zelfstandige gemeente bij Utrecht' }
    ],
    priceRanges: [
      { name: 'Onder €400k', slug: 'onder-400k-euro', min: 0, max: 400000 },
      { name: '€400k - €600k', slug: 'tussen-400k-600k-euro', min: 400000, max: 600000 },
      { name: '€600k - €800k', slug: 'tussen-600k-800k-euro', min: 600000, max: 800000 },
      { name: 'Boven €800k', slug: 'vanaf-800k-euro', min: 800000, max: null }
    ],
    propertyTypes: [
      { name: 'Eengezinswoningen', slug: 'huizen', type: 'HOUSE' },
      { name: 'Appartementen', slug: 'appartementen', type: 'APARTMENT' },
      { name: 'Rijtjeshuizen', slug: 'rijtjeshuizen', type: 'TOWNHOUSE' }
    ]
  }
}

export default function SEOCityPropertyPage() {
  const params = useParams();
  const citySlug = typeof params.city === 'string' ? params.city : Array.isArray(params.city) ? params.city[0] : '';
  const city = cityData[citySlug];
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
    notFound()
  }

  const breadcrumbs = SEOUrlGenerator.generateBreadcrumbs(`/huizen-te-koop/${citySlug}`)

  return (
    <>
      <StructuredData type="BreadcrumbList" data={{ items: breadcrumbs }} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Huizen te koop in {city.name}
              </h1>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8">
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
          {/* Quick Navigation */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Zoek op type en prijsklasse
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* Property Types */}
              {city.propertyTypes.map((type: any, index: number) => (
                <Link 
                  key={index}
                  href={`/${type.slug}-te-koop/${citySlug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{type.name} in {city.name}</div>
                  <div className="text-sm text-gray-600">Bekijk alle {type.name.toLowerCase()}</div>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Price Ranges */}
              {city.priceRanges.map((range: any, index: number) => (
                <Link 
                  key={index}
                  href={`/huizen-te-koop/${citySlug}/${range.slug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{range.name}</div>
                  <div className="text-sm text-gray-600">Woningen in {city.name}</div>
                </Link>
              ))}
            </div>
          </section>

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
          </div>

          {/* Neighborhoods */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Populaire wijken in {city.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {city.neighborhoods.map((neighborhood: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/huizen-te-koop/${citySlug}/${neighborhood.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-lg text-gray-900">
                            {neighborhood.name}
                          </h3>
                          <Badge variant={neighborhood.demand === 'Zeer hoog' ? 'default' : 'outline'}>
                            {neighborhood.demand}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{neighborhood.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Gemiddelde prijs:</span>
                          <span className="font-semibold text-primary">
                            {formatPrice(neighborhood.avgPrice)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Wil je je huis verkopen in {city.name}?
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Krijg een gratis taxatie en plaats je advertentie zonder makelaarskosten
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={`/huis-verkopen/${citySlug}`}>
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    Verkoop in {city.name}
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