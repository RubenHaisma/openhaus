"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Home, MapPin, Calendar, Zap } from 'lucide-react'
import { PropertyValuation, ComparableSale, ValuationFactor } from '@/lib/kadaster'
import { motion } from 'framer-motion'

interface ValuationResultProps {
  address: string
  postalCode: string
  valuation: PropertyValuation
  onSellRequest?: () => void
}

export function ValuationResult({ address, postalCode, valuation, onSellRequest }: ValuationResultProps) {
  const { estimatedValue, confidenceScore, comparableSales, factors } = valuation
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500'
    if (score >= 0.7) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getConfidenceText = (score: number) => {
    if (score >= 0.8) return 'Hoge betrouwbaarheid'
    if (score >= 0.7) return 'Gemiddelde betrouwbaarheid'
    return 'Lage betrouwbaarheid'
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Main Valuation Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">{address}, {postalCode}</span>
          </div>
          <CardTitle className="text-4xl font-bold text-blue-900 mb-4">
            {formatPrice(estimatedValue)}
          </CardTitle>
          
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2">
              <Progress 
                value={confidenceScore * 100} 
                className="w-24 h-3"
              />
              <Badge 
                variant="secondary" 
                className={`${getConfidenceColor(confidenceScore)} text-white`}
              >
                {Math.round(confidenceScore * 100)}%
              </Badge>
            </div>
            <span className="text-sm text-gray-600">
              {getConfidenceText(confidenceScore)}
            </span>
          </div>
          
          {valuation.realTimeData && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-blue-600 font-medium mb-1">Actuele marktgegevens</div>
              <div className="text-xs text-blue-800">
                Bronnen: {valuation.realTimeData.dataSource}
                <br />
                Bijgewerkt: {new Date(valuation.realTimeData.lastUpdated).toLocaleString('nl-NL')}
                <br />
                API versie: {valuation.realTimeData.apiVersion}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Deze schatting is gebaseerd op vergelijkbare verkopen in de buurt, 
            huidige marktcondities en specifieke eigenschappen van je woning.
          </p>
          
          {onSellRequest && (
            <Button 
              onClick={onSellRequest}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-lg font-semibold"
            >
              <Home className="w-5 h-5 mr-2" />
              Verkoop je huis via OpenHaus
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Valuation Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Waardebepalende factoren</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{factor.factor}</h4>
                  <p className="text-sm text-gray-600">{factor.description}</p>
                  <p className="text-xs text-gray-500 mt-1">Bron: {factor.dataSource}</p>
                </div>
                <div className={`flex items-center space-x-2 ${factor.impact > 0 ? 'text-green-600' : factor.impact < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {factor.impact > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : factor.impact < 0 ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : null}
                  <span className="font-semibold">
                    {factor.impact > 0 ? '+' : ''}{factor.impact.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparable Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Home className="w-5 h-5 text-blue-600" />
            <span>Vergelijkbare verkopen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparableSales.map((sale, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{sale.address}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Home className="w-4 h-4" />
                      <span>{sale.squareMeters} m²</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{sale.distance} km</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(sale.soldDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">
                    {formatPrice(sale.soldPrice)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatPrice(sale.soldPrice / sale.squareMeters)}/m²
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Insight */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Marktinzicht</h3>
              <p className="text-sm text-gray-600">Huidige trends in jouw buurt</p>
            </div>
          </div>
          {valuation.marketTrends && (
            <div className="space-y-2">
              <p className="text-gray-700">
                De huizenmarkt in jouw gebied toont een {valuation.marketTrends.averagePriceChange > 0 ? 'stijgende' : 'dalende'} trend van {Math.abs(valuation.marketTrends.averagePriceChange).toFixed(1)}% ten opzichte van vorig jaar.
              </p>
              <p className="text-gray-700">
                Woningen vergelijkbaar met die van jou verkopen gemiddeld binnen {valuation.marketTrends.averageDaysOnMarket} dagen.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Gebaseerd op {valuation.marketTrends.totalSales} verkopen in periode {valuation.marketTrends.period}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}