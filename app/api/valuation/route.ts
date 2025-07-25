import { NextRequest, NextResponse } from 'next/server'
import { propertyService } from '@/lib/property/property-service'
import { cbsOpenDataService } from '@/lib/integrations/cbs-open-data'
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
    
    try {
      // Get market context from CBS data
      const area = validPostalCode.substring(0, 4)
      const [propertyData, cbsHousingData] = await Promise.all([
        propertyService.getPropertyData(validAddress, validPostalCode),
        cbsOpenDataService.getHousingMarketData()
      ])
      
      if (!propertyData) {
        throw new Error('Property data not available')
      }
      
      // Find relevant CBS market data for the area
      const relevantMarketData = cbsHousingData.find(data => 
        data.region.toLowerCase().includes(validAddress.toLowerCase()) ||
        validAddress.toLowerCase().includes(data.region.toLowerCase())
      ) || cbsHousingData[0] // Fallback to first available data
      
      const valuation = await propertyService.calculateValuation(propertyData)
      
      Logger.audit('Property valuation completed', {
        address: validAddress,
        postalCode: validPostalCode,
        estimatedValue: valuation.estimatedValue,
        wozValue: valuation.wozValue,
        cbsMarketData: !!relevantMarketData,
        dataSource: valuation.dataSource
      })
      
      return NextResponse.json({ valuation })
    } catch (error) {
      Logger.error('Property valuation failed', error as Error, { address: validAddress, postalCode: validPostalCode })
      return NextResponse.json(
        { 
          error: `Valuation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: 'Unable to retrieve WOZ data, energy label, or market data. Please check the address and postal code.'
        },
        { status: 500 }
      )
    }
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
      rateLimitEnabled: true,
      dataSource: 'WOZ Scraping + EP Online + CBS Open Data'
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