import { NextRequest, NextResponse } from 'next/server'
import { rvoApiService } from '@/lib/integrations/rvo-api'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const contractorMatchSchema = z.object({
  projectType: z.array(z.string()).min(1, 'At least one project type required'),
  location: z.string().min(1, 'Location is required'),
  budget: z.number().min(1000, 'Minimum budget is €1000'),
  timeline: z.string().min(1, 'Timeline is required'),
  propertyType: z.string().min(1, 'Property type is required'),
  specialRequirements: z.array(z.string()).default([]),
  preferredCertifications: z.array(z.string()).default([]),
  maxDistance: z.number().min(5).max(100).default(50) // km
})

interface ContractorMatch {
  contractor: any
  matchScore: number
  matchReasons: string[]
  availability: {
    nextAvailable: string
    estimatedDuration: string
    currentWorkload: 'low' | 'medium' | 'high'
  }
  pricing: {
    estimatedCost: number
    priceRange: string
    competitiveness: 'low' | 'medium' | 'high'
  }
  qualifications: {
    certifications: string[]
    experience: number
    specialties: string[]
    rating: number
    reviewCount: number
  }
  riskFactors: string[]
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = contractorMatchSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const projectRequirements = validation.data
    
    Logger.info('Starting smart contractor matching', {
      projectType: projectRequirements.projectType,
      location: projectRequirements.location,
      budget: projectRequirements.budget
    })

    // Get all contractors in the area
    const contractors = await this.getContractorsInArea(
      projectRequirements.location, 
      projectRequirements.maxDistance
    )
    
    // Filter contractors by project type and certifications
    const qualifiedContractors = await this.filterQualifiedContractors(
      contractors, 
      projectRequirements
    )
    
    // Calculate match scores for each contractor
    const contractorMatches = await Promise.all(
      qualifiedContractors.map(contractor => 
        this.calculateContractorMatch(contractor, projectRequirements)
      )
    )
    
    // Sort by match score (descending)
    const sortedMatches = contractorMatches.sort((a, b) => b.matchScore - a.matchScore)
    
    // Get top 10 matches
    const topMatches = sortedMatches.slice(0, 10)
    
    // Generate matching insights
    const matchingInsights = this.generateMatchingInsights(topMatches, projectRequirements)

    Logger.audit('Smart contractor matching completed', {
      location: projectRequirements.location,
      totalContractors: contractors.length,
      qualifiedContractors: qualifiedContractors.length,
      topMatches: topMatches.length,
      averageMatchScore: topMatches.reduce((sum, match) => sum + match.matchScore, 0) / topMatches.length
    })

