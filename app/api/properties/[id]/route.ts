import { NextRequest, NextResponse } from 'next/server'
import { propertyService } from '@/lib/property/property-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const updatePropertySchema = z.object({
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'TOWNHOUSE']).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  squareMeters: z.number().min(1).optional(),
  constructionYear: z.number().min(1800).max(new Date().getFullYear()).optional(),
  askingPrice: z.number().min(1).optional(),
  energyLabel: z.string().optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  description: z.string().min(10).optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'PENDING']).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split("/").pop()!
    
    console.log('API: Fetching property with ID:', id)
    
    if (!id || id === 'undefined' || id === 'null') {
      console.error('API: Invalid property ID provided:', id)
      return NextResponse.json(
        { error: 'Invalid property ID' },
        { status: 400 }
      )
    }
    
    // Fetch property from the database
    const property = await propertyService.getProperty(id) as import("@prisma/client").Property & { user?: { id: string; name: string; email: string } };
    console.log('API: Property service returned:', property ? 'Property found' : 'Property not found')
    
    if (!property) {
      Logger.warn('Property not found in database', { propertyId: id })
      return NextResponse.json(
        { error: 'Property not found in database' },
        { status: 404 }
      )
    }
    
    // Ensure all required fields are present
    const propertyResponse = {
      id: property.id,
      address: property.address,
      postalCode: property.postalCode,
      city: property.city,
      province: property.province,
      propertyType: property.propertyType,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareMeters: Number(property.squareMeters),
      constructionYear: property.constructionYear,
      askingPrice: Number(property.askingPrice),
      estimatedValue: Number(property.estimatedValue),
      status: property.status,
      images: property.images || [],
      description: property.description,
      features: property.features || [],
      energyLabel: property.energyLabel,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
      userId: property.userId,
      user: property.user 
    }
    
    Logger.info('Property retrieved from database', { 
      propertyId: id, 
      address: propertyResponse.address,
      hasRealData: !!(propertyResponse.address && propertyResponse.askingPrice)
    })
    
    return NextResponse.json(propertyResponse)
  } catch (error) {
    Logger.error('Property retrieval failed', error as Error, {
      propertyId: request.nextUrl.pathname.split("/").pop(),
    })
    return NextResponse.json(
      { error: 'Property retrieval failed' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.pathname.split("/").pop()!
    const body = await request.json()
    const validatedData = updatePropertySchema.parse(body)

    // Get current property to check ownership
    const currentProperty = await propertyService.getProperty(id)
    if (!currentProperty || currentProperty.userId !== session.user.id) {
      return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 })
    }

    // Update property in database
    const updateData: any = {}
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value
      }
    })

    const property = await prisma.property.update({
      where: { id },
      data: updateData
    })

    Logger.audit('Property updated', {
      userId: session.user.id,
      propertyId: property.id,
      changes: Object.keys(updateData),
    })

    return NextResponse.json(property)
  } catch (error) {
    Logger.error('Property update failed', error as Error, {
      // propertyId: context.params.id,
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Property update failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const id = request.nextUrl.pathname.split("/").pop()!
    // Get current property to check ownership
    const currentProperty = await propertyService.getProperty(id)
    if (!currentProperty || currentProperty.userId !== session.user.id) {
      return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 })
    }

    // Delete property
    await prisma.property.delete({
      where: { id }
    })

    Logger.audit('Property deleted', {
      userId: session.user.id,
      propertyId: id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    Logger.error('Property deletion failed', error as Error, {
      // propertyId: context.params.id,
    })

    return NextResponse.json(
      { error: 'Property deletion failed' },
      { status: 500 }
    )
  }
}