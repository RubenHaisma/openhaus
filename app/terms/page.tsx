"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Scale, 
  Shield, 
  Users, 
  Home, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Mail
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function TermsPage() {
  const lastUpdated = "15 december 2024"

  const sections = [
    {
      id: 'definitions',
      title: 'Definities',
      icon: FileText,
      content: `
        In deze algemene voorwaarden worden de volgende begrippen gebruikt:
        
        **WattVrij:** WattVrij B.V., gevestigd te Amsterdam, KvK nummer 87654321
        
        **Platform:** De website, mobiele applicatie en alle gerelateerde diensten van WattVrij
        
        **Gebruiker:** Elke persoon die gebruik maakt van het Platform
        
        **Verkoper:** Een gebruiker die een woning aanbiedt via het Platform
        
        **Koper:** Een gebruiker die interesse toont in een woning via het Platform
        
        **Woning:** Elk onroerend goed dat wordt aangeboden via het Platform
        
        **Diensten:** Alle diensten die WattVrij aanbiedt via het Platform
      `
    },
    {
      id: 'acceptance',
      title: 'Acceptatie en wijzigingen',
      icon: Scale,
      content: `
        **Acceptatie:**
        Door gebruik te maken van het Platform accepteer je deze algemene voorwaarden volledig. 
        Als je niet akkoord gaat met deze voorwaarden, mag je het Platform niet gebruiken.
        
        **Wijzigingen:**
        WattVrij behoudt zich het recht voor om deze voorwaarden te wijzigen. Wijzigingen worden 
        minimaal 30 dagen van tevoren aangekondigd via email en op het Platform.
        
        **Nieuwe versies:**
        Bij belangrijke wijzigingen vragen we je om opnieuw akkoord te gaan. Voortgezet gebruik 
        na wijzigingen geldt als acceptatie van de nieuwe voorwaarden.
        
        **Toepasselijk recht:**
        Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd 
        aan de bevoegde rechter in Amsterdam.
      `
    },
    {
      id: 'user-accounts',
      title: 'Gebruikersaccounts',
      icon: Users,
      content: `
        **Account aanmaken:**
        Voor het gebruik van bepaalde functies is een account vereist. Je bent verplicht 
        juiste en volledige informatie te verstrekken.
        
        **Accountveiligheid:**
        Je bent verantwoordelijk voor het geheimhouden van je inloggegevens en alle 
        activiteiten die plaatsvinden onder je account.
        
        **Verificatie:**
        WattVrij kan identiteitsverificatie vereisen voor bepaalde diensten. Dit kan 
        bestaan uit het uploaden van officiële documenten.
        
        **Account opschorting:**
        WattVrij kan accounts opschorten of beëindigen bij overtreding van deze voorwaarden, 
        verdachte activiteiten of op verzoek van de gebruiker.
        
        **Gegevens bij beëindiging:**
        Bij beëindiging van je account worden je gegevens verwijderd conform ons privacybeleid, 
        behoudens wettelijke bewaarplichten.
      `
    },
    {
      id: 'platform-use',
      title: 'Gebruik van het Platform',
      icon: Home,
      content: `
        **Toegestaan gebruik:**
        Het Platform mag alleen worden gebruikt voor legitieme vastgoedtransacties en 
        gerelateerde activiteiten zoals beschreven in onze diensten.
        
        **Verboden activiteiten:**
        • Het plaatsen van valse of misleidende informatie
        • Het gebruik van het Platform voor illegale doeleinden
        • Het versturen van spam of ongewenste berichten
        • Het omzeilen van beveiligingsmaatregelen
        • Het kopiëren of reproduceren van Platform content
        
        **Content richtlijnen:**
        Alle content die je plaatst moet accuraat, legaal en niet-discriminerend zijn. 
        WattVrij behoudt zich het recht voor content te modereren of te verwijderen.
        
        **Intellectueel eigendom:**
        Het Platform en alle content blijven eigendom van WattVrij of haar licentiegevers. 
        Je krijgt alleen een beperkte licentie voor persoonlijk gebruik.
      `
    },
    {
      id: 'property-listings',
      title: 'Woningadvertenties',
      icon: Home,
      content: `
        **Verantwoordelijkheid verkoper:**
        Verkopers zijn volledig verantwoordelijk voor de juistheid en volledigheid van 
        hun woningadvertenties, inclusief foto's, beschrijvingen en prijzen.
        
        **Vereiste informatie:**
        Advertenties moeten minimaal bevatten: correct adres, realistische prijs, 
        accurate beschrijving en recente foto's.
        
        **Eigendomsverificatie:**
        WattVrij kan eigendomsverificatie vereisen voordat een advertentie wordt gepubliceerd. 
        Dit kan bestaan uit het tonen van eigendomsdocumenten.
        
        **Advertentie duur:**
        Advertenties blijven actief zolang de woning beschikbaar is, met een maximum van 
        12 maanden. Verkopers kunnen advertenties altijd eerder verwijderen.
        
        **Moderatie:**
        WattVrij behoudt zich het recht voor advertenties te modereren, bewerken of 
        verwijderen die niet voldoen aan onze richtlijnen.
      `
    },
    {
      id: 'transactions',
      title: 'Transacties en betalingen',
      icon: CreditCard,
      content: `
        **Rol van WattVrij:**
        WattVrij faciliteert contact tussen kopers en verkopers maar is geen partij 
        bij de uiteindelijke koopovereenkomst.
        
        **Betalingen:**
        Alle betalingen voor woningaankopen verlopen via een notaris. WattVrij 
        handelt geen koopprijzen af.
        
        **Kosten:**
        Het gebruik van het Platform is gratis voor gebruikers. Eventuele aanvullende 
        diensten hebben duidelijk vermelde kosten.
        
        **Geen garanties:**
        WattVrij geeft geen garanties over de totstandkoming van transacties of 
        de kwaliteit van woningen.
        
        **Geschillen:**
        Geschillen tussen kopers en verkopers moeten onderling worden opgelost. 
        WattVrij kan bemiddelen maar is niet verplicht dit te doen.
      `
    },
    {
      id: 'liability',
      title: 'Aansprakelijkheid',
      icon: Shield,
      content: `
        **Beperkte aansprakelijkheid:**
        WattVrij is niet aansprakelijk voor schade die voortvloeit uit het gebruik 
        van het Platform, behoudens grove schuld of opzet.
        
        **Geen garantie op beschikbaarheid:**
        We streven naar 99% uptime maar kunnen geen garantie geven dat het Platform 
        altijd beschikbaar is.
        
        **Gebruikersinhoud:**
        WattVrij is niet aansprakelijk voor content die door gebruikers wordt geplaatst, 
        inclusief onjuiste informatie in woningadvertenties.
        
        **Derde partijen:**
        Links naar externe websites zijn voor gemak. WattVrij is niet verantwoordelijk 
        voor de inhoud of het privacybeleid van deze sites.
        
        **Maximale aansprakelijkheid:**
        Onze totale aansprakelijkheid is beperkt tot €1.000 per incident, behoudens 
        wettelijke uitzonderingen.
      `
    },
    {
      id: 'privacy-data',
      title: 'Privacy en gegevens',
      icon: Shield,
      content: `
        **Privacybeleid:**
        Het verzamelen en verwerken van persoonlijke gegevens is geregeld in ons 
        separate privacybeleid, dat onderdeel uitmaakt van deze voorwaarden.
        
        **Toestemming:**
        Door het Platform te gebruiken stem je in met ons privacybeleid en de 
        verwerking van je gegevens zoals daarin beschreven.
        
        **Gegevensbeveiliging:**
        We nemen passende technische en organisatorische maatregelen om je gegevens 
        te beschermen tegen ongeautoriseerde toegang.
        
        **Internationale overdracht:**
        Je gegevens kunnen worden overgedragen naar landen buiten de EU, maar alleen 
        met passende waarborgen conform de AVG.
      `
    },
    {
      id: 'termination',
      title: 'Beëindiging',
      icon: AlertTriangle,
      content: `
        **Door gebruiker:**
        Je kunt je account op elk moment beëindigen door contact op te nemen met 
        onze klantenservice of via je accountinstellingen.
        
        **Door WattVrij:**
        We kunnen je toegang beëindigen bij overtreding van deze voorwaarden, 
        inactiviteit van meer dan 2 jaar, of om andere legitieme redenen.
        
        **Gevolgen van beëindiging:**
        Bij beëindiging vervallen alle rechten op het gebruik van het Platform. 
        Actieve advertenties worden verwijderd.
        
        **Gegevensverwijdering:**
        Na beëindiging worden je gegevens verwijderd conform ons privacybeleid, 
        behoudens wettelijke bewaarplichten.
        
        **Voortbestaan bepalingen:**
        Bepalingen over aansprakelijkheid, intellectueel eigendom en geschillenbeslechting 
        blijven van kracht na beëindiging.
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
              <Scale className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Algemene Voorwaarden
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Deze algemene voorwaarden regelen het gebruik van het WattVrij platform. 
              Door ons platform te gebruiken ga je akkoord met deze voorwaarden.
            </p>
            <Badge className="bg-blue-100 text-blue-800">
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
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-yellow-900 mb-4">
                    Belangrijke informatie
                  </h2>
                  <div className="space-y-3 text-yellow-800">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                      <span>Deze voorwaarden zijn juridisch bindend</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                      <span>Lees ze zorgvuldig door voordat je het platform gebruikt</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                      <span>Bij vragen kun je altijd contact met ons opnemen</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                      <span>Nederlands recht is van toepassing</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>Inhoudsopgave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <section.icon className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-900 hover:text-blue-600">
                      {index + 1}. {section.title}
                    </span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
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
                    <span>{index + 1}. {section.title}</span>
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
                Vragen over deze voorwaarden?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Ons juridisch team helpt je graag met uitleg over deze voorwaarden
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:legal@WattVrij.nl"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary hover:bg-gray-100 rounded-lg text-lg font-bold transition-colors"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  legal@WattVrij.nl
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