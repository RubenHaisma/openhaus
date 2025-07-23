"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Eye, 
  Lock, 
  Users, 
  FileText, 
  Mail,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { motion } from 'framer-motion'



export default function PrivacyPage() {
  const lastUpdated = "15 december 2024"

  const sections = [
    {
      id: 'introduction',
      title: 'Inleiding',
      icon: Shield,
      content: `
        OpenHaus B.V. ("wij", "ons", "OpenHaus") respecteert je privacy en is toegewijd aan het beschermen van je persoonlijke gegevens. 
        Dit privacybeleid legt uit hoe we je gegevens verzamelen, gebruiken, delen en beschermen wanneer je onze website en diensten gebruikt.
        
        Dit beleid is van toepassing op alle diensten die worden aangeboden door OpenHaus, inclusief onze website, mobiele applicatie en gerelateerde diensten.
      `
    },
    {
      id: 'data-collection',
      title: 'Welke gegevens verzamelen we?',
      icon: Eye,
      content: `
        We verzamelen verschillende soorten gegevens om onze diensten te kunnen leveren:
        
        **Persoonlijke identificatiegegevens:**
        • Naam, emailadres, telefoonnummer
        • Adresgegevens
        • Geboortedatum (indien relevant voor dienstverlening)
        
        **Woninggegevens:**
        • Adres van de woning
        • Woningkenmerken (aantal kamers, oppervlakte, etc.)
        • Foto's en beschrijvingen
        • Taxatiegegevens
        
        **Technische gegevens:**
        • IP-adres en browserinformatie
        • Cookies en vergelijkbare technologieën
        • Gebruiksstatistieken van onze website
        
        **Communicatiegegevens:**
        • Berichten tussen gebruikers
        • Klantenservice communicatie
        • Feedback en reviews
      `
    },
    {
      id: 'data-usage',
      title: 'Hoe gebruiken we je gegevens?',
      icon: Users,
      content: `
        We gebruiken je gegevens voor de volgende doeleinden:
        
        **Dienstverlening:**
        • Het faciliteren van vastgoedtransacties
        • Woningtaxaties en marktanalyses
        • Communicatie tussen kopers en verkopers
        
        **Verbetering van onze diensten:**
        • Analyseren van gebruikspatronen
        • Ontwikkelen van nieuwe functies
        • Optimaliseren van gebruikerservaring
        
        **Communicatie:**
        • Versturen van belangrijke updates
        • Klantenservice ondersteuning
        • Marketing (alleen met toestemming)
        
        **Juridische verplichtingen:**
        • Naleven van wettelijke vereisten
        • Voorkomen van fraude
        • Beschermen van gebruikersveiligheid
      `
    },
    {
      id: 'data-sharing',
      title: 'Met wie delen we je gegevens?',
      icon: Lock,
      content: `
        We delen je gegevens alleen in de volgende gevallen:
        
        **Met andere gebruikers:**
        • Contactgegevens worden gedeeld tussen kopers en verkopers (alleen na wederzijdse toestemming)
        • Woninggegevens zijn zichtbaar voor geïnteresseerde kopers
        
        **Met dienstverleners:**
        • Notarissen voor juridische afhandeling
        • Hypotheekadviseurs (alleen met toestemming)
        • Technische dienstverleners (hosting, analytics)
        
        **Wettelijke vereisten:**
        • Overheidsinstanties (alleen bij wettelijke verplichting)
        • Rechtshandhaving (bij gerechtelijk bevel)
        
        **Bedrijfsoverdracht:**
        • Bij fusie, overname of verkoop van ons bedrijf
        
        We verkopen nooit je gegevens aan derden voor marketingdoeleinden.
      `
    },
    {
      id: 'data-security',
      title: 'Hoe beschermen we je gegevens?',
      icon: Shield,
      content: `
        We nemen de beveiliging van je gegevens zeer serieus:
        
        **Technische maatregelen:**
        • SSL-encryptie voor alle datatransmissie
        • Beveiligde servers in EU-datacenters
        • Regelmatige beveiligingsupdates
        • Toegangscontrole en authenticatie
        
        **Organisatorische maatregelen:**
        • Beperkte toegang tot persoonlijke gegevens
        • Regelmatige training van medewerkers
        • Incident response procedures
        • Privacy impact assessments
        
        **Monitoring:**
        • Continue monitoring van systemen
        • Automatische detectie van verdachte activiteiten
        • Regelmatige beveiligingsaudits
      `
    },
    {
      id: 'your-rights',
      title: 'Jouw rechten',
      icon: FileText,
      content: `
        Onder de AVG/GDPR heb je de volgende rechten:
        
        **Recht op inzage:**
        • Je kunt opvragen welke gegevens we van je hebben
        • Je ontvangt een overzicht binnen 30 dagen
        
        **Recht op rectificatie:**
        • Je kunt onjuiste gegevens laten corrigeren
        • Je kunt incomplete gegevens laten aanvullen
        
        **Recht op verwijdering:**
        • Je kunt verzoeken om verwijdering van je gegevens
        • Dit geldt niet als we wettelijk verplicht zijn gegevens te bewaren
        
        **Recht op beperking:**
        • Je kunt de verwerking van je gegevens laten beperken
        • Je kunt bezwaar maken tegen bepaalde verwerkingen
        
        **Recht op dataportabiliteit:**
        • Je kunt je gegevens in een gestructureerd formaat opvragen
        • Je kunt deze gegevens overdragen aan een andere dienstverlener
        
        **Recht van bezwaar:**
        • Je kunt bezwaar maken tegen directmarketing
        • Je kunt bezwaar maken tegen geautomatiseerde besluitvorming
      `
    },
    {
      id: 'cookies',
      title: 'Cookies en tracking',
      icon: Eye,
      content: `
        We gebruiken cookies en vergelijkbare technologieën:
        
        **Noodzakelijke cookies:**
        • Voor het functioneren van de website
        • Voor inlogfunctionaliteit
        • Voor beveiligingsdoeleinden
        
        **Analytische cookies:**
        • Voor het meten van websitegebruik
        • Voor het verbeteren van gebruikerservaring
        • Voor het analyseren van trends
        
        **Marketing cookies:**
        • Voor gepersonaliseerde advertenties (alleen met toestemming)
        • Voor het meten van campagne-effectiviteit
        
        Je kunt cookies beheren via je browserinstellingen of onze cookie-instellingen.
      `
    },
    {
      id: 'retention',
      title: 'Bewaartermijnen',
      icon: Calendar,
      content: `
        We bewaren je gegevens niet langer dan noodzakelijk:
        
        **Accountgegevens:**
        • Zolang je account actief is
        • 3 jaar na laatste activiteit
        
        **Transactiegegevens:**
        • 7 jaar (wettelijke verplichting)
        • Voor juridische en fiscale doeleinden
        
        **Communicatiegegevens:**
        • 2 jaar na laatste contact
        • Voor klantenservice doeleinden
        
        **Marketinggegevens:**
        • Tot je je uitschrijft
        • Maximaal 3 jaar zonder activiteit
        
        **Technische logs:**
        • 12 maanden
        • Voor beveiligings- en analysedoeleinden
      `
    },
    {
      id: 'contact',
      title: 'Contact en klachten',
      icon: Mail,
      content: `
        Voor vragen over dit privacybeleid of je gegevens:
        
        **Privacy Officer:**
        Email: privacy@openhaus.nl
        Telefoon: 020 123 4567
        
        **Postadres:**
        OpenHaus B.V.
        t.a.v. Privacy Officer
        Herengracht 1
        1000 AA Amsterdam
        
        **Klachten:**
        Als je niet tevreden bent met hoe we je klacht behandelen, kun je een klacht indienen bij de Autoriteit Persoonsgegevens (AP).
        
        **Responstijd:**
        We reageren binnen 5 werkdagen op privacy-gerelateerde vragen en binnen 30 dagen op formele verzoeken onder de AVG.
      `
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
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Shield className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Privacy Policy
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Transparantie over hoe we je gegevens verzamelen, gebruiken en beschermen. 
              Je privacy is belangrijk voor ons.
            </p>
            <Badge className="bg-green-100 text-green-800">
              Laatst bijgewerkt: {lastUpdated}
            </Badge>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-green-900 mb-6">
                Samenvatting - Jouw Privacy in het Kort
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">We verkopen nooit je gegevens</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">Minimale gegevensverzameling</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">SSL-encryptie voor alle data</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">EU-servers voor gegevensbescherming</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">Volledige controle over je gegevens</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-800">AVG/GDPR compliant</span>
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
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-blue-600" />
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
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2"></div>
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

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Vragen over je privacy?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Ons privacy team staat klaar om al je vragen te beantwoorden
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:privacy@openhaus.nl"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary hover:bg-gray-100 rounded-lg text-lg font-bold transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  privacy@openhaus.nl
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}