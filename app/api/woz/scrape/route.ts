import { NextRequest, NextResponse } from 'next/server'
import { wozScraper } from '@/lib/woz-scraper'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const scrapeSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Valid Dutch postal code required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = scrapeSchema.parse(body)

    Logger.info('Starting WOZ scraping', {
      address: validatedData.address,
      postalCode: validatedData.postalCode
    })

    // Scrape WOZ value
    const result = await wozScraper.getWOZValue(validatedData.address, validatedData.postalCode)

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'WOZ scraping failed',
          message: result.error,
          suggestion: 'Please check the address and postal code'
        },
        { status: 400 }
      )
    }

    Logger.audit('WOZ value scraped successfully', {
      address: validatedData.address,
      postalCode: validatedData.postalCode,
      wozValue: result.data?.wozValue,
      cached: result.cached
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    Logger.error('WOZ scraping API failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'WOZ scraping failed', message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check for WOZ scraping service
    const testResult = await wozScraper.getWOZValue('Test 1', '1000AA')

    return NextResponse.json({
      service: 'WOZ Scraping Service',
      status: testResult.success ? 'operational' : 'degraded',
      lastTest: new Date().toISOString(),
      message: testResult.success ? 'Service is working' : testResult.error
    })
  } catch (error) {
    Logger.error('WOZ scraping health check failed', error as Error)
    return NextResponse.json(
      { 
        service: 'WOZ Scraping Service',
        status: 'down',
        error: 'Health check failed' 
      },
      { status: 500 }
    )
  }
}