import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const specialty = searchParams.get('specialty')
    const certification = searchParams.get('certification')
    
    // Query real contractors from database
    const { contractorVerificationService } = await import('@/lib/integrations/contractor-verification-real')
    
    const searchCriteria = {
      location: location || undefined,
      specialty: specialty || undefined,
      certificationRequired: certification ? [certification] : undefined
    }

    const verifiedContractors = await contractorVerificationService.searchVerifiedContractors(searchCriteria)

    if (verifiedContractors.length === 0) {
      Logger.warn('No verified contractors found', { searchCriteria })
      return NextResponse.json({
        contractors: [],
        total: 0,
        filters: searchCriteria,
        error: 'No verified contractors available - real contractor verification required'
      })
    }

    return NextResponse.json({
      contractors: verifiedContractors,
      total: verifiedContractors.length,
      filters: searchCriteria
    })
  } catch (error) {
    Logger.error('Contractors retrieval failed', error as Error)
    return NextResponse.json(
      { 
        error: 'Contractors retrieval failed',
        contractors: [],
        total: 0
      },
      { status: 500 }
    )
  }
}