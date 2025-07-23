"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ImageUploadProps {
  propertyId: string
  onImagesChange: (images: any[]) => void
  existingImages?: any[]
  maxImages?: number
}

export function ImageUpload({ 
  propertyId, 
  onImagesChange, 
  existingImages = [], 
  maxImages = 10 
}: ImageUploadProps) {
  const [images, setImages] = useState(existingImages)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (images.length + acceptedFiles.length > maxImages) {
      setError(`Maximum ${maxImages} afbeeldingen toegestaan`)
      return
    }

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const newImages = []
      
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i]
        
        // Simulate upload progress
        setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
        
        // Create preview URL
        const previewUrl = URL.createObjectURL(file)
        
        // In a real app, you would upload to your storage service here
        // For now, we'll just create a mock uploaded image object
        const uploadedImage = {
          id: `img-${Date.now()}-${i}`,
          url: previewUrl,
          file: file,
          name: file.name,
          size: file.size
        }
        
        newImages.push(uploadedImage)
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)
      onImagesChange(updatedImages)
      
    } catch (error) {
      console.error('Upload failed:', error)
      setError('Upload mislukt. Probeer het opnieuw.')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [images, maxImages, onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: uploading || images.length >= maxImages
  })

  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId)
    setImages(updatedImages)
    onImagesChange(updatedImages)
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
              ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              ${uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isDragActive ? 'Laat bestanden hier vallen...' : 'Upload foto\'s van je woning'}
                </h3>
                <p className="text-gray-600">
                  Sleep bestanden hierheen of klik om te selecteren
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Ondersteunde formaten: JPEG, PNG, WebP (max 10MB per bestand)
                </p>
              </div>
              
              <div className="text-sm text-gray-500">
                {images.length} van {maxImages} afbeeldingen geüpload
              </div>
            </div>
          </div>
          
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Uploaden...</span>
                <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Grid */}
      {images.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Geüploade afbeeldingen ({images.length})
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
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Image Info */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 truncate">{image.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                    </div>
                    
                    {/* Remove Button */}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    
                    {/* Primary Image Badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        Hoofdfoto
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Tips voor goede foto's</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Gebruik natuurlijk licht waar mogelijk</li>
                    <li>• Maak foto's van alle kamers en de buitenkant</li>
                    <li>• Zorg dat de ruimtes opgeruimd en schoon zijn</li>
                    <li>• De eerste foto wordt gebruikt als hoofdfoto</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}