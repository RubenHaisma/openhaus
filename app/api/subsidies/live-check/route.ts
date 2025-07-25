import { NextRequest, NextResponse } from 'next/server'
import { rvoApiService } from '@/lib/integrations/rvo-api'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const subsidyCheckSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Valid Dutch postal code required'),
  energyLabel: z.string().min(1, 'Energy label is required'),
  constructionYear: z.number().min(1800).max(new Date().getFullYear()),
  propertyType: z.string().min(1, 'Property type is required'),
  ownerOccupied: z.boolean().default(true),
  householdIncome: z.number().optional(),
  plannedMeasures: z.array(z.string()).default([])
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = subsidyCheckSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const propertyData = validation.data
    
    Logger.info('Starting live subsidy check', {
      address: propertyData.address,
      postalCode: propertyData.postalCode,
      energyLabel: propertyData.energyLabel,
      plannedMeasures: propertyData.plannedMeasures
    })

    // Get all available subsidy schemes
    const subsidySchemes = await rvoApiService.getSubsidySchemes()
    
    // Check eligibility for each scheme
    const eligibilityResult = await rvoApiService.checkEligibility(propertyData)
    
    // Calculate optimal subsidy combinations
    const optimalCombinations = this.calculateOptimalCombinations(
      eligibilityResult.eligibleSchemes,
      propertyData.plannedMeasures
    )
    
    // Get application requirements for eligible schemes
    const applicationRequirements = await this.getApplicationRequirements(eligibilityResult.eligibleSchemes)
    
    // Calculate deadlines and urgency
    const deadlineAnalysis = this.analyzeDeadlines(eligibilityResult.eligibleSchemes)

    Logger.audit('Live subsidy check completed', {
      address: propertyData.address,
      eligibleSchemes: eligibilityResult.eligibleSchemes.length,
      totalMaxSubsidy: eligibilityResult.totalMaxSubsidy,
      optimalCombinations: optimalCombinations.length
    })

    return NextResponse.json({
      eligibility: eligibilityResult,
      availableSchemes: subsidySchemes,
      optimalCombinations,
      applicationRequirements,
      deadlineAnalysis,
      recommendations: {
        immediateActions: this.getImmediateActions(eligibilityResult),
        timeline: this.getRecommendedTimeline(eligibilityResult.eligibleSchemes),
        riskFactors: this.identifyRiskFactors(eligibilityResult.eligibleSchemes)
      },
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('Live subsidy check failed', error as Error)
    return NextResponse.json(
      { error: 'Live subsidy check failed' },
      { status: 500 }
    )
  }
}

function calculateOptimalCombinations(eligibleSchemes: any[], plannedMeasures: string[]) {
  // Algorithm to find optimal subsidy combinations
  const combinations = []
  
  // Single scheme applications
  for (const scheme of eligibleSchemes) {
    const applicableMeasures = scheme.applicableEnergyMeasures.filter((measure: string) => 
      plannedMeasures.length === 0 || plannedMeasures.includes(measure)
    )
    
    if (applicableMeasures.length > 0) {
      combinations.push({
        schemes: [scheme],
        totalSubsidy: scheme.maxAmount,
        applicableMeasures,
        complexity: 'low',
        processingTime: '6-8 weeks',
        successProbability: 0.85
      })
    }
  }
  
  // Multi-scheme combinations (if allowed)
  for (let i = 0; i < eligibleSchemes.length; i++) {
    for (let j = i + 1; j < eligibleSchemes.length; j++) {
      const scheme1 = eligibleSchemes[i]
      const scheme2 = eligibleSchemes[j]
      
      // Check if schemes can be combined
      if (this.canCombineSchemes(scheme1, scheme2)) {
        const combinedMeasures = [
          ...scheme1.applicableEnergyMeasures,
          ...scheme2.applicableEnergyMeasures
        ].filter((measure, index, arr) => arr.indexOf(measure) === index)
        
        combinations.push({
          schemes: [scheme1, scheme2],
          totalSubsidy: scheme1.maxAmount + scheme2.maxAmount,
          applicableMeasures: combinedMeasures,
          complexity: 'medium',
          processingTime: '8-12 weeks',
          successProbability: 0.70
        })
      }
    }
  }
  
  // Sort by total subsidy amount (descending)
  return combinations.sort((a, b) => b.totalSubsidy - a.totalSubsidy)
}

