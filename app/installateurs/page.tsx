"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Mail,
  CheckCircle,
  Award,
  Users,
  Zap,
  Home,
  Wrench,
  Filter,
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ContractorsPage() {
  const [contractors, setContractors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')

  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await fetch('/api/contractors')
        if (response.ok) {
          const data = await response.json()
          setContractors(data.contractors || [])
        }
      } catch (error) {
        console.error('Failed to fetch contractors:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchContractors()
  }, [])

  const specialties = [
    { id: 'all', name: 'Alle specialisaties' },
    { id: 'heat_pump', name: 'Warmtepomp' },
    { id: 'insulation', name: 'Isolatie' },
    { id: 'solar_panels', name: 'Zonnepanelen' },
    { id: 'ventilation', name: 'Ventilatie' },
    { id: 'renovation', name: 'Renovatie' }
  ]

  const locations = [
    { id: 'all', name: 'Heel Nederland' },
    { id: 'noord-holland', name: 'Noord-Holland' },
    { id: 'zuid-holland', name: 'Zuid-Holland' },
    { id: 'utrecht', name: 'Utrecht' },
    { id: 'noord-brabant', name: 'Noord-Brabant' },
    { id: 'gelderland', name: 'Gelderland' }
  ]

  // Mock contractor data
  const featuredContractors = [
    {
      id: '1',
      companyName: 'GreenTech Installaties',
      contactName: 'Jan van der Berg',
      email: 'info@greentech.nl',
      phone: '020-1234567',
      city: 'Amsterdam',
      province: 'Noord-Holland',
      specialties: ['Warmtepomp', 'Zonnepanelen', 'Isolatie'],
      rating: 4.8,
      reviewCount: 127,
      isVerified: true,
      certifications: ['RVO Erkend', 'ISSO Gecertificeerd', 'Komo Kwaliteitsborging'],
      description: 'Specialist in duurzame energieoplossingen voor woningen. Meer dan 10 jaar ervaring.',
      completedProjects: 450,
      averageProjectValue: 15000
    },
    {
      id: '2',
      companyName: 'EcoWarm Installateurs',
      contactName: 'Maria Jansen',
      email: 'contact@ecowarm.nl',
      phone: '010-9876543',
      city: 'Rotterdam',
      province: 'Zuid-Holland',
      specialties: ['Warmtepomp', 'Ventilatie'],
      rating: 4.9,
      reviewCount: 89,
      isVerified: true,
      certifications: ['RVO Erkend', 'ISSO Gecertificeerd'],
      description: 'Gespecialiseerd in warmtepompen en ventilatie systemen. Kwaliteit staat voorop.',
      completedProjects: 320,
      averageProjectValue: 18000
    },
    {
      id: '3',
      companyName: 'Isolatie Experts Utrecht',
      contactName: 'Peter de Vries',
      email: 'info@isolatie-experts.nl',
      phone: '030-5555666',
      city: 'Utrecht',
      province: 'Utrecht',
      specialties: ['Isolatie', 'Renovatie'],
      rating: 4.7,
      reviewCount: 156,
      isVerified: true,
      certifications: ['RVO Erkend', 'Komo Kwaliteitsborging'],
      description: 'Specialist in isolatie en energetische renovaties. Persoonlijke aanpak.',
      completedProjects: 280,
      averageProjectValue: 12000
    }
  ]

  const filteredContractors = featuredContractors.filter(contractor => {
    const matchesSearch = searchQuery === '' || 
      contractor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.city.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSpecialty = selectedSpecialty === 'all' || 
      contractor.specialties.some(specialty => 
        specialty.toLowerCase().includes(selectedSpecialty.replace('_', ''))
      )
    
    const matchesLocation = selectedLocation === 'all' || 
      contractor.province.toLowerCase().includes(selectedLocation.replace('-', ' '))
    
    return matchesSearch && matchesSpecialty && matchesLocation
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Gecertificeerde installateurs
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Vind betrouwbare, RVO-gecertificeerde installateurs voor je energieproject. 
              Vergelijk offertes en lees reviews van andere klanten.
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 text-lg mb-8">
              <div className="flex items-center space-x-2">
                <Award className="w-6 h-6 text-blue-600" />
                <span><strong>500+</strong> gecertificeerde installateurs</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span><strong>4.8/5</strong> gemiddelde beoordeling</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span><strong>RVO</strong> gecertificeerd</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Zoek op bedrijfsnaam of plaats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer specialisatie" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer regio" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {filteredContractors.length} installateurs gevonden
          </h2>
        </div>

        {/* Contractor List */}
        <section className="mb-16">
          <div className="space-y-6">
            {filteredContractors.map((contractor, index) => (
              <motion.div
                key={contractor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {contractor.companyName}
                          </h3>
                          {contractor.isVerified && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Geverifieerd
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-semibold">{contractor.rating}</span>
                            <span className="text-gray-600">({contractor.reviewCount} reviews)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-600">{contractor.city}, {contractor.province}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{contractor.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Specialisaties</h4>
                            <div className="flex flex-wrap gap-2">
                              {contractor.specialties.map((specialty, specialtyIndex) => (
                                <Badge key={specialtyIndex} variant="outline" className="text-sm">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Certificeringen</h4>
                            <div className="flex flex-wrap gap-2">
                              {contractor.certifications.map((cert, certIndex) => (
                                <Badge key={certIndex} className="bg-blue-100 text-blue-800 text-sm">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Projecten voltooid:</span>
                            <div className="font-semibold text-gray-900">{contractor.completedProjects}</div>
                          </div>
                          <div>
                            <span className="font-medium">Gem. projectwaarde:</span>
                            <div className="font-semibold text-gray-900">
                              €{contractor.averageProjectValue.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Contact:</span>
                            <div className="font-semibold text-gray-900">{contractor.contactName}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col space-y-3">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Phone className="w-4 h-4 mr-2" />
                          Bel direct
                        </Button>
                        <Button variant="outline">
                          <Mail className="w-4 h-4 mr-2" />
                          Stuur bericht
                        </Button>
                        <Button variant="outline">
                          Vraag offerte aan
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Choose Certified Contractors */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Waarom gecertificeerde installateurs?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    RVO Certificering
                  </h3>
                  <p className="text-gray-600">
                    Alle installateurs zijn gecertificeerd door RVO en voldoen aan de hoogste kwaliteitseisen.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    Subsidie Garantie
                  </h3>
                  <p className="text-gray-600">
                    Werk uitgevoerd door gecertificeerde installateurs komt automatisch in aanmerking voor subsidie.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    Kwaliteitsgarantie
                  </h3>
                  <p className="text-gray-600">
                    Alle installateurs bieden garantie op hun werk en zijn verzekerd voor schade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section>
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">
                Klaar om te starten met je energieproject?
              </h2>
              <p className="text-xl opacity-90 mb-6">
                Krijg eerst gratis energieadvies en ontdek welke maatregelen het meest opleveren
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/energieadvies">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-bold"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start energieadvies
                  </Button>
                </Link>
                <Link href="/subsidies">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-green-600 hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-bold"
                  >
                    Bekijk subsidies
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}