import { NextRequest, NextResponse } from 'next/server'
import { inventoryManager } from '@/lib/marketplace/inventory'
import { authService } from '@/lib/security/auth'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const createPropertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  propertyType: z.enum(['house', 'apartment', 'townhouse']),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  squareMeters: z.number().min(1),
  constructionYear: z.number().min(1800).max(new Date().getFullYear()),
  askingPrice: z.number().min(1),
  energyLabel: z.string().optional(),
  features: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

const updatePropertySchema = createPropertySchema.partial()

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
    const validatedData = createPropertySchema.parse(body)

    // Create property
    const property = await inventoryManager.createProperty({
      address: validatedData.address,
      postal_code: validatedData.postalCode,
      city: validatedData.city,
      province: validatedData.province,
      property_type: validatedData.propertyType,
      bedrooms: validatedData.bedrooms,
      bathrooms: validatedData.bathrooms,
      square_meters: validatedData.squareMeters,
      construction_year: validatedData.constructionYear,
      asking_price: validatedData.askingPrice,
      energy_label: validatedData.energyLabel || 'Unknown',
      features: validatedData.features,
      images: validatedData.images,
      description: validatedData.description,
      status: 'available',
      estimated_value: validatedData.askingPrice, // Would be calculated
      confidence_score: 0.8, // Would be calculated
    })

    Logger.audit('Property created', {
      userId: user.id,
      propertyId: property.id,
      address: property.address,
      askingPrice: property.asking_price,
    })

    return NextResponse.json(property)
  } catch (error) {
    Logger.error('Property creation failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Property creation failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const properties = await inventoryManager.searchProperties(
      { status: 'available' },
      { limit, offset }
    )

    return NextResponse.json(properties)
  } catch (error) {
    Logger.error('Properties retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Properties retrieval failed' },
      { status: 500 }
    )
  }
}