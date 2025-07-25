"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { ListPropertyWizard } from '@/components/listing/list-property-wizard'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

function ListPropertyPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [realPropertyData, setRealPropertyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const address = searchParams.get('address') || ''
  const postalCode = searchParams.get('postal') || ''
  const providedValue = parseInt(searchParams.get('value') || '0')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      // Check if there's pending search data from homepage
      const pendingSearch = sessionStorage.getItem('pendingSearch')
      if (pendingSearch) {
        const searchData = JSON.parse(pendingSearch)
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('address', searchData.address)
        currentUrl.searchParams.set('postal', searchData.postalCode)
        if (searchData.value) {
          currentUrl.searchParams.set('value', searchData.value.toString())
        }
        sessionStorage.removeItem('pendingSearch')
        window.history.replaceState({}, '', currentUrl.toString())
      }
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href))
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const loadRealData = async () => {
      if (!address || !postalCode) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Get REAL property data using our property service - NO FALLBACKS TO MOCK DATA
        const response = await fetch('/api/valuation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, postalCode }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get property data')
        }
        
        const data = await response.json()
        const valuation = data.valuation
        
        setRealPropertyData({
          address,
          postalCode,
          estimatedValue: valuation.estimatedValue,
          wozValue: valuation.wozValue,
          propertyType: valuation.propertyType,
          squareMeters: valuation.squareMeters,
          constructionYear: valuation.constructionYear,
          energyLabel: valuation.energyLabel,
          oppervlakte: valuation.oppervlakte,
          bouwjaar: valuation.bouwjaar,
          identificatie: valuation.identificatie,
          nummeraanduiding: valuation.nummeraanduiding,
          grondOppervlakte: valuation.grondOppervlakte,
          gebruiksdoel: valuation.gebruiksdoel,
          adresseerbaarObject: valuation.adresseerbaarObject,
          wozValues: valuation.wozValues,
          dataSource: valuation.dataSource,
        })
      } catch (error) {
        console.error('Failed to load real property data:', error)
        setError(`Kon geen actuele woninggegevens ophalen: ${error instanceof Error ? error.message : 'Onbekende fout'}. Controleer het adres en probeer het opnieuw.`)
        setRealPropertyData(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadRealData()
  }, [address, postalCode, providedValue])

  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laden van actuele woninggegevens...</p>
          <p className="text-sm text-gray-500 mt-2">
            We halen de nieuwste WOZ-waarde en marktgegevens op
          </p>
        </div>
      </div>
    )
  }

  if (error && !realPropertyData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Fout bij laden van woninggegevens
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <p className="text-sm text-red-600">
              Controleer het adres en probeer het opnieuw, of ga terug naar de homepage.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {error && (
        <Card className="border-yellow-200 bg-yellow-50 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 text-sm">
                Waarschuwing: {error} Gebruikt fallback gegevens.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <ListPropertyWizard initialProperty={realPropertyData} />
    </div>
  )
}

export default function ListPropertyPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <ListPropertyPageContent />
    </Suspense>
  )
}