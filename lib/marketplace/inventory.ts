import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Property = Database['public']['Tables']['properties']['Row']
type PropertyInsert = Database['public']['Tables']['properties']['Insert']
type PropertyUpdate = Database['public']['Tables']['properties']['Update']

export interface PropertyFilters {
  city?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  maxBedrooms?: number
  minBathrooms?: number
  maxBathrooms?: number
  minSquareMeters?: number
  maxSquareMeters?: number
  energyLabel?: string
  status?: string
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
  async createProperty(data: PropertyInsert): Promise<Property> {
    try {
      const { data: property, error } = await supabase
        .from('properties')
        .insert(data)
        .select()
        .single()

      if (error) throw error

      // Index property for search
      await this.indexPropertyForSearch(property.id)

      return property
    } catch (error) {
      console.error('Property creation failed:', error)
      throw new Error('Failed to create property')
    }
  }

  async updateProperty(propertyId: string, data: PropertyUpdate): Promise<Property> {
    try {
      const updateData = {
        ...data,
        updated_at: new Date().toISOString(),
      }

      const { data: property, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)
        .select()
        .single()

      if (error) throw error

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
      const { data: property, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
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
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`)
      }
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType)
      }
      if (filters.minPrice) {
        query = query.gte('asking_price', filters.minPrice)
      }
      if (filters.maxPrice) {
        query = query.lte('asking_price', filters.maxPrice)
      }
      if (filters.minBedrooms) {
        query = query.gte('bedrooms', filters.minBedrooms)
      }
      if (filters.maxBedrooms) {
        query = query.lte('bedrooms', filters.maxBedrooms)
      }
      if (filters.minBathrooms) {
        query = query.gte('bathrooms', filters.minBathrooms)
      }
      if (filters.maxBathrooms) {
        query = query.lte('bathrooms', filters.maxBathrooms)
      }
      if (filters.minSquareMeters) {
        query = query.gte('square_meters', filters.minSquareMeters)
      }
      if (filters.maxSquareMeters) {
        query = query.lte('square_meters', filters.maxSquareMeters)
      }
      if (filters.energyLabel) {
        query = query.eq('energy_label', filters.energyLabel)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.features && filters.features.length > 0) {
        query = query.contains('features', filters.features)
      }

      // Apply search parameters
      if (searchParams.query) {
        query = query.or(`address.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%`)
      }

      // Apply sorting
      const sortBy = searchParams.sortBy || 'created_at'
      const sortOrder = searchParams.sortOrder || 'desc'
      
      switch (sortBy) {
        case 'price':
          query = query.order('asking_price', { ascending: sortOrder === 'asc' })
          break
        case 'size':
          query = query.order('square_meters', { ascending: sortOrder === 'asc' })
          break
        case 'date':
        default:
          query = query.order('created_at', { ascending: sortOrder === 'asc' })
          break
      }

      // Apply pagination
      const limit = searchParams.limit || 20
      const offset = searchParams.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data: properties, error, count } = await query

      if (error) throw error

      return {
        properties: properties || [],
        total: count || 0
      }
    } catch (error) {
      console.error('Property search failed:', error)
      return { properties: [], total: 0 }
    }
  }

  async getFeaturedProperties(limit: number = 10): Promise<Property[]> {
    try {
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return properties || []
    } catch (error) {
      console.error('Featured properties retrieval failed:', error)
      return []
    }
  }

  async getSimilarProperties(propertyId: string, limit: number = 5): Promise<Property[]> {
    try {
      const property = await this.getProperty(propertyId)
      if (!property) return []

      const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .eq('city', property.city)
        .eq('property_type', property.property_type)
        .neq('id', propertyId)
        .eq('status', 'available')
        .gte('asking_price', property.asking_price * 0.8)
        .lte('asking_price', property.asking_price * 1.2)
        .limit(limit)

      if (error) throw error
      return properties || []
    } catch (error) {
      console.error('Similar properties retrieval failed:', error)
      return []
    }
  }

  async updatePropertyStatus(propertyId: string, status: string): Promise<Property> {
    return this.updateProperty(propertyId, { status })
  }

  async deleteProperty(propertyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

      if (error) throw error

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