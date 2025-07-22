import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const valuation = await prisma.valuation.findUnique({
      where: { id: params.id }
    })

    if (!valuation) {
      return NextResponse.json(
        { error: 'Valuation not found' },
        { status: 404 }
      )
    }

    // Reconstruct the full valuation object from stored data
    const fullValuation = {
      id: valuation.id,
      address: valuation.address,
      postalCode: valuation.postalCode,
      city: valuation.city,
      createdAt: valuation.createdAt.toISOString(),
      valuation: {
        estimatedValue: Number(valuation.estimatedValue),
        confidenceScore: Number(valuation.confidenceScore),
        wozValue: (valuation.propertyDetails as any)?.wozValue || 0,
        marketMultiplier: (valuation.propertyDetails as any)?.marketMultiplier || 1,
        factors: (valuation.propertyDetails as any)?.factors || [],
        lastUpdated: valuation.createdAt.toISOString(),
        dataSource: (valuation.propertyDetails as any)?.dataSource || 'WOZ + Market Analysis',
        marketTrends: (valuation.propertyDetails as any)?.marketTrends || {
          averageDaysOnMarket: 35,
          averagePriceChange: 5.2,
          pricePerSquareMeter: Math.round(Number(valuation.estimatedValue) / 100)
        },
        comparableSales: valuation.comparableSales || [],
        realTimeData: (valuation.propertyDetails as any)?.realTimeData || {
          dataSource: 'WOZ + Market Analysis',
          lastUpdated: valuation.createdAt.toISOString()
        },
        // Include WOZ fields
        grondOppervlakte: (valuation.propertyDetails as any)?.grondOppervlakte,
        bouwjaar: (valuation.propertyDetails as any)?.bouwjaar,
        gebruiksdoel: (valuation.propertyDetails as any)?.gebruiksdoel,
        oppervlakte: (valuation.propertyDetails as any)?.oppervlakte,
        identificatie: (valuation.propertyDetails as any)?.identificatie,
        adresseerbaarObject: (valuation.propertyDetails as any)?.adresseerbaarObject,
        nummeraanduiding: (valuation.propertyDetails as any)?.nummeraanduiding,
        wozValues: (valuation.propertyDetails as any)?.wozValues
      }
    }

    return NextResponse.json(fullValuation)
  } catch (error) {
    Logger.error('Valuation retrieval failed', error as Error, {
      valuationId: params.id
    })
    
    return NextResponse.json(
      { error: 'Valuation retrieval failed' },
      { status: 500 }
    )
  }
}