function canCombineSchemes(scheme1: any, scheme2: any): boolean {
  // Check if schemes have overlapping measures (usually not allowed)
  const overlap = scheme1.applicableEnergyMeasures.some((measure: string) =>
    scheme2.applicableEnergyMeasures.includes(measure)
  )
  
  // Check if both schemes are from the same provider (may have restrictions)
  const sameProvider = scheme1.provider === scheme2.provider
  
  // Simple logic: allow combination if no overlap and different providers
  return !overlap && !sameProvider
}

async function getApplicationRequirements(eligibleSchemes: any[]) {
  return eligibleSchemes.map(scheme => ({
    schemeId: scheme.id,
    schemeName: scheme.name,
    requiredDocuments: [
      'Energielabel van de woning',
      'Eigendomsbewijs',
      'Offertes van gecertificeerde installateurs',
      'Technische specificaties van de maatregelen',
      'Bankafschrift',
      'Identiteitsbewijs'
    ],
    applicationProcess: [
      'Controleer geschiktheid woning',
      'Vraag offertes aan (minimaal 2)',
      'Dien aanvraag in online',
      'Wacht op goedkeuring',
      'Start werkzaamheden na goedkeuring',
      'Lever bewijsstukken aan na voltooiing'
    ],
    processingTime: '6-8 weken',
    applicationFee: 0,
    paymentMethod: 'Na voltooiing op basis van facturen'
  }))
}

function analyzeDeadlines(eligibleSchemes: any[]) {
  const now = new Date()
  
  return {
    urgentDeadlines: eligibleSchemes.filter(scheme => {
      const deadline = new Date(scheme.applicationDeadline)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDeadline <= 60 // Less than 2 months
    }),
    budgetStatus: eligibleSchemes.map(scheme => ({
      schemeId: scheme.id,
      schemeName: scheme.name,
      budgetRemaining: scheme.budgetRemaining,
      riskLevel: scheme.budgetRemaining < 30 ? 'high' : 
                 scheme.budgetRemaining < 60 ? 'medium' : 'low',
      estimatedDepletion: this.estimateBudgetDepletion(scheme)
    })),
    optimalApplicationWindow: this.calculateOptimalApplicationWindow(eligibleSchemes)
  }
}

function estimateBudgetDepletion(scheme: any): string {
  // Simple estimation based on current budget remaining and historical usage
  const monthlyUsageRate = (100 - scheme.budgetRemaining) / 12 // Assuming linear usage over year
  const monthsRemaining = scheme.budgetRemaining / monthlyUsageRate
  
  if (monthsRemaining < 2) return 'Binnen 2 maanden'
  if (monthsRemaining < 6) return 'Binnen 6 maanden'
  return 'Meer dan 6 maanden'
}

function calculateOptimalApplicationWindow(eligibleSchemes: any[]): string {
  // Find the scheme with the earliest deadline or lowest budget
  const urgentScheme = eligibleSchemes.reduce((most, current) => {
    const currentUrgency = this.calculateUrgencyScore(current)
    const mostUrgency = this.calculateUrgencyScore(most)
    return currentUrgency > mostUrgency ? current : most
  })
  
  return `Aanvragen binnen 2-4 weken voor optimale kans op ${urgentScheme.name}`
}

