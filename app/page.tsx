"use client"

import { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddressInput } from '@/components/ui/address-input'
import { ValuationResult } from '@/components/valuation/valuation-result'
import { PropertyCard } from '@/components/property/property-card'
import { getPropertyData, calculateValuation, PropertyValuation } from '@/lib/kadaster'
import { 
  Home, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle, 
  Star, 
  ArrowRight,
  Users,
  Award,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

// Mock featured properties
const featuredProperties = [
  {
    id: '1',
    address: 'Keizersgracht 123',
    city: 'Amsterdam',
    asking_price: 875000,
    bedrooms: 3,
    bathrooms: 2,
    square_meters: 120,
    images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
    status: 'available',
    energy_label: 'B',
    description: 'Karakteristieke grachtenpand in het hart van Amsterdam',
    features: ['Tuin', 'Balkon', 'Garage'],
  },
  {
    id: '2',
    address: 'Lange Voorhout 45',
    city: 'Den Haag',
    asking_price: 650000,
    bedrooms: 2,
    bathrooms: 1,
    square_meters: 85,
    images: ['https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg'],
    status: 'available',
    energy_label: 'C',
    description: 'Modern appartement nabij het centrum',
    features: ['Lift', 'Balkon'],
  },
  {
    id: '3',
    address: 'Erasmuslaan 78',
    city: 'Rotterdam',
    asking_price: 425000,
    bedrooms: 4,
    bathrooms: 2,
    square_meters: 140,
    images: ['https://images.pexels.com/photos/323772/pexels-photo-323772.jpeg'],
    status: 'available',
    energy_label: 'A',
    description: 'Ruime eengezinswoning met tuin',
    features: ['Tuin', 'Garage', 'Zonnepanelen'],
  },
]

export default function HomePage() {
  const [valuation, setValuation] = useState<PropertyValuation | null>(null)
  const [searchedAddress, setSearchedAddress] = useState<string>('')
  const [searchedPostalCode, setSearchedPostalCode] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleAddressSearch = async (address: string, postalCode: string) => {
    setLoading(true)
    try {
      const propertyData = await getPropertyData(address, postalCode)
      if (propertyData) {
        const valuationResult = await calculateValuation(propertyData)
        setValuation(valuationResult)
        setSearchedAddress(address)
        setSearchedPostalCode(postalCode)
      }
    } catch (error) {
      console.error('Valuation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSellRequest = () => {
    window.location.href = `/verkopen?address=${encodeURIComponent(searchedAddress)}&postal=${encodeURIComponent(searchedPostalCode)}&value=${valuation?.estimatedValue}`
  }

  if (valuation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ValuationResult
          address={searchedAddress}
          postalCode={searchedPostalCode}
          valuation={valuation}
          onSellRequest={handleSellRequest}
        />
      </div>
    )
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance"
            >
              Verkoop je huis{' '}
              <span className="text-secondary-200">direct</span>
              <br />
              zonder gedoe
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl mb-12 text-primary-100 max-w-3xl mx-auto text-pretty"
            >
              Ontvang een eerlijk bod binnen 2 minuten. Geen makelaarskosten, 
              geen onzekerheid, geen wachtlijsten. Gewoon een snelle, transparante verkoop.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <AddressInput
                onSearch={handleAddressSearch}
                placeholder="Voer je adres in voor een gratis taxatie"
                className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border-0"
                loading={loading}
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap justify-center gap-6 text-sm text-primary-100"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-secondary-300" />
                <span>100% gratis taxatie</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-secondary-300" />
                <span>Geen verplichtingen</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-secondary-300" />
                <span>Direct resultaat</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-neutral-50 border-b border-neutral-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-neutral-900 mb-2">2.500+</div>
              <div className="text-sm text-neutral-600">Huizen verkocht</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-900 mb-2">€450M+</div>
              <div className="text-sm text-neutral-600">Totale waarde</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-900 mb-2">4.8/5</div>
              <div className="text-sm text-neutral-600">Klantbeoordeling</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-900 mb-2">14 dagen</div>
              <div className="text-sm text-neutral-600">Gemiddelde verkoop</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Waarom kiezen voor OpenHaus?
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto text-pretty">
              We maken het verkopen van je huis eenvoudig, snel en transparant
            </p>
          </div>

          <div className="feature-grid">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="card text-center p-8 h-full hover:shadow-large transition-all duration-300">
                <CardContent className="card-content">
                  <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                    Direct bod binnen 2 minuten
                  </h3>
                  <p className="text-neutral-600 text-pretty">
                    Geen weken wachten op kopers. Ontvang een eerlijk bod gebaseerd 
                    op AI-analyse en marktdata van vergelijkbare woningen.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="card text-center p-8 h-full hover:shadow-large transition-all duration-300">
                <CardContent className="card-content">
                  <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-success-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                    100% zekerheid
                  </h3>
                  <p className="text-neutral-600 text-pretty">
                    Geen financieringsvoorbehoud of afvallers. Ons bod is definitief 
                    en we regelen alles van inspectie tot notaris.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Card className="card text-center p-8 h-full hover:shadow-large transition-all duration-300">
                <CardContent className="card-content">
                  <div className="w-16 h-16 bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-secondary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-4">
                    Geen makelaarskosten
                  </h3>
                  <p className="text-neutral-600 text-pretty">
                    Bespaar duizenden euro's aan makelaarskosten. Ons digitale 
                    platform maakt tussenpersonen overbodig.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Zo werkt het
            </h2>
            <p className="text-xl text-neutral-600 text-pretty">
              Van taxatie tot sleuteloverdracht in 4 eenvoudige stappen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Gratis taxatie',
                description: 'Vul je adres in en ontvang direct een nauwkeurige woningwaarde',
                icon: Home
              },
              {
                step: '2',
                title: 'Direct bod',
                description: 'Accepteer ons eerlijke bod of kies voor traditionele verkoop',
                icon: TrendingUp
              },
              {
                step: '3',
                title: 'Inspectie & documenten',
                description: 'We regelen de inspectie en alle juridische documenten',
                icon: CheckCircle
              },
              {
                step: '4',
                title: 'Sleuteloverdracht',
                description: 'Na tekening bij de notaris ontvang je het geld op je rekening',
                icon: Star
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary-500 text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mt-4 shadow-medium">
                    <item.icon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-neutral-600 text-pretty">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section-padding">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                Uitgelichte woningen
              </h2>
              <p className="text-xl text-neutral-600">
                Ontdek ons aanbod van zorgvuldig geselecteerde woningen
              </p>
            </div>
            <Link href="/kopen">
              <Button variant="outline" className="hidden sm:flex items-center space-x-2">
                <span>Alle woningen</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="property-grid">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12 sm:hidden">
            <Link href="/kopen">
              <Button className="btn-primary">
                Alle woningen bekijken
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="section-padding bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Wat onze klanten zeggen
            </h2>
            <p className="text-xl text-neutral-600">
              Meer dan 2.500 tevreden klanten gingen je voor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah van der Berg',
                location: 'Amsterdam',
                rating: 5,
                text: 'Binnen 3 dagen verkocht! Geen gedoe met bezichtigingen en een eerlijke prijs. Precies wat ze beloven.',
                avatar: '/avatars/sarah.jpg'
              },
              {
                name: 'Mark Janssen',
                location: 'Rotterdam',
                rating: 5,
                text: 'Super service en transparant proces. Ze hielden me op de hoogte van elke stap. Aanrader!',
                avatar: '/avatars/mark.jpg'
              },
              {
                name: 'Lisa de Vries',
                location: 'Utrecht',
                rating: 5,
                text: 'Eindelijk een makelaar die doet wat ze zeggen. Snel, eerlijk en professioneel.',
                avatar: '/avatars/lisa.jpg'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="card p-6 h-full">
                  <CardContent className="card-content">
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-neutral-700 mb-6 text-pretty">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-neutral-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900">{testimonial.name}</div>
                        <div className="text-sm text-neutral-600">{testimonial.location}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
              Klaar om je huis te verkopen?
            </h2>
            <p className="text-xl mb-8 text-primary-100 max-w-2xl mx-auto text-pretty">
              Voeg je adres toe en ontdek binnen 2 minuten wat je huis waard is
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button 
                size="lg" 
                className="bg-white text-primary-600 hover:bg-neutral-100 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Start gratis taxatie
              </Button>
              <Link href="/kopen">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl text-lg font-semibold"
                >
                  Bekijk woningen
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}