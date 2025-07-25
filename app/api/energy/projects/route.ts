import { NextRequest, NextResponse } from 'next/server'
import { Logger } from '@/lib/monitoring/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')

    // Mock energy projects data
    const projects = [
      {
        id: '1',
        name: 'Warmtepomp + Isolatie Amsterdam',
        location: 'Amsterdam Noord',
        status: 'COMPLETED',
        energyLabelBefore: 'D',
        energyLabelAfter: 'A',
        measures: ['Warmtepomp', 'Dakisolatie', 'HR++ glas'],
        totalCost: 22000,
        subsidyReceived: 9500,
        energySavings: 65,
        co2Reduction: 3200,
        completedDate: '2024-11-15',
        createdAt: '2024-08-01',
        annualSavings: 1800
      },
      {
        id: '2',
        name: 'Zonnepanelen + Isolatie Rotterdam',
        location: 'Rotterdam Centrum',
        status: 'COMPLETED',
        energyLabelBefore: 'C',
        energyLabelAfter: 'A+',
        measures: ['Zonnepanelen', 'Muurisolatie'],
        totalCost: 18000,
        subsidyReceived: 6000,
        energySavings: 55,
        co2Reduction: 2800,
        completedDate: '2024-10-22',
        createdAt: '2024-07-15',
        annualSavings: 1500
      },
      {
        id: '3',
        name: 'Complete verduurzaming Utrecht',
        location: 'Utrecht Oost',
        status: 'COMPLETED',
        energyLabelBefore: 'E',
        energyLabelAfter: 'A++',
        measures: ['Warmtepomp', 'Isolatie', 'Zonnepanelen', 'Ventilatie'],
        totalCost: 35000,
        subsidyReceived: 15000,
        energySavings: 75,
        co2Reduction: 4500,
        completedDate: '2024-09-30',
        createdAt: '2024-05-20',
        annualSavings: 2400
      }
    ]

    let filteredProjects = projects

    if (status) {
      filteredProjects = projects.filter(project => project.status === status)
    }

    const result = {
      projects: filteredProjects.slice(0, limit),
      total: filteredProjects.length
    }

    return NextResponse.json(result)
  } catch (error) {
    Logger.error('Energy projects retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Energy projects retrieval failed' },
      { status: 500 }
    )
  }
}