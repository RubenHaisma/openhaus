"use client"

import { Suspense, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { EnergyAssessmentResult } from '@/components/energy/energy-assessment-result'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

function EnergyPlanPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const address = searchParams.get('address') || ''
  const postalCode = searchParams.get('postal') || ''

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      // Check if there's pending assessment data from homepage
      const pendingAssessment = sessionStorage.getItem('pendingAssessment')
      if (pendingAssessment) {
        const assessmentData = JSON.parse(pendingAssessment)
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('address', assessmentData.address)
        currentUrl.searchParams.set('postal', assessmentData.postalCode)
        sessionStorage.removeItem('pendingAssessment')
        window.history.replaceState({}, '', currentUrl.toString())
      }
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent(window.location.href))
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const loadAssessmentData = async () => {
      if (!address || !postalCode) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Get energy assessment data
        const response = await fetch('/api/energy/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, postalCode }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to get energy assessment')
        }
        
        const data = await response.json()
        
        setAssessmentData({
          address,
          postalCode,
          assessment: data.assessment
        })
      } catch (error) {
        console.error('Failed to load energy assessment:', error)
        setError(`Kon geen energiegegevens ophalen: ${error instanceof Error ? error.message : 'Onbekende fout'}. Controleer het adres en probeer het opnieuw.`)
        setAssessmentData(null)
      } finally {
        setLoading(false)
      }
    }
    
    loadAssessmentData()
  }, [address, postalCode])

  const handleStartProject = () => {
    if (assessmentData) {
      router.push(`/project/create?address=${encodeURIComponent(address)}&postal=${encodeURIComponent(postalCode)}`)
    }
  }

  if (status === 'loading') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden van energiegegevens...</p>
          <p className="text-sm text-gray-500 mt-2">
            We analyseren je woning en berekenen de beste energiemaatregelen
          </p>
        </div>
      </div>
    )
  }

  if (error && !assessmentData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Fout bij laden van energiegegevens
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
      
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Jouw energieplan
        </h1>
        <p className="text-xl text-gray-600">
          Persoonlijk advies voor de energietransitie van je woning
        </p>
      </div>

      {assessmentData && (
        <EnergyAssessmentResult
          address={assessmentData.address}
          postalCode={assessmentData.postalCode}
          assessment={assessmentData.assessment}
          onStartProject={handleStartProject}
        />
      )}
    </div>
  )
}

export default function EnergyPlanPage() {
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
      <EnergyPlanPageContent />
    </Suspense>
  )
}