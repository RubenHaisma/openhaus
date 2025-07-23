"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StructuredData } from '@/components/seo/structured-data'
import { 
  CheckCircle, 
  Euro, 
  Clock, 
  Shield, 
  FileText, 
  Calculator,
  Home,
  TrendingUp,
  AlertTriangle,
  Users,
  Phone
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'






const faqData = {
  faqs: [
    {
      question: "Is het legaal om je huis zonder makelaar te verkopen?",
      answer: "Ja, het is volledig legaal om je huis zonder makelaar te verkopen in Nederland. Je hebt geen vergunning nodig en kunt alle stappen zelf uitvoeren."
    },
    {
      question: "Hoeveel geld bespaar je door geen makelaar te gebruiken?",
      answer: "Makelaarskosten zijn meestal 1-2% van de verkoopprijs. Bij een huis van €400.000 bespaar je dus €4.000-€8.000 door geen makelaar te gebruiken."
    },
    {
      question: "Welke documenten heb je nodig voor de verkoop?",
      answer: "Je hebt minimaal nodig: eigendomsakte, energielabel, bouwtekeningen (indien beschikbaar), VvE-documenten (bij appartement), en eventuele garantiebewijzen."
    },
    {
      question: "Hoe bepaal je de juiste verkoopprijs?",
      answer: "Gebruik een gratis online taxatie, bekijk vergelijkbare woningen in de buurt, en overweeg een professionele taxatie voor zekerheid."
    },
    {
      question: "Wat zijn de risico's van verkopen zonder makelaar?",
      answer: "Hoofdrisico's zijn: verkeerde prijsstelling, juridische fouten, en meer tijdsinvestering. Met goede voorbereiding zijn deze risico's beheersbaar."
    }
  ]
}

export default function SellingGuide() {
  const steps = [
    {
      number: 1,
      title: "Bepaal de waarde van je woning",
      description: "Start met een gratis online taxatie om een realistisch beeld te krijgen van de marktwaarde.",
      icon: Calculator,
      details: [
        "Gebruik online taxatietools",
        "Bekijk vergelijkbare woningen",
        "Overweeg professionele taxatie",
        "Houd rekening met woningkenmerken"
      ]
    },
    {
      number: 2,
      title: "Verzamel alle benodigde documenten",
      description: "Zorg dat je alle juridische documenten op orde hebt voordat je begint met verkopen.",
      icon: FileText,
      details: [
        "Eigendomsakte",
        "Energielabel (verplicht)",
        "Bouwtekeningen",
        "VvE-documenten (indien van toepassing)",
        "Garantiebewijzen en onderhoudshistorie"
      ]
    },
    {
      number: 3,
      title: "Maak professionele foto's",
      description: "Goede foto's zijn cruciaal voor het aantrekken van potentiële kopers.",
      icon: Home,
      details: [
        "Gebruik natuurlijk licht",
        "Ruim alle persoonlijke spullen op",
        "Fotografeer alle kamers",
        "Maak buitenfoto's",
        "Overweeg professionele fotografie"
      ]
    },
    {
      number: 4,
      title: "Plaats je advertentie online",
      description: "Gebruik platforms zoals OpenHaus om direct contact te maken met kopers.",
      icon: Users,
      details: [
        "Schrijf een aantrekkelijke beschrijving",
        "Upload alle foto's",
        "Vermeld alle belangrijke kenmerken",
        "Stel een realistische prijs",
        "Reageer snel op vragen"
      ]
    },
    {
      number: 5,
      title: "Organiseer bezichtigingen",
      description: "Plan bezichtigingen en bereid je voor op vragen van potentiële kopers.",
      icon: Clock,
      details: [
        "Plan bezichtigingen efficiënt",
        "Bereid antwoorden voor op veelgestelde vragen",
        "Zorg voor een schone, opgeruimde woning",
        "Wees eerlijk over eventuele gebreken",
        "Maak notities van serieuze kandidaten"
      ]
    },
    {
      number: 6,
      title: "Onderhandel en sluit de deal",
      description: "Evalueer biedingen en onderhandel tot een acceptabel bod.",
      icon: Euro,
      details: [
        "Evalueer alle aspecten van een bod",
        "Onderhandel professioneel",
        "Controleer financiering van kopers",
        "Stel voorwaarden vast",
        "Teken koopovereenkomst"
      ]
    },
    {
      number: 7,
      title: "Regel de overdracht via notaris",
      description: "De notaris regelt de juridische overdracht van eigendom.",
      icon: Shield,
      details: [
        "Kies een notaris (koper of verkoper)",
        "Lever alle documenten aan",
        "Controleer conceptakte",
        "Plan de ondertekening",
        "Ontvang de koopsom"
      ]
    }
  ]

  const benefits = [
    {
      icon: Euro,
      title: "Bespaar makelaarskosten",
      description: "Geen commissie van 1-2% betekent duizenden euro's besparing",
      amount: "€4.000 - €8.000"
    },
    {
      icon: Clock,
      title: "Snellere verkoop mogelijk",
      description: "Direct contact met kopers kan het proces versnellen",
      amount: "2-4 weken sneller"
    },
    {
      icon: Shield,
      title: "Volledige controle",
      description: "Jij bepaalt de prijs, voorwaarden en timing",
      amount: "100% zeggenschap"
    },
    {
      icon: Users,
      title: "Direct contact met kopers",
      description: "Geen tussenpersoon, directe communicatie",
      amount: "Persoonlijke benadering"
    }
  ]

  const risks = [
    {
      title: "Verkeerde prijsstelling",
      description: "Te hoog: geen interesse. Te laag: geld verlies.",
      solution: "Gebruik professionele taxatie en marktonderzoek"
    },
    {
      title: "Juridische fouten",
      description: "Fouten in contracten kunnen duur uitpakken.",
      solution: "Laat contracten controleren door notaris of jurist"
    },
    {
      title: "Tijdsinvestering",
      description: "Verkopen kost tijd voor bezichtigingen en administratie.",
      solution: "Plan goed en gebruik efficiënte tools"
    },
    {
      title: "Emotionele betrokkenheid",
      description: "Moeilijk om objectief te blijven bij onderhandelingen.",
      solution: "Stel van tevoren duidelijke grenzen en doelen"
    }
  ]

  return (
    <>
      <StructuredData type="FAQPage" data={faqData} />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-green-100 text-green-800">
                Complete Gids 2024
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Huis Verkopen Zonder Makelaar
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Leer hoe je duizenden euro's bespaart door je huis zelf te verkopen. 
                Complete stap-voor-stap gids met praktische tips en juridische aspecten.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/list-property">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3">
                    Plaats je woning
                  </Button>
                </Link>
                <Link href="/instant-offer">
                  <Button size="lg" variant="outline" className="px-8 py-3">
                    Gratis taxatie
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Benefits Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Waarom verkopen zonder makelaar?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <benefit.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600 mb-2">{benefit.description}</p>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {benefit.amount}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Step-by-Step Guide */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Stap-voor-stap verkoop proces
            </h2>
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardContent className="p-8">
                      <div className="flex items-start space-x-6">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold">
                            {step.number}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-4">
                            <step.icon className="w-6 h-6 text-primary" />
                            <h3 className="text-xl font-bold text-gray-900">
                              {step.title}
                            </h3>
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
          </section>

          {/* Risks and Solutions */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Risico's en hoe je ze vermijdt
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {risks.map((risk, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3 mb-4">
                        <AlertTriangle className="w-6 h-6 text-orange-600 mt-1" />
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 mb-2">
                            {risk.title}
                          </h3>
                          <p className="text-gray-600 mb-3">{risk.description}</p>
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-1">Oplossing:</h4>
                        <p className="text-green-800 text-sm">{risk.solution}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Veelgestelde vragen
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
                  Klaar om je huis te verkopen?
                </h2>
                <p className="text-xl opacity-90 mb-6">
                  Start met een gratis taxatie en ontdek wat je huis waard is
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/list-property">
                    <Button 
                      size="lg" 
                      className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      Plaats je woning
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  )
}