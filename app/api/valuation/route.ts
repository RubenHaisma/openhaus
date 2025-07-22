import { NextRequest, NextResponse } from 'next/server'
import { getPropertyData, calculateValuation } from '@/lib/kadaster'
import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'
import { z } from 'zod'

const valuationSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().regex(/^\d{4}\s?[A-Z]{2}$/i, 'Valid Dutch postal code required'),
})

export async function POST(req: NextRequest) {
  let address: string | undefined
  let postalCode: string | undefined
  try {
    // Try to parse JSON body, handle empty/invalid JSON
    const body = await req.text()
    if (!body) {
      return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
    }
    let parsed
    try {
      parsed = JSON.parse(body)
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    address = parsed.address
    postalCode = parsed.postalCode
    // Validate input
    const validation = valuationSchema.safeParse({ address, postalCode })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }
    // After validation, these are guaranteed to be strings
    const { address: validAddress, postalCode: validPostalCode } = validation.data
    const propertyData = await getPropertyData(validAddress, validPostalCode)
    if (!propertyData) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }
    const valuation = await calculateValuation(propertyData)
    return NextResponse.json({ valuation })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check for WOZ scraping service
    const { wozScraper } = await import('@/lib/woz-scraper')
    
    // Quick health check
    const isHealthy = await wozScraper.healthCheck()

    return NextResponse.json({
      wozScrapingEnabled: true,
      serviceHealthy: isHealthy,
      service: 'WOZ Waardeloket Scraping',
      timestamp: new Date().toISOString(),
      cacheEnabled: true,
      rateLimitEnabled: true
    })
  } catch (error) {
    Logger.error('WOZ scraping health check failed', error as Error)
    return NextResponse.json(
      { 
        error: 'Health check failed',
        serviceHealthy: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}