import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    // Extract the id from the URL
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()

    // For demo purposes, return mock valuation data
    const mockValuation = {
      id: id,
      address: 'Keizersgracht 123',
      postalCode: '1015CJ',
      city: 'Amsterdam',
      createdAt: new Date().toISOString(),
      estimatedValue: 450000,
      confidenceScore: 0.85
    }

    if (!mockValuation) {
      return NextResponse.json(
        { error: 'Valuation not found' },
        { status: 404 }
      )
    }

    // Reconstruct the full valuation object from stored data
    const fullValuation = {
      id: mockValuation.id,
      address: mockValuation.address,
      postalCode: mockValuation.postalCode,
      city: mockValuation.city,
      createdAt: mockValuation.createdAt,
      valuation: {
        estimatedValue: mockValuation.estimatedValue,
        confidenceScore: mockValuation.confidenceScore,
        wozValue: 380000,
        marketMultiplier: 1.18,
        factors: [
          { factor: 'Locatie', impact: 5.2, description: 'Gewilde buurt' },
          { factor: 'Energielabel', impact: 2.1, description: 'Label C - gemiddeld' }
        ],
        lastUpdated: mockValuation.createdAt,
        dataSource: 'Demo WOZ + Market Analysis',
        marketTrends: {
          averageDaysOnMarket: 35,
          averagePriceChange: 6.2,
          pricePerSquareMeter: 4500
        },
        comparableSales: [
          { address: 'Herengracht 234', soldPrice: 435000, soldDate: '2024-12-15', squareMeters: 100, pricePerSqm: 4350 }
        ],
        realTimeData: {
          dataSource: 'Demo Market Data',
          lastUpdated: mockValuation.createdAt
        },
        bouwjaar: '1980',
        oppervlakte: '100 m²'
      }
    }

    return NextResponse.json(fullValuation)
  } catch (error) {
    Logger.error('Valuation retrieval failed', error as Error, {
      // id may be undefined if URL parsing fails
      valuationId: undefined
    })
    
    return NextResponse.json(
      { error: 'Valuation retrieval failed' },
      { status: 500 }
    )
  }
}