"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Euro, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Home,
  Zap,
  Leaf,
  Calculator,
  ArrowRight,
  Info
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function SubsidiesPage() {
  const [subsidies, setSubsidies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [totalBudget, setTotalBudget] = useState<number>(0)
  const [totalSchemes, setTotalSchemes] = useState<number>(0)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    const fetchSubsidies = async () => {
      try {
        const response = await fetch('/api/subsidies')
        if (response.ok) {
          const data = await response.json()
          setSubsidies(data.subsidies || [])
          setTotalBudget(data.totalBudget || 0)
          setTotalSchemes(data.totalSchemes || 0)
          setLastUpdated(data.lastUpdated || '')
        }
      } catch (error) {
        console.error('Failed to fetch subsidies:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubsidies()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Dynamisch categorieën bepalen op basis van subsidies
  const allMeasures = Array.from(new Set(subsidies.flatMap((s) => s.applicableEnergyMeasures || [])))
  const subsidyCategories = [
    { id: 'all', name: 'Alle subsidies', count: subsidies.length },
    ...allMeasures.map((m) => ({
      id: m.toLowerCase().replace(/\s/g, '_'),
      name: m.charAt(0).toUpperCase() + m.slice(1),
      count: subsidies.filter((s) => (s.applicableEnergyMeasures || []).includes(m)).length
    }))
  ]

  // Filtering op basis van search/categorie
  const filteredSubsidies = subsidies.filter((subsidy) => {
    const matchesSearch = searchQuery === '' ||
      subsidy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subsidy.description && subsidy.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' ||
      (subsidy.applicableEnergyMeasures || []).some((measure: string) =>
        measure.toLowerCase().replace(/\s/g, '_') === selectedCategory
      )
    return matchesSearch && matchesCategory
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
              Energiesubsidies {new Date().getFullYear()}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ontdek alle beschikbare subsidies voor energiebesparing en duurzame energie.
              {totalBudget > 0 && (
                <> Tot {formatPrice(totalBudget)} subsidie beschikbaar voor jouw woning.</>
              )}
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-lg mb-8">
              <div className="flex items-center space-x-2">
                <Euro className="w-6 h-6 text-blue-600" />
                <span><strong>{formatPrice(totalBudget)}</strong> beschikbaar</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-green-600" />
                <span><strong>Direct</strong> aanvragen</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-purple-600" />
                <span><strong>Automatische</strong> check</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Zoek subsidies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Selecteer categorie" />
              </SelectTrigger>
              <SelectContent>
                {subsidyCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Subsidy Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatPrice(totalBudget)}</div>
              <div className="text-gray-600">Totaal beschikbaar</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{subsidies.length > 0 ? formatPrice(Math.max(...subsidies.map(s => s.maxAmount || 0))) : '€0'}</div>
              <div className="text-gray-600">Max per woning</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{totalSchemes}</div>
              <div className="text-gray-600">Subsidieregelingen</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{subsidies.length > 0 ? (new Date(Math.max(...subsidies.map(s => new Date(s.applicationDeadline || s.validUntil || '').getTime() || 0))).getFullYear()) : '—'}</div>
              <div className="text-gray-600">Deadline</div>
            </CardContent>
          </Card>
        </div>

        {/* Subsidy List */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Beschikbare subsidies ({filteredSubsidies.length})
            </h2>
          </div>
          <div className="space-y-6">
            {loading ? (
              <div className="text-center text-gray-500">Laden...</div>
            ) : filteredSubsidies.length === 0 ? (
              <div className="text-center text-gray-500">Geen subsidies gevonden.</div>
            ) : filteredSubsidies.map((subsidy, index) => (
              <motion.div
                key={subsidy.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Badge className="bg-blue-100 text-blue-800">
                            {subsidy.provider}
                          </Badge>
                          {subsidy.isActive && (
                            <Badge className="bg-green-100 text-green-800">
                              Actief
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {subsidy.name}
                        </h3>
                        <p className="text-gray-600 mb-4">{subsidy.description}</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {(subsidy.applicableEnergyMeasures || []).map((measure: string, measureIndex: number) => (
                            <Badge key={measureIndex} variant="outline" className="text-sm">
                              {measure}
                            </Badge>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Max subsidie:</span>
                            <div className="text-2xl font-bold text-green-600">
                              {formatPrice(subsidy.maxAmount)}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Deadline:</span>
                            <div className="font-semibold text-gray-900">
                              {subsidy.applicationDeadline ? new Date(subsidy.applicationDeadline).toLocaleDateString('nl-NL') : (subsidy.validUntil ? new Date(subsidy.validUntil).toLocaleDateString('nl-NL') : '—')}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <div className="font-semibold text-green-600">
                              {subsidy.isActive ? 'Beschikbaar' : 'Gesloten'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 lg:mt-0 lg:ml-8 flex flex-col space-y-3">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Calculator className="w-4 h-4 mr-2" />
                          Check geschiktheid
                        </Button>
                        <Button variant="outline">
                          <Info className="w-4 h-4 mr-2" />
                          Meer info
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Subsidy Calculator CTA */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Hoeveel subsidie kun jij krijgen?
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Gebruik onze subsidiecalculator om te ontdekken welke subsidies 
                beschikbaar zijn voor jouw specifieke situatie.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/energieadvies">
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg font-bold"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Start subsidiecheck
                  </Button>
                </Link>
                <Link href="/installateurs">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="px-8 py-3 text-lg font-bold"
                  >
                    Vind installateurs
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Important Information */}
        <section>
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4">
                <Info className="w-8 h-8 text-yellow-600 mt-1" />
                <div>
                  <h3 className="text-2xl font-bold text-yellow-900 mb-4">
                    Belangrijke informatie over subsidies
                  </h3>
                  <div className="space-y-3 text-yellow-800">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                      <span>Subsidies zijn beschikbaar zolang de pot niet leeg is</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                      <span>Aanvragen moet vóór start van de werkzaamheden</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                      <span>Gebruik alleen gecertificeerde installateurs</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600" />
                      <span>Bewaar alle facturen en certificaten</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}