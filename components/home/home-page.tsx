"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Search, 
  TrendingUp, 
  Shield, 
  Clock, 
  Euro, 
  CheckCircle, 
  Star,
  MapPin,
  Users,
  Award,
  ArrowRight,
  Phone,
  Calculator,
  Heart,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AddressInput } from '@/components/ui/address-input'

export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddressSearch = async (address: string, postalCode: string) => {
    // Redirect to instant offer page with address data
    window.location.href = `/instant-offer?address=${encodeURIComponent(address)}&postal=${encodeURIComponent(postalCode)}`
  }

  const stats = [
    { label: 'Huizen verkocht', value: '2,847', icon: Home, color: 'text-elegant-red-600' },
    { label: 'Totale waarde', value: '€1.2B', icon: Euro, color: 'text-elegant-red-600' },
    { label: 'Klantbeoordeling', value: '4.9/5', icon: Star, color: 'text-elegant-red-600' },
    { label: 'Gemiddelde verkoop', value: '14 dagen', icon: Clock, color: 'text-elegant-red-600' }
  ]

  const features = [
    {
      icon: Zap,
      title: 'Direct bod binnen 2 minuten',
      description: 'Ontvang een eerlijk bod gebaseerd op actuele WOZ-waarde en marktgegevens',
      color: 'bg-elegant-red-100 text-elegant-red-600'
    },
    {
      icon: Shield,
      title: 'Geen financieringsvoorbehoud',
      description: 'Garantie op koopprijs - wij kopen je huis direct zonder onzekerheid',
      color: 'bg-elegant-red-100 text-elegant-red-600'
    },
    {
      icon: Euro,
      title: '0% makelaarskosten',
      description: 'Bespaar duizenden euros aan makelaarskosten met onze directe aanpak',
      color: 'bg-elegant-red-100 text-elegant-red-600'
    },
    {
      icon: Clock,
      title: 'Snelle afhandeling',
      description: 'Van taxatie tot sleuteloverdracht in gemiddeld 4-6 weken',
      color: 'bg-elegant-red-100 text-elegant-red-600'
    },
    {
      icon: CheckCircle,
      title: 'Volledige begeleiding',
      description: 'Persoonlijke begeleiding van inspectie tot notaris',
      color: 'bg-elegant-red-100 text-elegant-red-600'
    },
    {
      icon: Heart,
      title: 'Flexibele oplevering',
      description: 'Bepaal zelf wanneer je je huis wilt opleveren',
      color: 'bg-elegant-red-100 text-elegant-red-600'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah van der Berg',
      location: 'Amsterdam',
      text: 'Binnen 3 dagen een bod ontvangen en binnen 5 weken was alles geregeld. Fantastische service!',
      rating: 5,
      amount: '€675.000'
    },
    {
      name: 'Mark Janssen',
      location: 'Rotterdam',
      text: 'Geen gedoe met bezichtigingen en onzekere kopers. WattVrij maakte het verkopen zo eenvoudig.',
      rating: 5,
      amount: '€425.000'
    },
    {
      name: 'Linda Bakker',
      location: 'Utrecht',
      text: 'De taxatie was precies wat we uiteindelijk kregen. Transparant en betrouwbaar proces.',
      rating: 5,
      amount: '€550.000'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="elegant-hero py-20 lg:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Verkoop je huis
              <br />
              <span className="text-elegant-red-600">direct zonder gedoe</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-elegant-red-700 mb-12 max-w-4xl mx-auto leading-relaxed">
              Ontvang een eerlijk bod binnen 2 minuten. Geen makelaarskosten, 
              geen onzekerheid, geen wachtlijsten. Gewoon een snelle, transparante verkoop.
            </p>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="relative">
                <AddressInput
                  onSearch={handleAddressSearch}
                  placeholder="Voer je volledige adres in voor een gratis taxatie..."
                  className="w-full h-20 text-xl px-8 pr-48 rounded-2xl shadow-elegant-lg border-2 border-elegant-red-200 focus:border-elegant-red-500 bg-white/95 backdrop-blur-sm"
                />
                <Button className="absolute right-2 top-2 h-16 px-8 elegant-button-primary text-lg font-bold">
                  <Search className="w-6 h-6 mr-2" />
                  Gratis taxatie
                </Button>
              </div>
              
              <div className="flex items-center justify-center space-x-8 mt-6 text-sm text-elegant-red-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-elegant-red-500" />
                  <span>100% gratis taxatie</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-elegant-red-500" />
                  <span>Geen verplichtingen</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-elegant-red-500" />
                  <span>Direct resultaat</span>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/instant-offer">
                <Button className="elegant-button-primary text-xl px-12 py-6 shadow-elegant-lg hover:shadow-elegant-xl animate-elegant-pulse">
                  <Home className="w-6 h-6 mr-3" />
                  Start nu je verkoop
                </Button>
              </Link>
              
              <Link href="/buy">
                <Button className="elegant-button-secondary text-xl px-12 py-6">
                  <Search className="w-6 h-6 mr-3" />
                  Zoek een huis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 animate-elegant-float">
          <div className="w-16 h-16 bg-elegant-red-100 rounded-full flex items-center justify-center shadow-elegant">
            <Home className="w-8 h-8 text-elegant-red-600" />
          </div>
        </div>
        <div className="absolute top-40 right-20 animate-elegant-float" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 bg-elegant-red-200 rounded-full flex items-center justify-center shadow-elegant">
            <Euro className="w-6 h-6 text-elegant-red-700" />
          </div>
        </div>
        <div className="absolute bottom-20 left-1/4 animate-elegant-float" style={{ animationDelay: '2s' }}>
          <div className="w-14 h-14 bg-elegant-red-50 rounded-full flex items-center justify-center shadow-elegant">
            <CheckCircle className="w-7 h-7 text-elegant-red-500" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="elegant-card text-center p-8 hover:scale-105 transition-all duration-300">
                  <CardContent>
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-elegant-red-100 flex items-center justify-center`}>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                    <div className="text-4xl font-bold text-elegant-red-800 mb-2">{stat.value}</div>
                    <div className="text-elegant-red-600 font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 elegant-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-elegant-red-800 mb-6">
              Waarom kiezen voor WattVrij?
            </h2>
            <p className="text-xl text-elegant-red-600 max-w-3xl mx-auto">
              We maken het verkopen van je huis eenvoudig, snel en transparant. 
              Geen verrassingen, geen gedoe, gewoon een eerlijke deal.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="elegant-card h-full p-8 hover:scale-105 transition-all duration-500">
                  <CardContent>
                    <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-elegant-red-800 mb-4">{feature.title}</h3>
                    <p className="text-elegant-red-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-elegant-red-800 mb-6">
              Zo werkt het
            </h2>
            <p className="text-xl text-elegant-red-600 max-w-3xl mx-auto">
              Van taxatie tot sleuteloverdracht in 4 eenvoudige stappen
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Gratis taxatie',
                description: 'Vul je adres in en ontvang direct een nauwkeurige woningwaarde',
                icon: Calculator
              },
              {
                step: '02',
                title: 'Direct bod',
                description: 'Accepteer ons eerlijke bod of kies voor traditionele verkoop',
                icon: Euro
              },
              {
                step: '03',
                title: 'Inspectie & documenten',
                description: 'We regelen de inspectie en alle juridische documenten',
                icon: Shield
              },
              {
                step: '04',
                title: 'Sleuteloverdracht',
                description: 'Na tekening bij de notaris ontvang je het geld op je rekening',
                icon: CheckCircle
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 mx-auto rounded-2xl elegant-gradient flex items-center justify-center shadow-elegant-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-elegant-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-elegant-red-800 mb-4">{step.title}</h3>
                <p className="text-elegant-red-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 elegant-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-elegant-red-800 mb-6">
              Wat onze klanten zeggen
            </h2>
            <p className="text-xl text-elegant-red-600 max-w-3xl mx-auto">
              Duizenden tevreden klanten gingen je voor
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="elegant-card p-8 h-full">
                  <CardContent>
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-elegant-red-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-elegant-red-700 mb-6 italic leading-relaxed">
                      "{testimonial.text}"
                    </p>
                    <div className="border-t border-elegant-red-200 pt-4">
                      <div className="font-bold text-elegant-red-800">{testimonial.name}</div>
                      <div className="text-elegant-red-600">{testimonial.location}</div>
                      <div className="text-elegant-red-500 font-semibold mt-2">{testimonial.amount}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="elegant-card p-12 elegant-gradient text-white">
              <CardContent>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Klaar om te beginnen?
                </h2>
                <p className="text-xl mb-8 opacity-90">
                  Ontvang binnen 2 minuten een gratis taxatie van je woning
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link href="/instant-offer">
                    <Button className="bg-white text-elegant-red-600 hover:bg-elegant-red-50 text-xl px-12 py-6 font-bold shadow-elegant-lg hover:shadow-elegant-xl transition-all duration-300">
                      <Home className="w-6 h-6 mr-3" />
                      Start gratis taxatie
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-elegant-red-600 text-xl px-12 py-6 font-bold transition-all duration-300">
                    <Phone className="w-6 h-6 mr-3" />
                    020 123 4567
                  </Button>
                </div>
                
                <div className="mt-8 text-sm opacity-75">
                  ✓ Geen verplichtingen ✓ 100% gratis ✓ Direct resultaat
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}