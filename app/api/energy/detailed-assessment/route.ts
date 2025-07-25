import { NextRequest, NextResponse } from 'next/server'
import { advancedEnergyAssessment } from '@/lib/energy/advanced-assessment'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const detailedAssessmentSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Valid Dutch postal code required'),
  propertyType: z.string().default('house'),
  constructionYear: z.number().min(1800).max(new Date().getFullYear()),
  squareMeters: z.number().min(10).max(1000),
  currentHeating: z.string().optional(),
  assessmentType: z.enum(['basic', 'detailed', 'professional']).default('detailed')
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const validation = detailedAssessmentSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }

    const { address, postalCode, propertyType, constructionYear, squareMeters, currentHeating } = validation.data
    
    Logger.info('Starting detailed energy assessment', {
      address,
      postalCode,
      propertyType,
      constructionYear,
      squareMeters
    })

    // Perform comprehensive energy assessment
    const assessment = await advancedEnergyAssessment.performDetailedAnalysis({
      address,
      postalCode,
      propertyType,
      constructionYear,
      squareMeters,
      currentHeating
    })

    Logger.audit('Detailed energy assessment completed', {
      address,
      postalCode,
      currentLabel: assessment.currentState.energyLabel,
      targetLabel: assessment.targetState.energyLabel,
      totalInvestment: assessment.financialAnalysis.totalInvestment,
      totalSubsidies: assessment.financialAnalysis.totalSubsidies,
      paybackPeriod: assessment.financialAnalysis.paybackPeriod
    })

    return NextResponse.json({ 
      assessment,
      summary: {
        currentLabel: assessment.currentState.energyLabel,
        targetLabel: assessment.targetState.energyLabel,
        totalInvestment: assessment.financialAnalysis.totalInvestment,
        totalSubsidies: assessment.financialAnalysis.totalSubsidies,
        netInvestment: assessment.financialAnalysis.netInvestment,
        annualSavings: assessment.financialAnalysis.annualSavings,
        paybackPeriod: assessment.financialAnalysis.paybackPeriod,
        co2Reduction: assessment.gapAnalysis.co2Reduction,
        complianceStatus: assessment.complianceStatus.current2030Compliance
      }
    })
  } catch (error) {
    Logger.error('Detailed energy assessment failed', error as Error)
    return NextResponse.json(
      { error: 'Detailed energy assessment failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check for energy assessment services
    const services = {
      rvoApi: process.env.RVO_API_KEY ? 'configured' : 'mock',
      epOnline: process.env.EP_ONLINE_API_KEY ? 'configured' : 'mock',
      bagApi: process.env.BAG_API_KEY ? 'configured' : 'mock',
      energyPrices: process.env.ENERGY_PRICE_API_KEY ? 'configured' : 'mock'
    }

    return NextResponse.json({
      service: 'Detailed Energy Assessment',
      status: 'operational',
      integrations: services,
      features: [
        'Comprehensive property analysis',
        'Real-time subsidy checking',
        'Contractor matching',
        'Financial optimization',
        'Compliance tracking',
        'Implementation planning'
      ],
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('Energy assessment health check failed', error as Error)
    return NextResponse.json(
      { 
        service: 'Detailed Energy Assessment',
        status: 'degraded',
        error: 'Health check failed' 
      },
      { status: 500 }
    )
  }
}