function calculateUrgencyScore(scheme: any): number {
  const now = new Date()
  const deadline = new Date(scheme.applicationDeadline)
  const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  // Higher score = more urgent
  let score = 0
  
  // Deadline urgency
  if (daysUntilDeadline <= 30) score += 50
  else if (daysUntilDeadline <= 60) score += 30
  else if (daysUntilDeadline <= 90) score += 10
  
  // Budget urgency
  if (scheme.budgetRemaining <= 20) score += 40
  else if (scheme.budgetRemaining <= 40) score += 25
  else if (scheme.budgetRemaining <= 60) score += 10
  
  return score
}

function getImmediateActions(eligibilityResult: any): string[] {
  const actions = []
  
  if (eligibilityResult.eligible) {
    actions.push('Vraag offertes aan bij minimaal 2 gecertificeerde installateurs')
    actions.push('Verzamel alle benodigde documenten')
    
    const urgentSchemes = eligibilityResult.eligibleSchemes.filter((scheme: any) => {
      const deadline = new Date(scheme.applicationDeadline)
      const daysUntilDeadline = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return daysUntilDeadline <= 60
    })
    
    if (urgentSchemes.length > 0) {
      actions.push(`Dien aanvraag in voor ${urgentSchemes[0].name} binnen 2 weken`)
    }
  } else {
    actions.push('Controleer of woning voldoet aan basisvereisten')
    actions.push('Overweeg eerst isolatiemaatregelen')
  }
  
  return actions
}

function getRecommendedTimeline(eligibleSchemes: any[]): any[] {
  return [
    {
      phase: 'Voorbereiding',
      duration: '1-2 weken',
      tasks: [
        'Offertes aanvragen',
        'Documenten verzamelen',
        'Subsidieaanvragen voorbereiden'
      ]
    },
    {
      phase: 'Aanvragen',
      duration: '1 week',
      tasks: [
        'Subsidieaanvragen indienen',
        'Bevestigingen ontvangen'
      ]
    },
    {
      phase: 'Wachten op goedkeuring',
      duration: '6-8 weken',
      tasks: [
        'Aanvullende informatie verstrekken indien nodig',
        'Installateurs definitief boeken'
      ]
    },
    {
      phase: 'Uitvoering',
      duration: '1-3 weken',
      tasks: [
        'Werkzaamheden laten uitvoeren',
        'Kwaliteitscontrole',
        'Certificaten ontvangen'
      ]
    },
    {
      phase: 'Afronding',
      duration: '2-4 weken',
      tasks: [
        'Facturen en bewijsstukken indienen',
        'Subsidie ontvangen',
        'Nieuw energielabel aanvragen'
      ]
    }
  ]
}

function identifyRiskFactors(eligibleSchemes: any[]): any[] {
  const risks = []
  
  // Budget depletion risk
  const lowBudgetSchemes = eligibleSchemes.filter(scheme => scheme.budgetRemaining < 30)
  if (lowBudgetSchemes.length > 0) {
    risks.push({
      type: 'budget_depletion',
      level: 'high',
      description: 'Subsidiebudget raakt op',
      affectedSchemes: lowBudgetSchemes.map(s => s.name),
      mitigation: 'Aanvraag zo snel mogelijk indienen'
    })
  }
  
  // Deadline risk
  const urgentDeadlines = eligibleSchemes.filter(scheme => {
    const deadline = new Date(scheme.applicationDeadline)
    const daysUntilDeadline = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilDeadline <= 90
  })
  
  if (urgentDeadlines.length > 0) {
    risks.push({
      type: 'deadline_pressure',
      level: 'medium',
      description: 'Aanvraagdeadline nadert',
      affectedSchemes: urgentDeadlines.map(s => s.name),
      mitigation: 'Planning versnellen'
    })
  }
  
  // Contractor availability risk
  risks.push({
    type: 'contractor_availability',
    level: 'medium',
    description: 'Hoge vraag naar gecertificeerde installateurs',
    affectedSchemes: ['Alle schemes'],
    mitigation: 'Vroeg boeken en meerdere offertes aanvragen'
  })
  
  return risks
}