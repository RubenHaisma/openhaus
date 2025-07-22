"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { CheckCircle, ArrowRight, ArrowLeft, Home, Camera, FileText, Users, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

interface ListPropertyWizardProps {
  initialProperty?: {
    address: string
    postalCode?: string
    estimatedValue: number
    wozValue?: number
    confidenceScore?: number
    dataSource?: string
    realTimeData?: any
    marketTrends?: any
    factors?: any[]
    propertyType?: string
    squareMeters?: number
    oppervlakte?: number
    constructionYear?: number
    bouwjaar?: number
    energyLabel?: string
  }
}

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  completed: boolean
}

export function ListPropertyWizard({ initialProperty }: ListPropertyWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [propertyListed, setPropertyListed] = useState(false)

  // Property listing data
  const [listingData, setListingData] = useState({
    askingPrice: initialProperty?.estimatedValue?.toString() || '',
    bedrooms: '',
    bathrooms: '',
    description: '',
    features: [] as string[],
    images: [] as string[],
    contactPreference: 'email',
    availableFrom: '',
    viewingInstructions: ''
  })

  const steps: WizardStep[] = [
    {
      id: 'details',
      title: 'Woningdetails',
      description: 'Vul de details van je woning in',
      icon: Home,
      completed: false
    },
    {
      id: 'pricing',
      title: 'Prijs & beschrijving',
      description: 'Stel je vraagprijs en beschrijving in',
      icon: FileText,
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
      id: 'contact',
      title: 'Contact voorkeuren',
      description: 'Hoe willen kopers contact opnemen?',
      icon: Users,
      completed: false
    },
    {
      id: 'publish',
      title: 'Publiceren',
      description: 'Controleer en publiceer je advertentie',
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

  const handlePublish = async () => {
    try {
      // Create property listing
      const propertyData = {
        address: initialProperty?.address,
        postalCode: initialProperty?.postalCode,
        city: extractCityFromPostalCode(initialProperty?.postalCode || ''),
        province: 'Noord-Holland', // Default, could be determined from postal code
        propertyType: initialProperty?.propertyType || 'HOUSE',
        bedrooms: parseInt(listingData.bedrooms),
        bathrooms: parseInt(listingData.bathrooms),
        squareMeters: initialProperty?.squareMeters || 100,
        constructionYear: initialProperty?.constructionYear || 1980,
        askingPrice: parseInt(listingData.askingPrice),
        energyLabel: initialProperty?.energyLabel || 'C',
        features: listingData.features,
        images: listingData.images,
        description: listingData.description,
        status: 'AVAILABLE',
        estimatedValue: initialProperty?.estimatedValue || parseInt(listingData.askingPrice),
        confidenceScore: initialProperty?.confidenceScore || 0.8
      }

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      })

      if (response.ok) {
        const property = await response.json()
        setPropertyListed(true)
        // Redirect to property page after a delay
        setTimeout(() => {
          router.push(`/properties/${property.id}`)
        }, 3000)
      } else {
        throw new Error('Failed to create property listing')
      }
    } catch (error) {
      console.error('Failed to publish property:', error)
      alert('Er is een fout opgetreden bij het publiceren van je advertentie.')
    }
  }

  const extractCityFromPostalCode = (postalCode: string): string => {
    const area = postalCode.substring(0, 4)
    const cityMapping: Record<string, string> = {
      '1000': 'Amsterdam', '1001': 'Amsterdam', '1002': 'Amsterdam',
      '3000': 'Rotterdam', '3001': 'Rotterdam', '3002': 'Rotterdam',
      '2500': 'Den Haag', '2501': 'Den Haag', '2502': 'Den Haag',
      '3500': 'Utrecht', '3501': 'Utrecht', '3502': 'Utrecht',
    }
    return cityMapping[area] || 'Nederland'
  }

  const renderStepContent = () => {
    const step = steps[currentStep]

    switch (step.id) {
      case 'details':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Woningdetails
              </h2>
              <p className="text-gray-600">
                {initialProperty?.address || 'Je woning'} - Geschatte waarde: {formatPrice(initialProperty?.estimatedValue || 450000)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h3 className="font-medium mb-3">Basisinformatie (automatisch ingevuld)</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Adres:</span>
                    <span className="font-medium">{initialProperty?.address || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{initialProperty?.propertyType || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Oppervlakte:</span>
                    <span className="font-medium">{initialProperty?.squareMeters ? `${initialProperty.squareMeters} m²` : (initialProperty?.oppervlakte || '-')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Bouwjaar:</span>
                    <span className="font-medium">{initialProperty?.constructionYear || initialProperty?.bouwjaar || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Energielabel:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">{initialProperty?.energyLabel || '-'}</Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-medium mb-3">Aanvullende details</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="bedrooms">Aantal slaapkamers</Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      min={1}
                      placeholder="3"
                      value={listingData.bedrooms}
                      onChange={e => setListingData(prev => ({ ...prev, bedrooms: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="bathrooms">Aantal badkamers</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      min={1}
                      placeholder="1"
                      value={listingData.bathrooms}
                      onChange={e => setListingData(prev => ({ ...prev, bathrooms: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </Card>
            </div>

            {initialProperty?.realTimeData && (
              <div className="bg-blue-50 p-4 rounded-xl">
                <p className="text-blue-800 text-sm">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Gegevens geverifieerd via {initialProperty.dataSource}
                </p>
              </div>
            )}
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Prijs en beschrijving
              </h2>
              <p className="text-gray-600">
                Stel je vraagprijs in en schrijf een aantrekkelijke beschrijving
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-medium mb-4">Vraagprijs</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="askingPrice">Vraagprijs (€)</Label>
                    <Input
                      id="askingPrice"
                      type="number"
                      value={listingData.askingPrice}
                      onChange={e => setListingData(prev => ({ ...prev, askingPrice: e.target.value }))}
                      className="text-xl font-bold"
                      required
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Geschatte marktwaarde: {formatPrice(initialProperty?.estimatedValue || 450000)}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-medium mb-4">Beschrijving</h3>
                <div>
                  <Label htmlFor="description">Beschrijf je woning</Label>
                  <Textarea
                    id="description"
                    value={listingData.description}
                    onChange={e => setListingData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Beschrijf de unieke kenmerken van je woning, de buurt, en wat het bijzonder maakt..."
                    rows={6}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Tip: Vermeld bijzonderheden zoals recent onderhoud, unieke kenmerken, of voordelen van de locatie.
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-medium mb-4">Kenmerken (optioneel)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Tuin', 'Balkon', 'Garage', 'Parkeerplaats', 'Lift', 'Airconditioning',
                    'Vloerverwarming', 'Open keuken', 'Inbouwkeuken', 'Zonnepanelen',
                    'Dakraam', 'Kelder', 'Zolder', 'Schuurtje', 'Berging', 'Alarm'
                  ].map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={feature}
                        checked={listingData.features.includes(feature)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setListingData(prev => ({ ...prev, features: [...prev.features, feature] }))
                          } else {
                            setListingData(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }))
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={feature} className="text-sm">{feature}</Label>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )

      case 'photos':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Foto's uploaden
              </h2>
              <p className="text-gray-600">
                Goede foto's zijn cruciaal voor het aantrekken van kopers
              </p>
            </div>

            <Card className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload foto's van je woning
                </h3>
                <p className="text-gray-600 mb-4">
                  Sleep foto's hierheen of klik om te selecteren
                </p>
                <Button variant="outline">
                  Selecteer foto's
                </Button>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-3">Tips voor goede foto's:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Gebruik natuurlijk licht</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Ruim persoonlijke spullen op</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Fotografeer alle kamers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Maak ook buitenfoto's</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )

      case 'contact':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Contact voorkeuren
              </h2>
              <p className="text-gray-600">
                Hoe kunnen geïnteresseerde kopers contact met je opnemen?
              </p>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-medium mb-4">Contact methode</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="email"
                      name="contactPreference"
                      value="email"
                      checked={listingData.contactPreference === 'email'}
                      onChange={e => setListingData(prev => ({ ...prev, contactPreference: e.target.value }))}
                    />
                    <Label htmlFor="email">Via email (aanbevolen)</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="phone"
                      name="contactPreference"
                      value="phone"
                      checked={listingData.contactPreference === 'phone'}
                      onChange={e => setListingData(prev => ({ ...prev, contactPreference: e.target.value }))}
                    />
                    <Label htmlFor="phone">Via telefoon</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="both"
                      name="contactPreference"
                      value="both"
                      checked={listingData.contactPreference === 'both'}
                      onChange={e => setListingData(prev => ({ ...prev, contactPreference: e.target.value }))}
                    />
                    <Label htmlFor="both">Email en telefoon</Label>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-medium mb-4">Beschikbaarheid</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="availableFrom">Beschikbaar vanaf</Label>
                    <Input
                      id="availableFrom"
                      type="date"
                      value={listingData.availableFrom}
                      onChange={e => setListingData(prev => ({ ...prev, availableFrom: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="viewingInstructions">Bezichtiging instructies</Label>
                    <Textarea
                      id="viewingInstructions"
                      value={listingData.viewingInstructions}
                      onChange={e => setListingData(prev => ({ ...prev, viewingInstructions: e.target.value }))}
                      placeholder="Bijv. 'Bezichtigingen op afspraak, bij voorkeur in het weekend'"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )

      case 'publish':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Controleer je advertentie
              </h2>
              <p className="text-gray-600">
                Controleer alle gegevens voordat je publiceert
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-gray-600" />
                  <div>
                    <div className="font-semibold text-gray-900">{initialProperty?.address}</div>
                    <div className="text-gray-600">{extractCityFromPostalCode(initialProperty?.postalCode || '')}, {initialProperty?.postalCode}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Vraagprijs</div>
                    <div className="font-semibold text-gray-900 text-xl">{formatPrice(parseInt(listingData.askingPrice))}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Slaapkamers</div>
                    <div className="font-semibold text-gray-900">{listingData.bedrooms}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Badkamers</div>
                    <div className="font-semibold text-gray-900">{listingData.bathrooms}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Oppervlakte</div>
                    <div className="font-semibold text-gray-900">{initialProperty?.squareMeters || 100} m²</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Beschrijving</div>
                  <p className="text-gray-900">{listingData.description}</p>
                </div>

                {listingData.features.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Kenmerken</div>
                    <div className="flex flex-wrap gap-2">
                      {listingData.features.map(feature => (
                        <Badge key={feature} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-600 mb-2">Contact</div>
                  <p className="text-gray-900">
                    {listingData.contactPreference === 'email' ? 'Via email' :
                     listingData.contactPreference === 'phone' ? 'Via telefoon' : 'Email en telefoon'}
                  </p>
                </div>
              </div>
            </Card>

            {!propertyListed && (
              <Button
                onClick={handlePublish}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-bold"
              >
                Publiceer advertentie
              </Button>
            )}

            {propertyListed && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    Advertentie gepubliceerd!
                  </h3>
                  <p className="text-green-800 mb-4">
                    Je woning staat nu online en kopers kunnen contact met je opnemen.
                  </p>
                  <p className="text-sm text-green-700">
                    Je wordt doorgestuurd naar je advertentie...
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Plaats je woning</h1>
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
      {!propertyListed && (
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
            disabled={
              currentStep === steps.length - 1 || 
              (currentStep === 0 && (!listingData.bedrooms || !listingData.bathrooms)) ||
              (currentStep === 1 && (!listingData.askingPrice || !listingData.description))
            }
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            Volgende
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}