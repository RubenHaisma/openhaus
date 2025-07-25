import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    // Fetch real subsidy schemes from RVO API
    const { rvoApiService } = await import('@/lib/integrations/rvo-api')
    const subsidySchemes = await rvoApiService.getSubsidySchemes()
    
    if (subsidySchemes.length === 0) {
      Logger.warn('No real subsidy schemes available - RVO API may not be configured')
      return NextResponse.json({
        subsidies: [],
        totalBudget: 0,
        totalSchemes: 0,
        lastUpdated: new Date().toISOString(),
        error: 'No real subsidy data available - API configuration required'
      })
    }

    return NextResponse.json({
      subsidies: subsidySchemes,
      totalBudget: subsidySchemes.reduce((sum, scheme) => sum + scheme.maxAmount, 0),
      totalSchemes: subsidySchemes.length,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('Subsidies retrieval failed', error as Error)
    return NextResponse.json(
      { 
        error: 'Subsidies retrieval failed',
        subsidies: [],
        totalBudget: 0,
        totalSchemes: 0,
        lastUpdated: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}