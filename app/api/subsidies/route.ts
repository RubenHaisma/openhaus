import { NextRequest, NextResponse } from 'next/server'
import { rvoOpenDataService } from '@/lib/integrations/rvo-open-data'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    // Fetch real subsidy schemes from RVO Open Data
    const subsidySchemes = await rvoOpenDataService.getActiveSubsidySchemes()
    
    if (subsidySchemes.length === 0) {
      Logger.warn('No subsidy schemes available from RVO Open Data')
      return NextResponse.json({
        subsidies: [],
        totalBudget: 0,
        totalSchemes: 0,
        lastUpdated: new Date().toISOString(),
        error: 'No subsidy data available from RVO Open Data'
      })
    }

    const totalBudget = subsidySchemes.reduce((sum, scheme) => sum + (scheme.budgetTotal - scheme.budgetUsed), 0)
    const totalSchemes = subsidySchemes.length

    return NextResponse.json({
      subsidies: subsidySchemes,
      totalBudget,
      totalSchemes,
      lastUpdated: new Date().toISOString(),
      dataSource: 'RVO Open Data Portal'
    })
  } catch (error) {
    Logger.error('Subsidies retrieval failed', error as Error)
    return NextResponse.json(
      { 
        error: 'Subsidies retrieval failed',
        subsidies: [],
        totalBudget: 0,
        totalSchemes: 0,
        lastUpdated: new Date().toISOString(),
        message: 'Unable to retrieve subsidy data from RVO Open Data'
      },
      { status: 500 }
    )
  }
}