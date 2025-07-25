"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Target, 
  Award, 
  TrendingUp, 
  Shield, 
  Heart,
  Globe,
  Zap,
  CheckCircle,
  ArrowRight,
  MapPin,
  Calendar,
  Star
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Metadata } from 'next'

export default function AboutPage() {
  const stats = [
    { label: 'Woningen verkocht', value: '2.847', icon: TrendingUp },
    { label: 'Tevreden klanten', value: '5.200+', icon: Users },
    { label: 'Bespaard aan kosten', value: '€12.5M', icon: Shield },
    { label: 'Gemiddelde beoordeling', value: '4.8/5', icon: Star }
  ]

  const values = [
    {
      icon: Heart,
      title: 'Transparantie',
      description: 'Geen verborgen kosten of onduidelijke voorwaarden. Alles is helder en eerlijk.'
    },
    {
      icon: Users,
      title: 'Persoonlijke service',
      description: 'Elke klant verdient persoonlijke aandacht en op maat gemaakte oplossingen.'
    },
    {
      icon: Zap,
      title: 'Innovatie',
      description: 'We gebruiken de nieuwste technologie om vastgoed toegankelijker te maken.'
    },
    {
      icon: Shield,
      title: 'Betrouwbaarheid',
      description: 'Veilige transacties en professionele begeleiding staan centraal.'
    }
  ]

  const timeline = [
    {
      year: '2020',
      title: 'Oprichting OpenHaus',
      description: 'Gestart met de missie om vastgoed toegankelijker te maken voor iedereen.'
    },
    {
      year: '2021',
      title: 'Eerste 100 woningen',
      description: 'Mijlpaal bereikt met succesvolle verkoop van 100 woningen via ons platform.'
    },
    {
      year: '2022',
      title: 'Landelijke dekking',
      description: 'Uitbreiding naar alle grote steden in Nederland.'
    },
    {
      year: '2023',
      title: 'Technologie innovatie',
      description: 'Lancering van AI-gedreven woningtaxaties en marktanalyses.'
    },
    {
      year: '2024',
      title: 'Internationale expansie',
      description: 'Voorbereiding voor uitbreiding naar België en Duitsland.'
    }
  ]

  const team = [
    {
      name: 'Sarah van der Berg',
      role: 'CEO & Oprichter',
      description: 'Voormalig vastgoedmakelaar met 15 jaar ervaring in de sector.',
      image: '/team/sarah.jpg'
    },
    {
      name: 'Mark Janssen',
      role: 'CTO',
      description: 'Tech expert gespecialiseerd in PropTech en AI-oplossingen.',
      image: '/team/mark.jpg'
    },
    {
      name: 'Lisa de Vries',
      role: 'Head of Customer Success',
      description: 'Zorgt ervoor dat elke klant de beste ervaring heeft op ons platform.',
      image: '/team/lisa.jpg'
    },
    {
      name: 'Tom Bakker',
      role: 'Head of Legal',
      description: 'Juridisch expert die zorgt voor veilige en correcte transacties.',
      image: '/team/tom.jpg'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Over OpenHaus
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Wij revolutioneren de vastgoedmarkt door directe verbindingen te maken tussen 
              kopers en verkopers, zonder de hoge kosten van traditionele makelaars.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3">
                  Neem contact op
                </Button>
              </Link>
              <Link href="/careers">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  Werk bij ons
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <stat.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-6 h-6 text-blue-600" />
                    <span>Onze Missie</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    OpenHaus maakt vastgoed toegankelijk voor iedereen door de traditionele 
                    barrières weg te nemen. Wij geloven dat het kopen en verkopen van een huis 
                    eenvoudig, transparant en betaalbaar moet zijn.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Door directe verbindingen tussen kopers en verkopers te faciliteren, 
                    elimineren we onnodige kosten en maken we de droom van huiseigenaarschap 
                    bereikbaarder voor meer mensen.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="w-6 h-6 text-green-600" />
                    <span>Onze Visie</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Wij streven naar een toekomst waarin vastgoedtransacties volledig 
                    transparant, efficiënt en kosteneffectief zijn. Een wereld waarin 
                    technologie en persoonlijke service hand in hand gaan.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Tegen 2030 willen we de leidende vastgoedplatform zijn in Europa, 
                    waar miljoenen mensen hun droomhuis vinden zonder onnodige kosten 
                    of complexiteit.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Onze Waarden
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Ons Verhaal
          </h2>
          
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className="flex-1">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <Badge className="bg-blue-600 text-white">{item.year}</Badge>
                        <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-gray-600">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-8">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
                <div className="flex-1"></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Ons Team
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-10 h-10 text-gray-500" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Erkenning & Awards
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Award className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    PropTech Award 2023
                  </h3>
                  <p className="text-gray-600">Beste innovatie in vastgoed technologie</p>
                </div>
                
                <div className="text-center">
                  <Star className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Trustpilot Excellent
                  </h3>
                  <p className="text-gray-600">4.8/5 sterren van meer dan 2.000 reviews</p>
                </div>
                
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Snelst Groeiende Startup
                  </h3>
                  <p className="text-gray-600">FD Gazellen Award 2023</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact CTA */}
        <section>
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Sluit je aan bij de revolutie
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Word onderdeel van de toekomst van vastgoed. Samen maken we huizen kopen en verkopen beter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/list-property">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    Start vandaag
                  </Button>
                </Link>
                <Link href="/careers">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                  >
                    Werk bij ons
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}