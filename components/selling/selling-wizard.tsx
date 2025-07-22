"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Home, Camera, Calendar, FileText, CreditCard } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

// This component is now deprecated - redirect users to the new ListPropertyWizard
export function SellingWizard({ initialProperty }: any) {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Deze pagina is verplaatst
      </h1>
      <p className="text-gray-600 mb-6">
        Het verkoop proces is vernieuwd. Je wordt doorgestuurd naar de nieuwe pagina.
      </p>
      <Button 
        onClick={() => {
          const address = initialProperty?.address || ''
          const postalCode = initialProperty?.postalCode || ''
          const value = initialProperty?.estimatedValue || ''
          window.location.href = `/list-property?address=${encodeURIComponent(address)}&postal=${encodeURIComponent(postalCode)}&value=${value}`
        }}
        className="bg-primary hover:bg-primary/90"
      >
        Ga naar nieuwe pagina
      </Button>
    </div>
  )
}