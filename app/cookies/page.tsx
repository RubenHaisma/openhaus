"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Cookie, 
  Settings, 
  Eye, 
  BarChart3, 
  Target,
  Shield,
  CheckCircle,
  X,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'


export default function CookiesPage() {
  const [cookieSettings, setCookieSettings] = useState({
    necessary: true, // Always enabled
    analytics: true,
    marketing: false,
    preferences: true
  })

  const lastUpdated = "15 december 2024"

  const cookieTypes = [
    {
      id: 'necessary',
      title: 'Noodzakelijke Cookies',
      icon: Shield,
      description: 'Deze cookies zijn essentieel voor het functioneren van de website',
      required: true,
      examples: [
        'Inlogstatus onthouden',
        'Winkelwagen inhoud bewaren',
        'Beveiligingsinstellingen',
        'Taalvoorkeuren'
      ],
      retention: 'Sessie tot 1 jaar',
      enabled: cookieSettings.necessary
    },
    {
      id: 'analytics',
      title: 'Analytische Cookies',
      icon: BarChart3,
      description: 'Helpen ons begrijpen hoe bezoekers de website gebruiken',
      required: false,
      examples: [
        'Google Analytics',
        'Pagina bezoeken tellen',
        'Gebruikersgedrag analyseren',
        'Performance monitoring'
      ],
      retention: '2 jaar',
      enabled: cookieSettings.analytics
    },
    {
      id: 'marketing',
      title: 'Marketing Cookies',
      icon: Target,
      description: 'Gebruikt voor gepersonaliseerde advertenties en marketing',
      required: false,
      examples: [
        'Facebook Pixel',
        'Google Ads tracking',
        'Retargeting advertenties',
        'Conversie tracking'
      ],
      retention: '1 jaar',
      enabled: cookieSettings.marketing
    },
    {
      id: 'preferences',
      title: 'Voorkeur Cookies',
      icon: Settings,
      description: 'Onthouden je voorkeuren voor een betere gebruikerservaring',
      required: false,
      examples: [
        'Weergave instellingen',
        'Zoekfilters onthouden',
        'Favoriete woningen',
        'Notificatie voorkeuren'
      ],
      retention: '6 maanden',
      enabled: cookieSettings.preferences
    }
  ]

  const handleCookieToggle = (cookieId: string, enabled: boolean) => {
    if (cookieId === 'necessary') return // Cannot disable necessary cookies
    
    setCookieSettings(prev => ({
      ...prev,
      [cookieId]: enabled
    }))
  }

  const acceptAll = () => {
    setCookieSettings({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    })
  }

  const rejectAll = () => {
    setCookieSettings({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    })
  }

  const saveSettings = () => {
    // In a real implementation, this would save to localStorage and update actual cookie consent
    alert('Cookie voorkeuren opgeslagen!')
  }

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
              <Cookie className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Cookie Beleid
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              Transparante uitleg over welke cookies we gebruiken, waarom we ze gebruiken 
              en hoe je je voorkeuren kunt beheren.
            </p>
            <Badge className="bg-blue-100 text-blue-800">
              Laatst bijgewerkt: {lastUpdated}
            </Badge>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cookie Settings Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-green-600" />
                <span>Cookie Voorkeuren Beheren</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Beheer hier je cookie voorkeuren. Je kunt deze instellingen op elk moment wijzigen.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {cookieTypes.map((type, index) => (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <type.icon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{type.title}</h3>
                              {type.required && (
                                <Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
                                  Verplicht
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Switch
                            checked={type.enabled}
                            onCheckedChange={(enabled) => handleCookieToggle(type.id, enabled)}
                            disabled={type.required}
                          />
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900 text-sm">Voorbeelden:</h4>
                          {type.examples.map((example, exampleIndex) => (
                            <div key={exampleIndex} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                              <span className="text-gray-600 text-xs">{example}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Bewaartijd:</span>
                            <span>{type.retention}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <Button onClick={acceptAll} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accepteer alle cookies
                </Button>
                <Button onClick={rejectAll} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Alleen noodzakelijke
                </Button>
                <Button onClick={saveSettings} variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Voorkeuren opslaan
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* What are cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Info className="w-6 h-6 text-blue-600" />
                <span>Wat zijn cookies?</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Cookies zijn kleine tekstbestanden die op je apparaat worden opgeslagen wanneer je een website bezoekt. 
                  Ze helpen websites om je voorkeuren te onthouden en je een betere gebruikerservaring te bieden.
                </p>
                
                <h4 className="font-bold text-gray-900 mt-6 mb-3">Waarom gebruiken we cookies?</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h5 className="font-medium text-gray-900">Functionaliteit</h5>
                      <p className="text-gray-600 text-sm">Je inlogstatus onthouden en voorkeuren bewaren</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h5 className="font-medium text-gray-900">Verbetering</h5>
                      <p className="text-gray-600 text-sm">Analyseren hoe de website wordt gebruikt om verbeteringen te maken</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h5 className="font-medium text-gray-900">Personalisatie</h5>
                      <p className="text-gray-600 text-sm">Relevante content en advertenties tonen</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <h5 className="font-medium text-gray-900">Beveiliging</h5>
                      <p className="text-gray-600 text-sm">Beschermen tegen fraude en misbruik</p>
                    </div>
                  </div>
                </div>
                
                <h4 className="font-bold text-gray-900 mt-6 mb-3">Soorten cookies die we gebruiken:</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Sessie cookies:</strong> Worden verwijderd wanneer je je browser sluit
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Permanente cookies:</strong> Blijven op je apparaat voor een bepaalde periode
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Eerste partij cookies:</strong> Geplaatst door WattVrij zelf
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <strong>Derde partij cookies:</strong> Geplaatst door externe diensten (Google, Facebook, etc.)
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to manage cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>Cookies beheren in je browser</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Naast onze cookie voorkeuren kun je cookies ook beheren via je browserinstellingen. 
                Hier vind je instructies voor de meest gebruikte browsers:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Chrome', url: 'https://support.google.com/chrome/answer/95647' },
                  { name: 'Firefox', url: 'https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop' },
                  { name: 'Safari', url: 'https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac' },
                  { name: 'Edge', url: 'https://support.microsoft.com/help/4027947/microsoft-edge-delete-cookies' }
                ].map((browser, index) => (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-gray-900 mb-2">{browser.name}</h4>
                      <Button variant="outline" size="sm" asChild>
                        <a href={browser.url} target="_blank" rel="noopener noreferrer">
                          Instructies
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Let op</h4>
                    <p className="text-yellow-800 text-sm">
                      Het uitschakelen van bepaalde cookies kan de functionaliteit van onze website beperken. 
                      Noodzakelijke cookies kunnen niet worden uitgeschakeld zonder de werking van de site te beïnvloeden.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Third party services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>Externe diensten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                We gebruiken verschillende externe diensten die hun eigen cookies kunnen plaatsen:
              </p>
              
              <div className="space-y-4">
                {[
                  {
                    name: 'Google Analytics',
                    purpose: 'Website statistieken en gebruikersgedrag',
                    privacy: 'https://policies.google.com/privacy',
                    optOut: 'https://tools.google.com/dlpage/gaoptout'
                  },
                  {
                    name: 'Google Maps',
                    purpose: 'Kaarten en locatiediensten',
                    privacy: 'https://policies.google.com/privacy',
                    optOut: 'Via Google account instellingen'
                  },
                  {
                    name: 'Facebook Pixel',
                    purpose: 'Marketing en advertenties (alleen met toestemming)',
                    privacy: 'https://www.facebook.com/privacy/explanation',
                    optOut: 'https://www.facebook.com/settings?tab=ads'
                  },
                  {
                    name: 'Hotjar',
                    purpose: 'Gebruikerservaring analyse',
                    privacy: 'https://www.hotjar.com/legal/policies/privacy/',
                    optOut: 'https://www.hotjar.com/legal/compliance/opt-out'
                  }
                ].map((service, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-3 md:mb-0">
                        <h4 className="font-bold text-gray-900">{service.name}</h4>
                        <p className="text-gray-600 text-sm">{service.purpose}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={service.privacy} target="_blank" rel="noopener noreferrer">
                            Privacy beleid
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={service.optOut} target="_blank" rel="noopener noreferrer">
                            Opt-out
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Vragen over cookies?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Ons privacy team helpt je graag met al je vragen over cookies en privacy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="mailto:privacy@WattVrij.nl"
                  className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary hover:bg-gray-100 rounded-lg text-lg font-bold transition-colors"
                >
                  <Cookie className="w-5 h-5 mr-2" />
                  privacy@WattVrij.nl
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}