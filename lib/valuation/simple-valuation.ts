import { wozScraper, WOZData } from '@/lib/woz-scraper'
import { supabase } from '@/lib/supabase'
import { Logger } from '@/lib/monitoring/logger'

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
      // Get WOZ value through scraping
      const wozResult = await wozScraper.getWOZValue(address, postalCode)
      
      if (!wozResult.success || !wozResult.data) {
        throw new Error(wozResult.error || 'Failed to get WOZ value')
      }

      const wozData = wozResult.data

      // Try to get additional property data from our database or public sources
      const additionalData = await this.getAdditionalPropertyData(address, postalCode)

      return {
        address: wozData.address || address,
        postalCode: wozData.postalCode,
        city: this.extractCityFromPostalCode(postalCode),
        propertyType: wozData.objectType || 'Woning',
        squareMeters: wozData.surfaceArea || additionalData?.squareMeters,
        wozValue: wozData.wozValue,
        constructionYear: additionalData?.constructionYear,
        energyLabel: additionalData?.energyLabel,
        coordinates: additionalData?.coordinates
      }
    } catch (error) {
      Logger.error('Failed to get property data', error as Error, { address, postalCode })
      return null
    }
  }

  async calculateValuation(propertyData: SimplePropertyData): Promise<SimpleValuation> {
    try {
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

      // Store valuation in database
      await this.storeValuation(propertyData, {
        estimatedValue: Math.round(estimatedValue),
        confidenceScore,
        wozValue: baseValue,
        marketMultiplier,
        factors,
        lastUpdated: new Date().toISOString(),
        dataSource: 'WOZ + Market Analysis'
      })

      return {
        estimatedValue: Math.round(estimatedValue),
        confidenceScore,
        wozValue: baseValue,
        marketMultiplier,
        factors,
        lastUpdated: new Date().toISOString(),
        dataSource: 'WOZ + Market Analysis'
      }
    } catch (error) {
      Logger.error('Valuation calculation failed', error as Error)
      throw new Error('Failed to calculate property valuation')
    }
  }

  private async getMarketMultiplier(postalCode: string): Promise<number> {
    try {
      // Get recent market data from our database
      const { data, error } = await supabase
        .from('market_data_cache')
        .select('market_multiplier')
        .eq('postal_code_area', postalCode.substring(0, 4))
        .gte('updated_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 7 days
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (data && !error) {
        return data.market_multiplier
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
    
    // Major cities typically have higher multipliers
    const cityMultipliers: Record<string, number> = {
      '1000': 1.25, // Amsterdam center
      '1001': 1.25, '1002': 1.25, '1003': 1.25, '1004': 1.25, '1005': 1.25,
      '1010': 1.20, '1011': 1.20, '1012': 1.20, '1013': 1.20, '1014': 1.20,
      '3000': 1.18, // Rotterdam center
      '3001': 1.18, '3002': 1.18, '3003': 1.18, '3004': 1.18, '3005': 1.18,
      '2500': 1.16, // Den Haag center
      '2501': 1.16, '2502': 1.16, '2503': 1.16, '2504': 1.16, '2505': 1.16,
      '3500': 1.14, // Utrecht center
      '3501': 1.14, '3502': 1.14, '3503': 1.14, '3504': 1.14, '3505': 1.14,
    }

    const multiplier = cityMultipliers[area] || 1.12 // Default 12% above WOZ

    // Cache this multiplier
    await supabase
      .from('market_data_cache')
      .upsert({
        postal_code_area: area,
        market_multiplier: multiplier,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'postal_code_area'
      })

    return multiplier
  }

  private getEnergyLabelAdjustment(energyLabel: string): number {
    const adjustments: Record<string, number> = {
      'A+++': 0.08, 'A++': 0.06, 'A+': 0.04, 'A': 0.02,
      'B': 0.0, 'C': -0.02, 'D': -0.04, 'E': -0.06, 'F': -0.08, 'G': -0.10
    }
    return adjustments[energyLabel] || 0
  }

  private getAgeAdjustment(constructionYear: number): number {
    const currentYear = new Date().getFullYear()
    const age = currentYear - constructionYear

    if (age < 5) return 0.05 // New construction premium
    if (age < 15) return 0.02 // Modern construction
    if (age < 30) return 0.0 // Standard
    if (age < 50) return -0.02 // Older construction
    if (age < 80) return -0.05 // Old construction
    return -0.08 // Very old construction
  }

  private async getLocationAdjustment(postalCode: string): Promise<number> {
    // Simple location adjustment based on postal code
    const area = postalCode.substring(0, 4)
    
    // Premium areas get positive adjustment
    const premiumAreas = ['1000', '1001', '1002', '1003', '1004', '1005', '1010', '1011', '1012']
    if (premiumAreas.includes(area)) {
      return 0.05 // 5% premium for premium areas
    }

    return 0 // No adjustment for other areas
  }

  private calculateConfidenceScore(propertyData: SimplePropertyData, factors: ValuationFactor[]): number {
    let confidence = 0.7 // Base confidence for WOZ-based valuation

    // Increase confidence if we have more property data
    if (propertyData.squareMeters) confidence += 0.1
    if (propertyData.constructionYear) confidence += 0.05
    if (propertyData.energyLabel) confidence += 0.05
    if (propertyData.coordinates) confidence += 0.05

    // Adjust based on number of factors
    confidence += Math.min(0.05, factors.length * 0.01)

    return Math.min(0.95, Math.max(0.5, confidence))
  }

  private async getAdditionalPropertyData(address: string, postalCode: string): Promise<any> {
    try {
      // Try to get data from our existing database
      const { data, error } = await supabase
        .from('properties')
        .select('square_meters, construction_year, energy_label')
        .ilike('address', `%${address}%`)
        .eq('postal_code', postalCode)
        .limit(1)
        .single()

      if (data && !error) {
        return {
          squareMeters: data.square_meters,
          constructionYear: data.construction_year,
          energyLabel: data.energy_label
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
      '1000': 'Amsterdam', '1001': 'Amsterdam', '1002': 'Amsterdam', '1003': 'Amsterdam',
      '1004': 'Amsterdam', '1005': 'Amsterdam', '1010': 'Amsterdam', '1011': 'Amsterdam',
      '1012': 'Amsterdam', '1013': 'Amsterdam', '1014': 'Amsterdam', '1015': 'Amsterdam',
      '3000': 'Rotterdam', '3001': 'Rotterdam', '3002': 'Rotterdam', '3003': 'Rotterdam',
      '3004': 'Rotterdam', '3005': 'Rotterdam', '3010': 'Rotterdam', '3011': 'Rotterdam',
      '2500': 'Den Haag', '2501': 'Den Haag', '2502': 'Den Haag', '2503': 'Den Haag',
      '2504': 'Den Haag', '2505': 'Den Haag', '2510': 'Den Haag', '2511': 'Den Haag',
      '3500': 'Utrecht', '3501': 'Utrecht', '3502': 'Utrecht', '3503': 'Utrecht',
      '3504': 'Utrecht', '3505': 'Utrecht', '3510': 'Utrecht', '3511': 'Utrecht',
    }

    return cityMapping[area] || 'Nederland'
  }

  private async storeValuation(propertyData: SimplePropertyData, valuation: SimpleValuation): Promise<void> {
    try {
      const { error } = await supabase
        .from('valuations')
        .insert({
          address: propertyData.address,
          postal_code: propertyData.postalCode,
          city: propertyData.city,
          estimated_value: valuation.estimatedValue,
          confidence_score: valuation.confidenceScore,
          property_details: {
            wozValue: valuation.wozValue,
            marketMultiplier: valuation.marketMultiplier,
            propertyType: propertyData.propertyType,
            squareMeters: propertyData.squareMeters,
            constructionYear: propertyData.constructionYear,
            energyLabel: propertyData.energyLabel
          },
          comparable_sales: [], // Empty for now
          user_id: null // Anonymous valuation
        })

      if (error) {
        Logger.error('Failed to store valuation', error)
      }
    } catch (error) {
      Logger.error('Failed to store valuation', error as Error)
    }
  }
}

export const simpleValuationEngine = new SimpleValuationEngine()