"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Home, Camera, Calendar, FileText, CreditCard } from 'lucide-react'

interface SellingWizardProps {
  initialProperty?: {
    address: string
    estimatedValue: number
  }
}

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  completed: boolean
}

export function SellingWizard({ initialProperty }: SellingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [offerAccepted, setOfferAccepted] = useState(false)

  const steps: WizardStep[] = [
    {
      id: 'details',
      title: 'Woningdetails',
      description: 'Vertel ons meer over je woning',
      icon: Home,
      completed: false
    },
    {
      id: 'offer',
      title: 'Ontvang bod',
      description: 'Bekijk ons directe bod',
      icon: CreditCard,
      completed: false
    },
    {
      id: 'photos',
      title: "Foto's uploaden",
      description: 'Upload foto\'s van je woning',
      icon: Camera,
      completed: false
    },
    {
      id: 'inspection',
      title: 'Inspectie inplannen',
      description: 'Plan een gratis inspectie',
      icon: Calendar,
      completed: false
    },
    {
      id: 'notary',
      title: 'Notaris kiezen',
      description: 'Selecteer een notaris',
      icon: FileText,
      completed: false
    },
    {
      id: 'completion',
      title: 'Afronding',
      description: 'Transactie afronden',
      icon: CheckCircle,
      completed: false
    }
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      steps[currentStep].completed = true
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Vertel ons meer over je woning
              </h2>
              <p className="text-gray-600">
                {initialProperty?.address || 'Je woning'} - {formatPrice(initialProperty?.estimatedValue || 450000)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-medium mb-3">Basisinformatie</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">Eengezinswoning</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kamers:</span>
                    <span className="font-medium">5 kamers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Oppervlakte:</span>
                    <span className="font-medium">120 m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bouwjaar:</span>
                    <span className="font-medium">1985</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-3">Staat van de woning</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Energielabel:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">B</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Onderhoud:</span>
                    <span className="font-medium">Goed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tuin:</span>
                    <span className="font-medium">Achtertuin 50 m²</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Parkeren:</span>
                    <span className="font-medium">Oprit + garage</span>
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl">
              <p className="text-blue-800 text-sm">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Gegevens gecontroleerd via Kadaster en BAG database
              </p>
            </div>
          </div>
        )

      case 'offer':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ons directe bod voor je woning
              </h2>
              <p className="text-gray-600">
                Gebaseerd op huidige marktcondities en woningkenmerken
              </p>
            </div>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-green-800 mb-4">
                  {formatPrice((initialProperty?.estimatedValue || 450000) * 0.95)}
                </div>
                <p className="text-green-700 mb-6">
                  Direct bod - geen onzekerheid, geen wachtlijsten
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0%</div>
                    <div className="text-sm text-gray-600">Makelaarskosten</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">14</div>
                    <div className="text-sm text-gray-600">Dagen gemiddeld</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">100%</div>
                    <div className="text-sm text-gray-600">Zekerheid</div>
                  </div>
                </div>

                {!offerAccepted && (
                  <Button
                    onClick={() => setOfferAccepted(true)}
                    size="lg"
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl"
                  >
                    Accepteer dit bod
                  </Button>
                )}

                {offerAccepted && (
                  <div className="bg-white p-4 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-800">Bod geaccepteerd!</p>
                    <p className="text-sm text-gray-600">Je kunt nu doorgaan naar de volgende stap</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="p-6">
              <h3 className="font-medium mb-4">Wat krijg je van ons?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Garantie op koopprijs - geen financieringsvoorbehoud</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Gratis professionele fotografie</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Begeleiding van notaris tot sleuteloverdracht</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Flexibele opleverdatum naar jouw wensen</span>
                </div>
              </div>
            </Card>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <step.icon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h2>
            <p className="text-gray-600 mb-8">{step.description}</p>
            <div className="bg-gray-100 p-8 rounded-xl">
              <p className="text-gray-600">Deze stap wordt binnenkort geïmplementeerd</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Verkoop je huis</h1>
          <Badge variant="outline" className="text-blue-600 border-blue-200">
            Stap {currentStep + 1} van {steps.length}
          </Badge>
        </div>
        
        <Progress value={progress} className="h-2 mb-6" />
        
        {/* Step indicators */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center space-y-2">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2
                ${index <= currentStep 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
                ${index < currentStep ? 'bg-green-600 border-green-600' : ''}
              `}>
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span className={`text-xs text-center max-w-20 ${
                index <= currentStep ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vorige
        </Button>
        
        <Button
          onClick={nextStep}
          disabled={currentStep === steps.length - 1 || (currentStep === 1 && !offerAccepted)}
          className="bg-blue-600 hover:bg-blue-700 px-6"
        >
          Volgende
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}