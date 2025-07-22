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

// City data for selling-specific content
const citySellingData: Record<string, any> = {
  'amsterdam': {
    name: 'Amsterdam',
    averagePrice: 675000,
    averageSavings: 13500, // 2% of average price
    averageDays: 16,
    marketActivity: 'Zeer actief',
    demandLevel: 'Hoog',
    priceGrowth: '+6.8%',
    description: 'Amsterdam heeft een van de meest dynamische woningmarkten van Nederland. Door de hoge vraag en beperkte aanbod verkopen woningen snel, vaak binnen enkele weken.',
    sellingTips: [
      'Prijs competitief vanwege hoge concurrentie',
      'Professionele foto\'s zijn essentieel',
      'Reageer snel op interesse',
      'Bereid je voor op snelle beslissingen'
    ],
    neighborhoods: [
      { name: 'Centrum', avgPrice: 850000, demand: 'Zeer hoog' },
      { name: 'Jordaan', avgPrice: 750000, demand: 'Hoog' },
      { name: 'De Pijp', avgPrice: 650000, demand: 'Hoog' },
      { name: 'Oud-Zuid', avgPrice: 900000, demand: 'Zeer hoog' },
      { name: 'Noord', avgPrice: 550000, demand: 'Gemiddeld' },
      { name: 'Oost', avgPrice: 600000, demand: 'Hoog' }
    ]
  },
  'rotterdam': {
    name: 'Rotterdam',
    averagePrice: 385000,
    averageSavings: 7700,
    averageDays: 24,
    marketActivity: 'Actief',
    demandLevel: 'Groeiend',
    priceGrowth: '+8.2%',
    description: 'Rotterdam ervaart sterke groei in de woningmarkt. De stad trekt steeds meer kopers door betaalbare prijzen en moderne ontwikkelingen.',
    sellingTips: [
      'Benadruk moderne aspecten van je woning',
      'Highlight bereikbaarheid en voorzieningen',
      'Vergelijk met Amsterdam prijzen voor perspectief',
      'Toon potentie voor waardestijging'
    ],
    neighborhoods: [
      { name: 'Centrum', avgPrice: 450000, demand: 'Hoog' },
      { name: 'Kralingen', avgPrice: 520000, demand: 'Hoog' },
      { name: 'Hillegersberg', avgPrice: 650000, demand: 'Gemiddeld' },
      { name: 'Blijdorp', avgPrice: 380000, demand: 'Gemiddeld' },
      { name: 'Feijenoord', avgPrice: 320000, demand: 'Groeiend' },
      { name: 'Delfshaven', avgPrice: 350000, demand: 'Groeiend' }
    ]
  },
  'den-haag': {
    name: 'Den Haag',
    averagePrice: 485000,
    averageSavings: 9700,
    averageDays: 22,
    marketActivity: 'Stabiel',
    demandLevel: 'Hoog',
    priceGrowth: '+7.8%',
    description: 'Den Haag biedt een stabiele woningmarkt met constante vraag door overheidsinstellingen en internationale organisaties.',
    sellingTips: [
      'Benadruk nabijheid van strand en centrum',
      'Highlight internationale omgeving',
      'Toon stabiliteit van de markt',
      'Vermeld overheids- en diplomatieke voordelen'
    ],
    neighborhoods: [
      { name: 'Centrum', avgPrice: 550000, demand: 'Hoog' },
      { name: 'Scheveningen', avgPrice: 620000, demand: 'Zeer hoog' },
      { name: 'Benoordenhout', avgPrice: 750000, demand: 'Hoog' },
      { name: 'Voorburg', avgPrice: 480000, demand: 'Gemiddeld' },
      { name: 'Wassenaar', avgPrice: 850000, demand: 'Gemiddeld' },
      { name: 'Leidschenveen', avgPrice: 420000, demand: 'Groeiend' }
    ]
  },
  'utrecht': {
    name: 'Utrecht',
    averagePrice: 525000,
    averageSavings: 10500,
    averageDays: 18,
    marketActivity: 'Zeer actief',
    demandLevel: 'Zeer hoog',
    priceGrowth: '+8.5%',
    description: 'Utrecht heeft een van de snelst groeiende woningmarkten door de centrale ligging en sterke economie.',
    sellingTips: [
      'Benadruk centrale ligging in Nederland',
      'Highlight bereikbaarheid per trein',
      'Toon universitaire omgeving',
      'Vermeld economische groei'
    ],
    neighborhoods: [
      { name: 'Centrum', avgPrice: 650000, demand: 'Zeer hoog' },
      { name: 'Wittevrouwen', avgPrice: 580000, demand: 'Hoog' },
      { name: 'Lombok', avgPrice: 450000, demand: 'Hoog' },
      { name: 'Zuilen', avgPrice: 380000, demand: 'Groeiend' },
      { name: 'Leidsche Rijn', avgPrice: 520000, demand: 'Hoog' },
      { name: 'Nieuwegein', avgPrice: 420000, demand: 'Gemiddeld' }
    ]
  }
}

