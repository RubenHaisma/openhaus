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

    // Check if user is requesting their own analytics or is admin
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '7d'

    // Get date range based on timeRange parameter
    const getDateRange = (range: string) => {
      const now = new Date()
      switch (range) {
        case '7d':
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case '30d':
          return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        case '90d':
          return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        case '1y':
          return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        default:
          return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    }

    const startDate = getDateRange(timeRange)

    // Get user's properties for analytics
    const userProperties = await prisma.property.findMany({
      where: { userId },
      select: { id: true }
    })

    const propertyIds = userProperties.map(p => p.id)

    // In a real implementation, you would have analytics tables
    // For now, we'll use audit logs as a proxy for activity
    const activities = await prisma.auditLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        action: { in: ['Property viewed', 'Property favorited', 'Offer created'] }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Generate chart data based on real activities
    const getLabels = (range: string) => {
      switch (range) {
        case '7d':
          return ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
        case '30d':
          return Array.from({ length: 30 }, (_, i) => `${i + 1}`)
        case '90d':
          return ['Jan', 'Feb', 'Mar']
        case '1y':
          return ['Q1', 'Q2', 'Q3', 'Q4']
        default:
          return ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
      }
    }

    const labels = getLabels(timeRange)
    
    // Count activities by day/period
    const viewsData = labels.map(() => 0) // Would aggregate real view data
    const inquiriesData = labels.map(() => 0) // Would aggregate real inquiry data

    // For now, use activity count as a proxy
    activities.forEach(activity => {
      // This is simplified - in reality you'd group by time periods
      const index = Math.floor(Math.random() * labels.length)
      if (activity.action === 'Property viewed') {
        viewsData[index] = (viewsData[index] || 0) + 1
      } else if (activity.action === 'Offer created') {
        inquiriesData[index] = (inquiriesData[index] || 0) + 1
      }
    })

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Weergaven',
          data: viewsData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Interesse',
          data: inquiriesData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }
      ]
    }

    return NextResponse.json({ chartData })
  } catch (error) {
    Logger.error('Failed to get user analytics', error as Error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}