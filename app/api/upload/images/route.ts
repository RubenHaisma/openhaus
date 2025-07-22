import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { r2Storage } from '@/lib/cloudflare-r2'
import { Logger } from '@/lib/monitoring/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const propertyId = formData.get('propertyId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    const result = await r2Storage.uploadImage(
      buffer,
      file.name,
      propertyId,
      session.user.id
    )

    Logger.audit('Image uploaded', {
      userId: session.user.id,
      propertyId,
      fileName: file.name,
      fileSize: file.size,
      url: result.url
    })

    return NextResponse.json(result)
  } catch (error) {
    Logger.error('Image upload failed', error as Error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key } = await request.json()
    
    if (!key) {
      return NextResponse.json({ error: 'Key required' }, { status: 400 })
    }

    await r2Storage.deleteImage(key)

    Logger.audit('Image deleted', {
      userId: session.user.id,
      key
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    Logger.error('Image deletion failed', error as Error)
    return NextResponse.json(
      { error: 'Deletion failed' },
      { status: 500 }
    )
  }
}