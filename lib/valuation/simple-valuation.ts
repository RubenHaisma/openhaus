import { wozScraper, WOZData } from '@/lib/woz-scraper'
import { prisma } from '@/lib/prisma'
import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

export interface SimplePropertyData {
  address: string
  postalCode: string
  city: string
  propertyType: string
  constructionYear?: number
  squareMeters?: number
  energyLabel?: string
  wozValue: number
  coordinates?: {
    lat: number
    lng: number
  }
  // New WOZ fields
  grondOppervlakte?: string
  bouwjaar?: string
  gebruiksdoel?: string
  oppervlakte?: string
  identificatie?: string
  adresseerbaarObject?: string
  nummeraanduiding?: string
  wozValues?: Array<{ date: string, value: string }>
}

export interface SimpleValuation {
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

export class SimpleValuationEngine {
  async getPropertyData(address: string, postalCode: string): Promise<SimplePropertyData | null> {
    try {
      // Create cache key for property data
      const cacheKey = `property:${address}:${postalCode.replace(/\s/g, '').toUpperCase()}`
      
      // Check cache first for faster response
      const cachedProperty = await cacheService.get<SimplePropertyData>(cacheKey, 'property')
      if (cachedProperty) {
        Logger.info('Property data retrieved from cache', { address, postalCode })
        return cachedProperty
      }

      // Get WOZ value through scraping
      const wozResult = await wozScraper.getWOZValue(address, postalCode)
      
      if (!wozResult.success || !wozResult.data) {
        throw new Error(wozResult.error || 'Failed to get WOZ value')
      }

      const wozData = wozResult.data

      // Try to get additional property data from our database or public sources
      const additionalData = await this.getAdditionalPropertyData(address, postalCode)

      const propertyData: SimplePropertyData = {
        address: wozData.address || address,
        postalCode: wozData.postalCode,
        city: this.extractCityFromPostalCode(postalCode),
        propertyType: wozData.objectType || 'Woning',
        squareMeters: wozData.surfaceArea || additionalData?.squareMeters,
        wozValue: wozData.wozValue,
        constructionYear: additionalData?.constructionYear,
        energyLabel: additionalData?.energyLabel,
        coordinates: additionalData?.coordinates,
        // Pass through new WOZ fields
        grondOppervlakte: wozData.grondOppervlakte,
        bouwjaar: wozData.bouwjaar,
        gebruiksdoel: wozData.gebruiksdoel,
        oppervlakte: wozData.oppervlakte,
        identificatie: wozData.identificatie,
        adresseerbaarObject: wozData.adresseerbaarObject,
        nummeraanduiding: wozData.nummeraanduiding,
        wozValues: wozData.wozValues
      }
      
      // Cache property data for 1 hour
      await cacheService.set(cacheKey, propertyData, { ttl: 3600, prefix: 'property' })
      
      return propertyData
    } catch (error) {
      Logger.error('Failed to get property data', error as Error, { address, postalCode })
      return null
    }
  }

