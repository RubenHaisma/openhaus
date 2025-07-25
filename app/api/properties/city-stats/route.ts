import { NextRequest, NextResponse } from 'next/server'
import { propertyService } from '@/lib/property/property-service'
import { cbsOpenDataService } from '@/lib/integrations/cbs-open-data'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const citiesParam = searchParams.get('cities')
    if (!citiesParam) {
      return NextResponse.json({ error: 'Missing cities parameter' }, { status: 400 })
    }
    const cities = citiesParam.split(',').map(c => c.trim()).filter(Boolean)
    if (cities.length === 0) {
      return NextResponse.json({ error: 'No cities provided' }, { status: 400 })
    }
    
    // Get real city statistics from database and CBS open data
    const [dbStats, cbsHousingData] = await Promise.all([
      propertyService.getCityStats(cities),
      cbsOpenDataService.getHousingMarketData()
    ])
    
    // Combine database stats with CBS market data
    const enhancedStats = dbStats.map(dbStat => {
      const cbsData = cbsHousingData.find(cbs => 
        cbs.region.toLowerCase().includes(dbStat.city.toLowerCase()) ||
        dbStat.city.toLowerCase().includes(cbs.region.toLowerCase())
      )
      
      return {
        ...dbStat,
        // Use CBS data if available, otherwise use database data
        avgPrice: cbsData?.averageHousePrice || dbStat.avgPrice,
        priceChange: cbsData?.priceChange || 0,
        transactionVolume: cbsData?.transactionVolume || 0,
        averageDaysOnMarket: cbsData?.averageDaysOnMarket || 30,
        dataSource: cbsData ? 'CBS Open Data + Database' : 'Database Only'
      }
    })
    
    Logger.info('City statistics retrieved', {
      cities: cities.length,
      dbRecords: dbStats.length,
      cbsRecords: cbsHousingData.length,
      enhancedRecords: enhancedStats.length
    })
    
    return NextResponse.json(enhancedStats)
  } catch (error) {
    Logger.error('City stats retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'City stats retrieval failed' },
      { status: 500 }
    )
  }
} 