import { NextRequest, NextResponse } from 'next/server'
import { offerManager } from '@/lib/marketplace/offers'
import { authService } from '@/lib/security/auth'
import { Logger } from '@/lib/monitoring/logger'
import { propertyService } from '@/lib/property/property-service'
import { z } from 'zod'

const createOfferSchema = z.object({
  propertyId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default('EUR'),
  message: z.string().optional(),
  expiresAt: z.string().optional(),
  conditions: z.array(z.string()).default([]),
})

const offerFiltersSchema = z.object({
  propertyId: z.string().uuid().optional(),
  status: z.enum(['pending', 'accepted', 'rejected', 'countered', 'expired']).optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await authService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createOfferSchema.parse(body)

    // Get property to determine seller
    const property = await propertyService.getProperty(validatedData.propertyId)
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Create offer
    const offer = await offerManager.createOffer({
      propertyId: validatedData.propertyId,
      buyerId: user.id,
      sellerId: 'seller-id', // Would be from property owner
      amount: validatedData.amount,
      currency: validatedData.currency,
      message: validatedData.message,
      expiresAt: validatedData.expiresAt,
      conditions: validatedData.conditions,
    })

    Logger.audit('Offer created', {
      userId: user.id,
      offerId: offer.id,
      propertyId: offer.propertyId,
      amount: offer.amount,
      currency: offer.currency,
    })

    return NextResponse.json(offer)
  } catch (error) {
    Logger.error('Offer creation failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Offer creation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await authService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = offerFiltersSchema.parse({
      propertyId: searchParams.get('propertyId'),
      status: searchParams.get('status'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    })

    // Get offers for user (as buyer or seller)
    const offers = await offerManager.getOffers({
      ...filters,
      buyerId: user.role === 'buyer' ? user.id : undefined,
      sellerId: user.role === 'seller' ? user.id : undefined,
    })

    return NextResponse.json(offers)
  } catch (error) {
    Logger.error('Offers retrieval failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Offers retrieval failed' },
      { status: 500 }
    )
  }
}