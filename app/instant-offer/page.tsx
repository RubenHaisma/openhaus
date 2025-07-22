"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Home, 
  MapPin, 
  Calculator, 
  TrendingUp, 
  CheckCircle, 
  Euro, 
  Calendar,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AddressInput } from '@/components/ui/address-input'
import { getPropertyData, calculateValuation } from '@/lib/kadaster'
import { dutchTaxCalculator } from '@/lib/real-data/tax-calculator'
import { Logger } from '@/lib/monitoring/logger'

interface PropertyData {
  address: string
  postalCode: string
  city: string
  propertyType: string
  bedrooms: number
  bathrooms: number
  squareMeters: number
  constructionYear: number
  condition: string
  renovations: string[]
  energyLabel: string
}

interface OfferResult {
  instantOffer: number
  marketValue: number
  confidenceScore: number
  offerValidUntil: string
  fees: {
    inspection: number
    legal: number
    transfer: number
    total: number
    breakdown: any[]
  }
  timeline: {
    inspection: string
    contract: string
    completion: string
  }
  realTimeData: {
    valuationSource: string
    lastUpdated: string
    confidence: number
  }
}

export default function InstantOfferPage() {
  const [step, setStep] = useState(1)
  const [propertyData, setPropertyData] = useState<Partial<PropertyData>>({})
  const [offerResult, setOfferResult] = useState<OfferResult | null>(null)
  const [loading, setLoading] = useState(false)

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  const handleAddressSearch = async (address: string, postalCode: string) => {
    setLoading(true)
    try {
      // Get real property data from Kadaster
      const realPropertyData = await getPropertyData(address, postalCode)
      if (!realPropertyData) {
        throw new Error('Property not found in Kadaster database')
      }

    setPropertyData(prev => ({ ...prev, address, postalCode }))
    // Auto-populate some data based on address (mock)
    setPropertyData(prev => ({
      ...prev,
        city: realPropertyData.city,
        propertyType: realPropertyData.propertyType,
        constructionYear: realPropertyData.constructionYear,
        energyLabel: realPropertyData.energyLabel,
        squareMeters: realPropertyData.squareMeters
    }))
    setStep(2)
    } catch (error) {
      console.error('Address search error:', error)
      // Show error to user
    } finally {
      setLoading(false)
    }
  }

  const calculateOffer = async () => {
    setLoading(true)
    try {
      // Get REAL property data using our API
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: propertyData.address, 
          postalCode: propertyData.postalCode 
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get property valuation')
      }
      
      const data = await response.json()
      const valuation = data.valuation

      if (valuation.confidenceScore < 0.6) {
        throw new Error('Onvoldoende gegevens voor betrouwbare waardering. Probeer een ander adres.')
      }

      // Store the valuation and get its ID
      const valuationResponse = await fetch('/api/valuations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: propertyData.address, 
          postalCode: propertyData.postalCode,
          valuation
        }),
      })
      
      const valuationData = await valuationResponse.json()
      const valuationId = valuationData.id
    
      const marketValue = valuation.estimatedValue
      
      // Calculate REAL instant offer based on actual market conditions
      let offerMultiplier = 0.95 // Base 5% below market
      
      // Adjust based on REAL market trends from valuation
      if (valuation.marketTrends.averagePriceChange > 5) {
        offerMultiplier = 0.97 // Hot market - higher offer
      } else if (valuation.marketTrends.averagePriceChange < -2) {
        offerMultiplier = 0.92 // Cold market - lower offer
      }
      
      // Adjust based on days on market
      if (valuation.marketTrends.averageDaysOnMarket > 90) {
        offerMultiplier -= 0.02 // Slow market
      } else if (valuation.marketTrends.averageDaysOnMarket < 30) {
        offerMultiplier += 0.01 // Fast market
      }
      
      const instantOffer = Math.round(marketValue * offerMultiplier)
      
      const result: OfferResult = {
        instantOffer,
        marketValue,
        confidenceScore: valuation.confidenceScore,
        offerValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        fees: {
          inspection: 750, // Real inspection cost
          legal: 1500, // Estimated notary fees
          transfer: Math.round(marketValue * 0.02), // 2% transfer tax
          total: 750 + 1500 + Math.round(marketValue * 0.02),
          breakdown: []
        },
        timeline: {
          inspection: valuation.marketTrends.averageDaysOnMarket < 30 ? '2-3 werkdagen' : '3-5 werkdagen',
          contract: '1-2 weken',
          completion: '4-6 weken'
        },
        realTimeData: {
          valuationSource: valuation.dataSource,
          lastUpdated: valuation.lastUpdated,
          confidence: valuation.confidenceScore
        }
      }
      
      Logger.audit('Real instant offer calculated using WOZ + EP Online', {
        address: propertyData.address,
        marketValue,
        instantOffer,
        confidenceScore: valuation.confidenceScore,
        dataSource: valuation.dataSource,
        wozValue: valuation.wozValue,
        valuationId
      })
      
      setOfferResult(result)
      // Store valuation ID for potential redirect to sell page
      sessionStorage.setItem('lastValuationId', valuationId)
      setStep(5)
    } catch (error) {
      console.error('Offer calculation error:', error)
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

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Wat is het adres van je woning?
              </h2>
              <p className="text-xl text-gray-600">
                We gebruiken openbare gegevens om je woning te waarderen
              </p>
            </div>

            <div className="max-w-2xl mx-auto">
              <AddressInput
                onSearch={handleAddressSearch}
                placeholder="Voer je volledige adres in..."
                className="text-xl py-4 px-6"
              />
            </div>

            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Kadaster gegevens</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>WOZ waardering</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Marktanalyse</span>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Vertel ons meer over je woning
              </h2>
              <p className="text-xl text-gray-600">
                Deze informatie helpt ons een nauwkeurigere waardering te geven
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="bedrooms" className="text-lg font-medium">Aantal slaapkamers</Label>
                  <Select onValueChange={(value) => setPropertyData(prev => ({ ...prev, bedrooms: parseInt(value) }))}>
                    <SelectTrigger className="mt-2 h-12 text-lg">
                      <SelectValue placeholder="Selecteer aantal" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} slaapkamer{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bathrooms" className="text-lg font-medium">Aantal badkamers</Label>
                  <Select onValueChange={(value) => setPropertyData(prev => ({ ...prev, bathrooms: parseInt(value) }))}>
                    <SelectTrigger className="mt-2 h-12 text-lg">
                      <SelectValue placeholder="Selecteer aantal" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} badkamer{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="squareMeters" className="text-lg font-medium">Woonoppervlakte (m²)</Label>
                  <Input
                    id="squareMeters"
                    type="number"
                    placeholder="120"
                    className="mt-2 h-12 text-lg"
                    onChange={(e) => setPropertyData(prev => ({ ...prev, squareMeters: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="condition" className="text-lg font-medium">Staat van onderhoud</Label>
                  <Select onValueChange={(value) => setPropertyData(prev => ({ ...prev, condition: value }))}>
                    <SelectTrigger className="mt-2 h-12 text-lg">
                      <SelectValue placeholder="Selecteer staat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Uitstekend</SelectItem>
                      <SelectItem value="good">Goed</SelectItem>
                      <SelectItem value="average">Gemiddeld</SelectItem>
                      <SelectItem value="poor">Matig</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-lg font-medium">Recente renovaties</Label>
                  <div className="mt-2 space-y-2">
                    {['Keuken', 'Badkamer', 'Vloeren', 'Schilderwerk', 'Dak', 'CV-installatie'].map(renovation => (
                      <label key={renovation} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          onChange={(e) => {
                            const renovations = propertyData.renovations || []
                            if (e.target.checked) {
                              setPropertyData(prev => ({ ...prev, renovations: [...renovations, renovation] }))
                            } else {
                              setPropertyData(prev => ({ ...prev, renovations: renovations.filter(r => r !== renovation) }))
                            }
                          }}
                        />
                        <span>{renovation}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={() => setStep(3)}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
                disabled={!propertyData.bedrooms || !propertyData.bathrooms || !propertyData.condition}
              >
                Volgende stap
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Controleer je gegevens
              </h2>
              <p className="text-xl text-gray-600">
                Kloppen deze gegevens? We gebruiken ze voor je waardering
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-gray-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{propertyData.address}</div>
                      <div className="text-gray-600">{propertyData.city}, {propertyData.postalCode}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm text-gray-600">Slaapkamers</div>
                      <div className="font-semibold text-gray-900">{propertyData.bedrooms}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Badkamers</div>
                      <div className="font-semibold text-gray-900">{propertyData.bathrooms}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Oppervlakte</div>
                      <div className="font-semibold text-gray-900">{propertyData.squareMeters} m²</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Staat</div>
                      <div className="font-semibold text-gray-900">
                        {propertyData.condition === 'excellent' ? 'Uitstekend' :
                         propertyData.condition === 'good' ? 'Goed' :
                         propertyData.condition === 'average' ? 'Gemiddeld' : 'Matig'}
                      </div>
                    </div>
                  </div>

                  {propertyData.renovations && propertyData.renovations.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <div className="text-sm text-gray-600 mb-2">Recente renovaties</div>
                        <div className="flex flex-wrap gap-2">
                          {propertyData.renovations.map(renovation => (
                            <Badge key={renovation} variant="outline">{renovation}</Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="px-8 py-3 text-lg"
              >
                Terug
              </Button>
              <Button
                onClick={calculateOffer}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
              >
                Bereken mijn bod
                <Calculator className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Calculator className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                We berekenen je bod...
              </h2>
              <p className="text-xl text-gray-600">
                We analyseren marktgegevens en vergelijkbare verkopen
              </p>
            </div>
            <div className="max-w-md mx-auto">
              <Progress value={75} className="h-3" />
            </div>
          </motion.div>
        )

      case 5:
        return offerResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Main Offer */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="text-sm text-green-700 font-medium mb-2">Ons directe bod voor</div>
                  <div className="text-lg text-gray-600 mb-4">{propertyData.address}</div>
                  <div className="text-5xl font-bold text-green-800 mb-4">
                    {formatPrice(offerResult.instantOffer)}
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-sm text-green-700">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Geen financieringsvoorbehoud</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Geldig tot {new Date(offerResult.offerValidUntil).toLocaleDateString('nl-NL')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0%</div>
                    <div className="text-sm text-gray-600">Makelaarskosten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">4-6</div>
                    <div className="text-sm text-gray-600">Weken tot afronding</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{Math.round(offerResult.confidenceScore * 100)}%</div>
                    <div className="text-sm text-gray-600">Betrouwbaarheid</div>
                  </div>
                </div>

                <div className="mb-6 p-3 bg-green-100 rounded-lg">
                  <div className="text-xs text-green-700 font-medium mb-1">Gebaseerd op actuele gegevens</div>
                  <div className="text-xs text-green-800">
                    {offerResult.realTimeData.valuationSource}
                    <br />
                    Bijgewerkt: {new Date(offerResult.realTimeData.lastUpdated).toLocaleString('nl-NL')}
                    <br />
                    Betrouwbaarheid: {Math.round(offerResult.realTimeData.confidence * 100)}% (2025 marktdata)
                  </div>
                </div>

                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-xl font-bold">
                  Accepteer dit bod
                </Button>
                
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <p className="text-green-800 text-sm">
                    💡 <strong>Tip:</strong> Dit bod is gebaseerd op actuele WOZ-gegevens en marktdata.
                    <br />
                    Bron: {offerResult.realTimeData.valuationSource}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Market Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Marktwaarde vergelijking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Geschatte marktwaarde</span>
                      <span className="font-bold text-gray-900">{formatPrice(offerResult.marketValue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Ons directe bod</span>
                      <span className="font-bold text-green-600">{formatPrice(offerResult.instantOffer)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Verschil</span>
                      <span className="text-gray-500">
                        {formatPrice(offerResult.marketValue - offerResult.instantOffer)} 
                        ({Math.round(((offerResult.marketValue - offerResult.instantOffer) / offerResult.marketValue) * 100)}%)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Euro className="w-5 h-5 text-primary" />
                    <span>Kosten overzicht</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inspectie</span>
                      <span className="font-medium">{formatPrice(offerResult.fees.inspection)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Juridische kosten</span>
                      <span className="font-medium">{formatPrice(offerResult.fees.legal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overdrachtsbelasting (2%)</span>
                      <span className="font-medium">{formatPrice(offerResult.fees.transfer)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Totale kosten</span>
                      <span>{formatPrice(offerResult.fees.total)}</span>
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-600">
                        * Gebaseerd op actuele tarieven van Belastingdienst en KNB (2024)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Verwachte tijdlijn</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="font-semibold text-gray-900">Inspectie</div>
                    <div className="text-gray-600">{offerResult.timeline.inspection}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="font-semibold text-gray-900">Contract</div>
                    <div className="text-gray-600">{offerResult.timeline.contract}</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="font-semibold text-gray-900">Afronding</div>
                    <div className="text-gray-600">{offerResult.timeline.completion}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GDPR Notice */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Privacy en gegevensbescherming</h4>
                    <p className="text-blue-800 text-sm">
                      Jouw gegevens worden veilig behandeld conform AVG/GDPR wetgeving. We delen geen persoonlijke 
                      informatie met derden zonder jouw toestemming. Dit bod is vrijblijvend en je kunt op elk moment 
                      je gegevens laten verwijderen. Alle waarderingen zijn gebaseerd op officiële bronnen (WOZ, EP Online).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      default:
        return null
    }
  }

  if (loading) {
    setStep(4)
    setTimeout(() => calculateOffer(), 100)
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ontvang een direct bod
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Krijg binnen enkele minuten een eerlijk bod op je woning, 
            gebaseerd op actuele marktgegevens
          </p>
        </div>

        {/* Progress Bar */}
        {step <= totalSteps && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600">
                Stap {step} van {totalSteps}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(progress)}% voltooid
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  )
}