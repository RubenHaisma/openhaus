import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract userId from the URL
    const pathParts = request.nextUrl.pathname.split("/")
    const userId = pathParts[pathParts.indexOf("users") + 1]

    // Check if user is requesting their own performance data or is admin
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user's properties
    const userProperties = await prisma.property.findMany({
      where: { userId },
      include: {
        offers: true
      }
    })

    // Calculate real performance metrics
    const totalViews = 0 // Would come from analytics service
    const totalFavorites = 0 // Would come from favorites table
    const activeListings = userProperties.filter(p => p.status === 'AVAILABLE').length
    const completedSales = userProperties.filter(p => p.status === 'SOLD').length
    const totalRevenue = userProperties
      .filter(p => p.status === 'SOLD')
      .reduce((sum, p) => sum + Number(p.askingPrice), 0)

    // Calculate average time on market for sold properties
    const soldProperties = userProperties.filter(p => p.status === 'SOLD')
    const averageTimeOnMarket = soldProperties.length > 0
      ? soldProperties.reduce((sum, p) => {
          const days = Math.floor((p.updatedAt.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) / soldProperties.length
      : 0

    // Calculate conversion rate (offers to sales)
    const totalOffers = userProperties.reduce((sum, p) => sum + p.offers.length, 0)
    const conversionRate = totalOffers > 0 ? (completedSales / totalOffers) * 100 : 0

    // Calculate monthly growth (would need historical data)
    const monthlyGrowth = 0 // Would calculate from historical data

    const performanceData = {
      totalViews,
      totalFavorites,
      activeListings,
      completedSales,
      totalRevenue,
      monthlyGrowth,
      conversionRate,
      averageTimeOnMarket
    }

    return NextResponse.json(performanceData)
  } catch (error) {
    Logger.error('Failed to get user performance data', error as Error)
    return NextResponse.json(
      { error: 'Failed to retrieve performance data' },
      { status: 500 }
    )
  }
}