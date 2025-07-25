"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, 
  Euro, 
  Leaf, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Clock,
  Target,
  BarChart3,
  FileText,
  Users,
  Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import { DetailedAssessment } from '@/lib/energy/advanced-assessment'

interface DetailedAssessmentDashboardProps {
  assessment: DetailedAssessment
  onStartProject?: () => void
  onRequestQuotes?: () => void
  onApplySubsidies?: () => void
}

export function DetailedAssessmentDashboard({ 
  assessment, 
  onStartProject, 
  onRequestQuotes,
  onApplySubsidies 
}: DetailedAssessmentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEnergyLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      'A+++': 'bg-green-600', 'A++': 'bg-green-500', 'A+': 'bg-green-400', 'A': 'bg-green-300',
      'B': 'bg-yellow-400', 'C': 'bg-orange-400', 'D': 'bg-orange-500',
      'E': 'bg-red-400', 'F': 'bg-red-500', 'G': 'bg-red-600'
    }
    return colors[label] || 'bg-gray-400'
  }

  const getComplianceStatus = () => {
    if (assessment.complianceStatus.current2050Compliance) {
      return { status: 'excellent', color: 'text-green-600', text: '2050 Compliant' }
    } else if (assessment.complianceStatus.current2030Compliance) {
      return { status: 'good', color: 'text-blue-600', text: '2030 Compliant' }
    } else {
      return { status: 'needs-improvement', color: 'text-red-600', text: 'Niet Compliant' }
    }
  }

  const complianceStatus = getComplianceStatus()

  return (
    <div className="space-y-6">
      {/* Header Overview */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-green-900">
                Gedetailleerde Energieanalyse
              </CardTitle>
              <p className="text-green-700 mt-1">
                Gegenereerd op {formatDate(assessment.assessmentDate)} • Geldig tot {formatDate(assessment.validUntil)}
              </p>
            </div>
            <Badge className={`${complianceStatus.color} bg-white border-2`}>
              {complianceStatus.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-800 mb-2">
                {formatPrice(assessment.financialAnalysis.annualSavings)}
              </div>
              <div className="text-green-600">Jaarlijkse besparing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-800 mb-2">
                {formatPrice(assessment.financialAnalysis.totalSubsidies)}
              </div>
              <div className="text-blue-600">Beschikbare subsidie</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-800 mb-2">
                {Math.round(assessment.financialAnalysis.paybackPeriod)} jaar
              </div>
              <div className="text-purple-600">Terugverdientijd</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-800 mb-2">
                {Math.round(assessment.gapAnalysis.co2Reduction)} kg
              </div>
              <div className="text-orange-600">CO₂ reductie/jaar</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overzicht</TabsTrigger>
          <TabsTrigger value="recommendations">Maatregelen</TabsTrigger>
          <TabsTrigger value="financial">Financieel</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="implementation">Planning</TabsTrigger>
          <TabsTrigger value="risks">Risico's</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current vs Target State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <span>Huidige Situatie</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Energielabel</span>
                  <Badge className={`${getEnergyLabelColor(assessment.currentState.energyLabel)} text-white`}>
                    {assessment.currentState.energyLabel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Energiekosten/jaar</span>
                  <span className="font-semibold">{formatPrice(assessment.currentState.annualEnergyCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CO₂ uitstoot/jaar</span>
                  <span className="font-semibold">{Math.round(assessment.currentState.co2Emissions)} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Verwarmingssysteem</span>
                  <span className="font-semibold">{assessment.currentState.heatingSystem}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Doelsituatie</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Energielabel</span>
                  <Badge className={`${getEnergyLabelColor(assessment.targetState.energyLabel)} text-white`}>
                    {assessment.targetState.energyLabel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Energiekosten/jaar</span>
                  <span className="font-semibold text-green-600">{formatPrice(assessment.targetState.annualEnergyCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CO₂ uitstoot/jaar</span>
                  <span className="font-semibold text-green-600">{Math.round(assessment.targetState.co2Emissions)} kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compliance niveau</span>
                  <Badge className="bg-green-100 text-green-800">{assessment.targetState.complianceLevel}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gap Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span>Verbeterpotentieel</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {Math.round((assessment.gapAnalysis.energyReduction / assessment.currentState.annualEnergyUse) * 100)}%
                  </div>
                  <div className="text-blue-800">Energiereductie</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatPrice(assessment.gapAnalysis.costReduction)}
                  </div>
                  <div className="text-green-800">Kostenbesparing/jaar</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {assessment.gapAnalysis.labelImprovement}
                  </div>
                  <div className="text-purple-800">Label stappen</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="space-y-4">
            {assessment.recommendations
              .sort((a, b) => a.priority - b.priority)
              .map((recommendation, index) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge className={`
                          ${recommendation.priority === 1 ? 'bg-red-100 text-red-800' :
                            recommendation.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'}
                        `}>
                          Prioriteit {recommendation.priority}
                        </Badge>
                        <h3 className="text-xl font-bold text-gray-900">
                          {recommendation.measure}
                        </h3>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {recommendation.category}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-4">{recommendation.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Energy Impact */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Energie Impact</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Label verbetering:</span>
                            <span className="font-medium">{recommendation.energyImpact.labelImprovement}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Energiereductie:</span>
                            <span className="font-medium">{recommendation.energyImpact.energyReduction}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">CO₂ reductie:</span>
                            <span className="font-medium">{Math.round(recommendation.energyImpact.co2Reduction)} kg/jaar</span>
                          </div>
                        </div>
                      </div>

                      {/* Financial Impact */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Financieel</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Investering:</span>
                            <span className="font-medium">{formatPrice(recommendation.financialImpact.investmentCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Subsidie:</span>
                            <span className="font-medium text-green-600">-{formatPrice(recommendation.financialImpact.availableSubsidy)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Eigen kosten:</span>
                            <span className="font-medium">{formatPrice(recommendation.financialImpact.netCost)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Terugverdientijd:</span>
                            <span className="font-medium">{recommendation.financialImpact.paybackPeriod.toFixed(1)} jaar</span>
                          </div>
                        </div>
                      </div>

                      {/* Implementation */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900">Uitvoering</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Duur:</span>
                            <span className="font-medium">{recommendation.implementation.duration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Complexiteit:</span>
                            <Badge variant="outline" className={`
                              ${recommendation.implementation.complexity === 'low' ? 'text-green-600' :
                                recommendation.implementation.complexity === 'medium' ? 'text-yellow-600' :
                                'text-red-600'}
                            `}>
                              {recommendation.implementation.complexity}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Installateurs:</span>
                            <span className="font-medium">{recommendation.contractors.estimatedContractors}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Wachttijd:</span>
                            <span className="font-medium">{recommendation.contractors.averageWaitTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Requirements */}
                    {recommendation.technicalRequirements.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Technische vereisten:</h5>
                        <ul className="space-y-1">
                          {recommendation.technicalRequirements.map((req, reqIndex) => (
                            <li key={reqIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          {/* Investment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Euro className="w-5 h-5 text-green-600" />
                <span>Financieel Overzicht</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Totale investering</span>
                    <span className="text-xl font-bold">{formatPrice(assessment.financialAnalysis.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Beschikbare subsidies</span>
                    <span className="text-xl font-bold text-green-600">-{formatPrice(assessment.financialAnalysis.totalSubsidies)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <span className="font-medium">Eigen investering</span>
                    <span className="text-2xl font-bold text-blue-600">{formatPrice(assessment.financialAnalysis.netInvestment)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="font-medium">Jaarlijkse besparing</span>
                    <span className="text-xl font-bold text-purple-600">{formatPrice(assessment.financialAnalysis.annualSavings)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium">Terugverdientijd</span>
                    <span className="text-xl font-bold text-orange-600">{assessment.financialAnalysis.paybackPeriod.toFixed(1)} jaar</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="font-medium">ROI</span>
                    <span className="text-xl font-bold text-indigo-600">{assessment.financialAnalysis.roi.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Aanvullende Voordelen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Hypotheekvoordelen</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Groene hypotheek korting:</span>
                      <span className="font-medium">{assessment.financialAnalysis.mortgageBenefits.greenMortgageDiscount}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extra leencapaciteit:</span>
                      <span className="font-medium">{formatPrice(assessment.financialAnalysis.mortgageBenefits.additionalBorrowingCapacity)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Belastingvoordelen</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Energie-investeringsaftrek:</span>
                      <span className="font-medium">{formatPrice(assessment.financialAnalysis.taxBenefits.energyInvestmentDeduction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">WOZ-waarde vermindering:</span>
                      <span className="font-medium">{formatPrice(assessment.financialAnalysis.taxBenefits.propertyTaxReduction)}/jaar</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Compliance Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Compliance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      {assessment.complianceStatus.current2030Compliance ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      )}
                      <h3 className="font-semibold">2030 Compliance</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Alle woningen moeten minimaal energielabel C hebben
                    </p>
                    {assessment.complianceStatus.requiredFor2030.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Nog nodig:</p>
                        <ul className="space-y-1">
                          {assessment.complianceStatus.requiredFor2030.map((req, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      {assessment.complianceStatus.current2050Compliance ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                      )}
                      <h3 className="font-semibold">2050 Compliance</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Alle woningen moeten CO₂-neutraal zijn
                    </p>
                    {assessment.complianceStatus.requiredFor2050.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Nog nodig:</p>
                        <ul className="space-y-1">
                          {assessment.complianceStatus.requiredFor2050.map((req, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deadlines */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-900">Belangrijke Deadlines</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Volgende mijlpaal:</p>
                      <p className="text-yellow-800">{formatDate(assessment.complianceStatus.deadlines.nextMilestone)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Finale deadline:</p>
                      <p className="text-yellow-800">{formatDate(assessment.complianceStatus.deadlines.finalDeadline)}</p>
                    </div>
                  </div>
                </div>

                {/* Penalties */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h3 className="font-semibold text-red-900">Gevolgen van Niet-Compliance</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-red-900">Mogelijke boete:</p>
                      <p className="text-red-800">{formatPrice(assessment.complianceStatus.penalties.nonComplianceFine)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-900">Waardedaling woning:</p>
                      <p className="text-red-800">{formatPrice(assessment.complianceStatus.penalties.propertyValueImpact)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="implementation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Implementatieplan</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Timeline Overview */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-900">Totale Projectduur</h3>
                    <span className="text-blue-800 font-medium">{assessment.implementationPlan.totalDuration}</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    Kritiek pad: {assessment.implementationPlan.criticalPath.join(' → ')}
                  </div>
                </div>

                {/* Phases */}
                <div className="space-y-4">
                  {assessment.implementationPlan.phases.map((phase, index) => (
                    <div key={phase.phase} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                            {phase.phase}
                          </div>
                          <h4 className="font-semibold text-gray-900">{phase.name}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Duur: {phase.duration}</div>
                          <div className="text-sm text-gray-600">Optimaal: {phase.optimalTiming}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Maatregelen:</p>
                          <ul className="space-y-1">
                            {phase.measures.map((measure, measureIndex) => (
                              <li key={measureIndex} className="text-sm text-gray-600">• {measure}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Financieel:</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Kosten:</span>
                              <span>{formatPrice(phase.cost)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subsidie:</span>
                              <span className="text-green-600">-{formatPrice(phase.subsidy)}</span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span>Netto:</span>
                              <span>{formatPrice(phase.cost - phase.subsidy)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Impact:</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Energiebesparing:</span>
                              <span>{phase.energyImpact}%</span>
                            </div>
                            {phase.dependencies.length > 0 && (
                              <div>
                                <span className="text-gray-600">Afhankelijkheden:</span>
                                <div className="text-xs text-gray-500 mt-1">
                                  {phase.dependencies.join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Seasonal Considerations */}
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-3">Seizoensoverwegingen</h4>
                  <ul className="space-y-1">
                    {assessment.implementationPlan.seasonalConsiderations.map((consideration, index) => (
                      <li key={index} className="text-sm text-orange-800 flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Permit Requirements */}
                {assessment.implementationPlan.permitRequirements.length > 0 && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-3">Vergunningsvereisten</h4>
                    <ul className="space-y-1">
                      {assessment.implementationPlan.permitRequirements.map((permit, index) => (
                        <li key={index} className="text-sm text-purple-800 flex items-center space-x-2">
                          <FileText className="w-4 h-4" />
                          <span>{permit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Technical Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Technische Risico's</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessment.riskAssessment.technicalRisks.map((risk, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 text-sm">{risk.risk}</h5>
                        <Badge variant="outline" className={`
                          ${risk.impact === 'high' ? 'text-red-600' :
                            risk.impact === 'medium' ? 'text-yellow-600' :
                            'text-green-600'}
                        `}>
                          {risk.impact}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">
                        Kans: {risk.probability} • Impact: {risk.impact}
                      </p>
                      <p className="text-xs text-gray-700">
                        <strong>Mitigatie:</strong> {risk.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Financiële Risico's</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">Subsidie beschikbaarheid</span>
                    <Badge variant="outline" className={`
                      ${assessment.riskAssessment.financialRisks.subsidyAvailability === 'high' ? 'text-red-600' :
                        assessment.riskAssessment.financialRisks.subsidyAvailability === 'medium' ? 'text-yellow-600' :
                        'text-green-600'}
                    `}>
                      {assessment.riskAssessment.financialRisks.subsidyAvailability}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">Energieprijs volatiliteit</span>
                    <Badge variant="outline" className={`
                      ${assessment.riskAssessment.financialRisks.energyPriceVolatility === 'high' ? 'text-red-600' :
                        assessment.riskAssessment.financialRisks.energyPriceVolatility === 'medium' ? 'text-yellow-600' :
                        'text-green-600'}
                    `}>
                      {assessment.riskAssessment.financialRisks.energyPriceVolatility}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">Installateur beschikbaarheid</span>
                    <Badge variant="outline" className={`
                      ${assessment.riskAssessment.financialRisks.contractorAvailability === 'high' ? 'text-red-600' :
                        assessment.riskAssessment.financialRisks.contractorAvailability === 'medium' ? 'text-yellow-600' :
                        'text-green-600'}
                    `}>
                      {assessment.riskAssessment.financialRisks.contractorAvailability}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Regulatory Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Regelgeving Risico's</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">Beleidswijzigingen</span>
                    <Badge variant="outline" className={`
                      ${assessment.riskAssessment.regulatoryRisks.policyChanges === 'high' ? 'text-red-600' :
                        assessment.riskAssessment.regulatoryRisks.policyChanges === 'medium' ? 'text-yellow-600' :
                        'text-green-600'}
                    `}>
                      {assessment.riskAssessment.regulatoryRisks.policyChanges}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <span className="text-sm font-medium">Compliance deadlines</span>
                    <Badge variant="outline" className={`
                      ${assessment.riskAssessment.regulatoryRisks.complianceDeadlines === 'high' ? 'text-red-600' :
                        assessment.riskAssessment.regulatoryRisks.complianceDeadlines === 'medium' ? 'text-yellow-600' :
                        'text-green-600'}
                    `}>
                      {assessment.riskAssessment.regulatoryRisks.complianceDeadlines}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onStartProject && (
          <Button 
            onClick={onStartProject}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
          >
            <Zap className="w-5 h-5 mr-2" />
            Start Energieproject
          </Button>
        )}
        
        {onRequestQuotes && (
          <Button 
            onClick={onRequestQuotes}
            size="lg"
            variant="outline"
            className="px-8 py-3"
          >
            <Users className="w-5 h-5 mr-2" />
            Vraag Offertes Aan
          </Button>
        )}
        
        {onApplySubsidies && (
          <Button 
            onClick={onApplySubsidies}
            size="lg"
            variant="outline"
            className="px-8 py-3"
          >
            <Euro className="w-5 h-5 mr-2" />
            Subsidies Aanvragen
          </Button>
        )}
      </div>
    </div>
  )
}