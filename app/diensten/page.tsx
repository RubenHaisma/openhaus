"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Home, 
  Search, 
  Calculator, 
  TrendingUp, 
  Euro, 
  Shield, 
  Clock,
  Users,
  FileText,
  Phone,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onze Diensten | OpenHaus - Vastgoed zonder makelaarskosten',
  description: 'Ontdek alle diensten van OpenHaus: huis verkopen, huis kopen, hypotheekadvies, gratis taxaties en meer. Alles voor vastgoed zonder makelaarskosten.',
  keywords: ['vastgoeddiensten', 'huis verkopen', 'huis kopen', 'hypotheekadvies', 'woningtaxatie', 'makelaarskosten besparen']
}

export default function DienstenPage() {
  const services = [
    {
      icon: Home,
      title: 'Huis Verkopen',
      description: 'Verkoop je huis direct aan kopers zonder makelaarskosten. Bespaar duizenden euro\'s.',
      features: [
        'Gratis woningtaxatie',
        'Professionele fotografie',
        'Online advertentie plaatsing',
        'Juridische ondersteuning',
        'Geen commissiekosten'
      ],
      price: 'Gratis',
      href: '/sell',
      color: 'bg-green-500',
      popular: true
    },
    {
      icon: Search,
      title: 'Huis Kopen',
      description: 'Vind je droomhuis rechtstreeks van particuliere verkopers zonder tussenpersonen.',
      features: [
        'Uitgebreid woningaanbod',
        'Direct contact met eigenaren',
        'Geen aankoopkosten',
        'Persoonlijke begeleiding',
        'Bezichtigingen regelen'
      ],
      price: 'Gratis',
      href: '/buy',
      color: 'bg-blue-500'
    },
    {
      icon: Calculator,
      title: 'Hypotheekadvies',
      description: 'Professioneel hypotheekadvies en begeleiding bij het aanvragen van je hypotheek.',
      features: [
        'Hypotheek berekening',
        'Rentetarieven vergelijken',
        'Aanvraag begeleiding',
        'Financiële planning',
        'NHG mogelijkheden'
      ],
      price: 'Vanaf €495',
      href: '/finance',
      color: 'bg-purple-500'
    },
    {
      icon: TrendingUp,
      title: 'Gratis Taxatie',
      description: 'Ontdek de actuele marktwaarde van je woning met onze geavanceerde taxatietool.',
      features: [
        'WOZ-gebaseerde waardering',
        'Marktanalyse',
        'Vergelijkbare verkopen',
        'Energielabel integratie',
        'Direct resultaat'
      ],
      price: 'Gratis',
      href: '/instant-offer',
      color: 'bg-orange-500'
    },
    {
      icon: Users,
      title: 'Marktplaats',
      description: 'Toegang tot onze uitgebreide marktplaats met duizenden woningen van particulieren.',
      features: [
        'Geavanceerde zoekfilters',
        'Favorieten opslaan',
        'Markttrends inzichten',
        'Buurtinformatie',
        'Mobiele app'
      ],
      price: 'Gratis',
      href: '/marketplace',
      color: 'bg-red-500'
    },
    {
      icon: Shield,
      title: 'Juridische Ondersteuning',
      description: 'Professionele juridische begeleiding bij de aan- of verkoop van je woning.',
      features: [
        'Contractcontrole',
        'Notaris bemiddeling',
        'Juridisch advies',
        'Documentatie hulp',
        'Geschillenbeslechting'
      ],
      price: 'Vanaf €295',
      href: '/contact',
      color: 'bg-indigo-500'
    }
  ]

  const additionalServices = [
    {
      title: 'Professionele Fotografie',
      description: 'Laat je woning professioneel fotograferen voor optimale presentatie',
      price: '€149'
    },
    {
      title: 'Energielabel Aanvraag',
      description: 'Wij regelen het energielabel voor je woning',
      price: '€89'
    },
    {
      title: 'Woningrapport',
      description: 'Uitgebreid rapport met marktanalyse en verkoopadvies',
      price: '€49'
    },
    {
      title: 'Marketing Boost',
      description: 'Extra promotie voor je advertentie op sociale media',
      price: '€99'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Onze Diensten
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Alles wat je nodig hebt voor het kopen of verkopen van je woning. 
              Professionele diensten zonder de hoge kosten van traditionele makelaars.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Geen verborgen kosten</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Persoonlijke begeleiding</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Professionele kwaliteit</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Services */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Hoofddiensten
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {service.popular && (
                  <Badge className="absolute -top-3 left-4 z-10 bg-green-600 text-white">
                    Populair
                  </Badge>
                )}
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className={`w-12 h-12 ${service.color} rounded-lg flex items-center justify-center mb-4`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <p className="text-gray-600">{service.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-gray-900">{service.price}</span>
                        {service.price === 'Gratis' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Geen kosten
                          </Badge>
                        )}
                      </div>
                      
                      <Link href={service.href}>
                        <Button className="w-full">
                          Meer informatie
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Additional Services */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Aanvullende Diensten
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">{service.price}</span>
                      <Button variant="outline" size="sm">
                        Bestellen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Process Overview */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Hoe werken onze diensten?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    step: '1',
                    title: 'Kies je dienst',
                    description: 'Selecteer de dienst die bij jouw situatie past'
                  },
                  {
                    step: '2',
                    title: 'Persoonlijk advies',
                    description: 'Ontvang op maat gemaakt advies van onze experts'
                  },
                  {
                    step: '3',
                    title: 'Begeleiding',
                    description: 'Wij begeleiden je door het hele proces'
                  },
                  {
                    step: '4',
                    title: 'Succesvol resultaat',
                    description: 'Bereik je doel met onze professionele ondersteuning'
                  }
                ].map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {step.step}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact CTA */}
        <section>
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Vragen over onze diensten?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Onze experts helpen je graag bij het kiezen van de juiste dienst
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Neem contact op
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                >
                  020 123 4567
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}