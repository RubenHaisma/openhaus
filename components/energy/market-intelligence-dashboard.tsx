"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Zap, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  MapPin,
  Thermometer,
  Battery
} from 'lucide-react'
import { motion } from 'framer-motion'
import { EnergyMarketIntelligence } from '@/lib/integrations/energy-market-intelligence'
import React from 'react'

interface MarketIntelligenceDashboardProps {
  region?: string
  onRegionChange?: (region: string) => void
}

export function MarketIntelligenceDashboard({ 
  region, 
  onRegionChange 
}: MarketIntelligenceDashboardProps) {
  const [intelligence, setIntelligence] = useState<EnergyMarketIntelligence | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState(region || 'Nederland')
  const [anwbPrices, setAnwbPrices] = useState<{ gas: number | null, electricity: number | null } | null>(null)

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        const url = selectedRegion === 'Nederland' 
          ? '/api/energy/market-intelligence'
          : `/api/energy/market-intelligence?region=${selectedRegion}`
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setIntelligence(data.intelligence || data.regionalData)
          if (data.anwbPrices) setAnwbPrices(data.anwbPrices)
          else if (data.intelligence && data.intelligence.anwbPrices) setAnwbPrices(data.intelligence.anwbPrices)
        }
      } catch (error) {
        console.error('Failed to fetch market intelligence:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchIntelligence()
  }, [selectedRegion])

  const formatPrice = (price: number | undefined | null, unit: string) => {
    return typeof price === 'number' && !isNaN(price)
      ? `€${price.toFixed(2)}${unit}`
      : 'n.b.';
  }

  const formatPercentage = (value: number | null | undefined) => {
    return typeof value === 'number' && !isNaN(value)
      ? `${value.toFixed(1)}%`
      : 'n.b.';
  }

  const getPriceChangeIcon = (current: number, forecast: number) => {
    return forecast < current ? TrendingDown : TrendingUp
  }

  const getPriceChangeColor = (current: number, forecast: number) => {
    return forecast < current ? 'text-green-600' : 'text-red-600'
  }

  const getSubsidyUrgencyColor = (utilizationRate: number) => {
    if (utilizationRate >= 80) return 'text-red-600 bg-red-100'
    if (utilizationRate >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!intelligence) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Marktdata niet beschikbaar
          </h3>
          <p className="text-gray-600">
            Kon geen marktinformatie ophalen. Probeer het later opnieuw.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Region Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Energiemarkt Intelligentie
        </h2>
        <select
          value={selectedRegion}
          onChange={(e) => {
            setSelectedRegion(e.target.value)
            onRegionChange?.(e.target.value)
          }}
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
        >
          <option value="Nederland">Nederland</option>
          <option value="Noord-Holland">Noord-Holland</option>
          <option value="Zuid-Holland">Zuid-Holland</option>
          <option value="Utrecht">Utrecht</option>
          <option value="Noord-Brabant">Noord-Brabant</option>
        </select>
      </div>

      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="prices">Prijzen</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="subsidies">Subsidies</TabsTrigger>
          <TabsTrigger value="contractors">Installateurs</TabsTrigger>
          <TabsTrigger value="regional">Regionaal</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-6">
          {/* Current Energy Prices */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Thermometer className="w-5 h-5 text-blue-600" />
                  <span>Gas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatPrice(intelligence.currentPrices.gas, '/m³')}
                    <Badge className="ml-2" variant="outline">Energieprijs.nl</Badge>
                  </div>
                  {anwbPrices && anwbPrices.gas !== null && (
                    <div className="text-lg text-gray-700 flex items-center gap-2">
                      {formatPrice(anwbPrices.gas, '/m³')}
                      <Badge className="ml-1" variant="secondary">ANWB Energie</Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {React.createElement(
                    getPriceChangeIcon(
                      intelligence.currentPrices.gas, 
                      intelligence.priceForecasts.gas.forecast6Months
                    ),
                    { className: `w-4 h-4 ${getPriceChangeColor(intelligence.currentPrices.gas, intelligence.priceForecasts.gas.forecast6Months)}` }
                  )}
                  <span className={`text-sm ${getPriceChangeColor(intelligence.currentPrices.gas, intelligence.priceForecasts.gas.forecast6Months)}`}>
                    {formatPrice(intelligence.priceForecasts.gas.forecast6Months, '/m³')} (6m)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  <span>Elektriciteit</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-1">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatPrice(intelligence.currentPrices.electricity, '/kWh')}
                    <Badge className="ml-2" variant="outline">Energieprijs.nl</Badge>
                  </div>
                  {anwbPrices && anwbPrices.electricity !== null && (
                    <div className="text-lg text-gray-700 flex items-center gap-2">
                      {formatPrice(anwbPrices.electricity, '/kWh')}
                      <Badge className="ml-1" variant="secondary">ANWB Energie</Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {React.createElement(
                    getPriceChangeIcon(
                      intelligence.currentPrices.electricity, 
                      intelligence.priceForecasts.electricity.forecast6Months
                    ),
                    { className: `w-4 h-4 ${getPriceChangeColor(intelligence.currentPrices.electricity, intelligence.priceForecasts.electricity.forecast6Months)}` }
                  )}
                  <span className={`text-sm ${getPriceChangeColor(intelligence.currentPrices.electricity, intelligence.priceForecasts.electricity.forecast6Months)}`}>
                    {formatPrice(intelligence.priceForecasts.electricity.forecast6Months, '/kWh')} (6m)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Battery className="w-5 h-5 text-purple-600" />
                  <span>Stadsverwarming</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  €43,79/GJ
                </div>
                <div className="text-sm text-gray-600">
                  Vaste prijs voor 2025 (incl. btw)
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Forecasts */}
          <Card>
            <CardHeader>
              <CardTitle>Prijsvoorspellingen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Gas Prijzen</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Huidig:</span>
                      <span className="font-medium">{formatPrice(intelligence.priceForecasts.gas.current, '/m³')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">3 maanden:</span>
                      <span className="font-medium">{formatPrice(intelligence.priceForecasts.gas.forecast3Months, '/m³')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">12 maanden:</span>
                      <span className="font-medium">{formatPrice(intelligence.priceForecasts.gas.forecast12Months, '/m³')}</span>
                    </div>
                    <div className="mt-3 p-2 bg-blue-50 rounded">
                      <div className="text-xs text-blue-800">
                        Betrouwbaarheid: {formatPercentage(intelligence.priceForecasts.gas.confidence * 100)}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Elektriciteit Prijzen</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Huidig:</span>
                      <span className="font-medium">{formatPrice(intelligence.priceForecasts.electricity.current, '/kWh')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">3 maanden:</span>
                      <span className="font-medium">{formatPrice(intelligence.priceForecasts.electricity.forecast3Months, '/kWh')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">12 maanden:</span>
                      <span className="font-medium">{formatPrice(intelligence.priceForecasts.electricity.forecast12Months, '/kWh')}</span>
                    </div>
                    <div className="mt-3 p-2 bg-green-50 rounded">
                      <div className="text-xs text-green-800">
                        Betrouwbaarheid: {formatPercentage(intelligence.priceForecasts.electricity.confidence * 100)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Market Trends */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatPercentage(intelligence.marketTrends.energyTransitionProgress)}
                </div>
                <div className="text-gray-600">Woningen verduurzaamd</div>
                <Progress 
                  value={intelligence.marketTrends.energyTransitionProgress} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatPercentage(intelligence.marketTrends.heatPumpAdoption)}
                </div>
                <div className="text-gray-600">Warmtepomp adoptie</div>
                <Progress 
                  value={intelligence.marketTrends.heatPumpAdoption} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {formatPercentage(intelligence.marketTrends.solarPanelPenetration)}
                </div>
                <div className="text-gray-600">Zonnepanelen</div>
                <Progress 
                  value={intelligence.marketTrends.solarPanelPenetration} 
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatPercentage(intelligence.marketTrends.gasPhaseOut)}
                </div>
                <div className="text-gray-600">Gasvrije wijken</div>
                <Progress 
                  value={intelligence.marketTrends.gasPhaseOut} 
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="subsidies" className="space-y-6">
          {/* Subsidy Budget Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(intelligence.subsidyBudgetStatus).map(([key, subsidy]) => {
              if (key === 'municipal') return null // Handle separately
              const s = subsidy as import('@/lib/integrations/energy-market-intelligence').SubsidyBudgetStatus;
              return (
                <Card key={key}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{s.scheme}</CardTitle>
                      <Badge className={getSubsidyUrgencyColor(s.utilizationRate)}>
                        {s.utilizationRate >= 80 ? 'Urgent' : 
                         s.utilizationRate >= 60 ? 'Let op' : 'Beschikbaar'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Budget gebruikt</span>
                          <span>{formatPercentage(s.utilizationRate)}</span>
                        </div>
                        <Progress value={s.utilizationRate} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Resterend</div>
                          <div className="font-semibold">
                            €{typeof s.remainingBudget === 'number' ? (s.remainingBudget / 1000000).toFixed(1) : 'n.b.'}M
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Wachtlijst</div>
                          <div className="font-semibold">{s.applicationBacklog}</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        Verwachte uitputting: {s.estimatedDepletion}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Municipal Subsidies */}
          {intelligence.subsidyBudgetStatus.municipal.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gemeentelijke Subsidies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {intelligence.subsidyBudgetStatus.municipal.map((municipal, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{municipal.scheme}</h4>
                        <div className="text-sm text-gray-600">
                          €{typeof municipal.remainingBudget === 'number' ? (municipal.remainingBudget / 1000000).toFixed(1) : 'n.b.'}M resterend
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getSubsidyUrgencyColor(municipal.utilizationRate)}>
                          {formatPercentage(municipal.utilizationRate)} gebruikt
                        </Badge>
                        <div className="text-xs text-gray-600 mt-1">
                          {municipal.estimatedDepletion}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contractors" className="space-y-6">
          {/* Contractor Market */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {intelligence.contractorMarket.averageWaitTime} weken
                </div>
                <div className="text-gray-600">Gemiddelde wachttijd</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-red-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  +{formatPercentage(intelligence.contractorMarket.priceInflation)}
                </div>
                <div className="text-gray-600">Prijsstijging (1 jaar)</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {intelligence.contractorMarket.capacity.heatPump.available + 
                   intelligence.contractorMarket.capacity.insulation.available + 
                   intelligence.contractorMarket.capacity.solar.available}
                </div>
                <div className="text-gray-600">Beschikbare installateurs</div>
              </CardContent>
            </Card>
          </div>

          {/* Contractor Capacity by Specialty */}
          <Card>
            <CardHeader>
              <CardTitle>Installateur Capaciteit per Specialisatie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(intelligence.contractorMarket.capacity).map(([specialty, data]) => (
                  <div key={specialty} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {specialty === 'heatPump' ? 'Warmtepomp' : 
                         specialty === 'insulation' ? 'Isolatie' : 'Zonnepanelen'}
                      </h4>
                      <span className="text-sm text-gray-600">
                        {data.averageWaitTime} weken wachttijd
                      </span>
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Beschikbaar</span>
                          <span>{data.available}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(data.available / (data.available + data.busy)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Bezet</span>
                          <span>{data.busy}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ width: `${(data.busy / (data.available + data.busy)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          {/* Regional Energy Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {intelligence.regionalData.map((region, index) => (
              <motion.div
                key={region.region}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedRegion(region.region)}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span>{region.region}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Huishoudens</div>
                          <div className="font-semibold">
                            {(region.householdsTotal / 1000).toFixed(0)}k
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600">Verduurzaamd</div>
                          <div className="font-semibold">
                            {formatPercentage((region.householdsUpgraded / region.householdsTotal) * 100)}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Energietransitie voortgang</span>
                          <span>{formatPercentage((region.householdsUpgraded / region.householdsTotal) * 100)}</span>
                        </div>
                        <Progress 
                          value={(region.householdsUpgraded / region.householdsTotal) * 100} 
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-gray-600">Gem. energielabel</div>
                          <Badge variant="outline">{region.averageEnergyLabel}</Badge>
                        </div>
                        <div>
                          <div className="text-gray-600">Subsidie uptake</div>
                          <div className="font-medium">{formatPercentage(region.subsidyUptake)}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}