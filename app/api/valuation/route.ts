import { NextRequest, NextResponse } from 'next/server'
import { getPropertyData, calculateValuation } from '@/lib/kadaster'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const valuationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Valid Dutch postal code required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = valuationSchema.parse(body)

    Logger.info('Starting WOZ-based valuation calculation', {
      address: validatedData.address,
      postalCode: validatedData.postalCode
    })

    // Get property data using WOZ scraping
    const propertyData = await getPropertyData(validatedData.address, validatedData.postalCode)
    if (!propertyData) {
      return NextResponse.json(
        { error: 'Property not found or WOZ value unavailable' },
        { status: 404 }
      )
    }

    // Calculate valuation using WOZ data and market analysis
    const valuation = await calculateValuation(propertyData)

    Logger.audit('WOZ-based valuation calculated', {
      address: validatedData.address,
      estimatedValue: valuation.estimatedValue,
      confidenceScore: valuation.confidenceScore,
      wozValue: valuation.wozValue,
      dataSource: valuation.dataSource
    })

    return NextResponse.json({
      property: propertyData,
      valuation,
      wozBased: true,
      timestamp: new Date().toISOString(),
      disclaimer: 'Valuation based on WOZ value and market analysis'
    })

  } catch (error) {
    Logger.error('WOZ-based valuation calculation failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    // Check if it's a scraping error
    if (error.message.includes('scraping') || error.message.includes('WOZ')) {
      return NextResponse.json(
        { 
          error: 'WOZ data service unavailable',
          message: error.message,
          suggestion: 'Please check the address and postal code, or try again later'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'Valuation calculation failed', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check for WOZ scraping service
    const { wozScraper } = await import('@/lib/woz-scraper')
    
    // Test with a known address
    const testResult = await wozScraper.getWOZValue('Test 1', '1000AA')

    return NextResponse.json({
      wozScrapingEnabled: true,
      testScraping: testResult.success,
      service: 'WOZ Waardeloket Scraping',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    Logger.error('WOZ scraping health check failed', error as Error)
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    )
  }
}