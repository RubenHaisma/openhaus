"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Home, 
  Calculator, 
  Users, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Clock,
  Euro,
  Shield,
  Phone,
  Camera,
  MessageSquare,
  TrendingUp
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'



export default function HowItWorksPage() {
  const sellingSteps = [
    {
      number: 1,
      title: 'Gratis Taxatie',
      description: 'Start met een gratis online taxatie van je woning',
      icon: Calculator,
      details: [
        'Voer je adres in',
        'Ontvang direct een schatting',
        'Gebaseerd op WOZ en marktdata',
        'Geen verplichtingen'
      ],
      time: '2 minuten'
    },
    {
      number: 2,
      title: 'Woning Details',
      description: 'Vul aanvullende informatie over je woning in',
      icon: Home,
      details: [
        'Aantal kamers en badkamers',
        'Bijzondere kenmerken',
        'Staat van onderhoud',
        'Energielabel'
      ],
      time: '5 minuten'
    },
    {
      number: 3,
      title: 'Foto\'s Uploaden',
      description: 'Upload professionele foto\'s van je woning',
      icon: Camera,
      details: [
        'Minimaal 5 foto\'s',
        'Alle kamers fotograferen',
        'Buitenkant en tuin',
        'Optioneel: professionele fotografie'
      ],
      time: '15 minuten'
    },
    {
      number: 4,
      title: 'Advertentie Live',
      description: 'Je woning staat online en is zichtbaar voor kopers',
      icon: TrendingUp,
      details: [
        'Direct online zichtbaar',
        'Geoptimaliseerd voor zoekmachines',
        'Sociale media promotie',
        'Mobiel geoptimaliseerd'
      ],
      time: 'Direct'
    },
    {
      number: 5,
      title: 'Interesse & Contact',
      description: 'Kopers nemen direct contact met je op',
      icon: MessageSquare,
      details: [
        'Direct contact via platform',
        'Veilige berichtgeving',
        'Telefonisch contact mogelijk',
        'Bezichtigingen plannen'
      ],
      time: 'Binnen 24 uur'
    },
    {
      number: 6,
      title: 'Onderhandeling',
      description: 'Onderhandel rechtstreeks met geïnteresseerde kopers',
      icon: Users,
      details: [
        'Directe communicatie',
        'Transparante onderhandeling',
        'Juridische ondersteuning',
        'Voorwaarden vaststellen'
      ],
      time: '1-2 weken'
    },
    {
      number: 7,
      title: 'Overdracht',
      description: 'Notaris regelt de eigendomsoverdracht',
      icon: FileText,
      details: [
        'Notaris selecteren',
        'Koopakte opstellen',
        'Ondertekening regelen',
        'Sleutels overdragen'
      ],
      time: '4-6 weken'
    }
  ]

  const buyingSteps = [
    {
      number: 1,
      title: 'Zoek & Filter',
      description: 'Zoek woningen met onze geavanceerde filters',
      icon: Search,
      details: [
        'Locatie en prijsfilters',
        'Type woning selecteren',
        'Aantal kamers specificeren',
        'Bijzondere wensen aangeven'
      ]
    },
    {
      number: 2,
      title: 'Bekijk & Vergelijk',
      description: 'Bekijk woningen en vergelijk verschillende opties',
      icon: Home,
      details: [
        'Gedetailleerde woninginfo',
        'Foto\'s en plattegronden',
        'Buurtinformatie',
        'Marktwaarde inschatting'
      ]
    },
    {
      number: 3,
      title: 'Contact & Bezichtiging',
      description: 'Neem contact op met eigenaren voor bezichtigingen',
      icon: Phone,
      details: [
        'Direct contact met eigenaar',
        'Bezichtiging inplannen',
        'Vragen stellen',
        'Tweede bezichtiging mogelijk'
      ]
    },
    {
      number: 4,
      title: 'Bod Uitbrengen',
      description: 'Breng een bod uit op je favoriete woning',
      icon: Euro,
      details: [
        'Bod formuleren',
        'Voorwaarden toevoegen',
        'Financiering aantonen',
        'Onderhandeling starten'
      ]
    },
    {
      number: 5,
      title: 'Juridische Afhandeling',
      description: 'Laat de juridische aspecten professioneel afhandelen',
      icon: Shield,
      details: [
        'Koopakte controleren',
        'Notaris selecteren',
        'Hypotheek regelen',
        'Overdracht voorbereiden'
      ]
    }
  ]

  const benefits = [
    {
      icon: Euro,
      title: 'Bespaar Duizenden Euro\'s',
      description: 'Geen makelaarskosten van 1-2% van de verkoopprijs',
      amount: '€4.000 - €8.000 besparing'
    },
    {
      icon: Clock,
      title: 'Sneller Proces',
      description: 'Direct contact tussen koper en verkoper versnelt het proces',
      amount: '2-4 weken sneller'
    },
    {
      icon: Shield,
      title: 'Veilig & Betrouwbaar',
      description: 'Professionele begeleiding en juridische ondersteuning',
      amount: '100% veilig'
    },
    {
      icon: Users,
      title: 'Persoonlijke Service',
      description: 'Direct contact en persoonlijke begeleiding',
      amount: '24/7 ondersteuning'
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
              Hoe Het Werkt
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ontdek hoe eenvoudig het is om je huis te verkopen of kopen via OpenHaus. 
              Geen ingewikkelde processen, wel professionele begeleiding.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Eenvoudig proces</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Professionele begeleiding</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Geen verborgen kosten</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Benefits Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Waarom Kiezen Voor OpenHaus?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
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
                      <benefit.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{benefit.description}</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {benefit.amount}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Selling Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Huis Verkopen in 7 Stappen
          </h2>
          
          <div className="space-y-8">
            {sellingSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                          {step.number}
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <step.icon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2 lg:mb-0">
                            {step.title}
                          </h3>
                          <Badge className="bg-green-100 text-green-800 w-fit">
                            {step.time}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {step.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-700">{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/list-property">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3">
                Start met verkopen
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Buying Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Huis Kopen in 5 Stappen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {buyingSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                      {step.number}
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <step.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">{step.description}</p>
                    <div className="space-y-1">
                      {step.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="text-xs text-gray-500">
                          • {detail}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/buy">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3">
                Start met zoeken
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Veelgestelde Vragen
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Hoe lang duurt het hele proces?",
                answer: "Van advertentie tot sleuteloverdracht duurt het gemiddeld 6-8 weken, afhankelijk van marktomstandigheden en onderhandelingen."
              },
              {
                question: "Wat als mijn huis niet verkoopt?",
                answer: "We bieden gratis advies over prijsaanpassingen en marketingstrategieën. Je kunt je advertentie altijd aanpassen of tijdelijk offline halen."
              },
              {
                question: "Is juridische begeleiding inbegrepen?",
                answer: "Basisjuridische ondersteuning is gratis. Voor uitgebreide juridische begeleiding bieden we optionele diensten aan."
              },
              {
                question: "Kan ik mijn advertentie bewerken?",
                answer: "Ja, je kunt je advertentie altijd bewerken, foto's toevoegen of de prijs aanpassen via je persoonlijke dashboard."
              },
              {
                question: "Hoe werkt de betaling?",
                answer: "Alle betalingen verlopen via de notaris bij de eigendomsoverdracht. Dit garandeert veiligheid voor beide partijen."
              },
              {
                question: "Wat als er problemen ontstaan?",
                answer: "Ons klantenservice team staat 24/7 klaar om te helpen bij vragen of problemen tijdens het proces."
              }
            ].map((faq, index) => (
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
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Klaar om te beginnen?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Start vandaag nog met het verkopen of kopen van je droomhuis
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/instant-offer">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    Gratis taxatie
                  </Button>
                </Link>
                <Link href="/buy">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                  >
                    Zoek woningen
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