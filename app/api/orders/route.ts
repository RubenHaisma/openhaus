import { NextRequest, NextResponse } from 'next/server'
import { orderManager } from '@/lib/marketplace/orders'
import { authService } from '@/lib/security/auth'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const createOrderSchema = z.object({
  propertyId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  paymentMethod: z.string(),
  shippingAddress: z.object({
    name: z.string(),
    street1: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
  }).optional(),
  notes: z.string().optional(),
})

const orderFiltersSchema = z.object({
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
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
    const validatedData = createOrderSchema.parse(body)

    // Create order
    const order = await orderManager.createOrder({
      buyerId: user.id,
      sellerId: validatedData.propertyId, // This would be resolved from property
      propertyId: validatedData.propertyId,
      amount: validatedData.amount,
      currency: validatedData.currency,
      paymentMethod: validatedData.paymentMethod,
      shippingAddress: validatedData.shippingAddress,
      notes: validatedData.notes,
    })

    Logger.audit('Order created', {
      userId: user.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })

    return NextResponse.json(order)
  } catch (error) {
    Logger.error('Order creation failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Order creation failed' },
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
    const filters = orderFiltersSchema.parse({
      status: searchParams.get('status'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      minAmount: searchParams.get('minAmount') ? parseFloat(searchParams.get('minAmount')!) : undefined,
      maxAmount: searchParams.get('maxAmount') ? parseFloat(searchParams.get('maxAmount')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    })

    // Get orders for user
    const orders = await orderManager.getOrders({
      ...filters,
      buyerId: user.role === 'buyer' ? user.id : undefined,
      sellerId: user.role === 'seller' ? user.id : undefined,
    })

    return NextResponse.json(orders)
  } catch (error) {
    Logger.error('Orders retrieval failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Orders retrieval failed' },
      { status: 500 }
    )
  }
}