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
  const { estimatedValue, confidenceScore, wozValue, marketMultiplier, factors } = valuation
  
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
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-600 font-medium mb-1">WOZ-gebaseerde waardering</div>
            <div className="text-xs text-blue-800">
              WOZ waarde: {formatPrice(wozValue)}
              <br />
              Marktfactor: {(marketMultiplier * 100).toFixed(1)}%
              <br />
              Bron: {valuation.dataSource}
              <br />
              Bijgewerkt: {new Date(valuation.lastUpdated).toLocaleString('nl-NL')}
            </div>
          </div>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Deze schatting is gebaseerd op de officiële WOZ waarde, 
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

      {/* WOZ vs Market Value Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>WOZ vs Marktwaarde</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Officiële WOZ waarde</h4>
                <p className="text-sm text-gray-600">Vastgesteld door gemeente</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{formatPrice(wozValue)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-900">Geschatte marktwaarde</h4>
                <p className="text-sm text-green-600">WOZ + marktcorrectie ({(marketMultiplier * 100).toFixed(1)}%)</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-800">{formatPrice(estimatedValue)}</div>
              </div>
            </div>
            
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                Verschil: {formatPrice(estimatedValue - wozValue)} 
                ({(((estimatedValue - wozValue) / wozValue) * 100).toFixed(1)}% boven WOZ)
              </div>
            </div>
          </div>
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

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">Belangrijke disclaimer</h4>
              <p className="text-yellow-800 text-sm">
                Deze waardering is een schatting gebaseerd op de WOZ waarde en marktanalyse. 
                De werkelijke verkoopprijs kan afwijken afhankelijk van de staat van de woning, 
                marktomstandigheden en onderhandelingen. Voor een nauwkeurige waardering 
                adviseren wij een professionele taxatie.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}