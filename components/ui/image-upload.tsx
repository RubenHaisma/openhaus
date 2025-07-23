"use client"

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageUploadProps {
  propertyId: string
  onImagesChange: (images: any[]) => void
  existingImages?: any[]
  maxImages?: number
  maxSize?: number // in MB
}

interface UploadedImage {
  id: string
  url: string
  name: string
  size: number
  uploading?: boolean
  progress?: number
  error?: string
}

export function ImageUpload({ 
  propertyId, 
  onImagesChange, 
  existingImages = [], 
  maxImages = 20,
  maxSize = 10 
}: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages)
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      alert(`Je kunt maximaal ${maxImages} foto's uploaden`)
      return
    }

    setUploading(true)

    for (const file of acceptedFiles) {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`${file.name} is te groot. Maximale grootte is ${maxSize}MB`)
        continue
      }

      const tempId = `temp-${Date.now()}-${Math.random()}`
      const tempImage: UploadedImage = {
        id: tempId,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        uploading: true,
        progress: 0
      }

      setImages(prev => [...prev, tempImage])

      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          setImages(prev => prev.map(img => 
            img.id === tempId ? { ...img, progress } : img
          ))
        }

        // In a real implementation, you would upload to your storage service
        const uploadedImage: UploadedImage = {
          id: `uploaded-${Date.now()}`,
          url: URL.createObjectURL(file), // In reality, this would be the uploaded URL
          name: file.name,
          size: file.size,
          uploading: false
        }

        setImages(prev => prev.map(img => 
          img.id === tempId ? uploadedImage : img
        ))

      } catch (error) {
        setImages(prev => prev.map(img => 
          img.id === tempId ? { ...img, uploading: false, error: 'Upload failed' } : img
        ))
      }
    }

    setUploading(false)
  }, [images.length, maxImages, maxSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    disabled: uploading || images.length >= maxImages
  })

  const removeImage = (imageId: string) => {
    const newImages = images.filter(img => img.id !== imageId)
    setImages(newImages)
    onImagesChange(newImages)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Update parent component when images change
  React.useEffect(() => {
    onImagesChange(images.filter(img => !img.uploading && !img.error))
  }, [images, onImagesChange])

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            
            {isDragActive ? (
              <p className="text-blue-600 font-medium">Laat de foto's hier vallen...</p>
            ) : (
              <div>
                <p className="text-gray-600 font-medium mb-2">
                  Sleep foto's hierheen of klik om te selecteren
                </p>
                <p className="text-gray-500 text-sm">
                  Ondersteunde formaten: JPG, PNG, WebP (max {maxSize}MB per foto)
                </p>
                <p className="text-gray-500 text-sm">
                  {images.length}/{maxImages} foto's geüpload
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">
              Geüploade foto's ({images.length})
            </h3>
            
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
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Upload Progress */}
                      {image.uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <div className="text-sm">{image.progress}%</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Error State */}
                      {image.error && (
                        <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center">
                          <div className="text-center text-white">
                            <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                            <div className="text-xs">Upload mislukt</div>
                          </div>
                        </div>
                      )}
                      
                      {/* Success State */}
                      {!image.uploading && !image.error && (
                        <div className="absolute top-2 left-2">
                          <CheckCircle className="w-5 h-5 text-green-500 bg-white rounded-full" />
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      {!image.uploading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Image Info */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 truncate">{image.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-medium text-blue-900 mb-3">
            Tips voor goede woningfoto's
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Gebruik natuurlijk licht</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Ruim alle persoonlijke spullen op</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Fotografeer alle kamers</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Maak ook buitenfoto's</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Gebruik een stabiele camera</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Fotografeer vanuit de hoeken</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}