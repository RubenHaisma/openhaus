import { NextRequest, NextResponse } from 'next/server'
import { propertyService } from '@/lib/property/property-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Logger } from '@/lib/monitoring/logger'
import { PropertyType } from '@prisma/client'
import { z } from 'zod'

const createPropertySchema = z.object({
  address: z.string().min(1, 'Address is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
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

    // Get property data from WOZ scraper and EP Online
    const propertyData = await propertyService.getPropertyData(validatedData.address, validatedData.postalCode)
    if (!propertyData) {
      return NextResponse.json({ error: 'Could not retrieve property data' }, { status: 400 })
    }

    // Create property with real data
    const property = await propertyService.createProperty(session.user.id, propertyData, {
      askingPrice: validatedData.askingPrice,
      bedrooms: validatedData.bedrooms,
      bathrooms: validatedData.bathrooms,
      description: validatedData.description,
      features: validatedData.features,
      images: validatedData.images
    })

    Logger.audit('Property created', {
      userId: session.user.id,
      propertyId: property.id,
      address: property.address,
      askingPrice: property.askingPrice,
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

    // Use propertyService to fetch real properties from the database
    const { properties, total } = await propertyService.searchProperties({
      status: 'AVAILABLE',
      limit,
      offset,
    })

    const result = {
      properties,
      total
    }

    return NextResponse.json(result)
  } catch (error) {
    Logger.error('Properties retrieval failed', error as Error)
    return NextResponse.json(
      { error: 'Properties retrieval failed' },
      { status: 500 }
    )
  }
}