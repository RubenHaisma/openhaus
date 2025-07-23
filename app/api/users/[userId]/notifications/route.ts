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

    // Check if user is requesting their own notifications or is admin
    if (session.user.id !== userId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get recent audit logs as notifications
    const auditLogs = await prisma.auditLog.findMany({
      where: { 
        userId,
        action: { 
          in: ['Offer created', 'Property viewed', 'Property favorited', 'User logged in'] 
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Transform audit logs to notifications
    const notifications = auditLogs.map(log => ({
      id: log.id,
      title: getNotificationTitle(log.action),
      message: getNotificationMessage(log.action, log.newValues),
      type: getNotificationType(log.action),
      timestamp: log.createdAt.toISOString(),
      read: false, // In a real app, you'd track read status
      icon: getNotificationIcon(log.action)
    }))

    return NextResponse.json({ notifications })
  } catch (error) {
    Logger.error('Failed to get user notifications', error as Error)
    return NextResponse.json(
      { error: 'Failed to retrieve notifications' },
      { status: 500 }
    )
  }
}

function getNotificationTitle(action: string): string {
  switch (action) {
    case 'Offer created':
      return 'Nieuw bod uitgebracht'
    case 'Property viewed':
      return 'Woning bekeken'
    case 'Property favorited':
      return 'Woning toegevoegd aan favorieten'
    case 'User logged in':
      return 'Ingelogd'
    default:
      return action
  }
}

function getNotificationMessage(action: string, metadata: any): string {
  switch (action) {
    case 'Offer created':
      return `Je hebt een bod uitgebracht van ${metadata?.amount ? `€${metadata.amount.toLocaleString()}` : 'onbekend bedrag'}`
    case 'Property viewed':
      return `Je hebt een woning bekeken: ${metadata?.address || 'Onbekend adres'}`
    case 'Property favorited':
      return `Je hebt een woning toegevoegd aan je favorieten`
    case 'User logged in':
      return 'Je bent succesvol ingelogd op je account'
    default:
      return `${action} uitgevoerd`
  }
}

function getNotificationType(action: string): 'info' | 'success' | 'warning' | 'error' {
  switch (action) {
    case 'Offer created':
      return 'success'
    case 'Property viewed':
      return 'info'
    case 'Property favorited':
      return 'info'
    case 'User logged in':
      return 'success'
    default:
      return 'info'
  }
}

function getNotificationIcon(action: string): string {
  switch (action) {
    case 'Offer created':
      return 'Euro'
    case 'Property viewed':
      return 'Eye'
    case 'Property favorited':
      return 'Heart'
    case 'User logged in':
      return 'User'
    default:
      return 'Info'
  }
}