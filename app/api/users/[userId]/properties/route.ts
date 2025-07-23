import { NextRequest, NextResponse } from 'next/server'
import { propertyService } from '@/lib/property/property-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

    // Check if user is requesting their own properties or is admin
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get real user properties from database
    const userProperties = await propertyService.getUserProperties(userId)

    Logger.info('User properties retrieved', {
      userId: userId,
      count: userProperties.length
    })

    // Add calculated fields for dashboard (views, favorites would come from analytics)
    const propertiesWithStats = userProperties.map(property => ({
      ...property,
      views: 0, // TODO: Implement real view tracking from analytics
      favorites: 0, // TODO: Implement real favorite tracking from database
    }))

    return NextResponse.json({ properties: propertiesWithStats })
  } catch (error) {
    Logger.error('Failed to get user properties', error as Error, {
      userId: (request.nextUrl.pathname.split("/")[request.nextUrl.pathname.split("/").indexOf("users") + 1])
    })

    return NextResponse.json(
      { error: 'Failed to retrieve properties' },
      { status: 500 }
    )
  }
}