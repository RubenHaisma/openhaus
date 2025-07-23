"use client"

import { useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddressInput } from '@/components/ui/address-input'
import { ValuationResult } from '@/components/valuation/valuation-result'
import { PropertyCard } from '@/components/property/property-card'
import { propertyService } from '@/lib/property/property-service'
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

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

// Fetch real featured properties from API
async function fetchFeaturedProperties() {
  const response = await fetch('/api/properties?limit=3')
  if (!response.ok) {
    throw new Error('Failed to fetch featured properties')
  }
  return response.json()
}

export default function HomePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [featuredProperties, setFeaturedProperties] = useState([])

  const { data: featuredData } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: fetchFeaturedProperties,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  useEffect(() => {
    if (featuredData?.properties) {
      setFeaturedProperties(featuredData.properties)
    }
  }, [featuredData])

  const handleAddressSearch = async (address: string, postalCode: string) => {
    setLoading(true)
    try {
      if (!session) {
        // Store the search data and redirect to sign in
        sessionStorage.setItem('pendingSearch', JSON.stringify({ address, postalCode }))
        router.push('/auth/signin?callbackUrl=/list-property')
        return
      }

      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, postalCode }),
      })
      const data = await res.json()
      if (res.ok) {
        // Redirect to /list-property with valuation data
        router.push(`/list-property?address=${encodeURIComponent(address)}&postal=${encodeURIComponent(postalCode)}&value=${encodeURIComponent(data.valuation.estimatedValue)}`)
      } else {
        alert(`Fout bij het ophalen van woninggegevens: ${data.error}`)
      }
    } catch (error: any) {
      alert(`Fout bij het ophalen van woninggegevens: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Remove valuation/result display logic and just show the AddressInput as before
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
                  Koop en verkoop{' '}
                  <span className="text-primary relative">
                    direct
                    <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" fill="none">
                      <path d="M2 10C60 2 140 2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <br />
                  <span className="text-gray-600">van particulier</span>
                </h1>
                
                <p className="text-2xl lg:text-3xl text-gray-600 leading-relaxed max-w-2xl font-light">
                  Vind je <strong className="font-semibold text-gray-900">droomhuis of verkoop direct</strong> aan andere particulieren. 
                  Geen makelaarskosten, geen tussenpersonen. 
                  <br />Gewoon eerlijke deals tussen mensen.
                </p>
              </div>

              {/* Address Search */}
              <div className="space-y-6">
                <AddressInput
                  onSearch={handleAddressSearch}
                  placeholder="Zoek woningen of voer je adres in voor een gratis taxatie..."
                  className="opendoor-input shadow-2xl h-16 text-xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/20"
                  loading={loading}
                />
                
                <div className="flex flex-wrap items-center gap-8 text-base text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">Gratis platform</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">Direct contact</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">Geen makelaarskosten</span>
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
                title: 'Plaats advertentie',
                description: 'Upload je woning met foto\'s en beschrijving op ons platform',
                icon: Calculator,
                color: 'bg-blue-500'
              },
              {
                step: '2',
                title: 'Ontvang interesse',
                description: 'Geïnteresseerde kopers nemen direct contact met je op',
                icon: DollarSign,
                color: 'bg-green-500'
              },
              {
                step: '3',
                title: 'Onderhandel direct',
                description: 'Onderhandel rechtstreeks met kopers over prijs en voorwaarden',
                icon: FileText,
                color: 'bg-purple-500'
              },
              {
                step: '4',
                title: 'Notaris & overdracht',
                description: 'Regel samen met de koper de notaris en eigendomsoverdracht',
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
                title: 'Sneller dan makelaars',
                description: 'Direct contact met kopers betekent snellere reacties en kortere doorlooptijden dan via makelaars.',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: Shield,
                title: 'Veilige transacties',
                description: 'Alle communicatie verloopt via ons platform. Identiteitsverificatie en veilige berichtgeving.',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: TrendingUp,
                title: 'Geen makelaarskosten',
                description: 'Bespaar duizenden euro\'s aan makelaarskosten door direct te handelen met andere particulieren.',
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
                Nieuwste woningen
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-xl text-gray-600"
              >
                Ontdek woningen van particulieren zonder makelaarskosten
              </motion.p>
            </div>
            <Link href="/buy">
              <Button className="opendoor-button-secondary hidden sm:flex items-center space-x-2">
                <span>Alle woningen</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="property-grid">
            {featuredProperties.length > 0 ? (
              featuredProperties.properties?.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <PropertyCard property={property} />
                </motion.div>
              ))
            ) : (
              // Loading skeleton for featured properties
              Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
              ))
            )}
          </div>

          <div className="text-center mt-16 sm:hidden">
            <Link href="/buy">
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
              Klaar om te beginnen?
            </h2>
            <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Plaats je woning of zoek je droomhuis op ons platform
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-gray-100 px-10 py-4 rounded-lg text-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Plaats je woning
              </Button>
              <Link href="/buy">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-red-500 hover:bg-white hover:text-primary px-10 py-4 rounded-lg text-xl font-bold"
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