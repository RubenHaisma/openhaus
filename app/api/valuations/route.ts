import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    // Fetch all valuations from the database
    const valuations = await prisma.valuation.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Map to API response format
    const response = valuations.map((valuation) => ({
      id: valuation.id,
      address: valuation.address,
      postalCode: valuation.postalCode,
      city: valuation.city,
      createdAt: valuation.createdAt,
      estimatedValue: valuation.estimatedValue,
      confidenceScore: valuation.confidenceScore,
      propertyDetails: valuation.propertyDetails,
      comparableSales: valuation.comparableSales,
    }))

    return NextResponse.json(response)
  } catch (error) {
    Logger.error('Valuations retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Valuations retrieval failed' },
      { status: 500 }
    )
  }
}