"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  TrendingUp, 
  Heart,
  Coffee,
  Laptop,
  Globe,
  Award,
  ArrowRight,
  Mail,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Carrières | OpenHaus - Werk bij de toekomst van vastgoed',
  description: 'Sluit je aan bij OpenHaus en help mee aan de revolutie in vastgoed. Bekijk onze openstaande vacatures en ontdek waarom werken bij ons zo bijzonder is.',
  keywords: ['carrières openhaus', 'vacatures', 'werken bij openhaus', 'proptech jobs', 'vastgoed banen']
}

export default function CareersPage() {
  const openPositions = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Amsterdam',
      type: 'Fulltime',
      experience: '3-5 jaar',
      description: 'Bouw mee aan de gebruikersinterface van het toonaangevende vastgoedplatform van Nederland.',
      requirements: [
        'React/Next.js expertise',
        'TypeScript ervaring',
        'UI/UX gevoel',
        'Agile werkervaring'
      ],
      salary: '€65.000 - €85.000'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Amsterdam',
      type: 'Fulltime',
      experience: '4-6 jaar',
      description: 'Leid de productstrategie en help bepalen welke features we bouwen voor onze gebruikers.',
      requirements: [
        'Product management ervaring',
        'Data-driven mindset',
        'Stakeholder management',
        'PropTech interesse'
      ],
      salary: '€70.000 - €90.000'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Amsterdam / Remote',
      type: 'Fulltime',
      experience: '2-4 jaar',
      description: 'Zorg ervoor dat onze klanten succesvol zijn en help ze het maximale uit ons platform te halen.',
      requirements: [
        'Customer success ervaring',
        'Uitstekende communicatie',
        'Probleemoplossend vermogen',
        'Vastgoed interesse'
      ],
      salary: '€50.000 - €65.000'
    },
    {
      title: 'Data Scientist',
      department: 'Data & Analytics',
      location: 'Amsterdam',
      type: 'Fulltime',
      experience: '3-5 jaar',
      description: 'Ontwikkel machine learning modellen voor woningtaxaties en marktvoorspellingen.',
      requirements: [
        'Python/R expertise',
        'Machine Learning ervaring',
        'Statistiek achtergrond',
        'Real estate data interesse'
      ],
      salary: '€60.000 - €80.000'
    },
    {
      title: 'Marketing Manager',
      department: 'Marketing',
      location: 'Amsterdam',
      type: 'Fulltime',
      experience: '3-5 jaar',
      description: 'Leid onze marketingcampagnes en help meer mensen ontdekken hoe ze geld kunnen besparen.',
      requirements: [
        'Digital marketing ervaring',
        'Content marketing',
        'SEO/SEM kennis',
        'Analytics tools'
      ],
      salary: '€55.000 - €70.000'
    },
    {
      title: 'Legal Counsel',
      department: 'Legal',
      location: 'Amsterdam',
      type: 'Fulltime',
      experience: '5+ jaar',
      description: 'Zorg voor juridische compliance en ondersteun onze klanten bij vastgoedtransacties.',
      requirements: [
        'Juridische opleiding',
        'Vastgoed recht ervaring',
        'Contractonderhandeling',
        'Compliance kennis'
      ],
      salary: '€75.000 - €95.000'
    }
  ]

  const benefits = [
    {
      icon: Euro,
      title: 'Competitief Salaris',
      description: 'Marktconform salaris met jaarlijkse reviews en bonussen'
    },
    {
      icon: Laptop,
      title: 'Flexibel Werken',
      description: 'Hybride werken met moderne apparatuur en thuiswerkvergoeding'
    },
    {
      icon: TrendingUp,
      title: 'Groei & Ontwikkeling',
      description: 'Persoonlijk ontwikkelingsbudget en interne doorgroeimogelijkheden'
    },
    {
      icon: Heart,
      title: 'Zorgverzekering',
      description: 'Uitgebreide zorgverzekering en pensioenregeling'
    },
    {
      icon: Coffee,
      title: 'Kantoorvoordelen',
      description: 'Gratis lunch, onbeperkt koffie en gezellige teamuitjes'
    },
    {
      icon: Globe,
      title: 'Internationale Kansen',
      description: 'Mogelijkheden om mee te werken aan onze Europese expansie'
    }
  ]

  const values = [
    {
      title: 'Innovatie',
      description: 'We zoeken altijd naar betere manieren om vastgoed toegankelijker te maken'
    },
    {
      title: 'Transparantie',
      description: 'Eerlijkheid en openheid in alles wat we doen, intern en extern'
    },
    {
      title: 'Impact',
      description: 'Ons werk heeft directe impact op het leven van duizenden mensen'
    },
    {
      title: 'Samenwerking',
      description: 'We geloven in de kracht van diverse teams en verschillende perspectieven'
    }
  ]

  const perks = [
    'Flexibele werktijden',
    '25 vakantiedagen + feestdagen',
    'Thuiswerkvergoeding €2 per dag',
    'Ontwikkelingsbudget €1.500 per jaar',
    'MacBook Pro of vergelijkbaar',
    'Gratis lunch op kantoor',
    'Teamuitjes en borrels',
    'Fitness abonnement vergoeding',
    'NS Business Card',
    'Pensioenregeling',
    'Ziektekostenverzekering',
    'Bonusregeling'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Carrières bij OpenHaus
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sluit je aan bij ons team en help mee aan de revolutie in de vastgoedmarkt. 
              Samen maken we huizen kopen en verkopen beter, eerlijker en toegankelijker.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-purple-600" />
                <span>50+ collega's</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span>Snelgroeiend bedrijf</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-6 h-6 text-yellow-600" />
                <span>Beste werkgever PropTech</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Why Work With Us */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Waarom Werken Bij OpenHaus?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Maak Impact in PropTech
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Bij OpenHaus werk je niet alleen aan een product, maar aan een missie. 
                    We democratiseren de vastgoedmarkt en maken het voor iedereen toegankelijk 
                    om een huis te kopen of verkopen zonder onnodige kosten.
                  </p>
                  <p className="text-gray-700">
                    Ons team bestaat uit gepassioneerde professionals die geloven in transparantie, 
                    innovatie en het maken van een verschil in het leven van mensen.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">€12.5M</div>
                    <div className="text-gray-600">Bespaard voor klanten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">2.847</div>
                    <div className="text-gray-600">Woningen verkocht</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">4.8/5</div>
                    <div className="text-gray-600">Klantbeoordeling</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">50+</div>
                    <div className="text-gray-600">Team leden</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Wat Wij Bieden
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alle Voordelen op een Rij</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {perks.map((perk, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">{perk}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Open Positions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Openstaande Vacatures
          </h2>
          
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {position.title}
                          </h3>
                          <Badge className="bg-blue-100 text-blue-800">
                            {position.department}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{position.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{position.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="w-4 h-4" />
                            <span>{position.experience}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{position.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                          {position.requirements.map((req, reqIndex) => (
                            <div key={reqIndex} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-700">{req}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="text-lg font-bold text-green-600">
                          {position.salary}
                        </div>
                      </div>
                      
                      <div className="mt-6 lg:mt-0 lg:ml-8">
                        <Button className="w-full lg:w-auto">
                          Solliciteer nu
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Application Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Sollicitatie Proces
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Sollicitatie',
                description: 'Stuur je CV en motivatiebrief via onze website'
              },
              {
                step: '2',
                title: 'Screening',
                description: 'We beoordelen je aanmelding en nemen contact op'
              },
              {
                step: '3',
                title: 'Gesprekken',
                description: 'Kennismakingsgesprek en technische/case interview'
              },
              {
                step: '4',
                title: 'Aanbieding',
                description: 'Bij een match ontvang je een arbeidsaanbod'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section>
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Zie je jezelf niet in bovenstaande vacatures?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                We zijn altijd op zoek naar getalenteerde mensen. Stuur ons een open sollicitatie!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Open sollicitatie
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                >
                  careers@openhaus.nl
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}