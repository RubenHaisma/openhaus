import { NextRequest, NextResponse } from 'next/server'
import { propertyService } from '@/lib/property/property-service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await propertyService.getProperty(params.id)
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(property)
  } catch (error) {
    Logger.error('Property retrieval failed', error as Error, {
      propertyId: params.id,
    })
    
    return NextResponse.json(
      { error: 'Property retrieval failed' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updatePropertySchema.parse(body)

    // Get current property to check ownership
    const currentProperty = await propertyService.getProperty(params.id)
    if (!currentProperty || currentProperty.userId !== session.user.id) {
      return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 })
    }

    // Update property in database
    const updateData: any = {}
    Object.keys(validatedData).forEach(key => {
      if (validatedData[key] !== undefined) {
        updateData[key] = validatedData[key]
      }
    })

    const property = await prisma.property.update({
      where: { id: params.id },
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
      propertyId: params.id,
    })

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Property update failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current property to check ownership
    const currentProperty = await propertyService.getProperty(params.id)
    if (!currentProperty || currentProperty.userId !== session.user.id) {
      return NextResponse.json({ error: 'Property not found or unauthorized' }, { status: 404 })
    }

    // Delete property
    await prisma.property.delete({
      where: { id: params.id }
    })

    Logger.audit('Property deleted', {
      userId: session.user.id,
      propertyId: params.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    Logger.error('Property deletion failed', error as Error, {
      propertyId: params.id,
    })

    return NextResponse.json(
      { error: 'Property deletion failed' },
      { status: 500 }
    )
  }
}