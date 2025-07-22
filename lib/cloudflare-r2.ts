import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!

export interface UploadResult {
  url: string
  key: string
  thumbnailUrl?: string
}

export class CloudflareR2Storage {
  async uploadImage(
    file: Buffer,
    originalName: string,
    propertyId: string,
    userId: string
  ): Promise<UploadResult> {
    try {
      const fileExtension = originalName.split('.').pop()?.toLowerCase()
      const key = `properties/${propertyId}/${uuidv4()}.${fileExtension}`
      const thumbnailKey = `properties/${propertyId}/thumbnails/${uuidv4()}.webp`

      // Optimize and resize main image
      const optimizedImage = await sharp(file)
        .resize(1920, 1080, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer()

      // Create thumbnail
      const thumbnail = await sharp(file)
        .resize(400, 300, { 
          fit: 'cover' 
        })
        .webp({ quality: 80 })
        .toBuffer()

      // Upload main image
      await r2Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: optimizedImage,
        ContentType: 'image/jpeg',
        Metadata: {
          userId,
          propertyId,
          originalName,
          uploadedAt: new Date().toISOString(),
        }
      }))

      // Upload thumbnail
      await r2Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: 'image/webp',
        Metadata: {
          userId,
          propertyId,
          type: 'thumbnail',
          uploadedAt: new Date().toISOString(),
        }
      }))

      return {
        url: `${PUBLIC_URL}/${key}`,
        key,
        thumbnailUrl: `${PUBLIC_URL}/${thumbnailKey}`
      }
    } catch (error) {
      console.error('Failed to upload image to R2:', error)
      throw new Error('Image upload failed')
    }
  }

  async deleteImage(key: string): Promise<void> {
    try {
      await r2Client.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      }))
    } catch (error) {
      console.error('Failed to delete image from R2:', error)
      throw new Error('Image deletion failed')
    }
  }

  async getSignedUploadUrl(
    propertyId: string,
    userId: string,
    fileName: string
  ): Promise<{ uploadUrl: string; key: string }> {
    try {
      const fileExtension = fileName.split('.').pop()?.toLowerCase()
      const key = `properties/${propertyId}/${uuidv4()}.${fileExtension}`

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Metadata: {
          userId,
          propertyId,
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        }
      })

      const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })

      return { uploadUrl, key }
    } catch (error) {
      console.error('Failed to generate signed URL:', error)
      throw new Error('Failed to generate upload URL')
    }
  }

  getPublicUrl(key: string): string {
    return `${PUBLIC_URL}/${key}`
  }
}

export const r2Storage = new CloudflareR2Storage()