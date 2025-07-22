import { prisma } from '@/lib/prisma'
import { Property, PropertyType, PropertyStatus } from '@prisma/client'

export interface PropertyFilters {
  city?: string
  propertyType?: PropertyType
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  minSquareMeters?: number
  maxSquareMeters?: number
  energyLabel?: string
  status?: PropertyStatus
  features?: string[]
}

export interface PropertySearchParams {
  query?: string
  location?: string
  radius?: number
  sortBy?: 'price' | 'date' | 'size' | 'relevance'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export class InventoryManager {
  async createProperty(data: any): Promise<Property> {
    try {
      const property = await prisma.property.create({
        data: {
          address: data.address,
          postalCode: data.postal_code,
          city: data.city,
          province: data.province,
          propertyType: data.property_type as PropertyType,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          squareMeters: data.square_meters,
          constructionYear: data.construction_year,
          askingPrice: data.asking_price,
          energyLabel: data.energy_label,
          features: data.features,
          images: data.images,
          description: data.description,
          status: data.status as PropertyStatus,
          estimatedValue: data.estimated_value,
          confidenceScore: data.confidence_score
        }
      })

      // Index property for search
      await this.indexPropertyForSearch(property.id)

      return property
    } catch (error) {
      console.error('Property creation failed:', error)
      throw new Error('Failed to create property')
    }
  }

  async updateProperty(propertyId: string, data: any): Promise<Property> {
    try {
      const property = await prisma.property.update({
        where: { id: propertyId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })

      // Re-index property for search
      await this.indexPropertyForSearch(propertyId)

      return property
    } catch (error) {
      console.error('Property update failed:', error)
      throw new Error('Failed to update property')
    }
  }

  async getProperty(propertyId: string): Promise<Property | null> {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId }
      })

      return property
    } catch (error) {
      console.error('Property retrieval failed:', error)
      return null
    }
  }

  async searchProperties(
    filters: PropertyFilters = {},
    searchParams: PropertySearchParams = {}
  ): Promise<{ properties: Property[]; total: number }> {
    try {
      const where: any = {}

      if (filters.city) {
        where.city = { contains: filters.city, mode: 'insensitive' }
      }
      if (filters.propertyType) where.propertyType = filters.propertyType
      if (filters.minPrice) where.askingPrice = { gte: filters.minPrice }
      if (filters.maxPrice) {
        where.askingPrice = { ...where.askingPrice, lte: filters.maxPrice }
      }
      if (filters.minBedrooms) where.bedrooms = { gte: filters.minBedrooms }
      if (filters.maxBedrooms) {
        where.bedrooms = { ...where.bedrooms, lte: filters.maxBedrooms }
      }
      if (filters.minBathrooms) where.bathrooms = { gte: filters.minBathrooms }
      if (filters.maxBathrooms) {
        where.bathrooms = { ...where.bathrooms, lte: filters.maxBathrooms }
      }
      if (filters.minSquareMeters) where.squareMeters = { gte: filters.minSquareMeters }
      if (filters.maxSquareMeters) {
        where.squareMeters = { ...where.squareMeters, lte: filters.maxSquareMeters }
      }
      if (filters.energyLabel) where.energyLabel = filters.energyLabel
      if (filters.status) where.status = filters.status
      if (filters.features && filters.features.length > 0) {
        where.features = { hasEvery: filters.features }
      }

      // Apply search parameters
      if (searchParams.query) {
        where.OR = [
          { address: { contains: searchParams.query, mode: 'insensitive' } },
          { description: { contains: searchParams.query, mode: 'insensitive' } }
        ]
      }

      // Apply sorting
      const sortBy = searchParams.sortBy || 'created_at'
      const sortOrder = searchParams.sortOrder || 'desc'
      
      let orderBy: any = {}
      switch (sortBy) {
        case 'price':
          orderBy = { askingPrice: sortOrder }
          break
        case 'size':
          orderBy = { squareMeters: sortOrder }
          break
        case 'date':
        default:
          orderBy = { createdAt: sortOrder }
          break
      }

      // Apply pagination
      const limit = searchParams.limit || 20
      const offset = searchParams.offset || 0

      
      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          orderBy,
          take: limit,
          skip: offset
        }),
        prisma.property.count({ where })
      ])


      return {
        properties,
        total
      }
    } catch (error) {
      console.error('Property search failed:', error)
      return { properties: [], total: 0 }
    }
  }

  async getFeaturedProperties(limit: number = 10): Promise<Property[]> {
    try {
      const properties = await prisma.property.findMany({
        where: { status: PropertyStatus.AVAILABLE },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      return properties
    } catch (error) {
      console.error('Featured properties retrieval failed:', error)
      return []
    }
  }

  async getSimilarProperties(propertyId: string, limit: number = 5): Promise<Property[]> {
    try {
      const property = await this.getProperty(propertyId)
      if (!property) return []

      const properties = await prisma.property.findMany({
        where: {
          city: property.city,
          propertyType: property.propertyType,
          id: { not: propertyId },
          status: PropertyStatus.AVAILABLE,
          askingPrice: {
            gte: Number(property.askingPrice) * 0.8,
            lte: Number(property.askingPrice) * 1.2
          }
        },
        take: limit
      })

      return properties
    } catch (error) {
      console.error('Similar properties retrieval failed:', error)
      return []
    }
  }

  async updatePropertyStatus(propertyId: string, status: PropertyStatus): Promise<Property> {
    return this.updateProperty(propertyId, { status })
  }

  async deleteProperty(propertyId: string): Promise<void> {
    try {
      await prisma.property.delete({
        where: { id: propertyId }
      })

      // Remove from search index
      await this.removePropertyFromSearch(propertyId)
    } catch (error) {
      console.error('Property deletion failed:', error)
      throw new Error('Failed to delete property')
    }
  }

  private async indexPropertyForSearch(propertyId: string): Promise<void> {
    try {
      // Implementation would integrate with search service (Elasticsearch, Algolia, etc.)
      console.log(`Indexing property ${propertyId} for search`)
    } catch (error) {
      console.error('Property search indexing failed:', error)
    }
  }

  private async removePropertyFromSearch(propertyId: string): Promise<void> {
    try {
      // Implementation would integrate with search service
      console.log(`Removing property ${propertyId} from search index`)
    } catch (error) {
      console.error('Property search removal failed:', error)
    }
  }
}

export const inventoryManager = new InventoryManager()