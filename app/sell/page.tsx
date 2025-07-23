"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddressInput } from '@/components/ui/address-input'
import { 
  Home, 
  Euro, 
  TrendingUp, 
  Calculator, 
  Clock,
  CheckCircle,
  Users,
  Shield,
  Phone,
  FileText,
  ArrowRight,
  MapPin
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SellPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAddressSearch = async (address: string, postalCode: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, postalCode }),
      })
      
      if (res.ok) {
        const data = await res.json()
        // Redirect to list-property with valuation data
        router.push(`/list-property?address=${encodeURIComponent(address)}&postal=${encodeURIComponent(postalCode)}&value=${encodeURIComponent(data.valuation.estimatedValue)}`)
      } else {
        const errorData = await res.json()
        alert(`Fout bij het ophalen van woninggegevens: ${errorData.error}`)
      }
    } catch (error: any) {
      alert(`Fout bij het ophalen van woninggegevens: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

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

  const steps = [
    {
      step: '1',
      title: 'Gratis taxatie',
      description: 'Voer je adres in en ontvang direct een nauwkeurige woningwaarde',
      icon: Calculator
    },
    {
      step: '2',
      title: 'Plaats advertentie',
      description: 'Upload foto\'s en beschrijving op ons platform',
      icon: Home
    },
    {
      step: '3',
      title: 'Ontvang interesse',
      description: 'Geïnteresseerde kopers nemen direct contact met je op',
      icon: Users
    },
    {
      step: '4',
      title: 'Verkoop & overdracht',
      description: 'Onderhandel en regel de overdracht via de notaris',
      icon: FileText
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-green-100 text-green-800">
              Verkoop zonder makelaar
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Verkoop je huis direct aan kopers
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plaats je woning op ons platform en kom direct in contact met kopers. 
              Geen makelaarskosten, geen tussenpersonen.
            </p>
            
            {/* Address Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <AddressInput
                onSearch={handleAddressSearch}
                placeholder="Voer je adres in voor een gratis taxatie..."
                className="w-full h-16 text-xl px-6 rounded-xl shadow-lg border-2 border-green-200 focus:border-green-500"
                loading={loading}
              />
              
              <div className="flex items-center justify-center space-x-8 mt-4 text-sm text-green-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Gratis taxatie</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Direct contact</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Geen kosten</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/instant-offer">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-3">
                  <Calculator className="w-5 h-5 mr-2" />
                  Start gratis taxatie
                </Button>
              </Link>
              <Link href="/gids/huis-verkopen-zonder-makelaar">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  <FileText className="w-5 h-5 mr-2" />
                  Lees de gids
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Waarom verkopen via OpenHaus?
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
                      <div className="p-3 bg-green-100 rounded-lg">
                        <benefit.icon className="w-6 h-6 text-green-600" />
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

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Zo werkt het
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center mx-auto text-xl font-bold mb-4">
                    {step.step}
                  </div>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto shadow-lg -mt-6 relative z-10">
                    <step.icon className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Klaar om je huis te verkopen?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Start met een gratis taxatie en ontdek wat je huis waard is
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/instant-offer">
                  <Button 
                    size="lg" 
                    className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Start gratis taxatie
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-3 text-lg font-bold"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  020 123 4567
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}