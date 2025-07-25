"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Zap, Euro, Leaf, Calendar, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface EnergyAssessment {
  currentEnergyLabel: string
  targetEnergyLabel: string
  currentEnergyUsage: number
  potentialSavings: number
  annualSavings: number
  estimatedCost: number
  subsidyAmount: number
  netInvestment: number
  paybackPeriod: number
  co2Reduction: number
  recommendations: Array<{
    measure: string
    description: string
    energySaving: number
    cost: number
    subsidy: number
    priority: number
    co2Reduction: number
  }>
  complianceDeadline: string
  assessmentDate: string
}

interface EnergyAssessmentResultProps {
  address: string
  postalCode: string
  assessment: EnergyAssessment
  onStartProject?: () => void
}

export function EnergyAssessmentResult({ 
  address, 
  postalCode, 
  assessment, 
  onStartProject 
}: EnergyAssessmentResultProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getEnergyLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      'A+++': 'bg-green-600', 'A++': 'bg-green-500', 'A+': 'bg-green-400', 'A': 'bg-green-300',
      'B': 'bg-yellow-400', 'C': 'bg-orange-400', 'D': 'bg-orange-500',
      'E': 'bg-red-400', 'F': 'bg-red-500', 'G': 'bg-red-600'
    }
    return colors[label] || 'bg-gray-400'
  }

  const savingsPercentage = Math.round((assessment.potentialSavings / assessment.currentEnergyUsage) * 100)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Main Assessment Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-lg">{address}, {postalCode}</span>
          </div>
          <CardTitle className="text-4xl font-bold text-green-900 mb-4">
            {savingsPercentage}% energiebesparing mogelijk
          </CardTitle>
          
          <div className="flex items-center justify-center space-x-8">
            <div className="text-center">
              <Badge className={`${getEnergyLabelColor(assessment.currentEnergyLabel)} text-white px-4 py-2 text-lg mb-2`}>
                Huidig: {assessment.currentEnergyLabel}
              </Badge>
              <div className="text-sm text-gray-600">Nu</div>
            </div>
            
            <TrendingUp className="w-8 h-8 text-green-600" />
            
            <div className="text-center">
              <Badge className={`${getEnergyLabelColor(assessment.targetEnergyLabel)} text-white px-4 py-2 text-lg mb-2`}>
                Doel: {assessment.targetEnergyLabel}
              </Badge>
              <div className="text-sm text-gray-600">2030</div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatPrice(assessment.annualSavings)}</div>
              <div className="text-sm text-gray-600">Jaarlijkse besparing</div>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatPrice(assessment.subsidyAmount)}</div>
              <div className="text-sm text-gray-600">Beschikbare subsidie</div>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{assessment.paybackPeriod} jaar</div>
              <div className="text-sm text-gray-600">Terugverdientijd</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="text-center">
          <p className="text-gray-700 mb-6">
            Met de aanbevolen energiemaatregelen bespaar je jaarlijks {formatPrice(assessment.annualSavings)} 
            en verminder je {assessment.co2Reduction} kg CO₂ uitstoot per jaar.
          </p>
          
          {onStartProject && (
            <Button 
              onClick={onStartProject}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl text-lg font-semibold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start energieproject
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Investment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Euro className="w-5 h-5 text-green-600" />
            <span>Investering & Subsidie</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Totale investering</h4>
                <p className="text-sm text-gray-600">Kosten voor alle aanbevolen maatregelen</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{formatPrice(assessment.estimatedCost)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-900">Beschikbare subsidie</h4>
                <p className="text-sm text-green-600">ISDE, SEEH en lokale subsidies</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-800">-{formatPrice(assessment.subsidyAmount)}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
              <div>
                <h4 className="font-medium text-blue-900">Eigen investering</h4>
                <p className="text-sm text-blue-600">Na aftrek van alle subsidies</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-800">{formatPrice(assessment.netInvestment)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Measures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Aanbevolen energiemaatregelen</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessment.recommendations
              .sort((a, b) => a.priority - b.priority)
              .map((recommendation, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      Prioriteit {recommendation.priority}
                    </Badge>
                    <h4 className="font-medium text-gray-900">{recommendation.measure}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-medium">
                      {recommendation.energySaving}% besparing
                    </span>
                    <span className="text-gray-600">
                      {recommendation.co2Reduction} kg CO₂/jaar
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(recommendation.cost)}
                  </div>
                  <div className="text-sm text-green-600">
                    -{formatPrice(recommendation.subsidy)} subsidie
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    = {formatPrice(recommendation.cost - recommendation.subsidy)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span>Compliance tijdlijn</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <h4 className="font-medium text-orange-900">2030 Deadline</h4>
                <p className="text-sm text-orange-600">
                  Alle woningen moeten energielabel C of hoger hebben
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-orange-800">
                  {Math.ceil((new Date('2030-01-01').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 365))} jaar
                </div>
                <div className="text-sm text-orange-600">Tijd over</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-medium text-green-900">Aanbevolen start</h4>
                <p className="text-sm text-green-600">
                  Begin binnen 6 maanden voor optimale subsidie en planning
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-800">2024</div>
                <div className="text-sm text-green-600">Dit jaar</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Leaf className="w-8 h-8 text-green-600 mt-1" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">
                Milieu impact
              </h4>
              <p className="text-green-800 text-sm mb-3">
                Met deze energiemaatregelen draag je significant bij aan de klimaatdoelen:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-900">CO₂ reductie:</span>
                  <br />
                  <span className="text-green-800">{assessment.co2Reduction} kg/jaar</span>
                </div>
                <div>
                  <span className="font-medium text-green-900">Equivalent:</span>
                  <br />
                  <span className="text-green-800">{Math.round(assessment.co2Reduction / 2300)} auto's van de weg</span>
                </div>
                <div>
                  <span className="font-medium text-green-900">Energiebesparing:</span>
                  <br />
                  <span className="text-green-800">{assessment.potentialSavings} m³ gas/jaar</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}