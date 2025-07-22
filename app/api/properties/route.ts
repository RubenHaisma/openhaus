import { NextRequest, NextResponse } from 'next/server'
import { inventoryManager } from '@/lib/marketplace/inventory'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Logger } from '@/lib/monitoring/logger'
import { PropertyType } from '@prisma/client'
import { z } from 'zod'

const createPropertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  propertyType: z.nativeEnum(PropertyType),
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      square_meters: validatedData.squareMeters.toString(),
      construction_year: validatedData.constructionYear,
      asking_price: validatedData.askingPrice.toString(),
      energy_label: validatedData.energyLabel || 'C',
      features: validatedData.features,
      images: validatedData.images,
      description: validatedData.description,
      status: 'AVAILABLE',
      estimated_value: validatedData.askingPrice.toString(), // Would be calculated
      confidence_score: '0.8', // Would be calculated
    })

    Logger.audit('Property created', {
      userId: session.user.id,
      propertyId: property.id,
      address: property.address,
      askingPrice: property.asking_price,
    })

    return NextResponse.json(property)
  } catch (error) {
    Logger.error('Property creation failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
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
      { status: 'AVAILABLE' },
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