    return NextResponse.json({
      matches: topMatches,
      insights: matchingInsights,
      summary: {
        totalContractorsEvaluated: contractors.length,
        qualifiedContractors: qualifiedContractors.length,
        averageMatchScore: topMatches.reduce((sum, match) => sum + match.matchScore, 0) / topMatches.length,
        recommendedContractors: topMatches.slice(0, 3).length
      },
      recommendations: {
        nextSteps: this.getNextSteps(topMatches),
        timeline: this.getProjectTimeline(topMatches, projectRequirements),
        budgetOptimization: this.getBudgetOptimization(topMatches, projectRequirements)
      },
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('Smart contractor matching failed', error as Error)
    return NextResponse.json(
      { error: 'Smart contractor matching failed' },
      { status: 500 }
    )
  }
}

async function getContractorsInArea(location: string, maxDistance: number) {
  // In production, this would query a comprehensive contractor database
  // For now, return mock data with realistic contractors
  
  const mockContractors = [
    {
      id: '1',
      companyName: 'EcoTech Installaties',
      kvkNumber: '12345678',
      location: 'Amsterdam',
      distance: 15,
      certifications: ['RVO erkend', 'ISSO WP-ketel', 'KOMO'],
      specialties: ['heat_pump', 'insulation', 'solar_panels'],
      rating: 4.8,
      reviewCount: 156,
      projectsCompleted: 450,
      yearsExperience: 12,
      teamSize: 8,
      currentWorkload: 'medium',
      averageProjectValue: 18000,
      responseTime: '2 hours',
      languages: ['Nederlands', 'Engels']
    },
    {
      id: '2',
      companyName: 'Duurzaam Wonen Solutions',
      kvkNumber: '87654321',
      location: 'Utrecht',
      distance: 25,
      certifications: ['RVO erkend', 'ISSO WP-ketel'],
      specialties: ['heat_pump', 'ventilation'],
      rating: 4.9,
      reviewCount: 89,
      projectsCompleted: 320,
      yearsExperience: 8,
      teamSize: 5,
      currentWorkload: 'low',
      averageProjectValue: 22000,
      responseTime: '1 hour',
      languages: ['Nederlands']
    },
    {
      id: '3',
      companyName: 'Isolatie Experts Nederland',
      kvkNumber: '11223344',
      location: 'Haarlem',
      distance: 20,
      certifications: ['RVO erkend', 'KOMO'],
      specialties: ['insulation', 'renovation'],
      rating: 4.7,
      reviewCount: 203,
      projectsCompleted: 680,
      yearsExperience: 15,
      teamSize: 12,
      currentWorkload: 'high',
      averageProjectValue: 8500,
      responseTime: '4 hours',
      languages: ['Nederlands', 'Duits']
    }
  ]
  
  return mockContractors.filter(contractor => contractor.distance <= maxDistance)
}

async function filterQualifiedContractors(contractors: any[], requirements: any) {
  const qualified = []
  
  for (const contractor of contractors) {
    // Check if contractor has required specialties
    const hasRequiredSpecialties = requirements.projectType.some((type: string) =>
      contractor.specialties.includes(type)
    )
    
    if (!hasRequiredSpecialties) continue
    
    // Check certifications if specified
    if (requirements.preferredCertifications.length > 0) {
      const hasCertifications = requirements.preferredCertifications.some((cert: string) =>
        contractor.certifications.includes(cert)
      )
      if (!hasCertifications) continue
    }
    
    // Verify contractor with RVO if possible
    const rvoVerification = await rvoApiService.getContractorCertifications(contractor.kvkNumber)
    if (rvoVerification) {
      contractor.rvoVerified = true
      contractor.rvoData = rvoVerification
    }
    
    qualified.push(contractor)
  }
  
  return qualified
}

async function calculateContractorMatch(contractor: any, requirements: any): Promise<ContractorMatch> {
  let matchScore = 0
  const matchReasons = []
  const riskFactors = []
  
  // Specialty match (40% of score)
  const specialtyMatch = requirements.projectType.filter((type: string) =>
    contractor.specialties.includes(type)
  ).length / requirements.projectType.length
  matchScore += specialtyMatch * 40
  if (specialtyMatch === 1) {
    matchReasons.push('Alle benodigde specialisaties')
  } else if (specialtyMatch > 0.5) {
    matchReasons.push('Meeste benodigde specialisaties')
  }
  
  // Rating and reviews (20% of score)
  const ratingScore = (contractor.rating / 5) * 20
  matchScore += ratingScore
  if (contractor.rating >= 4.5) {
    matchReasons.push('Uitstekende klantbeoordelingen')
  }
  if (contractor.reviewCount < 20) {
    riskFactors.push('Beperkt aantal reviews')
  }
  
  // Experience (15% of score)
  const experienceScore = Math.min(contractor.yearsExperience / 10, 1) * 15
  matchScore += experienceScore
  if (contractor.yearsExperience >= 10) {
    matchReasons.push('Ruime ervaring in de sector')
  }
  
  // Availability (15% of score)
  const availabilityScore = contractor.currentWorkload === 'low' ? 15 :
                           contractor.currentWorkload === 'medium' ? 10 : 5
  matchScore += availabilityScore
  if (contractor.currentWorkload === 'low') {
    matchReasons.push('Goede beschikbaarheid')
  } else if (contractor.currentWorkload === 'high') {
    riskFactors.push('Hoge werkdruk, langere wachttijd')
  }
  
  // Distance (10% of score)
  const distanceScore = Math.max(0, (50 - contractor.distance) / 50) * 10
  matchScore += distanceScore
  if (contractor.distance <= 20) {
    matchReasons.push('Lokale installateur')
  }
  
  // Budget compatibility
  const budgetCompatible = this.checkBudgetCompatibility(contractor, requirements.budget)
  if (budgetCompatible.compatible) {
    matchReasons.push('Budget past bij gemiddelde projectwaarde')
  } else {
    riskFactors.push(budgetCompatible.reason)
  }
  
  // Estimate availability
  const availability = this.estimateAvailability(contractor)
  
  // Estimate pricing
  const pricing = this.estimatePricing(contractor, requirements)
  
  return {
    contractor,
    matchScore: Math.round(matchScore),
    matchReasons,
    availability,
    pricing,
    qualifications: {
      certifications: contractor.certifications,
      experience: contractor.yearsExperience,
      specialties: contractor.specialties,
      rating: contractor.rating,
      reviewCount: contractor.reviewCount
    },
    riskFactors
  }
}

function checkBudgetCompatibility(contractor: any, budget: number) {
  const avgProjectValue = contractor.averageProjectValue
  const tolerance = 0.3 // 30% tolerance
  
  if (budget >= avgProjectValue * (1 - tolerance) && budget <= avgProjectValue * (1 + tolerance)) {
    return { compatible: true, reason: '' }
  } else if (budget < avgProjectValue * (1 - tolerance)) {
    return { compatible: false, reason: 'Budget mogelijk te laag voor deze installateur' }
  } else {
    return { compatible: false, reason: 'Budget hoger dan gemiddelde projecten' }
  }
}

function estimateAvailability(contractor: any) {
  const baseWeeks = contractor.currentWorkload === 'low' ? 2 :
                   contractor.currentWorkload === 'medium' ? 4 : 8
  
  const nextAvailable = new Date()
  nextAvailable.setDate(nextAvailable.getDate() + (baseWeeks * 7))
  
  return {
    nextAvailable: nextAvailable.toISOString().split('T')[0],
    estimatedDuration: this.estimateProjectDuration(contractor),
    currentWorkload: contractor.currentWorkload
  }
}

function estimateProjectDuration(contractor: any): string {
  // Estimate based on contractor's typical project complexity
  if (contractor.specialties.includes('heat_pump')) {
    return '2-3 dagen'
  } else if (contractor.specialties.includes('insulation')) {
    return '1-2 dagen'
  } else if (contractor.specialties.includes('solar_panels')) {
    return '1 dag'
  }
  return '1-3 dagen'
}

function estimatePricing(contractor: any, requirements: any) {
  const basePrice = contractor.averageProjectValue
  const projectComplexity = requirements.projectType.length
  const specialRequirements = requirements.specialRequirements.length
  
  // Adjust price based on project complexity
  let estimatedCost = basePrice
  if (projectComplexity > 1) {
    estimatedCost *= 1.2 // 20% increase for multi-type projects
  }
  if (specialRequirements > 0) {
    estimatedCost *= 1.1 // 10% increase for special requirements
  }
  
  // Determine competitiveness
  const marketAverage = 15000 // Estimated market average
  const competitiveness = estimatedCost < marketAverage * 0.9 ? 'high' :
                         estimatedCost < marketAverage * 1.1 ? 'medium' : 'low'
  
  return {
    estimatedCost: Math.round(estimatedCost),
    priceRange: `€${Math.round(estimatedCost * 0.9).toLocaleString()} - €${Math.round(estimatedCost * 1.1).toLocaleString()}`,
    competitiveness
  }
}

function generateMatchingInsights(matches: ContractorMatch[], requirements: any) {
  return {
    marketAnalysis: {
      averageRating: matches.reduce((sum, match) => sum + match.contractor.rating, 0) / matches.length,
      averageExperience: matches.reduce((sum, match) => sum + match.contractor.yearsExperience, 0) / matches.length,
      priceRange: {
        min: Math.min(...matches.map(match => match.pricing.estimatedCost)),
        max: Math.max(...matches.map(match => match.pricing.estimatedCost)),
        average: matches.reduce((sum, match) => sum + match.pricing.estimatedCost, 0) / matches.length
      }
    },
    availability: {
      earliestAvailable: matches.reduce((earliest, match) => {
        const matchDate = new Date(match.availability.nextAvailable)
        const earliestDate = new Date(earliest)
        return matchDate < earliestDate ? match.availability.nextAvailable : earliest
      }, matches[0]?.availability.nextAvailable),
      averageWaitTime: this.calculateAverageWaitTime(matches)
    },
    qualityIndicators: {
      highRatedContractors: matches.filter(match => match.contractor.rating >= 4.5).length,
      experiencedContractors: matches.filter(match => match.contractor.yearsExperience >= 10).length,
      rvoVerifiedContractors: matches.filter(match => match.contractor.rvoVerified).length
    },
    riskAnalysis: {
      commonRisks: this.identifyCommonRisks(matches),
      mitigationStrategies: this.getMitigationStrategies(matches)
    }
  }
}

function calculateAverageWaitTime(matches: ContractorMatch[]): string {
  const totalDays = matches.reduce((sum, match) => {
    const waitDays = Math.ceil((new Date(match.availability.nextAvailable).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return sum + waitDays
  }, 0)
  
  const averageDays = Math.round(totalDays / matches.length)
  const weeks = Math.floor(averageDays / 7)
  const days = averageDays % 7
  
  return weeks > 0 ? `${weeks} weken${days > 0 ? ` en ${days} dagen` : ''}` : `${days} dagen`
}

function identifyCommonRisks(matches: ContractorMatch[]): string[] {
  const riskCounts: Record<string, number> = {}
  
  matches.forEach(match => {
    match.riskFactors.forEach(risk => {
      riskCounts[risk] = (riskCounts[risk] || 0) + 1
    })
  })
  
  // Return risks that appear in more than 30% of matches
  const threshold = matches.length * 0.3
  return Object.entries(riskCounts)
    .filter(([risk, count]) => count >= threshold)
    .map(([risk]) => risk)
}

function getMitigationStrategies(matches: ContractorMatch[]): string[] {
  const strategies = [
    'Vraag meerdere offertes aan voor prijsvergelijking',
    'Controleer referenties van recente projecten',
    'Vraag naar garantievoorwaarden',
    'Plan werkzaamheden ruim van tevoren',
    'Zorg voor duidelijke contractafspraken'
  ]
  
  // Add specific strategies based on identified risks
  const commonRisks = this.identifyCommonRisks(matches)
  
  if (commonRisks.includes('Hoge werkdruk, langere wachttijd')) {
    strategies.push('Boek vroeg in het seizoen voor betere beschikbaarheid')
  }
  
  if (commonRisks.includes('Beperkt aantal reviews')) {
    strategies.push('Vraag extra referenties en voorbeeldprojecten')
  }
  
  return strategies
}

function getNextSteps(matches: ContractorMatch[]): string[] {
  const steps = []
  
  if (matches.length > 0) {
    steps.push(`Neem contact op met top 3 installateurs voor offertes`)
    steps.push('Vergelijk offertes op prijs, kwaliteit en beschikbaarheid')
    steps.push('Controleer certificeringen en referenties')
    steps.push('Plan bezichtiging voor technische beoordeling')
    
    const fastestAvailable = matches.reduce((fastest, match) => {
      const matchDate = new Date(match.availability.nextAvailable)
      const fastestDate = new Date(fastest.availability.nextAvailable)
      return matchDate < fastestDate ? match : fastest
    })
    
    steps.push(`Snelst beschikbaar: ${fastestAvailable.contractor.companyName} (${fastestAvailable.availability.nextAvailable})`)
  } else {
    steps.push('Geen geschikte installateurs gevonden in de buurt')
    steps.push('Overweeg uitbreiding van zoekgebied')
    steps.push('Controleer of projectvereisten realistisch zijn')
  }
  
  return steps
}

function getProjectTimeline(matches: ContractorMatch[], requirements: any): any[] {
  const bestMatch = matches[0]
  if (!bestMatch) return []
  
  const startDate = new Date(bestMatch.availability.nextAvailable)
  
  return [
    {
      phase: 'Offerte en planning',
      startDate: new Date().toISOString().split('T')[0],
      duration: '1-2 weken',
      description: 'Offertes vergelijken en installateur selecteren'
    },
    {
      phase: 'Voorbereiding',
      startDate: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: '1 week',
      description: 'Materialen bestellen en werkvoorbereiding'
    },
    {
      phase: 'Uitvoering',
      startDate: startDate.toISOString().split('T')[0],
      duration: bestMatch.availability.estimatedDuration,
      description: 'Installatie van energiemaatregelen'
    },
    {
      phase: 'Afronding',
      startDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duration: '1 week',
      description: 'Oplevering, testen en certificering'
    }
  ]
}

function getBudgetOptimization(matches: ContractorMatch[], requirements: any) {
  const prices = matches.map(match => match.pricing.estimatedCost)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
  
  return {
    budgetRange: {
      minimum: minPrice,
      maximum: maxPrice,
      average: Math.round(avgPrice),
      userBudget: requirements.budget
    },
    recommendations: {
      budgetAdequate: requirements.budget >= avgPrice,
      suggestedBudget: Math.round(avgPrice * 1.1), // 10% buffer
      costSavingTips: [
        'Combineer meerdere maatregelen voor schaalvoordeel',
        'Plan werkzaamheden in rustige periodes',
        'Overweeg minder dure alternatieven',
        'Vraag naar betalingsregelingen'
      ]
    },
    subsidyImpact: {
      beforeSubsidy: Math.round(avgPrice),
      afterSubsidy: Math.round(avgPrice * 0.7), // Assuming 30% subsidy
      netCost: Math.round(avgPrice * 0.7)
    }
  }
}