export default function CitySellingPage() {
  const params = useParams()
  const citySlug = params.city as string
  const city = citySellingData[citySlug]

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
      { name: city.name, url: `/huis-verkopen/${citySlug}` }
    ]
  }

  const faqData = {
    faqs: [
      {
        question: `Hoeveel kost het om een huis te verkopen in ${city.name}?`,
        answer: `Zonder makelaar bespaar je gemiddeld ${formatPrice(city.averageSavings)} aan makelaarskosten in ${city.name}. Je betaalt alleen notariskosten en eventuele advertentiekosten.`
      },
      {
        question: `Hoe lang duurt het om een huis te verkopen in ${city.name}?`,
        answer: `Gemiddeld staat een huis ${city.averageDays} dagen te koop in ${city.name}. Met de juiste prijs en presentatie kan het sneller gaan.`
      },
      {
        question: `Wat is de gemiddelde huizenprijs in ${city.name}?`,
        answer: `De gemiddelde verkoopprijs in ${city.name} is ${formatPrice(city.averagePrice)}. Prijzen variëren sterk per wijk en woningtype.`
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
                Huis Verkopen in {city.name} Zonder Makelaar
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                {city.description} Bespaar gemiddeld <strong>{formatPrice(city.averageSavings)}</strong> aan makelaarskosten.
              </p>
              
              <div className="flex flex-wrap justify-center gap-8 text-lg mb-8">
                <div className="flex items-center space-x-2">
                  <Euro className="w-6 h-6 text-green-600" />
                  <span>Bespaar <strong>{formatPrice(city.averageSavings)}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <span><strong>{city.averageDays} dagen</strong> gemiddeld</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <span><strong>{city.priceGrowth}</strong> groei</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/instant-offer">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3">
                    <Calculator className="w-5 h-5 mr-2" />
                    Gratis taxatie {city.name}
                  </Button>
                </Link>
                <Link href="/sell">
                  <Button size="lg" variant="outline" className="px-8 py-3">
                    <Home className="w-5 h-5 mr-2" />
                    Plaats advertentie
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
              Woningmarkt {city.name} in 2024
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatPrice(city.averagePrice)}
                  </div>
                  <div className="text-gray-600">Gemiddelde prijs</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {city.averageDays}
                  </div>
                  <div className="text-gray-600">Dagen op markt</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {city.demandLevel}
                  </div>
                  <div className="text-gray-600">Vraag niveau</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {city.priceGrowth}
                  </div>
                  <div className="text-gray-600">Prijsgroei (1 jaar)</div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Neighborhood Analysis */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Wijken in {city.name}: Prijzen & Vraag
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
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg text-gray-900 mb-3">
                        {neighborhood.name}
                      </h3>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gemiddelde prijs:</span>
                          <span className="font-semibold">{formatPrice(neighborhood.avgPrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vraag:</span>
                          <Badge variant={neighborhood.demand === 'Zeer hoog' ? 'default' : 'outline'}>
                            {neighborhood.demand}
                          </Badge>
                        </div>
                      </div>
                      <Link href={`/woningen/${citySlug}/${neighborhood.name.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Bekijk woningen
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Selling Tips */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Tips voor verkopen in {city.name}
            </h2>
            
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {city.sellingTips.map((tip: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-3"
                    >
                      <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cost Savings Calculator */}
          <section className="mb-16">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Besparing Calculator {city.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {formatPrice(city.averagePrice)}
                    </div>
                    <div className="text-gray-600">Gemiddelde verkoopprijs</div>
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {formatPrice(city.averageSavings)}
                    </div>
                    <div className="text-gray-600">Makelaarskosten (2%)</div>
                  </div>
                  
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {formatPrice(city.averageSavings)}
                    </div>
                    <div className="text-gray-600">Jouw besparing!</div>
                  </div>
                </div>
                
                <div className="text-center mt-8">
                  <p className="text-gray-700 mb-6">
                    Door je huis zelf te verkopen in {city.name} bespaar je gemiddeld <strong>{formatPrice(city.averageSavings)}</strong> aan makelaarskosten.
                  </p>
                  <Link href="/instant-offer">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      Bereken je exacte besparing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Veelgestelde vragen over verkopen in {city.name}
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
                  Klaar om je huis in {city.name} te verkopen?
                </h2>
                <p className="text-xl opacity-90 mb-6">
                  Start met een gratis taxatie en ontdek wat je huis waard is
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/instant-offer">
                    <Button 
                      size="lg" 
                      className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Gratis taxatie
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