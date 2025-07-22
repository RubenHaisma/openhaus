import { simpleValuationEngine, SimplePropertyData, SimpleValuation } from './valuation/simple-valuation'
import { Logger } from './monitoring/logger'
import { cacheService } from './cache/redis'

// Simple property data interface using WOZ scraping
export interface KadasterProperty {
  address: string
  postalCode: string
  city: string
  propertyType: string
  constructionYear: number
  squareMeters: number
  energyLabel: string
  wozValue: number
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface PropertyValuation {
  estimatedValue: number
  confidenceScore: number
  wozValue: number
  marketMultiplier: number
  factors: ValuationFactor[]
  lastUpdated: string
  dataSource: string
}

export interface ValuationFactor {
  factor: string
  impact: number
  description: string
}

export async function getPropertyData(address: string, postalCode: string): Promise<KadasterProperty | null> {
  try {
    // Performance optimization: check cache first
    const cacheKey = `kadaster:${address}:${postalCode.replace(/\s/g, '').toUpperCase()}`
    const cachedData = await cacheService.get<KadasterProperty>(cacheKey, 'kadaster')
    if (cachedData) {
      Logger.info('Kadaster property data retrieved from cache', { address, postalCode })
      return cachedData
    }

    Logger.info('Getting property data via WOZ scraping', { address, postalCode })
    
    // Get property data using WOZ scraping
    const propertyData = await simpleValuationEngine.getPropertyData(address, postalCode)
    if (!propertyData) {
      throw new Error('Property not found or WOZ value unavailable')
    }

    const kadasterProperty: KadasterProperty = {
      address: propertyData.address,
      postalCode: propertyData.postalCode,
      city: propertyData.city,
      propertyType: propertyData.propertyType,
      constructionYear: propertyData.constructionYear || 1980,
      squareMeters: propertyData.squareMeters || 120,
      energyLabel: propertyData.energyLabel || 'C',
      wozValue: propertyData.wozValue,
      coordinates: propertyData.coordinates
    }
    
    // Cache for 2 hours
    await cacheService.set(cacheKey, kadasterProperty, { ttl: 7200, prefix: 'kadaster' })
    
    return kadasterProperty
  } catch (error) {
    Logger.error('Property data retrieval failed', error as Error, { address, postalCode })
    throw new Error(`Failed to retrieve property data: ${error.message}`)
  }
}

export async function calculateValuation(propertyData: KadasterProperty): Promise<PropertyValuation> {
  try {
    // Performance optimization: check cache first
    const cacheKey = `valuation:${propertyData.address}:${propertyData.postalCode}`
    const cachedValuation = await cacheService.get<PropertyValuation>(cacheKey, 'valuation')
    if (cachedValuation) {
      Logger.info('Valuation retrieved from cache', { address: propertyData.address })
      return cachedValuation
    }

    Logger.info('Calculating valuation using simple engine', { 
      address: propertyData.address, 
      wozValue: propertyData.wozValue 
    })
    
    // Convert to SimplePropertyData format
    const simplePropertyData: SimplePropertyData = {
      address: propertyData.address,
      postalCode: propertyData.postalCode,
      city: propertyData.city,
      propertyType: propertyData.propertyType,
      constructionYear: propertyData.constructionYear,
      squareMeters: propertyData.squareMeters,
      energyLabel: propertyData.energyLabel,
      wozValue: propertyData.wozValue,
      coordinates: propertyData.coordinates
    }
    
    // Calculate valuation using simple engine
    const valuation = await simpleValuationEngine.calculateValuation(simplePropertyData)
    
    const propertyValuation: PropertyValuation = {
      estimatedValue: valuation.estimatedValue,
      confidenceScore: valuation.confidenceScore,
      wozValue: valuation.wozValue,
      marketMultiplier: valuation.marketMultiplier,
      factors: valuation.factors,
      lastUpdated: valuation.lastUpdated,
      dataSource: valuation.dataSource
    }
    
    // Cache for 30 minutes
    await cacheService.set(cacheKey, propertyValuation, { ttl: 1800, prefix: 'valuation' })
    
    return propertyValuation
  } catch (error) {
    Logger.error('Valuation calculation failed', error as Error)
    throw new Error(`Failed to calculate valuation: ${error.message}`)
  }
}

// Helper function to clean up WOZ scraper resources
export async function cleanupResources(): Promise<void> {
  const { wozScraper } = await import('./woz-scraper')
  await wozScraper.cleanup()
}