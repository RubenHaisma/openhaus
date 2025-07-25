import { NextRequest, NextResponse } from 'next/server'
import { energyMarketIntelligenceService } from '@/lib/integrations/energy-market-intelligence'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const priceOptimizationSchema = z.object({
  currentHeating: z.string().min(1, 'Current heating type is required'),
  plannedMeasures: z.array(z.string()).min(1, 'At least one planned measure is required'),
  region: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const region = searchParams.get('region')

    if (region) {
      // Get regional intelligence
      const regionalData = await energyMarketIntelligenceService.getRegionalIntelligence(region)
      if (!regionalData) {
        return NextResponse.json({ error: 'Region not found' }, { status: 404 })
      }
      return NextResponse.json({ regionalData })
    }

    // Get full market intelligence
    const intelligence = await energyMarketIntelligenceService.getMarketIntelligence()

    Logger.info('Energy market intelligence retrieved', {
      gasPriceEur: intelligence.currentPrices.gas,
      electricityPriceEur: intelligence.currentPrices.electricity,
      transitionProgress: intelligence.marketTrends.energyTransitionProgress
    })

    return NextResponse.json({
      intelligence,
      anwbPrices: intelligence.anwbPrices,
      summary: {
        currentGasPrice: intelligence.currentPrices.gas,
        currentElectricityPrice: intelligence.currentPrices.electricity,
        anwbGasPrice: intelligence.anwbPrices.gas,
        anwbElectricityPrice: intelligence.anwbPrices.electricity,
        transitionProgress: intelligence.marketTrends.energyTransitionProgress,
        averageWaitTime: intelligence.contractorMarket.averageWaitTime,
        subsidyBudgetAlert: getSubsidyAlert(intelligence.subsidyBudgetStatus)
      },
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('Energy market intelligence retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Market intelligence retrieval failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = priceOptimizationSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const { currentHeating, plannedMeasures, region } = validation.data

    Logger.info('Price optimization analysis requested', {
      currentHeating,
      plannedMeasures,
      region
    })

    // Get price optimization advice
    const optimization = await energyMarketIntelligenceService.getPriceOptimizationAdvice(
      currentHeating,
      plannedMeasures
    )

    // Get market intelligence for context
    const intelligence = await energyMarketIntelligenceService.getMarketIntelligence()

    Logger.audit('Price optimization analysis completed', {
      currentHeating,
      plannedMeasures,
      currentCosts: optimization.currentCosts,
      projectedSavings: optimization.savings,
      paybackPeriod: optimization.paybackPeriod
    })

    return NextResponse.json({
      optimization,
      marketContext: {
        currentPrices: intelligence.currentPrices,
        priceForecasts: intelligence.priceForecasts,
        contractorMarket: intelligence.contractorMarket,
        subsidyStatus: intelligence.subsidyBudgetStatus
      },
      recommendations: {
        immediate: getImmediateRecommendations(optimization, intelligence),
        timing: getTimingRecommendations(intelligence),
        riskMitigation: optimization.riskFactors
      },
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('Price optimization analysis failed', error as Error)
    return NextResponse.json(
      { error: 'Price optimization analysis failed' },
      { status: 500 }
    )
  }
}

function getSubsidyAlert(subsidyStatus: any): string {
  const urgentSchemes = []
  
  if (subsidyStatus.isde.utilizationRate > 80) {
    urgentSchemes.push('ISDE')
  }
  if (subsidyStatus.seeh.utilizationRate > 80) {
    urgentSchemes.push('SEEH')
  }

  if (urgentSchemes.length > 0) {
    return `Urgent: ${urgentSchemes.join(', ')} budget raakt op`
  }

  return 'Subsidiebudgetten zijn beschikbaar'
}

function getImmediateRecommendations(optimization: any, intelligence: any): string[] {
  const recommendations = []

  if (optimization.paybackPeriod < 7) {
    recommendations.push('Uitstekende investering - korte terugverdientijd')
  }

  if (intelligence.contractorMarket.averageWaitTime > 8) {
    recommendations.push('Plan project nu - lange wachttijden verwacht')
  }

  if (optimization.savings > 1000) {
    recommendations.push('Hoge besparingen mogelijk - prioriteer dit project')
  }

  return recommendations
}

function getTimingRecommendations(intelligence: any): string[] {
  const recommendations = []

  if (intelligence.priceForecasts.gas.forecast6Months < intelligence.currentPrices.gas * 0.95) {
    recommendations.push('Overweeg uitstel - gasprijzen dalen waarschijnlijk')
  }

  if (intelligence.subsidyBudgetStatus.isde.utilizationRate > 70) {
    recommendations.push('Dien subsidieaanvraag binnen 4 weken in')
  }

  const currentMonth = new Date().getMonth()
  if (currentMonth >= 2 && currentMonth <= 5) { // March to June
    recommendations.push('Optimale periode voor installaties')
  }

  return recommendations
}