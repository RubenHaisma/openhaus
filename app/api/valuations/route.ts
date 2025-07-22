import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPropertyData, calculateValuation } from '@/lib/kadaster'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const createValuationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Valid Dutch postal code required'),
  valuation: z.object({
    estimatedValue: z.number(),
    confidenceScore: z.number(),
    wozValue: z.number(),
    marketMultiplier: z.number(),
    factors: z.array(z.any()),
    lastUpdated: z.string(),
    dataSource: z.string(),
    marketTrends: z.object({
      averageDaysOnMarket: z.number(),
      averagePriceChange: z.number(),
      pricePerSquareMeter: z.number()
    }),
    comparableSales: z.array(z.any()),
    realTimeData: z.object({
      dataSource: z.string(),
      lastUpdated: z.string()
    }),
    grondOppervlakte: z.string().optional(),
    bouwjaar: z.string().optional(),
    gebruiksdoel: z.string().optional(),
    oppervlakte: z.string().optional(),
    identificatie: z.string().optional(),
    adresseerbaarObject: z.string().optional(),
    nummeraanduiding: z.string().optional(),
    wozValues: z.array(z.any()).optional()
  }),
  userId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createValuationSchema.parse(body)

    Logger.info('Creating new valuation', {
      address: validatedData.address,
      postalCode: validatedData.postalCode
    })

    // Use the provided valuation data (already calculated with real data)
    const valuation = validatedData.valuation

    // Store valuation in database
    const storedValuation = await prisma.valuation.create({
      data: {
        userId: validatedData.userId || null,
        address: validatedData.address,
        postalCode: validatedData.postalCode.replace(/\s/g, '').toUpperCase(),
        city: propertyData.city,
        estimatedValue: valuation.estimatedValue,
        confidenceScore: valuation.confidenceScore,
        propertyDetails: {
          wozValue: valuation.wozValue,
          marketMultiplier: valuation.marketMultiplier,
          propertyType: 'Woning', // Default since we don't have this in valuation
          squareMeters: Math.round(valuation.estimatedValue / valuation.marketTrends.pricePerSquareMeter),
          constructionYear: valuation.bouwjaar ? parseInt(valuation.bouwjaar) : null,
          energyLabel: 'C', // Default
          dataSource: valuation.dataSource,
          factors: valuation.factors,
          marketTrends: valuation.marketTrends,
          realTimeData: valuation.realTimeData,
          // Include all WOZ fields
          grondOppervlakte: valuation.grondOppervlakte,
          bouwjaar: valuation.bouwjaar,
          gebruiksdoel: valuation.gebruiksdoel,
          oppervlakte: valuation.oppervlakte,
          identificatie: valuation.identificatie,
          adresseerbaarObject: valuation.adresseerbaarObject,
          nummeraanduiding: valuation.nummeraanduiding,
          wozValues: valuation.wozValues
        },
        comparableSales: valuation.comparableSales
      }
    })

    Logger.audit('Valuation created and stored', {
      valuationId: storedValuation.id,
      address: validatedData.address,
      estimatedValue: valuation.estimatedValue,
      dataSource: valuation.dataSource
    })

    return NextResponse.json({
      id: storedValuation.id
    })

  } catch (error) {
    Logger.error('Valuation creation failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Valuation creation failed', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = userId ? { userId } : {}

    const valuations = await prisma.valuation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        address: true,
        postalCode: true,
        city: true,
        estimatedValue: true,
        confidenceScore: true,
        createdAt: true
      }
    })

    return NextResponse.json({ valuations })
  } catch (error) {
    Logger.error('Valuations retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Failed to retrieve valuations' },
      { status: 500 }
    )
  }
}