  async calculateValuation(propertyData: SimplePropertyData): Promise<SimpleValuation> {
    try {
      // Create cache key for valuation
      const cacheKey = `valuation:${propertyData.address}:${propertyData.postalCode}`
      
      // Check cache first
      const cachedValuation = await cacheService.get<SimpleValuation>(cacheKey, 'valuation')
      if (cachedValuation) {
        Logger.info('Valuation retrieved from cache', { address: propertyData.address })
        return cachedValuation
      }

      // Base valuation on WOZ value with market adjustments
      const baseValue = propertyData.wozValue
      
      // Get market multiplier based on current market conditions
      const marketMultiplier = await this.getMarketMultiplier(propertyData.postalCode)
      
      // Calculate estimated market value
      let estimatedValue = baseValue * marketMultiplier
      
      // Apply property-specific adjustments
      const factors: ValuationFactor[] = []
      
      // Energy label adjustment
      if (propertyData.energyLabel) {
        const energyAdjustment = this.getEnergyLabelAdjustment(propertyData.energyLabel)
        estimatedValue *= (1 + energyAdjustment)
        factors.push({
          factor: 'Energielabel',
          impact: energyAdjustment * 100,
          description: `Energielabel ${propertyData.energyLabel}`
        })
      }

      // Age adjustment
      if (propertyData.constructionYear) {
        const ageAdjustment = this.getAgeAdjustment(propertyData.constructionYear)
        estimatedValue *= (1 + ageAdjustment)
        factors.push({
          factor: 'Bouwjaar',
          impact: ageAdjustment * 100,
          description: `Gebouwd in ${propertyData.constructionYear}`
        })
      }

      // Location adjustment based on postal code
      const locationAdjustment = await this.getLocationAdjustment(propertyData.postalCode)
      estimatedValue *= (1 + locationAdjustment)
      factors.push({
        factor: 'Locatie',
        impact: locationAdjustment * 100,
        description: `Locatiefactor voor ${propertyData.postalCode}`
      })

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore(propertyData, factors)

      const valuation: SimpleValuation = {
        estimatedValue: Math.round(estimatedValue),
        confidenceScore,
        wozValue: baseValue,
        marketMultiplier,
        factors,
        lastUpdated: new Date().toISOString(),
        dataSource: 'WOZ + Market Analysis'
      }
      
      // Cache valuation for 30 minutes
      await cacheService.set(cacheKey, valuation, { ttl: 1800, prefix: 'valuation' })
      
      // Store valuation in database (async, don't wait)
      this.storeValuation(propertyData, valuation).catch(error => {
        Logger.error('Failed to store valuation in database', error)
      })

      return valuation
    } catch (error) {
      Logger.error('Valuation calculation failed', error as Error)
      throw new Error('Failed to calculate property valuation')
    }
  }

