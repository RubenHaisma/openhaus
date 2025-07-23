import { NextRequest, NextResponse } from 'next/server'
import { propertyService } from '@/lib/property/property-service'
import { cacheService } from '@/lib/cache/redis'
import { Logger } from '@/lib/monitoring/logger'
import { z } from 'zod'

const searchSchema = z.object({
  query: z.string().optional(),
  city: z.string().optional(),
  propertyType: z.enum(['HOUSE', 'APARTMENT', 'TOWNHOUSE']).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  minBedrooms: z.number().min(0).optional(),
  maxBedrooms: z.number().min(0).optional(),
  minBathrooms: z.number().min(0).optional(),
  maxBathrooms: z.number().min(0).optional(),
  minSquareMeters: z.number().min(0).optional(),
  maxSquareMeters: z.number().min(0).optional(),
  energyLabel: z.string().optional(),
  features: z.array(z.string()).optional(),
  sortBy: z.enum(['price', 'date', 'size', 'relevance']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse and validate search parameters
    const filters = searchSchema.parse({
      query: searchParams.get('query'),
      city: searchParams.get('city'),
      propertyType: searchParams.get('propertyType'),
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      minBedrooms: searchParams.get('minBedrooms') ? parseInt(searchParams.get('minBedrooms')!) : undefined,
      maxBedrooms: searchParams.get('maxBedrooms') ? parseInt(searchParams.get('maxBedrooms')!) : undefined,
      minBathrooms: searchParams.get('minBathrooms') ? parseInt(searchParams.get('minBathrooms')!) : undefined,
      maxBathrooms: searchParams.get('maxBathrooms') ? parseInt(searchParams.get('maxBathrooms')!) : undefined,
      minSquareMeters: searchParams.get('minSquareMeters') ? parseInt(searchParams.get('minSquareMeters')!) : undefined,
      maxSquareMeters: searchParams.get('maxSquareMeters') ? parseInt(searchParams.get('maxSquareMeters')!) : undefined,
      energyLabel: searchParams.get('energyLabel'),
      features: searchParams.get('features')?.split(','),
      sortBy: searchParams.get('sortBy') as any || 'date',
      sortOrder: searchParams.get('sortOrder') as any || 'desc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
    })

    // Create cache key from search parameters
    const cacheKey = JSON.stringify(filters)
    
    // Try to get cached results
    const cachedResults = await cacheService.getCachedSearchResults(cacheKey)
    if (cachedResults) {
      Logger.info('Property search cache hit', { filters })
      return NextResponse.json(cachedResults)
    }

    // Perform search
    const results = await propertyService.searchProperties({
      city: filters.city,
      propertyType: filters.propertyType as any,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minBedrooms: filters.minBedrooms,
      maxBedrooms: filters.maxBedrooms,
      status: 'AVAILABLE',
      limit: filters.limit,
      offset: filters.offset,
    })

    // Cache results for 10 minutes
    await cacheService.cacheSearchResults(cacheKey, results, 600)

    Logger.info('Property search performed', {
      filters,
      resultsCount: results.properties.length,
      totalCount: results.total,
    })

    return NextResponse.json(results)
  } catch (error) {
    Logger.error('Property search failed', error as Error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid search parameters', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Property search failed' },
      { status: 500 }
    )
  }
}