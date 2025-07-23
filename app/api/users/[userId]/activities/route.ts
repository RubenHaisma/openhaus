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

    // Check if user is requesting their own activities or is admin
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get real activities from audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Transform audit logs to activity format
    const activities = auditLogs.map(log => ({
      id: log.id,
      type: getActivityType(log.action),
      message: formatActivityMessage(log.action, log.resourceType, log.newValues),
      timestamp: log.createdAt.toISOString(),
      icon: getActivityIcon(log.action),
      color: getActivityColor(log.action),
      metadata: log.newValues
    }))

    return NextResponse.json({ activities })
  } catch (error) {
    Logger.error('Failed to get user activities', error as Error)
    return NextResponse.json(
      { error: 'Failed to retrieve activities' },
      { status: 500 }
    )
  }
}

function getActivityType(action: string): string {
  if (action.includes('view')) return 'view'
  if (action.includes('favorite')) return 'favorite'
  if (action.includes('message') || action.includes('inquiry')) return 'message'
  if (action.includes('offer')) return 'inquiry'
  return 'info'
}

function formatActivityMessage(action: string, resourceType: string, metadata: any): string {
  switch (action) {
    case 'Property created':
      return `Je hebt een nieuwe woning geplaatst: ${metadata?.address || 'Onbekend adres'}`
    case 'Property updated':
      return `Je hebt een woning bijgewerkt: ${metadata?.address || 'Onbekend adres'}`
    case 'Offer created':
      return `Je hebt een bod uitgebracht van ${metadata?.amount ? `€${metadata.amount.toLocaleString()}` : 'onbekend bedrag'}`
    case 'User logged in':
      return 'Je bent ingelogd op je account'
    default:
      return `${action} - ${resourceType}`
  }
}

function getActivityIcon(action: string) {
  // Return icon component names as strings since we can't import React components here
  if (action.includes('view')) return 'Eye'
  if (action.includes('favorite')) return 'Heart'
  if (action.includes('message') || action.includes('offer')) return 'MessageSquare'
  if (action.includes('login')) return 'User'
  return 'Info'
}

function getActivityColor(action: string): string {
  if (action.includes('view')) return 'blue'
  if (action.includes('favorite')) return 'red'
  if (action.includes('message') || action.includes('offer')) return 'green'
  if (action.includes('login')) return 'purple'
  return 'gray'
}