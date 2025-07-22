"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  TrendingDown, 
  Home, 
  MapPin, 
  Calendar, 
  Zap, 
  Share2, 
  Download,
  ArrowLeft,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { PropertyValuation } from '@/lib/kadaster'

interface ValuationPageData {
  id: string
  address: string
  postalCode: string
  city: string
  valuation: PropertyValuation
  createdAt: string
}

export default function ValuationPage() {
  const params = useParams()
  const router = useRouter()
  const [valuationData, setValuationData] = useState<ValuationPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    const loadValuation = async () => {
      try {
        const response = await fetch(`/api/valuations/${params.id}`)
        if (!response.ok) {
          throw new Error('Valuation not found')
        }
        const data = await response.json()
        setValuationData(data)
      } catch (error) {
        console.error('Failed to load valuation:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadValuation()
    }
  }, [params.id])

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const handleShare = async () => {
    setSharing(true)
    try {
      const shareData = {
        title: `Woningtaxatie: ${valuationData?.address}`,
        text: `Geschatte waarde: ${formatPrice(valuationData?.valuation.estimatedValue || 0)}`,
        url: window.location.href
      }

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        // Show toast notification
        alert('Link gekopieerd naar klembord!')
      }
    } catch (error) {
      console.error('Share failed:', error)
    } finally {
      setSharing(false)
    }
  }

  const handleSellRequest = () => {
    if (valuationData) {
      const sellUrl = `/sell?address=${encodeURIComponent(valuationData.address)}&postal=${encodeURIComponent(valuationData.postalCode)}&value=${valuationData.valuation.estimatedValue}`
      router.push(sellUrl)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laden van taxatie...</p>
        </div>
      </div>
    )
  }

  if (error || !valuationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Taxatie niet gevonden</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Deze taxatie bestaat niet of is niet meer beschikbaar.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar home
              </Button>
            </Link>
            <Link href="/instant-offer">
              <Button className="bg-primary hover:bg-primary/90">
                Nieuwe taxatie
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { valuation } = valuationData

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleShare}
                disabled={sharing}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{sharing ? 'Delen...' : 'Deel taxatie'}</span>
              </Button>
              
              <Button variant="outline" className="flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Woningtaxatie
            </h1>
            <p className="text-gray-600">
              Gegenereerd op {formatDate(valuationData.createdAt)}
            </p>
          </div>
        </div>

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
                <span className="text-lg">{valuationData.address}, {valuationData.postalCode}</span>
              </div>
              <CardTitle className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
                {formatPrice(valuation.estimatedValue)}
              </CardTitle>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={valuation.confidenceScore * 100} 
                    className="w-24 h-3"
                  />
                  <Badge 
                    variant="secondary" 
                    className={`${getConfidenceColor(valuation.confidenceScore)} text-white`}
                  >
                    {Math.round(valuation.confidenceScore * 100)}%
                  </Badge>
                </div>
                <span className="text-sm text-gray-600">
                  {getConfidenceText(valuation.confidenceScore)}
                </span>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-600 font-medium mb-1">Gebaseerd op actuele gegevens</div>
                <div className="text-xs text-blue-800">
                  WOZ waarde: {formatPrice(valuation.wozValue)}
                  <br />
                  Marktfactor: {(valuation.marketMultiplier * 100).toFixed(1)}%
                  <br />
                  Bron: {valuation.dataSource}
                  <br />
                  Bijgewerkt: {new Date(valuation.lastUpdated).toLocaleString('nl-NL')}
                </div>
              </div>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <p className="text-gray-600">
                Deze schatting is gebaseerd op de officiële WOZ waarde, 
                huidige marktcondities en specifieke eigenschappen van je woning.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleSellRequest}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-lg font-semibold"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Verkoop via OpenHaus
                </Button>
                
                <Link href="/finance">
                  <Button 
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 rounded-xl text-lg font-semibold"
                  >
                    Hypotheek berekenen
                  </Button>
                </Link>
              </div>
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
                    <div className="text-xl font-bold text-gray-900">{formatPrice(valuation.wozValue)}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-green-900">Geschatte marktwaarde</h4>
                    <p className="text-sm text-green-600">WOZ + marktcorrectie ({(valuation.marketMultiplier * 100).toFixed(1)}%)</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-800">{formatPrice(valuation.estimatedValue)}</div>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    Verschil: {formatPrice(valuation.estimatedValue - valuation.wozValue)} 
                    ({(((valuation.estimatedValue - valuation.wozValue) / valuation.wozValue) * 100).toFixed(1)}% boven WOZ)
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
                {/* WOZ Historical Data */}
                {valuation.wozValues && valuation.wozValues.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">WOZ-waardes per jaar</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead>
                          <tr>
                            <th className="pr-4 py-1 text-gray-600">Peildatum</th>
                            <th className="py-1 text-gray-600">WOZ-waarde</th>
                          </tr>
                        </thead>
                        <tbody>
                          {valuation.wozValues.map((row, idx) => (
                            <tr key={idx}>
                              <td className="pr-4 py-1">{row.date}</td>
                              <td className="py-1">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* WOZ Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {valuation.bouwjaar && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Bouwjaar (WOZ)</span>
                      <span className="text-gray-700">{valuation.bouwjaar}</span>
                    </div>
                  )}
                  {valuation.grondOppervlakte && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Grondoppervlakte</span>
                      <span className="text-gray-700">{valuation.grondOppervlakte}</span>
                    </div>
                  )}
                  {valuation.oppervlakte && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Oppervlakte (WOZ)</span>
                      <span className="text-gray-700">{valuation.oppervlakte}</span>
                    </div>
                  )}
                  {valuation.gebruiksdoel && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">Gebruiksdoel</span>
                      <span className="text-gray-700">{valuation.gebruiksdoel}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Market Factors */}
                {valuation.factors.map((factor, index) => (
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

          {/* Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>Markttrends</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {valuation.marketTrends.averageDaysOnMarket}
                  </div>
                  <div className="text-gray-600">Dagen op markt</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(valuation.marketTrends.pricePerSquareMeter)}
                  </div>
                  <div className="text-gray-600">Prijs per m²</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${valuation.marketTrends.averagePriceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {valuation.marketTrends.averagePriceChange > 0 ? '+' : ''}{valuation.marketTrends.averagePriceChange.toFixed(1)}%
                  </div>
                  <div className="text-gray-600">Prijsstijging (1 jaar)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparable Sales */}
          {valuation.comparableSales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="w-5 h-5 text-blue-600" />
                  <span>Vergelijkbare verkopen</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {valuation.comparableSales.map((sale, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{sale.address}</div>
                        <div className="text-sm text-gray-600">
                          {sale.squareMeters} m² • {formatDate(sale.soldDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {formatPrice(sale.soldPrice)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatPrice(sale.pricePerSqm)}/m²
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Sources */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-2">Gegevens geverifieerd</h4>
                  <p className="text-green-800 text-sm mb-3">
                    Deze taxatie is gebaseerd op officiële bronnen en actuele marktgegevens:
                  </p>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• WOZ-waarde: Officiële gemeentelijke waardering</li>
                    <li>• Energielabel: EP Online database</li>
                    <li>• Marktgegevens: CBS en NVM statistieken</li>
                    <li>• Vergelijkbare verkopen: Recente transacties in de buurt</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
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

          {/* Call to Action */}
          <Card className="bg-gradient-to-r from-primary to-primary/90 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Klaar om je huis te verkopen?
              </h3>
              <p className="text-lg opacity-90 mb-6">
                Ontvang een direct bod gebaseerd op deze taxatie
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleSellRequest}
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                >
                  Start verkoop proces
                </Button>
                <Link href="/instant-offer">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-3 text-lg font-bold"
                  >
                    Nieuwe taxatie
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}