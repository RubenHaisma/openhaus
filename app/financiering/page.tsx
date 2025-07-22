"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calculator, Home, Euro, FileText, CheckCircle, TrendingUp } from 'lucide-react'
import { mortgageCalculator, dutchTaxCalculator } from '@/lib/real-data/tax-calculator'
import { marketDataProvider } from '@/lib/real-data/market-data'
import { Logger } from '@/lib/monitoring/logger'

interface MortgageCalculation {
  maxLoan: number
  monthlyPayment: number
  interestRate: number
  totalCost: number
  buyingCosts?: number
  realTimeData: {
    rateSource: string
    lastUpdated: string
    confidence: number
  }
}

export default function FinancingPage() {
  const [income, setIncome] = useState('')
  const [housePrice, setHousePrice] = useState('')
  const [ownCapital, setOwnCapital] = useState('')
  const [buyerAge, setBuyerAge] = useState('')
  const [isFirstHome, setIsFirstHome] = useState(false)
  const [calculation, setCalculation] = useState<MortgageCalculation | null>(null)
  const [loading, setLoading] = useState(false)

  const calculateMortgage = async () => {
    setLoading(true)
    try {
      const yearlyIncome = parseFloat(income) || 0
      const price = parseFloat(housePrice) || 0
      const capital = parseFloat(ownCapital) || 0
      const age = parseInt(buyerAge) || undefined

      if (yearlyIncome === 0 || price === 0) {
        throw new Error('Inkomen en koopprijs zijn verplicht')
      }

      // Get real maximum mortgage amount
      const maxMortgage = await mortgageCalculator.calculateMaxMortgage(yearlyIncome)
      const maxLoanFromPrice = price * 0.9 // Maximum 90% LTV
      const maxLoan = Math.min(maxMortgage, maxLoanFromPrice, price - capital)

      if (maxLoan <= 0) {
        throw new Error('Geen hypotheek mogelijk met deze gegevens')
      }

      // Get real current interest rates
      const interestRates = await marketDataProvider.getCurrentInterestRates()
      const mortgageDetails = await mortgageCalculator.calculateMortgagePayment(maxLoan, interestRates.mortgage)

      // Calculate real buying costs
      const buyingCosts = await dutchTaxCalculator.calculateTotalBuyingCosts(
        price,
        maxLoan,
        age,
        isFirstHome
      )

      Logger.audit('Real mortgage calculation performed', {
        income: yearlyIncome,
        propertyValue: price,
        maxLoan,
        interestRate: mortgageDetails.realTimeRates.rate,
        buyingCosts: buyingCosts.total
      })
      setCalculation({
        maxLoan: Math.max(0, maxLoan),
        monthlyPayment: mortgageDetails.monthlyPayment,
        interestRate: mortgageDetails.interestRate * 100,
        totalCost: mortgageDetails.totalAmount,
        buyingCosts: buyingCosts.total,
        realTimeData: {
          rateSource: mortgageDetails.realTimeRates.provider,
          lastUpdated: mortgageDetails.realTimeRates.lastUpdated,
          confidence: 0.95
        }
      })
    } catch (error) {
      console.error('Mortgage calculation error:', error)
      alert(`Fout bij berekening: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Hypotheek & Financiering
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Bereken je maximale hypotheek en krijg persoonlijk advies van onze gecertificeerde adviseurs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Mortgage Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              <span>Hypotheekcalculator</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="income">Bruto jaarinkomen (€)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="85000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="housePrice">Koopprijs woning (€)</Label>
                <Input
                  id="housePrice"
                  type="number"
                  placeholder="450000"
                  value={housePrice}
                  onChange={(e) => setHousePrice(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="ownCapital">Eigen geld (€)</Label>
                <Input
                  id="ownCapital"
                  type="number"
                  placeholder="50000"
                  value={ownCapital}
                  onChange={(e) => setOwnCapital(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="buyerAge">Leeftijd (optioneel)</Label>
                <Input
                  id="buyerAge"
                  type="number"
                  placeholder="30"
                  value={buyerAge}
                  onChange={(e) => setBuyerAge(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="firstHome"
                  checked={isFirstHome}
                  onChange={(e) => setIsFirstHome(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="firstHome">Dit is mijn eerste huis</Label>
              </div>

              <Button 
                onClick={calculateMortgage}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Berekenen...' : 'Bereken hypotheek'}
              </Button>
            </div>

            {calculation && (
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-semibold text-lg">Resultaten:</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Maximale hypotheek</div>
                    <div className="text-2xl font-bold text-green-800">
                      {formatPrice(calculation.maxLoan)}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Maandlasten</div>
                    <div className="text-xl font-bold text-blue-800">
                      {formatPrice(calculation.monthlyPayment)}/maand
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rente:</span>
                    <span className="font-medium">{calculation.interestRate}%</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Totale kosten (30 jaar):</span>
                    <span className="font-medium">{formatPrice(calculation.totalCost)}</span>
                  </div>

                  {calculation.buyingCosts && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kosten koper:</span>
                      <span className="font-medium">{formatPrice(calculation.buyingCosts)}</span>
                    </div>
                  )}

                  {calculation.realTimeData && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium mb-1">Actuele gegevens</div>
                      <div className="text-xs text-blue-800">
                        Bron: {calculation.realTimeData.rateSource}
                        <br />
                        Bijgewerkt: {new Date(calculation.realTimeData.lastUpdated).toLocaleString('nl-NL')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mortgage Process */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Hypotheekproces</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Oriëntatie</h4>
                  <p className="text-sm text-gray-600">Bereken je maximale hypotheek en oriënteer op mogelijkheden</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Persoonlijk advies</h4>
                  <p className="text-sm text-gray-600">Gratis gesprek met onze gecertificeerde hypotheekadviseur</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Aanvraag indienen</h4>
                  <p className="text-sm text-gray-600">Wij regelen de hypotheekaanvraag bij verschillende banken</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-300 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Afsluiting</h4>
                  <p className="text-sm text-gray-600">Tekenen van hypotheekakte en sleuteloverdracht</p>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700">
                Plan gratis gesprek
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center p-6">
          <CardContent>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Gecertificeerde adviseurs</h3>
            <p className="text-sm text-gray-600">Al onze adviseurs zijn AFM gecertificeerd en onafhankelijk</p>
          </CardContent>
        </Card>

        <Card className="text-center p-6">
          <CardContent>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Scherpe tarieven</h3>
            <p className="text-sm text-gray-600">Wij vergelijken alle banken voor de beste hypotheekrente</p>
          </CardContent>
        </Card>

        <Card className="text-center p-6">
          <CardContent>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Snelle afhandeling</h3>
            <p className="text-sm text-gray-600">Van oriëntatie tot offerte binnen 5 werkdagen</p>
          </CardContent>
        </Card>
      </div>

      {/* Mortgage Types */}
      <Card>
        <CardHeader>
          <CardTitle>Hypotheekvormen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Annuïteitenhypotheek</h4>
                  <Badge variant="outline" className="bg-green-50 text-green-700">Populair</Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Maandlasten blijven gelijk. In het begin betaal je vooral rente, later meer aflossing.
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-green-600">✓</span> Fiscaal aantrekkelijk
                  <br />
                  <span className="text-green-600">✓</span> Gelijke maandlasten
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Lineaire hypotheek</h4>
                <p className="text-sm text-gray-600">
                  Elke maand los je hetzelfde bedrag af. Maandlasten dalen in de tijd.
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-green-600">✓</span> Lagere totale kosten
                  <br />
                  <span className="text-green-600">✓</span> Sneller schuldenvrij
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Aflossingsvrije hypotheek</h4>
                <p className="text-sm text-gray-600">
                  Je betaalt alleen rente. Het geleende bedrag blijft gelijk.
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-red-600">✗</span> Beperkt aftrekbaar
                  <br />
                  <span className="text-green-600">✓</span> Lage maandlasten
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Spaar- of beleggingshypotheek</h4>
                <p className="text-sm text-gray-600">
                  Combinatie van aflossingsvrije hypotheek met spaar- of beleggingsproduct.
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-yellow-600">⚠</span> Risico bij beleggen
                  <br />
                  <span className="text-green-600">✓</span> Mogelijke extra rendement
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}