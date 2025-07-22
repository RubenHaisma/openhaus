import { NextRequest, NextResponse } from 'next/server'
import { inventoryManager } from '@/lib/marketplace/inventory'
import { authService } from '@/lib/security/auth'
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
    const property = await inventoryManager.getProperty(params.id)
    
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
    const validatedData = updatePropertySchema.parse(body)

    // Update property
    const updateData: any = {}
    if (validatedData.address) updateData.address = validatedData.address
    if (validatedData.postalCode) updateData.postalCode = validatedData.postalCode
    if (validatedData.city) updateData.city = validatedData.city
    if (validatedData.province) updateData.province = validatedData.province
    if (validatedData.propertyType) updateData.propertyType = validatedData.propertyType
    if (validatedData.bedrooms !== undefined) updateData.bedrooms = validatedData.bedrooms
    if (validatedData.bathrooms !== undefined) updateData.bathrooms = validatedData.bathrooms
    if (validatedData.squareMeters) updateData.squareMeters = validatedData.squareMeters
    if (validatedData.constructionYear) updateData.constructionYear = validatedData.constructionYear
    if (validatedData.askingPrice) updateData.askingPrice = validatedData.askingPrice
    if (validatedData.energyLabel) updateData.energyLabel = validatedData.energyLabel
    if (validatedData.features) updateData.features = validatedData.features
    if (validatedData.images) updateData.images = validatedData.images
    if (validatedData.description) updateData.description = validatedData.description
    if (validatedData.status) updateData.status = validatedData.status

    const property = await inventoryManager.updateProperty(params.id, updateData)

    Logger.audit('Property updated', {
      userId: user.id,
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
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const user = await authService.verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    await inventoryManager.deleteProperty(params.id)

    Logger.audit('Property deleted', {
      userId: user.id,
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