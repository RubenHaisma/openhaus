import { NextRequest, NextResponse } from 'next/server'
import { propertyService } from '@/lib/property/property-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is requesting their own properties or is admin
    if (session.user.id !== params.userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const properties = await propertyService.getUserProperties(params.userId)

    Logger.info('User properties retrieved', {
      userId: params.userId,
      count: properties.length
    })

    return NextResponse.json({ properties })
  } catch (error) {
    Logger.error('Failed to get user properties', error as Error, {
      userId: params.userId
    })

    return NextResponse.json(
      { error: 'Failed to retrieve properties' },
      { status: 500 }
    )
  }
}