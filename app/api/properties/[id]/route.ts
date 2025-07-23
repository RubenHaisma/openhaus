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
    // Fetch property from the database
    const property = await propertyService.getProperty(id)
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(property)
  } catch (error) {
    Logger.error('Property retrieval failed', error as Error, {
      // propertyId: context.params.id,
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