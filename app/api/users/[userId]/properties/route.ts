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

    // For demo purposes, return mock user properties
    const mockUserProperties = [
      {
        id: '1',
        address: 'Keizersgracht 123',
        city: 'Amsterdam',
        askingPrice: 675000,
        bedrooms: 3,
        bathrooms: 2,
        squareMeters: 120,
        images: ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
        status: 'AVAILABLE',
        energyLabel: 'B',
        description: 'Prachtige grachtenpand in het hart van Amsterdam.',
        features: ['Tuin', 'Balkon', 'Garage'],
        createdAt: new Date().toISOString(),
        userId: userId
      }
    ]

    Logger.info('User properties retrieved', {
      userId: userId,
      count: mockUserProperties.length
    })

    // Add calculated fields for dashboard
    const propertiesWithStats = mockUserProperties.map(property => ({
      ...property,
      views: Math.floor(Math.random() * 200) + 50, // TODO: Implement real view tracking
      favorites: Math.floor(Math.random() * 30) + 5, // TODO: Implement real favorite tracking
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