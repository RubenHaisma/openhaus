"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddressInput } from '@/components/ui/address-input'
import { 
  Zap, 
  Calculator, 
  TrendingUp, 
  Shield, 
  Clock,
  CheckCircle,
  Users,
  Euro,
  Leaf,
  Home,
  ArrowRight,
  Phone
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function EnergyAdvicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAddressSearch = async (address: string, postalCode: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/energy/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, postalCode }),
      })
      
      if (res.ok) {
        const data = await res.json()
        // Redirect to energy plan with assessment data
        router.push(`/energy-plan?address=${encodeURIComponent(address)}&postal=${encodeURIComponent(postalCode)}`)
      } else {
        const errorData = await res.json()
        alert(`Fout bij het ophalen van energiegegevens: ${errorData.error}`)
      }
    } catch (error: any) {
      alert(`Fout bij het ophalen van energiegegevens: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: Euro,
      title: "Tot €25.000 subsidie",
      description: "Maximale subsidie voor warmtepomp, isolatie en zonnepanelen",
      amount: "€25.000 max"
    },
    {
      icon: TrendingUp,
      title: "60% energiebesparing",
      description: "Gemiddelde energiebesparing na volledige verduurzaming",
      amount: "€2.400/jaar"
    },
    {
      icon: Leaf,
      title: "CO₂ reductie",
      description: "Draag bij aan klimaatdoelen en verhoog je woningwaarde",
      amount: "4 ton CO₂/jaar"
    },
    {
      icon: Shield,
      title: "Compliance zekerheid",
      description: "Voldoe aan alle 2030 en 2050 energievereisten",
      amount: "100% compliant"
    }
  ]

  const steps = [
    {
      step: '1',
      title: 'Energieanalyse',
      description: 'Uitgebreide analyse van je huidige energieverbruik en -label',
      icon: Calculator
    },
    {
      step: '2',
      title: 'Maatregelplan',
      description: 'Persoonlijk plan met prioritering van energiemaatregelen',
      icon: Zap
    },
    {
      step: '3',
      title: 'Subsidie optimalisatie',
      description: 'Maximale subsidie door slimme combinatie van maatregelen',
      icon: Euro
    },
    {
      step: '4',
      title: 'Implementatie',
      description: 'Uitvoering met gecertificeerde installateurs en begeleiding',
      icon: Users
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-green-100 text-green-800">
              Gratis energieadvies
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Gratis energieadvies voor je woning
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ontdek in 2 minuten welke energiemaatregelen het meest opleveren voor jouw woning. 
              Inclusief subsidie-advies en ROI berekening.
            </p>
            
            {/* Address Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <AddressInput
                onSearch={handleAddressSearch}
                placeholder="Voer je adres in voor gratis energieadvies..."
                className="w-full h-16 text-xl px-6 rounded-xl shadow-lg border-2 border-green-200 focus:border-green-500"
                loading={loading}
              />
              
              <div className="flex items-center justify-center space-x-8 mt-4 text-sm text-green-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>100% gratis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Direct resultaat</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Geen verplichtingen</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/subsidies">
                <Button size="lg" variant="outline" className="px-8 py-3">
                  <Euro className="w-5 h-5 mr-2" />
                  Bekijk subsidies
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
            Waarom energieadvies van WattVrij?
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
            Zo werkt ons energieadvies
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

        {/* What's Included */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Wat krijg je in je energieadvies?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Analyse & Advies</h3>
                  <div className="space-y-3">
                    {[
                      'Huidige energielabel en verbruik',
                      'Potentiële energiebesparing per maatregel',
                      'Prioritering van maatregelen',
                      'Terugverdientijd berekening',
                      'CO₂ reductie impact'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900">Subsidie & Uitvoering</h3>
                  <div className="space-y-3">
                    {[
                      'Alle beschikbare subsidies voor jouw situatie',
                      'Optimale combinatie van maatregelen',
                      'Geschatte totale investering',
                      'Aanbevolen installateurs in je regio',
                      'Stappenplan voor implementatie'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Start vandaag met je energietransitie
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Krijg binnen 2 minuten je persoonlijke energieadvies
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  onClick={() => document.querySelector('input')?.focus()}
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Start gratis advies
                </Button>
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