"use client"

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StructuredData } from '@/components/seo/structured-data'
import { SEOUrlGenerator } from '@/lib/seo/url-generator'
import { ValuationResult } from '@/components/valuation/valuation-result'
import { 
  TrendingUp, 
  TrendingDown, 
  Home, 
  MapPin, 
  Calendar, 
  Calculator,
  Share2, 
  Download,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SEOValuationPage() {
  const params = useParams();
  const city = typeof params.city === 'string' ? params.city : Array.isArray(params.city) ? params.city[0] : '';
  const address = typeof params.address === 'string' ? params.address : Array.isArray(params.address) ? params.address[0] : '';

  const [valuationData, setValuationData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  const cityName = city.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  const addressName = address.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')

  useEffect(() => {
    const loadValuation = async () => {
      try {
        // In production, you'd query your database for the valuation
        // based on the city and address from the URL
        const mockValuation = {
          id: 'valuation-' + Date.now(),
          address: addressName,
          postalCode: '1015CJ',
          city: cityName,
          createdAt: new Date().toISOString(),
          valuation: {
            estimatedValue: 675000,
            confidenceScore: 0.87,
            wozValue: 580000,
            marketMultiplier: 1.16,
            factors: [
              { factor: 'Locatie', impact: 8.2, description: `Gewilde locatie in ${cityName}` },
              { factor: 'Energielabel', impact: 3.1, description: 'Label B - bovengemiddeld' },
              { factor: 'Bouwjaar', impact: -2.1, description: 'Ouder pand, karakteristiek' },
              { factor: 'Oppervlakte', impact: 1.8, description: 'Ruime woning voor de buurt' }
            ],
            lastUpdated: new Date().toISOString(),
            dataSource: 'WOZ Scraping + EP Online + Market Analysis',
            marketTrends: {
              averageDaysOnMarket: 22,
              averagePriceChange: 7.8,
              pricePerSquareMeter: 5625
            },
            comparableSales: [
              { 
                address: `Vergelijkbare woning 1 in ${cityName}`, 
                soldPrice: 650000, 
                soldDate: '2024-12-15', 
                squareMeters: 115, 
                pricePerSqm: 5652 
              },
              { 
                address: `Vergelijkbare woning 2 in ${cityName}`, 
                soldPrice: 695000, 
                soldDate: '2024-11-28', 
                squareMeters: 125, 
                pricePerSqm: 5560 
              }
            ],
            realTimeData: {
              dataSource: 'Live WOZ + EP Online + Market Data',
              lastUpdated: new Date().toISOString()
            },
            bouwjaar: '1985',
            oppervlakte: '120 m²',
            energyLabel: 'B',
            propertyType: 'Eengezinswoning'
          }
        }
        
        setValuationData(mockValuation)
      } catch (error) {
        console.error('Failed to load valuation:', error)
        setError('Failed to load valuation')
      } finally {
        setLoading(false)
      }
    }

    loadValuation()
  }, [cityName, addressName])

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

  const handleShare = async () => {
    setSharing(true)
    try {
      const shareData = {
        title: `Woningtaxatie: ${addressName}, ${cityName}`,
        text: `Geschatte waarde: ${formatPrice(valuationData?.valuation.estimatedValue || 0)}`,
        url: window.location.href
      }

      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
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
      const sellUrl = `/huis-verkopen/${city}?address=${encodeURIComponent(addressName)}&value=${valuationData.valuation.estimatedValue}`
      window.location.href = sellUrl
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
    notFound()
  }

  const breadcrumbs = SEOUrlGenerator.generateBreadcrumbs(`/woningtaxatie/${city}/${address}`)

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": `Woningtaxatie ${addressName}, ${cityName}`,
    "description": `Gratis woningtaxatie voor ${addressName} in ${cityName}. Geschatte waarde: ${formatPrice(valuationData.valuation.estimatedValue)} gebaseerd op WOZ-gegevens en marktanalyse.`,
    "url": `https://openhaus.nl/woningtaxatie/${city}/${address}`,
    "provider": {
      "@type": "Organization",
      "name": "OpenHaus",
      "url": "https://openhaus.nl"
    },
    "areaServed": {
      "@type": "City",
      "name": cityName
    }
  }

  return (
    <>
      <StructuredData type="RealEstateListing" data={structuredData} />
      <StructuredData type="BreadcrumbList" data={{ items: breadcrumbs }} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            {/* Breadcrumbs */}
            <nav className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="flex items-center">
                    {index > 0 && <span className="mx-2">/</span>}
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-gray-900 font-medium">{crumb.name}</span>
                    ) : (
                      <Link href={crumb.url} className="hover:text-primary">
                        {crumb.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <div className="flex items-center justify-between mb-4">
              <Link href={`/woningtaxatie/${city}`}>
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Terug naar {cityName}
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
                Woningtaxatie {addressName}
              </h1>
              <p className="text-gray-600 mb-2">
                {cityName} • Gegenereerd op {formatDate(valuationData.createdAt)}
              </p>
              <Badge className="bg-green-100 text-green-800">
                Gratis taxatie
              </Badge>
            </div>
          </div>

          {/* Valuation Result Component */}
          <ValuationResult
            address={addressName}
            postalCode={valuationData.postalCode}
            valuation={valuationData.valuation}
            onSellRequest={handleSellRequest}
            valuationId={valuationData.id}
          />

          {/* Local Market Context */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Woningmarkt {cityName}
                  </h3>
                  <p className="text-blue-800 text-sm mb-3">
                    Deze taxatie is specifiek berekend voor de woningmarkt in {cityName}, 
                    rekening houdend met lokale marktomstandigheden en vergelijkbare verkopen.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-900">Gemiddelde verkooptijd:</span>
                      <br />
                      <span className="text-blue-800">{valuationData.valuation.marketTrends.averageDaysOnMarket} dagen</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Prijsontwikkeling:</span>
                      <br />
                      <span className="text-blue-800">+{valuationData.valuation.marketTrends.averagePriceChange}% (1 jaar)</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Prijs per m²:</span>
                      <br />
                      <span className="text-blue-800">{formatPrice(valuationData.valuation.marketTrends.pricePerSquareMeter)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href={`/huis-verkopen/${city}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Home className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Verkoop in {cityName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Leer hoe je je huis verkoopt zonder makelaar
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/huizen-te-koop/${city}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Woningen in {cityName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Bekijk het actuele aanbod
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/finance">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Calculator className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Hypotheek berekenen
                  </h3>
                  <p className="text-sm text-gray-600">
                    Bereken je maximale hypotheek
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}