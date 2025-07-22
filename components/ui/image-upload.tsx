"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Camera, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface UploadedImage {
  id: string
  url: string
  thumbnailUrl?: string
  name: string
  size: number
  key: string
}

interface ImageUploadProps {
  propertyId: string
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
  existingImages?: UploadedImage[]
}

export function ImageUpload({ 
  propertyId, 
  onImagesChange, 
  maxImages = 20,
  existingImages = []
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [errors, setErrors] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      setErrors([`Maximum ${maxImages} afbeeldingen toegestaan`])
      return
    }

    setUploading(true)
    setErrors([])

    const uploadPromises = acceptedFiles.map(async (file) => {
      const fileId = Math.random().toString(36).substr(2, 9)
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        const formData = new FormData()
        formData.append('file', file)
        formData.append('propertyId', propertyId)

        const response = await fetch('/api/upload/images', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))

        return {
          id: fileId,
          url: result.url,
          thumbnailUrl: result.thumbnailUrl,
          name: file.name,
          size: file.size,
          key: result.key
        }
      } catch (error) {
        console.error('Upload failed:', error)
        setErrors(prev => [...prev, `${file.name}: ${error.message}`])
        return null
      } finally {
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 1000)
      }
    })

    const results = await Promise.all(uploadPromises)
    const successfulUploads = results.filter(Boolean) as UploadedImage[]
    
    const newImages = [...images, ...successfulUploads]
    setImages(newImages)
    onImagesChange(newImages)
    setUploading(false)
  }, [images, maxImages, propertyId, onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading || images.length >= maxImages
  })

  const removeImage = async (imageToRemove: UploadedImage) => {
    try {
      // Delete from R2
      await fetch('/api/upload/images', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: imageToRemove.key })
      })

      const newImages = images.filter(img => img.id !== imageToRemove.id)
      setImages(newImages)
      onImagesChange(newImages)
    } catch (error) {
      console.error('Failed to delete image:', error)
      setErrors(prev => [...prev, 'Failed to delete image'])
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
              ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50'}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                {isDragActive ? (
                  <Upload className="w-12 h-12 text-blue-500" />
                ) : (
                  <Camera className="w-12 h-12 text-gray-400" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Laat bestanden hier vallen...' : 'Upload foto\'s van je woning'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Sleep foto's hierheen of klik om te selecteren
                </p>
                <div className="text-sm text-gray-500">
                  <p>Maximaal {maxImages} foto's • JPEG, PNG, WebP • Max 10MB per foto</p>
                  <p>{images.length} van {maxImages} foto's geüpload</p>
                </div>
              </div>
              
              {!uploading && images.length < maxImages && (
                <Button variant="outline" type="button">
                  <Camera className="w-4 h-4 mr-2" />
                  Selecteer foto's
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Uploaden...</h4>
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([fileId, progress]) => (
                <div key={fileId}>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Upload fouten:</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Images Grid */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Geüploade foto's ({images.length})</h4>
              <Badge variant="outline">
                {images.length} / {maxImages}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="relative group"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={image.thumbnailUrl || image.url}
                        alt={image.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    </div>
                    
                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(image)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Main image indicator */}
                    {index === 0 && (
                      <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                        Hoofdfoto
                      </Badge>
                    )}
                    
                    {/* Image info */}
                    <div className="mt-2 text-xs text-gray-600">
                      <p className="truncate">{image.name}</p>
                      <p>{formatFileSize(image.size)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-medium text-blue-900 mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Tips voor goede foto's
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Gebruik natuurlijk licht waar mogelijk</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Ruim persoonlijke spullen op</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Fotografeer alle kamers</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Maak ook buitenfoto's</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Zorg voor een opgeruimde woning</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>Eerste foto wordt de hoofdfoto</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}