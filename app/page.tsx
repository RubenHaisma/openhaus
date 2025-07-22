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
  Zap,
  Search,
  MapPin,
  Calculator,
  DollarSign,
  Calendar,
  FileText
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
      // Show user-friendly error message
      alert(`Fout bij het ophalen van woninggegevens: ${error.message}`)
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
      {/* Hero Section - OpenDoor Style */}
      <section className="opendoor-hero min-h-screen flex items-center">
        <div className="hero-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center min-h-[80vh]">
            {/* Left Column - Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Nieuw: Nu ook beschikbaar in Duitsland en Frankrijk
                </div>
                
                <h1 className="text-6xl lg:text-8xl font-bold text-gray-900 leading-[0.9] tracking-tight">
                  Verkoop je huis{' '}
                  <span className="text-primary relative">
                    direct
                    <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" fill="none">
                      <path d="M2 10C60 2 140 2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <br />
                  <span className="text-gray-600">zonder gedoe</span>
                </h1>
                
                <p className="text-2xl lg:text-3xl text-gray-600 leading-relaxed max-w-2xl font-light">
                  Ontvang een <strong className="font-semibold text-gray-900">eerlijk bod binnen 2 minuten</strong>. 
                  Geen makelaarskosten, geen onzekerheid, geen wachtlijsten. 
                  <br />Gewoon een snelle, transparante verkoop.
                </p>
              </div>

              {/* Address Search */}
              <div className="space-y-6">
                <AddressInput
                  onSearch={handleAddressSearch}
                  placeholder="Voer je volledige adres in voor een gratis taxatie..."
                  className="opendoor-input shadow-2xl h-16 text-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20"
                  loading={loading}
                />
                
                <div className="flex flex-wrap items-center gap-8 text-base text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">100% gratis taxatie</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">Geen verplichtingen</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">Direct resultaat</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:pl-8"
            >
              <div className="relative group">
                {/* Main Image */}
                <img
                  src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg"
                  alt="Modern house"
                  className="w-full h-[400px] lg:h-[600px] object-cover rounded-3xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-red-400 to-pink-600 rounded-full opacity-20 blur-xl"></div>
                
                {/* Floating Stats Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">2.847</div>
                      <div className="text-sm text-gray-600 font-medium">Huizen verkocht</div>
                    </div>
                    <div className="w-px h-16 bg-gray-200"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">€650M+</div>
                      <div className="text-sm text-gray-600 font-medium">Totale waarde</div>
                    </div>
                  </div>
                  
                  {/* Trust Indicators */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Live data</span>
                      </div>
                      <span>•</span>
                      <span>Laatste update: vandaag</span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Additional Floating Element */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="absolute top-8 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">+12%</div>
                      <div className="text-xs text-gray-600">Dit jaar</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">2.500+</div>
              <div className="text-gray-600">Huizen verkocht</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-primary mb-2">€450M+</div>
              <div className="text-gray-600">Totale waarde</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">4.8/5</div>
              <div className="text-gray-600">Klantbeoordeling</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-gray-900 mb-2">14 dagen</div>
              <div className="text-gray-600">Gemiddelde verkoop</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            >
              Zo werkt het
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Van taxatie tot sleuteloverdracht in 4 eenvoudige stappen
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Gratis taxatie',
                description: 'Vul je adres in en ontvang direct een nauwkeurige woningwaarde',
                icon: Calculator,
                color: 'bg-blue-500'
              },
              {
                step: '2',
                title: 'Direct bod',
                description: 'Accepteer ons eerlijke bod of kies voor traditionele verkoop',
                icon: DollarSign,
                color: 'bg-green-500'
              },
              {
                step: '3',
                title: 'Inspectie & documenten',
                description: 'We regelen de inspectie en alle juridische documenten',
                icon: FileText,
                color: 'bg-purple-500'
              },
              {
                step: '4',
                title: 'Sleuteloverdracht',
                description: 'Na tekening bij de notaris ontvang je het geld op je rekening',
                icon: Home,
                color: 'bg-primary'
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className={`w-20 h-20 ${item.color} text-white rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg mb-4`}>
                    {item.step}
                  </div>
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto shadow-lg -mt-8 relative z-10">
                    <item.icon className="w-8 h-8 text-gray-700" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            >
              Waarom kiezen voor OpenHaus?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              We maken het verkopen van je huis eenvoudig, snel en transparant
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: 'Direct bod binnen 2 minuten',
                description: 'Geen weken wachten op kopers. Ontvang een eerlijk bod gebaseerd op AI-analyse en marktdata van vergelijkbare woningen.',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: Shield,
                title: '100% zekerheid',
                description: 'Geen financieringsvoorbehoud of afvallers. Ons bod is definitief en we regelen alles van inspectie tot notaris.',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: TrendingUp,
                title: 'Geen makelaarskosten',
                description: 'Bespaar duizenden euro\'s aan makelaarskosten. Ons digitale platform maakt tussenpersonen overbodig.',
                color: 'bg-purple-100 text-purple-600'
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="opendoor-card text-center p-8 h-full">
                  <CardContent className="space-y-6">
                    <div className={`w-20 h-20 ${feature.color} rounded-2xl flex items-center justify-center mx-auto`}>
                      <feature.icon className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="section-padding bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-end mb-16">
            <div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
              >
                Uitgelichte woningen
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-xl text-gray-600"
              >
                Ontdek ons aanbod van zorgvuldig geselecteerde woningen
              </motion.p>
            </div>
            <Link href="/kopen">
              <Button className="opendoor-button-secondary hidden sm:flex items-center space-x-2">
                <span>Alle woningen</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="property-grid">
            {featuredProperties.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-16 sm:hidden">
            <Link href="/kopen">
              <Button className="opendoor-button-primary">
                Alle woningen bekijken
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="section-padding">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            >
              Wat onze klanten zeggen
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600"
            >
              Meer dan 2.500 tevreden klanten gingen je voor
            </motion.p>
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="opendoor-card p-8 h-full">
                  <CardContent className="space-y-6">
                    <div className="flex items-center space-x-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-gray-500" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                        <div className="text-gray-600">{testimonial.location}</div>
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
      <section className="section-padding bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Klaar om je huis te verkopen?
            </h2>
            <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Voeg je adres toe en ontdek binnen 2 minuten wat je huis waard is
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-10 py-4 rounded-lg text-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Start gratis taxatie
              </Button>
              <Link href="/kopen">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-10 py-4 rounded-lg text-xl font-bold"
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