  private async getMarketMultiplier(postalCode: string): Promise<number> {
    try {
      // Check Redis cache first
      const cacheKey = `market:${postalCode.substring(0, 4)}`
      const cachedMultiplier = await cacheService.get<number>(cacheKey, 'market')
      if (cachedMultiplier) {
        return cachedMultiplier
      }

      // Get recent market data from our database
      const data = await prisma.marketDataCache.findFirst({
        where: {
          postalCodeArea: postalCode.substring(0, 4),
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours for more current data
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })

      if (data) {
        const multiplier = Number(data.marketMultiplier)
        // Cache in Redis for 1 hour
        await cacheService.set(cacheKey, multiplier, { ttl: 3600, prefix: 'market' })
        return multiplier
      }

      // Fallback: calculate based on general market trends
      return await this.calculateDefaultMarketMultiplier(postalCode)
    } catch (error) {
      Logger.error('Failed to get market multiplier', error as Error)
      return 1.15 // Default 15% above WOZ
    }
  }

  private async calculateDefaultMarketMultiplier(postalCode: string): Promise<number> {
    // Simple market multiplier based on postal code area
    const area = postalCode.substring(0, 4)
    
    // Updated multipliers based on 2024 market data
    const cityMultipliers: Record<string, number> = {
      // Amsterdam (higher multipliers due to strong market)
      '1000': 1.28, '1001': 1.28, '1002': 1.28, '1003': 1.28, '1004': 1.28, '1005': 1.28,
      '1010': 1.25, '1011': 1.25, '1012': 1.25, '1013': 1.25, '1014': 1.25, '1015': 1.25,
      '1016': 1.22, '1017': 1.22, '1018': 1.22, '1019': 1.22,
      
      // Rotterdam
      '3000': 1.20, '3001': 1.20, '3002': 1.20, '3003': 1.20, '3004': 1.20, '3005': 1.20,
      '3010': 1.18, '3011': 1.18, '3012': 1.18, '3013': 1.18, '3014': 1.18,
      
      // Den Haag
      '2500': 1.18, '2501': 1.18, '2502': 1.18, '2503': 1.18, '2504': 1.18, '2505': 1.18,
      '2510': 1.16, '2511': 1.16, '2512': 1.16, '2513': 1.16, '2514': 1.16,
      
      // Utrecht
      '3500': 1.16, '3501': 1.16, '3502': 1.16, '3503': 1.16, '3504': 1.16, '3505': 1.16,
      '3510': 1.14, '3511': 1.14, '3512': 1.14, '3513': 1.14, '3514': 1.14,
      
      // Other major cities
      '5600': 1.12, // Eindhoven
      '9700': 1.10, // Groningen
      '6800': 1.11, // Arnhem
      '7500': 1.09, // Enschede
    }

    const multiplier = cityMultipliers[area] || 1.14 // Default 14% above WOZ (updated for 2024)

    // Cache this multiplier
    await prisma.marketDataCache.upsert({
      where: {
        postalCodeArea: area
      },
      update: {
        marketMultiplier: multiplier,
        updatedAt: new Date()
      },
      create: {
        postalCodeArea: area,
        marketMultiplier: multiplier
      }
      })
    
    // Cache in Redis for 1 hour
    await cacheService.set(`market:${area}`, multiplier, { ttl: 3600, prefix: 'market' })

    return multiplier
  }

  private getEnergyLabelAdjustment(energyLabel: string): number {
    const adjustments: Record<string, number> = {
      'A+++': 0.10, 'A++': 0.08, 'A+': 0.06, 'A': 0.04,
      'B': 0.0, 'C': -0.03, 'D': -0.06, 'E': -0.09, 'F': -0.12, 'G': -0.15
    }
    return adjustments[energyLabel] || 0
  }

  private getAgeAdjustment(constructionYear: number): number {
    const currentYear = new Date().getFullYear()
    const age = currentYear - constructionYear

    if (age < 3) return 0.08 // New construction premium
    if (age < 10) return 0.04 // Very modern construction
    if (age < 20) return 0.02 // Modern construction
    if (age < 30) return 0.0 // Standard
    if (age < 50) return -0.03 // Older construction
    if (age < 80) return -0.06 // Old construction
    return -0.10 // Very old construction
  }

  private async getLocationAdjustment(postalCode: string): Promise<number> {
    // Simple location adjustment based on postal code
    const area = postalCode.substring(0, 4)
    
    // Premium areas get positive adjustment (updated for 2024)
    const premiumAreas = [
      '1000', '1001', '1002', '1003', '1004', '1005', // Amsterdam center
      '1010', '1011', '1012', '1013', '1014', '1015', // Amsterdam canal ring
      '2500', '2501', '2502', '2503', // Den Haag center
      '3500', '3501', '3502', '3503', // Utrecht center
    ]
    if (premiumAreas.includes(area)) {
      return 0.08 // 8% premium for premium areas
    }

    return 0 // No adjustment for other areas
  }

  private calculateConfidenceScore(propertyData: SimplePropertyData, factors: ValuationFactor[]): number {
    let confidence = 0.75 // Base confidence for WOZ-based valuation

    // Increase confidence if we have more property data
    if (propertyData.squareMeters) confidence += 0.08
    if (propertyData.constructionYear) confidence += 0.06
    if (propertyData.energyLabel) confidence += 0.06
    if (propertyData.coordinates) confidence += 0.04

    // Adjust based on number of factors
    confidence += Math.min(0.06, factors.length * 0.015)

    return Math.min(0.92, Math.max(0.6, confidence))
  }

  private async getAdditionalPropertyData(address: string, postalCode: string): Promise<any> {
    try {
      // Try to get data from our existing database
      const data = await prisma.property.findFirst({
        where: {
          address: {
            contains: address,
            mode: 'insensitive'
          },
          postalCode: postalCode
        },
        select: {
          squareMeters: true,
          constructionYear: true,
          energyLabel: true
        }
      })

      if (data) {
        return {
          squareMeters: Number(data.squareMeters),
          constructionYear: data.constructionYear,
          energyLabel: data.energyLabel
        }
      }

      return null
    } catch (error) {
      return null
    }
  }

  private extractCityFromPostalCode(postalCode: string): string {
    // Simple mapping of postal code areas to cities
    const area = postalCode.substring(0, 4)
    const cityMapping: Record<string, string> = {
      // Amsterdam
      '1000': 'Amsterdam', '1001': 'Amsterdam', '1002': 'Amsterdam', '1003': 'Amsterdam',
      '1004': 'Amsterdam', '1005': 'Amsterdam', '1006': 'Amsterdam', '1007': 'Amsterdam',
      '1008': 'Amsterdam', '1009': 'Amsterdam', '1010': 'Amsterdam', '1011': 'Amsterdam',
      '1012': 'Amsterdam', '1013': 'Amsterdam', '1014': 'Amsterdam', '1015': 'Amsterdam',
      '1016': 'Amsterdam', '1017': 'Amsterdam', '1018': 'Amsterdam', '1019': 'Amsterdam',
      
      // Rotterdam
      '3000': 'Rotterdam', '3001': 'Rotterdam', '3002': 'Rotterdam', '3003': 'Rotterdam',
      '3004': 'Rotterdam', '3005': 'Rotterdam', '3006': 'Rotterdam', '3007': 'Rotterdam',
      '3008': 'Rotterdam', '3009': 'Rotterdam', '3010': 'Rotterdam', '3011': 'Rotterdam',
      '3012': 'Rotterdam', '3013': 'Rotterdam', '3014': 'Rotterdam', '3015': 'Rotterdam',
      
      // Den Haag
      '2500': 'Den Haag', '2501': 'Den Haag', '2502': 'Den Haag', '2503': 'Den Haag',
      '2504': 'Den Haag', '2505': 'Den Haag', '2506': 'Den Haag', '2507': 'Den Haag',
      '2508': 'Den Haag', '2509': 'Den Haag', '2510': 'Den Haag', '2511': 'Den Haag',
      '2512': 'Den Haag', '2513': 'Den Haag', '2514': 'Den Haag', '2515': 'Den Haag',
      
      // Utrecht
      '3500': 'Utrecht', '3501': 'Utrecht', '3502': 'Utrecht', '3503': 'Utrecht',
      '3504': 'Utrecht', '3505': 'Utrecht', '3506': 'Utrecht', '3507': 'Utrecht',
      '3508': 'Utrecht', '3509': 'Utrecht', '3510': 'Utrecht', '3511': 'Utrecht',
      '3512': 'Utrecht', '3513': 'Utrecht', '3514': 'Utrecht', '3515': 'Utrecht',
      
      // Other major cities
      '5600': 'Eindhoven', '5601': 'Eindhoven', '5602': 'Eindhoven', '5603': 'Eindhoven',
      '9700': 'Groningen', '9701': 'Groningen', '9702': 'Groningen', '9703': 'Groningen',
      '6800': 'Arnhem', '6801': 'Arnhem', '6802': 'Arnhem', '6803': 'Arnhem',
      '7500': 'Enschede', '7501': 'Enschede', '7502': 'Enschede', '7503': 'Enschede',
    }

    return cityMapping[area] || 'Nederland'
  }

  private async storeValuation(propertyData: SimplePropertyData, valuation: SimpleValuation): Promise<void> {
    try {
      await prisma.valuation.create({
        data: {
          address: propertyData.address,
          postalCode: propertyData.postalCode,
          city: propertyData.city,
          estimatedValue: valuation.estimatedValue,
          confidenceScore: valuation.confidenceScore,
          propertyDetails: {
            wozValue: valuation.wozValue,
            marketMultiplier: valuation.marketMultiplier,
            propertyType: propertyData.propertyType,
            squareMeters: propertyData.squareMeters,
            constructionYear: propertyData.constructionYear,
            energyLabel: propertyData.energyLabel
          },
          comparableSales: [], // Empty for now
          userId: null // Anonymous valuation
        }
        })

    } catch (error) {
      Logger.error('Failed to store valuation', error as Error)
    }
  }
  
  // Performance optimization: batch process multiple valuations
  async batchCalculateValuations(properties: Array<{address: string, postalCode: string}>): Promise<SimpleValuation[]> {
    const results = await Promise.allSettled(
      properties.map(async (prop) => {
        const propertyData = await this.getPropertyData(prop.address, prop.postalCode)
        if (!propertyData) throw new Error('Property data not found')
        return this.calculateValuation(propertyData)
      })
    )
    
    return results
      .filter((result): result is PromiseFulfilledResult<SimpleValuation> => result.status === 'fulfilled')
      .map(result => result.value)
  }
}

export const simpleValuationEngine = new SimpleValuationEngine()