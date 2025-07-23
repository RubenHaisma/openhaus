import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    // Get real market statistics from database
    const [
      totalProperties,
      activeListings,
      soldThisMonth,
      averagePrice,
      averageDaysOnMarket
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { status: 'AVAILABLE' } }),
      prisma.property.count({
        where: {
          status: 'SOLD',
          updatedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.property.aggregate({
        _avg: { askingPrice: true },
        where: { status: 'AVAILABLE' }
      }),
      // Calculate average days on market for sold properties
      prisma.$queryRaw`
        SELECT AVG(EXTRACT(DAY FROM (updated_at - created_at))) as avg_days
        FROM properties 
        WHERE status = 'SOLD' 
        AND updated_at >= NOW() - INTERVAL '3 months'
      `
    ])

    const avgDaysResult = averageDaysOnMarket as any[]
    const avgDays = avgDaysResult[0]?.avg_days ? Math.round(Number(avgDaysResult[0].avg_days)) : 30

    // Calculate growth rates (mock for now, would need historical data)
    const stats = {
      totalProperties,
      activeListings,
      soldThisMonth,
      averagePrice: averagePrice._avg.askingPrice ? Number(averagePrice._avg.askingPrice) : 0,
      averageDaysOnMarket: avgDays,
      growthRate: 12, // Would calculate from historical data
      priceGrowth: 8,
      salesGrowth: 15,
      timeChange: -5
    }

    return NextResponse.json(stats)
  } catch (error) {
    Logger.error('Market stats retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Market stats retrieval failed' },
      { status: 500 }
    )
  }
}