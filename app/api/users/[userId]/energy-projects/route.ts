import { NextRequest, NextResponse } from 'next/server'
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

    // Check if user is requesting their own projects or is admin
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mock user energy projects (in production, query from database)
    const userProjects = [
      {
        id: '1',
        name: 'Warmtepomp installatie',
        status: 'COMPLETED',
        energyMeasures: ['heat_pump', 'insulation'],
        totalCost: 18000,
        subsidyAmount: 7500,
        energySavings: 45,
        co2Reduction: 2800,
        createdAt: '2024-08-15',
        completedDate: '2024-11-20',
        annualSavings: 1200
      },
      {
        id: '2',
        name: 'Dakisolatie project',
        status: 'IN_PROGRESS',
        energyMeasures: ['roof_insulation'],
        totalCost: 8000,
        subsidyAmount: 3000,
        energySavings: 25,
        co2Reduction: 1200,
        createdAt: '2024-11-01',
        annualSavings: 600
      }
    ]

    Logger.info('User energy projects retrieved', {
      userId: userId,
      count: userProjects.length
    })

    return NextResponse.json({ projects: userProjects })
  } catch (error) {
    Logger.error('Failed to get user energy projects', error as Error, {
      userId: (request.nextUrl.pathname.split("/")[request.nextUrl.pathname.split("/").indexOf("users") + 1])
    })

    return NextResponse.json(
      { error: 'Failed to retrieve energy projects' },
      { status: 500 }
    )
  }
}