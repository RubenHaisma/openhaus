"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StructuredData } from '@/components/seo/structured-data'
import { 
  Home, 
  Euro, 
  TrendingUp, 
  Calculator, 
  Clock,
  CheckCircle,
  Users,
  Shield,
  Phone,
  FileText
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Metadata } from 'next'

export default function CitySellingPage() {
  const params = useParams()
  const citySlug = params.city as string
  const [cityData, setCityData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch real city selling data from API
  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const cityName = citySlug.charAt(0).toUpperCase() + citySlug.slice(1)
        const response = await fetch(`/api/properties/city-stats?cities=${cityName}`)
        
        if (response.ok) {
          const stats = await response.json()
          const cityStats = stats.find((s: any) => s.city.toLowerCase() === cityName.toLowerCase())
          
          if (cityStats) {
            setCityData({
              name: cityName,
              averagePrice: cityStats.avgPrice,
              averageSavings: Math.round(cityStats.avgPrice * 0.02), // 2% makelaar kosten
              activeListings: cityStats.count,
              description: `${cityName} biedt uitstekende mogelijkheden voor particuliere verkoop zonder makelaarskosten.`
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch city data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCityData()
  }, [citySlug])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laden van stadsgegevens...</p>
        </div>
      </div>
    )
  }

  if (!cityData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Stad niet gevonden</h1>
          <p className="text-gray-600 mb-6">Deze stad is nog niet beschikbaar voor verkoop informatie.</p>
          <Link href="/sell">
            <Button>Algemene verkoop informatie</Button>
          </Link>
        </div>
      </div>
    )
  }

  const breadcrumbData = {
    items: [
      { name: 'Home', url: '/' },
      { name: 'Huis verkopen', url: '/sell' },
      { name: cityData.name, url: `/huis-verkopen/${citySlug}` }
    ]
  }

  const faqData = {
    faqs: [
      {
        question: `Hoeveel kost het om een huis te verkopen in ${cityData.name}?`,
        answer: `Zonder makelaar bespaar je gemiddeld ${formatPrice(cityData.averageSavings)} aan makelaarskosten in ${cityData.name}. Je betaalt alleen notariskosten en eventuele advertentiekosten.`
      },
      {
        question: `Hoe lang duurt het om een huis te verkopen in ${cityData.name}?`,
        answer: `De verkooptijd varieert per woning en marktomstandigheden in ${cityData.name}. Met de juiste prijs en presentatie kan het sneller gaan.`
      },
      {
        question: `Wat is de gemiddelde huizenprijs in ${cityData.name}?`,
        answer: `De gemiddelde verkoopprijs in ${cityData.name} is ${formatPrice(cityData.averagePrice)}. Prijzen variëren sterk per wijk en woningtype.`
      }
    ]
  }

  return (
    <>
      <StructuredData type="BreadcrumbList" data={breadcrumbData} />
      <StructuredData type="FAQPage" data={faqData} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-green-100 text-green-800">
                Lokale Verkoop Gids
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Huis Verkopen in {cityData.name} Zonder Makelaar
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {cityData.description} Bespaar gemiddeld <strong>{formatPrice(cityData.averageSavings)}</strong> aan makelaarskosten.
              </p>
              
              <div className="flex flex-wrap justify-center gap-8 text-lg mb-8">
                <div className="flex items-center space-x-2">
                  <Euro className="w-6 h-6 text-green-600" />
                  <span>Bespaar <strong>{formatPrice(cityData.averageSavings)}</strong></span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/list-property">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3">
                    <Calculator className="w-5 h-5 mr-2" />
                    Plaats je woning
                  </Button>
                </Link>
                <Link href="/instant-offer">
                  <Button size="lg" variant="outline" className="px-8 py-3">
                    <Calculator className="w-5 h-5 mr-2" />
                    Gratis taxatie
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Market Overview */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Woningmarkt {cityData.name} in 2025
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatPrice(cityData.averagePrice)}
                  </div>
                  <div className="text-gray-600">Gemiddelde prijs</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {cityData.activeListings}
                  </div>
                  <div className="text-gray-600">Actieve advertenties</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    Hoog
                  </div>
                  <div className="text-gray-600">Vraag niveau</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    +6.2%
                  </div>
                  <div className="text-gray-600">Prijsgroei (1 jaar)</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Cost Savings Calculator */}
          <section className="mb-16">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Besparing Calculator {cityData.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatPrice(cityData.averagePrice)}
                    </div>
                    <div className="text-gray-600">Gemiddelde verkoopprijs</div>
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {formatPrice(cityData.averageSavings)}
                    </div>
                    <div className="text-gray-600">Makelaarskosten (2%)</div>
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatPrice(cityData.averageSavings)}
                    </div>
                    <div className="text-gray-600">Jouw besparing!</div>
                  </div>
                </div>
                
                <div className="text-center mt-8">
                  <p className="text-gray-700 mb-6">
                    Door je huis via ons platform te verkopen in {cityData.name} bespaar je gemiddeld <strong>{formatPrice(cityData.averageSavings)}</strong> aan makelaarskosten.
                  </p>
                  <Link href="/list-property">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      Plaats je woning
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Veelgestelde vragen over verkopen in {cityData.name}
            </h2>
            
            <div className="space-y-6">
              {faqData.faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-3">
                        {faq.question}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section>
            <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Klaar om je huis in {cityData.name} te verkopen?
                </h2>
                <p className="text-xl opacity-90 mb-6">
                  Start met een gratis taxatie en ontdek wat je huis waard is
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/list-property">
                    <Button 
                      size="lg" 
                      className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Plaats je woning
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    020 123 4567
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  )
}