"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Shield, 
  FileText, 
  TrendingUp, 
  Users,
  Globe,
  Mail,
  CheckCircle,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Disclaimer | OpenHaus - Belangrijke informatie en beperkingen',
  description: 'Lees onze disclaimer over het gebruik van OpenHaus, beperkingen van aansprakelijkheid en belangrijke informatie over vastgoedtransacties.',
  keywords: ['disclaimer', 'aansprakelijkheid', 'vastgoed disclaimer', 'gebruiksvoorwaarden']
}

export default function DisclaimerPage() {
  const lastUpdated = "15 december 2024"

  const sections = [
    {
      id: 'general',
      title: 'Algemene Disclaimer',
      icon: AlertTriangle,
      content: `
        OpenHaus B.V. ("OpenHaus", "wij", "ons") biedt een online platform voor vastgoedtransacties. 
        Deze disclaimer bevat belangrijke informatie over de beperkingen van onze diensten en aansprakelijkheid.
        
        **Gebruik op eigen risico:**
        Het gebruik van ons platform en alle informatie die daarop wordt verstrekt, geschiedt geheel 
        voor eigen risico van de gebruiker.
        
        **Geen professioneel advies:**
        De informatie op ons platform vormt geen professioneel vastgoed-, juridisch-, financieel- of 
        fiscaal advies. Raadpleeg altijd gekwalificeerde professionals voor specifiek advies.
        
        **Voortdurende ontwikkeling:**
        Ons platform wordt voortdurend ontwikkeld en verbeterd. Functies kunnen wijzigen zonder 
        voorafgaande kennisgeving.
      `
    },
    {
      id: 'property-info',
      title: 'Woninginformatie',
      icon: FileText,
      content: `
        **Verantwoordelijkheid gebruikers:**
        Alle informatie over woningen wordt verstrekt door gebruikers (verkopers). OpenHaus 
        controleert deze informatie niet op juistheid of volledigheid.
        
        **Geen garantie op juistheid:**
        We geven geen garantie dat woninginformatie, foto's, beschrijvingen of prijzen 
        accuraat, actueel of volledig zijn.
        
        **Verificatie vereist:**
        Kopers worden sterk aangeraden alle woninginformatie zelf te verifiëren door:
        • Persoonlijke bezichtiging
        • Professionele inspectie
        • Controle van officiële documenten
        • Verificatie bij relevante instanties
        
        **Prijswijzigingen:**
        Prijzen kunnen zonder kennisgeving wijzigen. De uiteindelijke prijs wordt bepaald 
        in de koopovereenkomst tussen koper en verkoper.
      `
    },
    {
      id: 'valuations',
      title: 'Taxaties en Waarderingen',
      icon: TrendingUp,
      content: `
        **Automatische taxaties:**
        Onze online taxaties zijn gebaseerd op algoritmes, WOZ-gegevens en marktdata. 
        Deze zijn bedoeld als indicatie en niet als professionele taxatie.
        
        **Geen garantie op waarde:**
        We geven geen garantie dat de geschatte waarde overeenkomt met de werkelijke 
        marktwaarde of verkoopprijs van een woning.
        
        **Factoren niet meegenomen:**
        Automatische taxaties houden mogelijk geen rekening met:
        • Staat van onderhoud
        • Unieke kenmerken
        • Lokale marktomstandigheden
        • Recente renovaties
        • Juridische beperkingen
        
        **Professionele taxatie aanbevolen:**
        Voor belangrijke beslissingen raden we aan een gecertificeerde taxateur in te schakelen.
      `
    },
    {
      id: 'transactions',
      title: 'Transacties en Bemiddeling',
      icon: Users,
      content: `
        **Faciliterende rol:**
        OpenHaus faciliteert alleen contact tussen kopers en verkopers. Wij zijn geen 
        partij bij koopovereenkomsten en treden niet op als makelaar.
        
        **Geen garantie op transacties:**
        We garanderen niet dat:
        • Woningen daadwerkelijk verkocht worden
        • Kopers geschikt zijn of financiering hebben
        • Transacties succesvol worden afgerond
        • Partijen hun verplichtingen nakomen
        
        **Geschillen:**
        Geschillen tussen kopers en verkopers moeten onderling worden opgelost. 
        OpenHaus is niet verantwoordelijk voor het oplossen van geschillen.
        
        **Juridische procedures:**
        Alle juridische procedures (koopakte, eigendomsoverdracht, etc.) moeten 
        worden afgehandeld door gekwalificeerde professionals zoals notarissen.
      `
    },
    {
      id: 'liability',
      title: 'Beperking van Aansprakelijkheid',
      icon: Shield,
      content: `
        **Uitgesloten aansprakelijkheid:**
        OpenHaus is niet aansprakelijk voor:
        • Directe, indirecte of gevolgschade
        • Verlies van winst of inkomsten
        • Verlies van gegevens
        • Schade door gebruik van het platform
        • Handelingen van andere gebruikers
        
        **Maximale aansprakelijkheid:**
        Onze totale aansprakelijkheid is beperkt tot maximaal €1.000 per incident, 
        behoudens gevallen van opzet of grove schuld.
        
        **Uitzonderingen:**
        Deze beperking geldt niet voor:
        • Schade door opzet of grove schuld
        • Schade aan personen
        • Wettelijk niet uit te sluiten aansprakelijkheid
        
        **Verzekering:**
        We adviseren gebruikers om adequate verzekeringen af te sluiten voor 
        vastgoedtransacties en aansprakelijkheid.
      `
    },
    {
      id: 'technical',
      title: 'Technische Aspecten',
      icon: Globe,
      content: `
        **Beschikbaarheid:**
        We streven naar 99% uptime maar kunnen niet garanderen dat het platform 
        altijd beschikbaar is. Onderhoud kan tijdelijke uitval veroorzaken.
        
        **Technische problemen:**
        We zijn niet aansprakelijk voor schade door:
        • Serveruitval of technische storingen
        • Internetverbindingsproblemen
        • Browser incompatibiliteit
        • Malware of virussen
        
        **Gegevensbeveiliging:**
        Hoewel we passende beveiligingsmaatregelen nemen, kunnen we geen absolute 
        beveiliging garanderen tegen cyberaanvallen of datalekken.
        
        **Back-ups:**
        We maken regelmatig back-ups maar garanderen geen volledig gegevensherstel 
        bij technische problemen.
      `
    },
    {
      id: 'external',
      title: 'Externe Links en Diensten',
      icon: Globe,
      content: `
        **Links naar externe websites:**
        Ons platform kan links bevatten naar externe websites. We zijn niet 
        verantwoordelijk voor de inhoud of het privacybeleid van deze sites.
        
        **Externe dienstverleners:**
        We werken samen met externe dienstverleners (notarissen, hypotheekadviseurs, etc.). 
        We zijn niet aansprakelijk voor hun dienstverlening.
        
        **Integraties:**
        Integraties met externe diensten (Google Maps, sociale media, etc.) kunnen 
        eigen voorwaarden en beperkingen hebben.
        
        **Verificatie:**
        Controleer altijd de betrouwbaarheid van externe dienstverleners voordat 
        je hun diensten gebruikt.
      `
    },
    {
      id: 'changes',
      title: 'Wijzigingen en Updates',
      icon: FileText,
      content: `
        **Wijzigingen in disclaimer:**
        We kunnen deze disclaimer op elk moment wijzigen. Belangrijke wijzigingen 
        worden aangekondigd op het platform.
        
        **Kennisgeving:**
        Gebruikers worden geïnformeerd over wijzigingen via:
        • Email notificaties
        • Berichten op het platform
        • Update van de "laatst bijgewerkt" datum
        
        **Voortgezet gebruik:**
        Voortgezet gebruik van het platform na wijzigingen geldt als acceptatie 
        van de nieuwe disclaimer.
        
        **Archief:**
        Eerdere versies van deze disclaimer zijn op verzoek beschikbaar.
      `
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-red-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <AlertTriangle className="w-12 h-12 text-orange-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Disclaimer
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Belangrijke informatie over het gebruik van OpenHaus, beperkingen van onze diensten 
              en aansprakelijkheid. Lees deze informatie zorgvuldig door.
            </p>
            <Badge className="bg-orange-100 text-orange-800">
              Laatst bijgewerkt: {lastUpdated}
            </Badge>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-8 h-8 text-red-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-red-900 mb-4">
                    Belangrijke Waarschuwing
                  </h2>
                  <div className="space-y-3 text-red-800">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-red-600" />
                      <span>Lees deze disclaimer zorgvuldig voordat je het platform gebruikt</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-red-600" />
                      <span>Raadpleeg professionals voor belangrijke vastgoedbeslissingen</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-red-600" />
                      <span>Controleer altijd alle informatie zelf</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-red-600" />
                      <span>Gebruik het platform op eigen risico</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    {section.content.split('\n').map((paragraph, pIndex) => {
                      if (paragraph.trim() === '') return null
                      
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        return (
                          <h4 key={pIndex} className="font-bold text-gray-900 mt-6 mb-3">
                            {paragraph.replace(/\*\*/g, '')}
                          </h4>
                        )
                      }
                      
                      if (paragraph.startsWith('•')) {
                        return (
                          <div key={pIndex} className="flex items-start space-x-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2"></div>
                            <span className="text-gray-700">{paragraph.substring(2)}</span>
                          </div>
                        )
                      }
                      
                      return (
                        <p key={pIndex} className="text-gray-700 leading-relaxed mb-4">
                          {paragraph}
                        </p>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Professional Advice Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 mb-8"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <Info className="w-8 h-8 text-blue-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 mb-4">
                    Professioneel Advies Aanbevolen
                  </h2>
                  <p className="text-blue-800 mb-4">
                    Voor belangrijke vastgoedbeslissingen raden we sterk aan om professioneel advies in te winnen van:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">Gecertificeerde taxateurs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">Notarissen</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">Hypotheekadviseurs</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">Juridisch adviseurs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">Bouwkundige inspecteurs</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-800">Fiscaal adviseurs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Vragen over deze disclaimer?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Ons juridisch team beantwoordt graag je vragen over deze disclaimer
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:legal@openhaus.nl"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary hover:bg-gray-100 rounded-lg text-lg font-bold transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  legal@openhaus.nl
                </a>
              </div>
              <p className="text-sm opacity-75 mt-4">
                We reageren binnen 5 werkdagen op juridische vragen
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}