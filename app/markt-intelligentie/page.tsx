"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarketIntelligenceDashboard } from '@/components/energy/market-intelligence-dashboard'
import { 
  BarChart3, 
  TrendingUp, 
  Euro, 
  Zap, 
  Users,
  MapPin,
  Download,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import React from 'react'
import { useEffect } from 'react'

export default function MarketIntelligencePage() {
  const [selectedRegion, setSelectedRegion] = useState('Nederland')
  const [refreshing, setRefreshing] = useState(false)
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchInsights()
    setRefreshing(false)
  }

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/energy/market-intelligence')
      const data = await res.json()
      const intelligence = data.intelligence
      // 1. Energieprijzen dalen
      const gasDrop = intelligence.priceForecasts.gas.forecast12Months < intelligence.currentPrices.gas
      const electricityDrop = intelligence.priceForecasts.electricity.forecast12Months < intelligence.currentPrices.electricity
      const priceDrop = gasDrop && electricityDrop
      // 2. Subsidiebudget kritiek
      const isdeUtil = intelligence.subsidyBudgetStatus.isde.utilizationRate
      const seehUtil = intelligence.subsidyBudgetStatus.seeh.utilizationRate
      // 3. Installateur tekort
      const avgWait = intelligence.contractorMarket.averageWaitTime
      // 4. Regionale verschillen
      const utrecht = intelligence.regionalData.find((r:any) => r.region === 'Utrecht')
      const noord = intelligence.regionalData.find((r:any) => r.region.toLowerCase().includes('noord'))
      setInsights([
        {
          title: 'Energieprijzen dalen',
          description: priceDrop
            ? 'Gas en elektriciteit prijzen verwacht lager in 2025'
            : 'Prijzen blijven stabiel of stijgen licht',
          impact: priceDrop
            ? 'Positief voor ROI berekeningen'
            : 'Let op bij investeringsbeslissingen',
          icon: TrendingUp,
          color: priceDrop ? 'text-green-600' : 'text-yellow-600'
        },
        {
          title: 'Subsidiebudget kritiek',
          description: `ISDE en SEEH budgetten ${Math.round(Math.max(isdeUtil, seehUtil))}% gebruikt`,
          impact: Math.max(isdeUtil, seehUtil) > 80
            ? 'Urgente actie vereist voor aanvragen'
            : 'Subsidie nog beschikbaar',
          icon: Euro,
          color: Math.max(isdeUtil, seehUtil) > 80 ? 'text-red-600' : 'text-green-600'
        },
        {
          title: 'Installateur tekort',
          description: `Gemiddelde wachttijd gestegen naar ${avgWait}+ weken`,
          impact: avgWait > 6
            ? 'Plan projecten vroeg in het seizoen'
            : 'Wachttijden zijn normaal',
          icon: Users,
          color: avgWait > 6 ? 'text-orange-600' : 'text-green-600'
        },
        {
          title: 'Regionale verschillen',
          description: utrecht && noord
            ? `Utrecht loopt voor (${utrecht.averageEnergyLabel}), Noord-Nederland achter (${noord.averageEnergyLabel})`
            : 'Regionale data niet volledig',
          impact: 'Lokale strategieën nodig',
          icon: MapPin,
          color: 'text-blue-600'
        }
      ])
    } catch (e) {
      setInsights([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <BarChart3 className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Energiemarkt Intelligentie
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Real-time marktdata, prijsvoorspellingen en trends voor de Nederlandse energietransitie. 
              Maak data-gedreven beslissingen voor je energieprojecten.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-lg mb-8">
              <div className="flex items-center space-x-2">
                <Zap className="w-6 h-6 text-blue-600" />
                <span><strong>Real-time</strong> prijsdata</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span><strong>Voorspellende</strong> analytics</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-purple-600" />
                <span><strong>Regionale</strong> inzichten</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
              >
                <RefreshCw className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Vernieuwen...' : 'Data vernieuwen'}
              </Button>
              
              <Button variant="outline" className="px-8 py-3">
                <Download className="w-5 h-5 mr-2" />
                Export rapport
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Insights */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Belangrijkste Marktinzichten
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse h-full">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="h-full flex"
                >
                  <Card className="flex flex-col h-full w-full hover:shadow-lg transition-shadow">
                    <CardContent className="flex-1 flex flex-col p-4 sm:p-6">
                      <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-gray-100 flex items-center justify-center">
                          <insight.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${insight.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 sm:mb-2 text-base sm:text-lg">
                            {insight.title}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">
                            {insight.description}
                          </p>
                          <Badge variant="outline" className="text-[10px] sm:text-xs">
                            {insight.impact}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Market Intelligence Dashboard */}
        <section className="mb-12">
          <MarketIntelligenceDashboard 
            region={selectedRegion}
            onRegionChange={setSelectedRegion}
          />
        </section>

        {/* Professional Services CTA */}
        {/* <section>
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Professionele Marktanalyse Nodig?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Krijg toegang tot geavanceerde analytics, custom rapporten en API toegang 
                voor je energieprojecten en investeringsbeslissingen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    Professionele Tools
                  </Button>
                </Link>
                <Link href="/api-docs">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-bold"
                  >
                    API Documentatie
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section> */}
      </div>
    </div>
  )
}