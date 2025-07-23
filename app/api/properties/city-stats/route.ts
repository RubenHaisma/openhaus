import { NextRequest, NextResponse } from 'next/server'
import { propertyService } from '@/lib/property/property-service'
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
    const stats = await propertyService.getCityStats(cities)
    return NextResponse.json(stats)
  } catch (error) {
    Logger.error('City stats retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'City stats retrieval failed' },
      { status: 500 }
    )
  }
} 