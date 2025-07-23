"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  TrendingUp, 
  Euro, 
  Home, 
  PiggyBank, 
  CreditCard,
  AlertCircle,
  CheckCircle,
  Info,
  Building,
  Calendar,
  Percent
} from 'lucide-react'
import { motion } from 'framer-motion'

interface MortgageResult {
  maxLoanAmount: number
  monthlyPayment: number
  totalMonthlyCost: number
  interestRate: number
  loanToValue: number
  totalInterest: number
  totalAmount: number
}

interface BuyingCosts {
  transferTax: number
  notaryFees: number
  mortgageDeed: number
  landRegistry: number
  total: number
  breakdown: Array<{
    item: string
    amount: number
    percentage?: number
    description: string
  }>
}

export default function FinancePage() {
  const [mortgageData, setMortgageData] = useState({
    grossAnnualIncome: '',
    propertyValue: '',
    ownCapital: '',
    monthlyObligations: '',
    hasPartner: false,
    partnerIncome: '',
    buyerAge: '',
    isFirstHome: false,
    termYears: 30
  })

  const [mortgageResult, setMortgageResult] = useState<MortgageResult | null>(null)
  const [buyingCosts, setBuyingCosts] = useState<BuyingCosts | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const calculateMortgage = async () => {
    if (!mortgageData.grossAnnualIncome || !mortgageData.propertyValue) {
      setError('Vul minimaal je inkomen en woningwaarde in')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/mortgage/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grossAnnualIncome: parseInt(mortgageData.grossAnnualIncome),
          propertyValue: parseInt(mortgageData.propertyValue),
          ownCapital: parseInt(mortgageData.ownCapital) || 0,
          monthlyObligations: parseInt(mortgageData.monthlyObligations) || 0,
          hasPartner: mortgageData.hasPartner,
          partnerIncome: parseInt(mortgageData.partnerIncome) || 0,
          buyerAge: parseInt(mortgageData.buyerAge) || undefined,
          isFirstHome: mortgageData.isFirstHome,
          termYears: mortgageData.termYears
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Hypotheek berekening mislukt')
      }

      const data = await response.json()
      setMortgageResult(data.calculation)
      setBuyingCosts(data.buyingCosts)
    } catch (error) {
      console.error('Mortgage calculation failed:', error)
      setError(error instanceof Error ? error.message : 'Er is een fout opgetreden bij de berekening')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hypotheek Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bereken je maximale hypotheek en maandlasten met actuele rentes en NHG normen
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  <span>Hypotheek berekenen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Income */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="income">Bruto jaarinkomen (€)</Label>
                    <Input
                      id="income"
                      type="number"
                      placeholder="65000"
                      value={mortgageData.grossAnnualIncome}
                      onChange={(e) => setMortgageData(prev => ({ ...prev, grossAnnualIncome: e.target.value }))}
                      className="text-lg"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasPartner"
                      checked={mortgageData.hasPartner}
                      onChange={(e) => setMortgageData(prev => ({ ...prev, hasPartner: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="hasPartner">Ik heb een partner</Label>
                  </div>

                  {mortgageData.hasPartner && (
                    <div>
                      <Label htmlFor="partnerIncome">Partner bruto jaarinkomen (€)</Label>
                      <Input
                        id="partnerIncome"
                        type="number"
                        placeholder="45000"
                        value={mortgageData.partnerIncome}
                        onChange={(e) => setMortgageData(prev => ({ ...prev, partnerIncome: e.target.value }))}
                        className="text-lg"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Property Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="propertyValue">Woningwaarde (€)</Label>
                    <Input
                      id="propertyValue"
                      type="number"
                      placeholder="450000"
                      value={mortgageData.propertyValue}
                      onChange={(e) => setMortgageData(prev => ({ ...prev, propertyValue: e.target.value }))}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ownCapital">Eigen geld (€)</Label>
                    <Input
                      id="ownCapital"
                      type="number"
                      placeholder="45000"
                      value={mortgageData.ownCapital}
                      onChange={(e) => setMortgageData(prev => ({ ...prev, ownCapital: e.target.value }))}
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="monthlyObligations">Maandelijkse verplichtingen (€)</Label>
                    <Input
                      id="monthlyObligations"
                      type="number"
                      placeholder="200"
                      value={mortgageData.monthlyObligations}
                      onChange={(e) => setMortgageData(prev => ({ ...prev, monthlyObligations: e.target.value }))}
                      className="text-lg"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Bijv. leningen, creditcards, alimentatie
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Additional Options */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="buyerAge">Leeftijd (optioneel)</Label>
                    <Input
                      id="buyerAge"
                      type="number"
                      placeholder="32"
                      value={mortgageData.buyerAge}
                      onChange={(e) => setMortgageData(prev => ({ ...prev, buyerAge: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFirstHome"
                      checked={mortgageData.isFirstHome}
                      onChange={(e) => setMortgageData(prev => ({ ...prev, isFirstHome: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isFirstHome">Dit is mijn eerste huis</Label>
                  </div>

                  <div>
                    <Label>Looptijd: {mortgageData.termYears} jaar</Label>
                    <Slider
                      value={[mortgageData.termYears]}
                      onValueChange={(value) => setMortgageData(prev => ({ ...prev, termYears: value[0] }))}
                      max={30}
                      min={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button
                  onClick={calculateMortgage}
                  disabled={loading || !mortgageData.grossAnnualIncome || !mortgageData.propertyValue}
                  className="w-full bg-primary hover:bg-primary/90 py-3 text-lg font-semibold"
                >
                  {loading ? 'Berekenen...' : 'Bereken hypotheek'}
                </Button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-800">{error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {mortgageResult ? (
              <>
                {/* Main Result */}
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-center text-2xl text-green-900">
                      Je maximale hypotheek
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <div className="text-5xl font-bold text-green-800">
                      {formatPrice(mortgageResult.maxLoanAmount)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(mortgageResult.monthlyPayment)}
                        </div>
                        <div className="text-gray-600">Maandlast</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {mortgageResult.interestRate.toFixed(2)}%
                        </div>
                        <div className="text-gray-600">Rente</div>
                      </div>
                    </div>

                    <div className="bg-green-100 p-4 rounded-lg">
                      <p className="text-green-800 text-sm">
                        <CheckCircle className="w-4 h-4 inline mr-2" />
                        Berekening gebaseerd op actuele NHG normen en bankrente
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gedetailleerde berekening</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loan-to-Value:</span>
                        <span className="font-semibold">{mortgageResult.loanToValue.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Totale rente:</span>
                        <span className="font-semibold">{formatPrice(mortgageResult.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Totaal te betalen:</span>
                        <span className="font-semibold">{formatPrice(mortgageResult.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maandlast totaal:</span>
                        <span className="font-semibold">{formatPrice(mortgageResult.totalMonthlyCost)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Buying Costs */}
                {buyingCosts && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Kosten koper</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {buyingCosts.breakdown.map((cost, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div>
                              <span className="font-medium">{cost.item}</span>
                              {cost.percentage && (
                                <span className="text-sm text-gray-500 ml-2">
                                  ({cost.percentage}%)
                                </span>
                              )}
                              <p className="text-xs text-gray-500">{cost.description}</p>
                            </div>
                            <span className="font-semibold">{formatPrice(cost.amount)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Totale kosten koper:</span>
                        <span className="text-primary">{formatPrice(buyingCosts.total)}</span>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          <Info className="w-4 h-4 inline mr-2" />
                          Kosten gebaseerd op actuele tarieven 2025
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Bereken je hypotheek
                  </h3>
                  <p className="text-gray-600">
                    Vul je gegevens in om je maximale hypotheek en maandlasten te berekenen
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Building className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">NHG Garantie</h4>
                  <p className="text-blue-800 text-sm">
                    Tot €450.000 kun je gebruik maken van de Nationale Hypotheek Garantie voor lagere rente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <PiggyBank className="w-6 h-6 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Starterslening</h4>
                  <p className="text-green-800 text-sm">
                    Eerste huis onder 35 jaar? Mogelijk geen overdrachtsbelasting en extra lening.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Percent className="w-6 h-6 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-2">Actuele Rente</h4>
                  <p className="text-purple-800 text-sm">
                    Berekening met actuele hypotheekrente van 3.8% (gemiddelde 2025).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}