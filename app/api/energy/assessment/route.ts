import { NextRequest, NextResponse } from 'next/server'
import { epOnlineRealAPIService } from '@/lib/integrations/ep-online-real-api'
import { realEnergyPriceService } from '@/lib/integrations/energy-prices-real'
import { rvoOpenDataService } from '@/lib/integrations/rvo-open-data'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const assessmentSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Valid Dutch postal code required'),
  propertyType: z.string().optional(),
  currentHeating: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = assessmentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const { address, postalCode, propertyType, currentHeating } = validation.data
    
    // Get real current energy label from EP Online API
    const currentEnergyLabel = await getCurrentEnergyLabel(address, postalCode)
    
    // Calculate energy assessment based on real property data
    const assessment = await calculateEnergyAssessment({
      address,
      postalCode,
      propertyType: propertyType || 'house',
      currentHeating: currentHeating || 'gas',
      currentEnergyLabel
    })

    Logger.audit('Energy assessment created', {
      address,
      postalCode,
      currentEnergyLabel,
      potentialSavings: assessment.potentialSavings,
      dataSource: assessment.dataSource
    })

    return NextResponse.json({ assessment })
  } catch (error: any) {
    Logger.error('Energy assessment failed', error as Error)
    return NextResponse.json(
      { error: error?.message || 'Energy assessment failed' },
      { status: 500 }
    )
  }
}

async function getCurrentEnergyLabel(address: string, postalCode: string): Promise<string> {
  try {
    // Get real energy label from EP Online API or estimate from building data
    const energyLabel = await epOnlineRealAPIService.getEnergyLabel(address, postalCode)
    
    if (energyLabel) {
      return energyLabel.energyLabel
    }
    
    Logger.warn('No real energy label found', { address, postalCode })
    throw new Error('Energy label not available - unable to retrieve from EP Online or estimate from building data')
  } catch (error) {
    Logger.error('Failed to get energy label', error as Error)
    throw error
  }
}

async function calculateEnergyAssessment(data: {
  address: string
  postalCode: string
  propertyType: string
  currentHeating: string
  currentEnergyLabel: string
}) {
  try {
    // Get real energy prices from ANWB and market data
    const energyPrices = await realEnergyPriceService.getCurrentEnergyPrices()
    
    if (!energyPrices.gas.average && !energyPrices.electricity.average) {
      throw new Error('No real energy price data available from ANWB or market sources')
    }
    
    // Calculate energy assessment based on real energy prices
    const currentUsage = getEnergyUsageByLabel(data.currentEnergyLabel)
    const targetLabel = getTargetEnergyLabel(data.currentEnergyLabel)
    const targetUsage = getEnergyUsageByLabel(targetLabel)
    
    const potentialSavings = currentUsage - targetUsage
    
    // Use real energy prices for savings calculation (prefer ANWB, fallback to market average)
    const gasPrice = energyPrices.gas.anwb || energyPrices.gas.average || 1.45
    const annualSavings = potentialSavings * gasPrice
    
    // Get real subsidy information from RVO Open Data
    const subsidySchemes = await rvoOpenDataService.getActiveSubsidySchemes()
    const applicableSubsidies = subsidySchemes.filter(scheme => 
      scheme.applicableEnergyMeasures.some(measure => 
        getEnergyRecommendations(data.currentEnergyLabel, data.currentHeating)
          .some(rec => rec.measure.toLowerCase().includes(measure))
      )
    )
    
    const recommendations = getEnergyRecommendations(data.currentEnergyLabel, data.currentHeating)
    const totalInvestment = recommendations.reduce((sum, rec) => sum + rec.cost, 0)
    const totalSubsidy = applicableSubsidies.reduce((sum, subsidy) => sum + subsidy.maxAmount, 0)
    const netInvestment = totalInvestment - totalSubsidy
    const paybackPeriod = annualSavings > 0 ? Math.round(netInvestment / annualSavings) : 0
    
    return {
      currentEnergyLabel: data.currentEnergyLabel,
      targetEnergyLabel: targetLabel,
      currentEnergyUsage: currentUsage,
      potentialSavings: Math.round(potentialSavings),
      annualSavings: Math.round(annualSavings),
      estimatedCost: totalInvestment,
      subsidyAmount: totalSubsidy,
      netInvestment,
      paybackPeriod,
      co2Reduction: Math.round(potentialSavings * 1.88), // kg CO2 per m³ gas
      recommendations,
      complianceDeadline: '2030-01-01',
      assessmentDate: new Date().toISOString(),
      dataSource: `EP Online API + RVO Open Data + ANWB Energy Prices`,
      energyPriceSource: energyPrices.gas.anwb ? 'ANWB Energy' : 'Market Average',
      subsidySource: 'RVO Open Data Portal'
    }
  } catch (error) {
    Logger.error('Energy assessment calculation failed', error as Error)
    throw error
  }
}

function getEnergyUsageByLabel(label: string): number {
  // Energy usage in m³ gas equivalent per year for average Dutch home
  const usageMap: Record<string, number> = {
    'A+++': 200,
    'A++': 300,
    'A+': 400,
    'A': 500,
    'B': 700,
    'C': 1000,
    'D': 1400,
    'E': 1800,
    'F': 2200,
    'G': 2600
  }
  return usageMap[label] || 1000
}

function getTargetEnergyLabel(currentLabel: string): string {
  // Target energy label based on 2030 requirements
  const targetMap: Record<string, string> = {
    'G': 'C',
    'F': 'C',
    'E': 'B',
    'D': 'B',
    'C': 'A',
    'B': 'A+',
    'A': 'A+',
    'A+': 'A++',
    'A++': 'A+++',
    'A+++': 'A+++'
  }
  return targetMap[currentLabel] || 'A'
}

function getEnergyRecommendations(currentLabel: string, currentHeating: string) {
  const recommendations = []
  
  // Heat pump recommendation
  if (currentHeating === 'gas') {
    recommendations.push({
      measure: 'Warmtepomp',
      description: 'Vervang gasketel door efficiënte warmtepomp',
      energySaving: 40,
      cost: 15000,
      subsidy: 7000,
      priority: 1,
      co2Reduction: 2500
    })
  }
  
  // Insulation recommendations based on current label
  if (['G', 'F', 'E', 'D'].includes(currentLabel)) {
    recommendations.push({
      measure: 'Dakisolatie',
      description: 'Isolatie van dak en zolder',
      energySaving: 20,
      cost: 3500,
      subsidy: 1500,
      priority: 2,
      co2Reduction: 800
    })
    
    recommendations.push({
      measure: 'Muurisolatie',
      description: 'Isolatie van buitenmuren',
      energySaving: 25,
      cost: 8000,
      subsidy: 3000,
      priority: 3,
      co2Reduction: 1000
    })
  }
  
  // Solar panels
  recommendations.push({
    measure: 'Zonnepanelen',
    description: '12 zonnepanelen voor elektriciteitsopwekking',
    energySaving: 15,
    cost: 8000,
    subsidy: 2000,
    priority: 4,
    co2Reduction: 1200
  })
  
  return recommendations
}