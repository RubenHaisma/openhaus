"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Euro, 
  Home, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle,
  ArrowLeft,
  Shield,
  Clock
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function MakeOfferPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const [offerData, setOfferData] = useState({
    amount: '',
    message: '',
    buyerName: '',
    buyerEmail: '',
    financingConfirmed: false,
    viewingRequested: false,
    conditions: [] as string[]
  })

  useEffect(() => {
    const loadProperty = async () => {
      try {
        console.log('Loading property for offer page:', params.id)
        const response = await fetch(`/api/properties/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          console.log('Property loaded for offer:', data)
          setProperty(data)
          setOfferData(prev => ({ ...prev, amount: data.askingPrice.toString() }))
        } else {
          console.error('Failed to load property:', response.status)
        }
      } catch (error) {
        console.error('Failed to load property:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProperty()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch(`/api/properties/${params.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...offerData,
          amount: parseInt(offerData.amount)
        })
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const error = await response.json()
        alert(`Fout bij het verzenden van je bod: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to submit offer:', error)
      alert('Er is een fout opgetreden bij het verzenden van je bod.')
    } finally {
      setSubmitting(false)
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

  const toggleCondition = (condition: string) => {
    setOfferData(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Laden van woninggegevens...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Woning niet gevonden</h1>
          <Link href="/buy">
            <Button>Terug naar woningen</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto px-4"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Je bericht is verzonden!
              </h1>
              
              <p className="text-gray-600 mb-6">
                De eigenaar van {property.address} heeft je bericht ontvangen en zal binnenkort reageren.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Wat gebeurt er nu?</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• De eigenaar bekijkt je bericht en contactgegevens</p>
                  <p>• Je ontvangt een email zodra er reactie is</p>
                  <p>• Bij interesse neemt de eigenaar direct contact op</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/buy">
                  <Button variant="outline">
                    Zoek meer woningen
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90">
                    Ga naar dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/properties/${params.id}`}>
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar woning
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Neem contact op
          </h1>
          <p className="text-gray-600">
            {property.address} • Vraagprijs: {formatPrice(property.askingPrice)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Offer Amount */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Euro className="w-5 h-5 text-primary" />
                    <span>Je interesse</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Bod bedrag (€) - optioneel</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={offerData.amount}
                      onChange={(e) => setOfferData(prev => ({ ...prev, amount: e.target.value }))}
                      className="text-xl font-bold"
                      placeholder="Laat leeg om geen specifiek bod te doen"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Vraagprijs: {formatPrice(property.askingPrice)}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="message">Bericht aan eigenaar (optioneel)</Label>
                    <Textarea
                      id="message"
                      value={offerData.message}
                      onChange={(e) => setOfferData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Stel jezelf voor en vertel waarom je geïnteresseerd bent in deze woning..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-primary" />
                    <span>Je contactgegevens</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="buyerName">Volledige naam</Label>
                    <Input
                      id="buyerName"
                      value={offerData.buyerName}
                      onChange={(e) => setOfferData(prev => ({ ...prev, buyerName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="buyerEmail">E-mailadres</Label>
                    <Input
                      id="buyerEmail"
                      type="email"
                      value={offerData.buyerEmail}
                      onChange={(e) => setOfferData(prev => ({ ...prev, buyerEmail: e.target.value }))}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Additional Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Aanvullende informatie</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="financingConfirmed"
                      checked={offerData.financingConfirmed}
                      onCheckedChange={(checked) => 
                        setOfferData(prev => ({ ...prev, financingConfirmed: checked as boolean }))
                      }
                    />
                    <Label htmlFor="financingConfirmed">
                      Ik heb mijn financiering op orde
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="viewingRequested"
                      checked={offerData.viewingRequested}
                      onCheckedChange={(checked) => 
                        setOfferData(prev => ({ ...prev, viewingRequested: checked as boolean }))
                      }
                    />
                    <Label htmlFor="viewingRequested">
                      Ik wil graag een bezichtiging inplannen
                    </Label>
                  </div>

                  <div>
                    <Label>Voorwaarden (optioneel)</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        'Voorbehoud financiering',
                        'Voorbehoud bouwkundige keuring',
                        'Voorbehoud verkoop eigen woning',
                        'Vrije oplevering'
                      ].map(condition => (
                        <div key={condition} className="flex items-center space-x-2">
                          <Checkbox
                            id={condition}
                            checked={offerData.conditions.includes(condition)}
                            onCheckedChange={() => toggleCondition(condition)}
                          />
                          <Label htmlFor={condition} className="text-sm">
                            {condition}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={submitting || !offerData.buyerName || !offerData.buyerEmail}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 text-lg font-bold"
              >
                {submitting ? 'Bericht verzenden...' : 'Verstuur bericht'}
              </Button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Property Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                  {property.images?.[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.address}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {property.address}
                </h3>
                
                <div className="text-2xl font-bold text-primary mb-4">
                  {formatPrice(property.askingPrice)}
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-gray-900">{property.bedrooms}</div>
                    <div className="text-gray-600">Slaapkamers</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-gray-600">Badkamers</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{Number(property.squareMeters)}</div>
                    <div className="text-gray-600">m²</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h4 className="font-semibold text-blue-900 mb-4">Tips voor je bod</h4>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Stel jezelf voor in je bericht</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Zorg dat je financiering op orde is</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Onderzoek vergelijkbare woningen in de buurt</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span>Wees respectvol en professioneel</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-2">Veilig bieden</h4>
                    <p className="text-green-800 text-sm">
                      Je contactgegevens worden alleen gedeeld met de eigenaar van deze woning.
                      Alle communicatie verloopt via ons beveiligde platform.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}