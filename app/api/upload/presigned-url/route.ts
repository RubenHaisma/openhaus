import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { r2Storage } from '@/lib/cloudflare-r2'
import { z } from 'zod'

const presignedUrlSchema = z.object({
  fileName: z.string().min(1),
  propertyId: z.string().min(1),
  fileType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB max
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = presignedUrlSchema.parse(body)

    const result = await r2Storage.getSignedUploadUrl(
      validatedData.propertyId,
      session.user.id,
      validatedData.fileName
    )

    return NextResponse.json({
      uploadUrl: result.uploadUrl,
      key: result.key,
      publicUrl: r2Storage.getPublicUrl(result.key)
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    )
  }
}