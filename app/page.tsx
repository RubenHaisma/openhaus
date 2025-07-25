"use client"

import { useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddressInput } from '@/components/ui/address-input'
import { EnergyAssessmentResult } from '@/components/energy/energy-assessment-result'
import { 
  Zap, 
  TrendingUp, 
  Shield, 
  Clock, 
  CheckCircle, 
  Star, 
  ArrowRight,
  Users,
  Award,
  Euro,
  Calendar,
  FileText,
  Leaf,
  Home,
  Calculator
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

export default function HomePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [featuredProjects, setFeaturedProjects] = useState([])

  const { data: featuredData } = useQuery({
    queryKey: ['featured-projects'],
    queryFn: async () => {
      const response = await fetch('/api/energy/projects?limit=3&status=COMPLETED')
      if (!response.ok) {
        throw new Error('Failed to fetch featured projects')
      }
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  useEffect(() => {
    if (featuredData?.projects) {
      setFeaturedProjects(featuredData.projects)
    }
  }, [featuredData])

  const handleAddressSearch = async (address: string, postalCode: string) => {
    setLoading(true)
    try {
      // Get energy assessment for the property
      const res = await fetch('/api/energy/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, postalCode }),
      })
      
      if (res.ok) {
        const data = await res.json()
        
        if (!session) {
          // Store the search data and redirect to sign in
          sessionStorage.setItem('pendingAssessment', JSON.stringify({ address, postalCode, assessment: data.assessment }))
          router.push('/auth/signin?callbackUrl=/energy-plan')
          return
        }
        // Redirect to energy plan with assessment data
        router.push(`/energy-plan?address=${encodeURIComponent(address)}&postal=${encodeURIComponent(postalCode)}`)
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Energy assessment failed')
      }
    } catch (error: any) {
      console.error('Energy assessment failed:', error)
      alert(`Fout bij het ophalen van energiegegevens: ${error.message}. Controleer het adres en probeer het opnieuw.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section - Energy Transition Focus */}
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
                <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full text-green-700 text-sm font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Nieuw: €3 miljard subsidie beschikbaar voor 2025
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-gray-900 leading-[1.05] tracking-tight break-words max-w-full">
                  Maak je huis{' '}
                  <span className="text-green-600 relative inline-block break-words max-w-full">
                    energie{' '}
                    <span className="relative inline-block">
                      neutraal
                      <svg className="absolute -bottom-2 left-0 w-full h-2 sm:h-3" viewBox="0 0 200 12" fill="none" style={{ minWidth: '100%' }}>
                        <path d="M2 10C60 2 140 2 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    </span>
                  </span>
                  <br />
                  <span className="text-gray-600">voor 2030</span>
                </h1>
                
                <p className="text-2xl lg:text-3xl text-gray-600 leading-relaxed max-w-2xl font-light">
                  Krijg <strong className="font-semibold text-gray-900">gratis energieadvies</strong>, vind gecertificeerde installateurs 
                  en ontvang tot <strong className="font-semibold text-green-600">€25.000 subsidie</strong> voor je energietransitie.
                </p>
              </div>

              {/* Address Search */}
              <div className="space-y-6">
                <AddressInput
                  onSearch={handleAddressSearch}
                  placeholder="Voer je adres in voor gratis energieadvies..."
                  className="opendoor-input shadow-2xl h-16 text-xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/20"
                  loading={loading}
                />
                
                <div className="flex flex-wrap items-center gap-8 text-base text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">Gratis energieadvies</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">Subsidie tot €25.000</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="font-medium">Gecertificeerde installateurs</span>
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
                  src="https://images.pexels.com/photos/9875414/pexels-photo-9875414.jpeg"
                  alt="Energy efficient home with solar panels"
                  className="w-full h-[400px] lg:h-[600px] object-cover rounded-3xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-20 blur-xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20 blur-xl"></div>
                
                {/* Floating Stats Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute -bottom-6 -left-6 bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-800">€3.2B</div>
                      <div className="text-sm text-gray-600">Subsidie beschikbaar</div>
                    </div>
                    <div className="w-px h-16 bg-gray-200"></div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">2030</div>
                      <div className="text-sm text-gray-600">Deadline</div>
                    </div>
                  </div>
                  
                  {/* Trust Indicators */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>RVO gecertificeerd</span>
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
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">CO₂ neutraal</div>
                      <div className="text-xs text-gray-600">2050 doel</div>
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
              <div className="text-4xl font-bold text-gray-900 mb-2">€3.2B</div>
              <div className="text-gray-600">Subsidie beschikbaar</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-green-600 mb-2">2.8M</div>
              <div className="text-gray-600">Woningen te verduurzamen</div>
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
              <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">Gecertificeerde installateurs</div>
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
              Van energieadvies tot subsidie-aanvraag in 4 eenvoudige stappen
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Energieadvies',
                description: 'Krijg een gratis energieadvies op basis van je woning en huidige energielabel',
                icon: Calculator,
                color: 'bg-blue-500'
              },
              {
                step: '2',
                title: 'Subsidie check',
                description: 'Ontdek welke subsidies beschikbaar zijn en hoeveel je kunt besparen',
                icon: Euro,
                color: 'bg-green-500'
              },
              {
                step: '3',
                title: 'Installateur kiezen',
                description: 'Vergelijk offertes van gecertificeerde installateurs in jouw regio',
                icon: Users,
                color: 'bg-purple-500'
              },
              {
                step: '4',
                title: 'Uitvoering & subsidie',
                description: 'Laat het werk uitvoeren en ontvang je subsidie automatisch',
                icon: CheckCircle,
                color: 'bg-green-600'
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
              Waarom kiezen voor EnergiePlatform?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              We maken de energietransitie eenvoudig, betaalbaar en betrouwbaar
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Maximale subsidie',
                description: 'Automatische check op alle beschikbare subsidies en optimale combinaties voor jouw situatie.',
                color: 'bg-yellow-100 text-yellow-600'
              },
              {
                icon: Shield,
                title: 'Gecertificeerde installateurs',
                description: 'Alleen RVO-gecertificeerde installateurs met bewezen track record en kwaliteitsgarantie.',
                color: 'bg-green-100 text-green-600'
              },
              {
                icon: TrendingUp,
                title: 'ROI transparantie',
                description: 'Duidelijke berekening van terugverdientijd en energiebesparing voor elke maatregel.',
                color: 'bg-blue-100 text-blue-600'
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

      {/* Featured Projects */}
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
                Recente projecten
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-xl text-gray-600"
              >
                Zie hoe andere eigenaren hun woning verduurzaamd hebben
              </motion.p>
            </div>
            <Link href="/projecten">
              <Button className="opendoor-button-secondary hidden sm:flex items-center space-x-2">
                <span>Alle projecten</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="property-grid">
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project: any, index: number) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="opendoor-card overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                      <Leaf className="w-16 h-16 text-green-600" />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className="bg-green-100 text-green-800">
                          Label {project.energyLabelBefore} → {project.energyLabelAfter}
                        </Badge>
                        <Badge variant="outline">
                          €{project.subsidyReceived?.toLocaleString()} subsidie
                        </Badge>
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">
                        {project.location}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {project.measures?.join(', ')}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-green-600 font-semibold">
                          {project.energySavings}% besparing
                        </span>
                        <span className="text-gray-500 text-sm">
                          {project.completedDate}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              // Loading skeleton for featured projects
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
            <Link href="/projecten">
              <Button className="opendoor-button-primary">
                Alle projecten bekijken
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
              Meer dan 2.500 tevreden eigenaren gingen je voor
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah van der Berg',
                location: 'Amsterdam',
                rating: 5,
                text: 'Dankzij EnergiePlatform hebben we €18.000 subsidie ontvangen voor onze warmtepomp. Het proces was heel duidelijk!',
                savings: '€1.200/jaar besparing'
              },
              {
                name: 'Mark Janssen',
                location: 'Rotterdam',
                rating: 5,
                text: 'Van energielabel G naar A+ in 6 maanden. De installateur was vakkundig en de subsidie werd snel uitgekeerd.',
                savings: '€1.800/jaar besparing'
              },
              {
                name: 'Lisa de Vries',
                location: 'Utrecht',
                rating: 5,
                text: 'Eindelijk een platform dat alle subsidies overzichtelijk maakt. We hebben meer gekregen dan verwacht!',
                savings: '€2.100/jaar besparing'
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
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Leaf className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{testimonial.name}</div>
                        <div className="text-gray-600">{testimonial.location}</div>
                        <div className="text-green-600 font-semibold text-sm">{testimonial.savings}</div>
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
      <section className="section-padding bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Klaar voor de energietransitie?
            </h2>
            <p className="text-xl lg:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Start vandaag met je gratis energieadvies en ontdek hoeveel je kunt besparen
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
              <Button 
                size="lg" 
                className="bg-white text-green-600 hover:bg-gray-100 px-10 py-4 rounded-lg text-xl font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Calculator className="w-6 h-6 mr-2" />
                Start energieadvies
              </Button>
              <Link href="/subsidies">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-10 py-4 rounded-lg text-xl font-bold"
                >
                  <Euro className="w-6 h-6 mr-2" />
                  Bekijk subsidies
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}