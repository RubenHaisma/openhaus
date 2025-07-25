import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/monitoring/logger'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    // Query real energy projects from database
    const projects = await prisma.energyProject.findMany({
      where: status ? { status: status as any } : undefined,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        property: {
          select: {
            address: true,
            city: true,
            postalCode: true
          }
        }
      }
    })

    if (projects.length === 0) {
      Logger.warn('No real energy projects found in database')
      return NextResponse.json({
        projects: [],
        total: 0,
        error: 'No real energy projects available'
      })
    }

    // Transform database projects to API format
    const transformedProjects = projects.map(project => ({
      id: project.id,
      name: project.name,
      location: `${project.property.city}, ${project.property.postalCode}`,
      status: project.status,
      energyLabelBefore: project.beforeEnergyLabel,
      energyLabelAfter: project.afterEnergyLabel,
      measures: project.energyMeasures,
      totalCost: Number(project.totalCost),
      subsidyReceived: Number(project.subsidyAmount),
      energySavings: Number(project.energySavings),
      co2Reduction: Number(project.co2Reduction),
      completedDate: project.completionDate?.toISOString().split('T')[0],
      createdAt: project.createdAt.toISOString().split('T')[0],
      annualSavings: Math.round(Number(project.energySavings) * 30) // Estimate based on savings percentage
    }))

    const result = {
      projects: transformedProjects,
      total: transformedProjects.length
    }

    return NextResponse.json(result)
  } catch (error) {
    Logger.error('Energy projects retrieval failed', error as Error)
    return NextResponse.json(
      { 
        error: 'Energy projects retrieval failed',
        projects: [],
        total: 0
      },
      { status: 500 }
    )
  }
}