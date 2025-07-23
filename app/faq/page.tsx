"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Home, 
  Euro, 
  FileText,
  Users,
  Shield,
  Phone
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Veelgestelde Vragen | OpenHaus - Alle antwoorden op een rij',
  description: 'Vind antwoorden op veelgestelde vragen over het kopen en verkopen van huizen via OpenHaus. Van taxaties tot juridische aspecten.',
  keywords: ['faq openhaus', 'veelgestelde vragen', 'huis verkopen vragen', 'huis kopen vragen', 'vastgoed hulp']
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openItems, setOpenItems] = useState<string[]>([])

  const categories = [
    { id: 'all', name: 'Alle vragen', icon: HelpCircle },
    { id: 'selling', name: 'Verkopen', icon: Home },
    { id: 'buying', name: 'Kopen', icon: Search },
    { id: 'pricing', name: 'Prijzen & Kosten', icon: Euro },
    { id: 'legal', name: 'Juridisch', icon: FileText },
    { id: 'platform', name: 'Platform', icon: Users },
    { id: 'safety', name: 'Veiligheid', icon: Shield }
  ]

  const faqs = [
    {
      id: '1',
      category: 'selling',
      question: 'Hoeveel kost het om mijn huis te verkopen via OpenHaus?',
      answer: 'Het plaatsen van je woning op OpenHaus is volledig gratis. Je betaalt geen commissie, geen advertentiekosten en geen verborgen kosten. Je bespaart hiermee de traditionele makelaarskosten van 1-2% van de verkoopprijs.'
    },
    {
      id: '2',
      category: 'selling',
      question: 'Hoe bepaal ik de juiste verkoopprijs voor mijn woning?',
      answer: 'Start met onze gratis online taxatie die gebaseerd is op WOZ-gegevens en actuele marktdata. Bekijk ook vergelijkbare woningen in je buurt. Voor extra zekerheid kun je een professionele taxatie laten uitvoeren.'
    },
    {
      id: '3',
      category: 'selling',
      question: 'Welke documenten heb ik nodig om mijn huis te verkopen?',
      answer: 'Je hebt minimaal nodig: eigendomsakte, geldig energielabel, bouwtekeningen (indien beschikbaar), VvE-documenten (bij appartement), en eventuele garantiebewijzen. Wij helpen je bij het verzamelen van alle benodigde documenten.'
    },
    {
      id: '4',
      category: 'selling',
      question: 'Hoe lang duurt het om mijn huis te verkopen?',
      answer: 'Gemiddeld staat een huis 4-6 weken te koop voordat er een koper wordt gevonden. Dit hangt af van factoren zoals locatie, prijs, staat van de woning en marktomstandigheden. Door de juiste prijs en goede foto\'s kun je dit proces versnellen.'
    },
    {
      id: '5',
      category: 'buying',
      question: 'Hoe maak ik contact met een verkoper?',
      answer: 'Via elke woningadvertentie kun je direct contact opnemen met de verkoper. Je kunt een bericht sturen via ons platform of, indien beschikbaar, direct bellen. Alle communicatie verloopt veilig via ons systeem.'
    },
    {
      id: '6',
      category: 'buying',
      question: 'Kan ik een bezichtiging inplannen?',
      answer: 'Ja, na contact met de verkoper kun je een bezichtiging afspreken. Veel verkopers organiseren open huizen of individuele bezichtigingen. De verkoper bepaalt zelf hoe bezichtigingen verlopen.'
    },
    {
      id: '7',
      category: 'buying',
      question: 'Hoe breng ik een bod uit?',
      answer: 'Na een bezichtiging kun je via ons platform een bod uitbrengen. Vermeld je biedprijs, eventuele voorwaarden en motivatie. De verkoper kan je bod accepteren, afwijzen of een tegenbod doen.'
    },
    {
      id: '8',
      category: 'pricing',
      question: 'Wat zijn de kosten voor de koper?',
      answer: 'Als koper betaal je geen kosten aan OpenHaus. Je betaalt wel de standaard kosten koper: overdrachtsbelasting (2%), notariskosten (€800-1500), taxatiekosten (€400-600) en eventuele hypotheekkosten.'
    },
    {
      id: '9',
      category: 'pricing',
      question: 'Zijn er verborgen kosten?',
      answer: 'Nee, OpenHaus heeft geen verborgen kosten. Het platform is gratis voor zowel kopers als verkopers. Je betaalt alleen de standaard kosten die bij elke woningaankoop komen kijken (notaris, belastingen, etc.).'
    },
    {
      id: '10',
      category: 'legal',
      question: 'Wie regelt de juridische aspecten?',
      answer: 'De notaris regelt alle juridische aspecten van de eigendomsoverdracht. Wij kunnen je helpen bij het vinden van een geschikte notaris en bieden basisjuridische ondersteuning tijdens het proces.'
    },
    {
      id: '11',
      category: 'legal',
      question: 'Is een koopovereenkomst verplicht?',
      answer: 'Ja, bij elke woningverkoop is een koopovereenkomst verplicht. Deze wordt opgesteld door de notaris of een juridisch adviseur. Wij kunnen je helpen bij het controleren van de voorwaarden.'
    },
    {
      id: '12',
      category: 'platform',
      question: 'Hoe maak ik een account aan?',
      answer: 'Klik op "Registreren" rechtsboven op de website. Vul je gegevens in en bevestig je email. Je kunt ook inloggen met je Google-account voor extra gemak.'
    },
    {
      id: '13',
      category: 'platform',
      question: 'Kan ik mijn advertentie bewerken?',
      answer: 'Ja, je kunt je advertentie altijd bewerken via je dashboard. Je kunt foto\'s toevoegen, de beschrijving aanpassen, de prijs wijzigen en de status updaten.'
    },
    {
      id: '14',
      category: 'platform',
      question: 'Hoe upload ik foto\'s van mijn woning?',
      answer: 'In je dashboard kun je eenvoudig foto\'s uploaden door ze te slepen naar het uploadgebied of door op "Foto\'s toevoegen" te klikken. We ondersteunen JPG, PNG en WebP formaten tot 10MB per foto.'
    },
    {
      id: '15',
      category: 'safety',
      question: 'Is OpenHaus veilig om te gebruiken?',
      answer: 'Ja, OpenHaus is volledig veilig. We gebruiken SSL-encryptie, verifiëren gebruikers en alle betalingen verlopen via de notaris. We delen nooit persoonlijke gegevens zonder toestemming.'
    },
    {
      id: '16',
      category: 'safety',
      question: 'Hoe voorkom ik oplichting?',
      answer: 'Ontmoet altijd eerst persoonlijk, betaal nooit vooraf geld buiten de notaris om, controleer identiteit van de verkoper/koper en gebruik alleen onze officiële communicatiekanalen.'
    },
    {
      id: '17',
      category: 'selling',
      question: 'Wat als mijn huis niet verkoopt?',
      answer: 'We bieden gratis advies over prijsaanpassingen, betere foto\'s of marketingstrategieën. Je kunt je advertentie altijd aanpassen of tijdelijk offline halen zonder kosten.'
    },
    {
      id: '18',
      category: 'buying',
      question: 'Kan ik een hypotheek krijgen voor een huis via OpenHaus?',
      answer: 'Ja, je kunt gewoon een hypotheek aanvragen bij elke bank. Het maakt voor de bank niet uit of je via een makelaar of OpenHaus koopt. Wij kunnen je doorverwijzen naar hypotheekadviseurs.'
    }
  ]

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

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
              Veelgestelde Vragen
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Vind snel antwoorden op je vragen over het kopen en verkopen van huizen via OpenHaus. 
              Staat je vraag er niet bij? Neem gerust contact met ons op.
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Zoek in veelgestelde vragen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories */}
        <section className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Button
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ List */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredFAQs.length} vragen gevonden
            </h2>
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery('')}
              >
                Wis zoekopdracht
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <AnimatePresence>
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {categories.find(c => c.id === faq.category)?.name}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="ml-4">
                          {openItems.includes(faq.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {openItems.includes(faq.id) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className="px-6 pb-6 border-t border-gray-100">
                              <p className="text-gray-700 leading-relaxed pt-4">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredFAQs.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Geen vragen gevonden
                </h3>
                <p className="text-gray-600 mb-6">
                  Probeer een andere zoekopdracht of selecteer een andere categorie.
                </p>
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}>
                  Toon alle vragen
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Still have questions */}
        <section>
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Staat je vraag er niet bij?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Ons team staat klaar om je persoonlijk te helpen met al je vragen
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    Neem contact op
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                  asChild
                >
                  <a href="tel:+31201234567">
                    <Phone className="w-5 h-5 mr-2" />
                    020 123 4567
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}