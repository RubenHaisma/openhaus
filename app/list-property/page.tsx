"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ListPropertyWizard } from '@/components/listing/list-property-wizard'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

function ListPropertyPageContent() {
  const searchParams = useSearchParams()
  const [realPropertyData, setRealPropertyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const address = searchParams.get('address') || ''
  const postalCode = searchParams.get('postal') || ''
  const providedValue = parseInt(searchParams.get('value') || '0')

  useEffect(() => {
    const loadRealData = async () => {
      if (!address || !postalCode) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Get REAL property data using WOZ scraper directly
        const response = await fetch('/api/woz/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, postalCode }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to get real property data')
        }
        
        const result = await response.json()
        const data = result.data
        setRealPropertyData({
          address,
          postalCode,
          estimatedValue: data.wozValue || providedValue || 450000,
          wozValue: data.wozValue,
          propertyType: data.objectType,
          squareMeters: data.surfaceArea,
          oppervlakte: data.oppervlakte,
          bouwjaar: data.bouwjaar,
          identificatie: data.identificatie,
          nummeraanduiding: data.nummeraanduiding,
          grondOppervlakte: data.grondOppervlakte,
          gebruiksdoel: data.gebruiksdoel,
          adresseerbaarObject: data.adresseerbaarObject,
          wozValues: data.wozValues,
          dataSource: 'WOZ Direct',
        })
      } catch (error) {
        console.error('Failed to load real property data:', error)
        setError('Kon geen actuele woninggegevens ophalen. Probeer het opnieuw.')
        // Fallback to provided value
        setRealPropertyData({
          address,
          postalCode,
          estimatedValue: providedValue || 450000,
          dataSource: 'Fallback data'
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadRealData()
  }, [address, postalCode, providedValue])

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