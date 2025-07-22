"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { SellingWizard } from '@/components/selling/selling-wizard'

function SellingPageContent() {
  const searchParams = useSearchParams()
  
  const initialProperty = {
    address: searchParams.get('address') || '',
    estimatedValue: parseInt(searchParams.get('value') || '0') || 450000
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SellingWizard initialProperty={initialProperty} />
    </div>
  )
}

export default function SellingPage() {
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
      <SellingPageContent />
    </Suspense>
  )
}