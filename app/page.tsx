"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AddressInput } from '@/components/ui/address-input'
import { ValuationResult } from '@/components/valuation/valuation-result'
import { getPropertyData, calculateValuation, PropertyValuation } from '@/lib/kadaster'
import { Home, TrendingUp, Shield, Clock, CheckCircle, Star } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function HomePage() {
  const [valuation, setValuation] = useState<PropertyValuation | null>(null)
  const [searchedAddress, setSearchedAddress] = useState<string>('')
  const [searchedPostalCode, setSearchedPostalCode] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleAddressSearch = async (address: string, postalCode: string) => {
    setLoading(true)
    try {
      const propertyData = await getPropertyData(address, postalCode)
      if (propertyData) {
        const valuationResult = await calculateValuation(propertyData)
        setValuation(valuationResult)
        setSearchedAddress(address)
        setSearchedPostalCode(postalCode)
      }
    } catch (error) {
      console.error('Valuation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSellRequest = () => {
    // Navigate to selling wizard with valuation data
    window.location.href = `/verkopen?address=${encodeURIComponent(searchedAddress)}&postal=${encodeURIComponent(searchedPostalCode)}&value=${valuation?.estimatedValue}`
  }

  if (valuation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ValuationResult
          address={searchedAddress}
          postalCode={searchedPostalCode}
          valuation={valuation}
          onSellRequest={handleSellRequest}
        />
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Direct je huis verkopen<br />
              <span className="text-blue-200">of kopen in Nederland</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto"
            >
              Ontvang een bod op je woning binnen enkele minuten. 
              Regel je verkoop of aankoop volledig digitaal – van taxatie tot notaris.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              <AddressInput
                onSearch={handleAddressSearch}
                placeholder="Bijv. Keizersgracht 123"
                className="bg-white rounded-2xl p-6 shadow-2xl"
              />
            </motion.div>

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 text-blue-100"
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                Berekenen van je woningwaarde...
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Waarom kiezen voor OpenHaus?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We maken het kopen en verkopen van huizen simpel, snel en transparant
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Direct bod binnen minuten
                  </h3>
                  <p className="text-gray-600">
                    Geen weken wachten op kopers. Ontvang een eerlijk bod gebaseerd 
                    op AI-analyse en marktdata van vergelijkbare woningen.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    100% zekerheid
                  </h3>
                  <p className="text-gray-600">
                    Geen financieringsvoorbehoud of afvallers. Ons bod is definitief 
                    en we regelen alles van inspectie tot notaris.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="text-center p-8 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Geen makelaarskosten
                  </h3>
                  <p className="text-gray-600">
                    Bespaar duizenden euro's aan makelaarskosten. Ons digitale 
                    platform maakt tussenpersonen overbodig.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Zo werkt het
            </h2>
            <p className="text-xl text-gray-600">
              Van taxatie tot sleuteloverdracht in 4 eenvoudige stappen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Gratis taxatie',
                description: 'Vul je adres in en ontvang direct een nauwkeurige woningwaarde',
                icon: Home
              },
              {
                step: '2',
                title: 'Direct bod',
                description: 'Accepteer ons eerlijke bod of kies voor traditionele verkoop',
                icon: TrendingUp
              },
              {
                step: '3',
                title: 'Inspectie & documenten',
                description: 'We regelen de inspectie en alle juridische documenten',
                icon: CheckCircle
              },
              {
                step: '4',
                title: 'Sleuteloverdracht',
                description: 'Na tekening bij de notaris ontvang je het geld op je rekening',
                icon: Star
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mt-4 shadow-lg">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Klaar om je huis te verkopen?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Voeg je adres toe en ontdek binnen 2 minuten wat je huis waard is
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#hero">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-xl text-lg font-semibold">
                Start gratis taxatie
              </Button>
            </Link>
            <Link href="/kopen">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-xl text-lg font-semibold">
                Bekijk woningen
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}