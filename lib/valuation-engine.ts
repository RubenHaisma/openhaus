// Advanced European Property Valuation Engine
// Replicates Opendoor's AVM (Automated Valuation Model) for European markets

import { EuropeanPropertyData } from './european-data-providers'

export interface ValuationInput {
  propertyData: EuropeanPropertyData
  marketConditions: MarketConditions
  comparableSales: ComparableSale[]
  userInputs?: UserPropertyInputs
}

export interface MarketConditions {
  country: string
  region: string
  averagePriceChange: number // Percentage change over last 12 months
  inventory: number // Number of properties for sale
  daysOnMarket: number // Average days on market
  seasonalFactor: number // Seasonal adjustment factor
  economicIndicators: {
    interestRates: number
    unemploymentRate: number
    gdpGrowth: number
  }
}

export interface ComparableSale {
  address: string
  salePrice: number
  saleDate: string
  squareMeters: number
  bedrooms: number
  bathrooms: number
  propertyType: string
  distance: number // Distance in km from subject property
  adjustments: PropertyAdjustment[]
}

export interface PropertyAdjustment {
  factor: string
  adjustment: number // Percentage adjustment
  reason: string
}

export interface UserPropertyInputs {
  condition: 'excellent' | 'good' | 'average' | 'poor'
  renovations: string[]
  uniqueFeatures: string[]
  marketingTimePreference: 'immediate' | 'normal' | 'patient'
}

export interface ValuationResult {
  estimatedValue: number
  confidenceScore: number // 0-1 scale
  valueRange: {
    low: number
    high: number
  }
  pricePerSquareMeter: number
  comparableAnalysis: ComparableAnalysis
  marketInsights: MarketInsights
  recommendations: string[]
}

export interface ComparableAnalysis {
  averagePrice: number
  medianPrice: number
  priceRange: { low: number; high: number }
  adjustmentsSummary: PropertyAdjustment[]
}

export interface MarketInsights {
  marketTrend: 'hot' | 'warm' | 'balanced' | 'cool' | 'cold'
  competitivePosition: 'above' | 'at' | 'below'
  timeToSell: number // Estimated days
  priceOptimization: {
    quickSale: number // Price for 30-day sale
    marketPrice: number // Price for normal timeline
    maximumPrice: number // Price for patient seller
  }
}

export class EuropeanValuationEngine {
  private countryFactors: Map<string, CountryFactors> = new Map()

  constructor() {
    this.initializeCountryFactors()
  }

  async calculateValuation(input: ValuationInput): Promise<ValuationResult> {
    const { propertyData, marketConditions, comparableSales, userInputs } = input
    
    // Step 1: Base valuation from comparable sales
    const baseValuation = this.calculateBaseValuation(propertyData, comparableSales)
    
    // Step 2: Apply market adjustments
    const marketAdjustedValue = this.applyMarketAdjustments(baseValuation, marketConditions)
    
    // Step 3: Apply property-specific adjustments
    const propertyAdjustedValue = this.applyPropertyAdjustments(
      marketAdjustedValue, 
      propertyData, 
      userInputs
    )
    
    // Step 4: Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      propertyData, 
      comparableSales, 
      marketConditions
    )
    
    // Step 5: Generate value range
    const valueRange = this.calculateValueRange(propertyAdjustedValue, confidenceScore)
    
    // Step 6: Analyze comparables
    const comparableAnalysis = this.analyzeComparables(comparableSales, propertyData)
    
    // Step 7: Generate market insights
    const marketInsights = this.generateMarketInsights(
      propertyAdjustedValue, 
      marketConditions, 
      comparableSales
    )
    
    return {
      estimatedValue: Math.round(propertyAdjustedValue),
      confidenceScore,
      valueRange: {
        low: Math.round(valueRange.low),
        high: Math.round(valueRange.high)
      },
      pricePerSquareMeter: Math.round(propertyAdjustedValue / propertyData.propertyDetails.squareMeters!),
      comparableAnalysis,
      marketInsights,
      recommendations: this.generateRecommendations(propertyAdjustedValue, marketInsights)
    }
  }

  private calculateBaseValuation(
    propertyData: EuropeanPropertyData, 
    comparableSales: ComparableSale[]
  ): number {
    if (comparableSales.length === 0) {
      // Fallback to existing market data
      return propertyData.marketData.estimatedValue
    }

    // Weight comparables by similarity and recency
    let weightedSum = 0
    let totalWeight = 0

    for (const comp of comparableSales) {
      const similarity = this.calculateSimilarityScore(propertyData, comp)
      const recency = this.calculateRecencyWeight(comp.saleDate)
      const distance = this.calculateDistanceWeight(comp.distance)
      
      const weight = similarity * recency * distance
      const adjustedPrice = this.applyComparableAdjustments(comp)
      
      weightedSum += adjustedPrice * weight
      totalWeight += weight
    }

    return totalWeight > 0 ? weightedSum / totalWeight : propertyData.marketData.estimatedValue
  }

  private calculateSimilarityScore(
    propertyData: EuropeanPropertyData, 
    comparable: ComparableSale
  ): number {
    let score = 1.0

    // Property type match
    if (propertyData.propertyDetails.type !== comparable.propertyType) {
      score *= 0.8
    }

    // Size similarity (within 20% gets full score)
    const sizeDiff = Math.abs(
      (propertyData.propertyDetails.squareMeters! - comparable.squareMeters) / 
      propertyData.propertyDetails.squareMeters!
    )
    if (sizeDiff > 0.2) {
      score *= Math.max(0.5, 1 - sizeDiff)
    }

    // Bedroom similarity
    if (propertyData.propertyDetails.bedrooms && comparable.bedrooms) {
      const bedroomDiff = Math.abs(propertyData.propertyDetails.bedrooms - comparable.bedrooms)
      score *= Math.max(0.7, 1 - (bedroomDiff * 0.1))
    }

    return score
  }

  private calculateRecencyWeight(saleDate: string): number {
    const monthsAgo = (Date.now() - new Date(saleDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
    
    if (monthsAgo <= 3) return 1.0
    if (monthsAgo <= 6) return 0.9
    if (monthsAgo <= 12) return 0.8
    if (monthsAgo <= 24) return 0.6
    return 0.4
  }

  private calculateDistanceWeight(distance: number): number {
    if (distance <= 0.5) return 1.0
    if (distance <= 1.0) return 0.9
    if (distance <= 2.0) return 0.8
    if (distance <= 5.0) return 0.6
    return 0.4
  }

  private applyComparableAdjustments(comparable: ComparableSale): number {
    let adjustedPrice = comparable.salePrice

    for (const adjustment of comparable.adjustments) {
      adjustedPrice *= (1 + adjustment.adjustment / 100)
    }

    return adjustedPrice
  }

  private applyMarketAdjustments(baseValue: number, marketConditions: MarketConditions): number {
    let adjustedValue = baseValue

    // Apply market trend adjustment
    adjustedValue *= (1 + marketConditions.averagePriceChange / 100)

    // Apply seasonal adjustment
    adjustedValue *= marketConditions.seasonalFactor

    // Apply supply/demand adjustment based on inventory
    if (marketConditions.inventory < 3) {
      adjustedValue *= 1.05 // Low inventory = higher prices
    } else if (marketConditions.inventory > 6) {
      adjustedValue *= 0.95 // High inventory = lower prices
    }

    return adjustedValue
  }

  private applyPropertyAdjustments(
    baseValue: number, 
    propertyData: EuropeanPropertyData, 
    userInputs?: UserPropertyInputs
  ): number {
    let adjustedValue = baseValue

    if (userInputs) {
      // Condition adjustment
      switch (userInputs.condition) {
        case 'excellent':
          adjustedValue *= 1.1
          break
        case 'good':
          adjustedValue *= 1.0
          break
        case 'average':
          adjustedValue *= 0.95
          break
        case 'poor':
          adjustedValue *= 0.85
          break
      }

      // Renovation adjustments
      const renovationValue = userInputs.renovations.length * 0.02 // 2% per renovation
      adjustedValue *= (1 + renovationValue)
    }

    // Energy efficiency adjustment (European specific)
    if (propertyData.propertyDetails.energyLabel) {
      const energyAdjustment = this.getEnergyLabelAdjustment(
        propertyData.propertyDetails.energyLabel
      )
      adjustedValue *= (1 + energyAdjustment)
    }

    return adjustedValue
  }

  private getEnergyLabelAdjustment(energyLabel: string): number {
    const adjustments: Record<string, number> = {
      'A+++': 0.08,
      'A++': 0.06,
      'A+': 0.04,
      'A': 0.02,
      'B': 0.0,
      'C': -0.02,
      'D': -0.04,
      'E': -0.06,
      'F': -0.08,
      'G': -0.10
    }
    return adjustments[energyLabel] || 0
  }

  private calculateConfidenceScore(
    propertyData: EuropeanPropertyData,
    comparableSales: ComparableSale[],
    marketConditions: MarketConditions
  ): number {
    let confidence = 0.5 // Base confidence

    // More comparables = higher confidence
    if (comparableSales.length >= 5) confidence += 0.2
    else if (comparableSales.length >= 3) confidence += 0.15
    else if (comparableSales.length >= 1) confidence += 0.1

    // Recent comparables = higher confidence
    const recentComps = comparableSales.filter(comp => {
      const monthsAgo = (Date.now() - new Date(comp.saleDate).getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsAgo <= 6
    })
    confidence += Math.min(0.2, recentComps.length * 0.05)

    // Market stability = higher confidence
    if (Math.abs(marketConditions.averagePriceChange) < 5) {
      confidence += 0.1
    }

    // Property data completeness
    const dataCompleteness = this.calculateDataCompleteness(propertyData)
    confidence += dataCompleteness * 0.2

    return Math.min(0.95, Math.max(0.3, confidence))
  }

  private calculateDataCompleteness(propertyData: EuropeanPropertyData): number {
    const fields = [
      propertyData.propertyDetails.squareMeters,
      propertyData.propertyDetails.bedrooms,
      propertyData.propertyDetails.bathrooms,
      propertyData.propertyDetails.constructionYear,
      propertyData.propertyDetails.energyLabel,
      propertyData.address.coordinates
    ]

    const completedFields = fields.filter(field => field !== undefined && field !== null).length
    return completedFields / fields.length
  }

  private calculateValueRange(estimatedValue: number, confidenceScore: number): { low: number; high: number } {
    const margin = (1 - confidenceScore) * 0.15 // Max 15% margin for low confidence
    
    return {
      low: estimatedValue * (1 - margin),
      high: estimatedValue * (1 + margin)
    }
  }

  private analyzeComparables(
    comparableSales: ComparableSale[],
    propertyData: EuropeanPropertyData
  ): ComparableAnalysis {
    const prices = comparableSales.map(comp => comp.salePrice)
    
    return {
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      medianPrice: this.calculateMedian(prices),
      priceRange: {
        low: Math.min(...prices),
        high: Math.max(...prices)
      },
      adjustmentsSummary: this.summarizeAdjustments(comparableSales)
    }
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 
      ? (sorted[mid - 1] + sorted[mid]) / 2 
      : sorted[mid]
  }

  private summarizeAdjustments(comparableSales: ComparableSale[]): PropertyAdjustment[] {
    const adjustmentMap = new Map<string, { total: number; count: number }>()

    for (const comp of comparableSales) {
      for (const adj of comp.adjustments) {
        const existing = adjustmentMap.get(adj.factor) || { total: 0, count: 0 }
        adjustmentMap.set(adj.factor, {
          total: existing.total + adj.adjustment,
          count: existing.count + 1
        })
      }
    }

    return Array.from(adjustmentMap.entries()).map(([factor, data]) => ({
      factor,
      adjustment: data.total / data.count,
      reason: `Average adjustment across ${data.count} comparables`
    }))
  }

  private generateMarketInsights(
    estimatedValue: number,
    marketConditions: MarketConditions,
    comparableSales: ComparableSale[]
  ): MarketInsights {
    const marketTrend = this.determineMarketTrend(marketConditions)
    const competitivePosition = this.determineCompetitivePosition(estimatedValue, comparableSales)
    
    return {
      marketTrend,
      competitivePosition,
      timeToSell: this.estimateTimeToSell(marketConditions, competitivePosition),
      priceOptimization: {
        quickSale: estimatedValue * 0.95,
        marketPrice: estimatedValue,
        maximumPrice: estimatedValue * 1.05
      }
    }
  }

  private determineMarketTrend(marketConditions: MarketConditions): 'hot' | 'warm' | 'balanced' | 'cool' | 'cold' {
    const { averagePriceChange, daysOnMarket, inventory } = marketConditions

    if (averagePriceChange > 10 && daysOnMarket < 30 && inventory < 3) return 'hot'
    if (averagePriceChange > 5 && daysOnMarket < 45 && inventory < 4) return 'warm'
    if (averagePriceChange > -2 && daysOnMarket < 60 && inventory < 6) return 'balanced'
    if (averagePriceChange > -5 && daysOnMarket < 90) return 'cool'
    return 'cold'
  }

  private determineCompetitivePosition(
    estimatedValue: number, 
    comparableSales: ComparableSale[]
  ): 'above' | 'at' | 'below' {
    if (comparableSales.length === 0) return 'at'

    const averagePrice = comparableSales.reduce((sum, comp) => sum + comp.salePrice, 0) / comparableSales.length
    const difference = (estimatedValue - averagePrice) / averagePrice

    if (difference > 0.05) return 'above'
    if (difference < -0.05) return 'below'
    return 'at'
  }

  private estimateTimeToSell(
    marketConditions: MarketConditions, 
    competitivePosition: 'above' | 'at' | 'below'
  ): number {
    let baseTime = marketConditions.daysOnMarket

    switch (competitivePosition) {
      case 'below':
        baseTime *= 0.8
        break
      case 'above':
        baseTime *= 1.3
        break
    }

    return Math.round(baseTime)
  }

  private generateRecommendations(
    estimatedValue: number, 
    marketInsights: MarketInsights
  ): string[] {
    const recommendations: string[] = []

    if (marketInsights.marketTrend === 'hot') {
      recommendations.push('Markt is zeer actief - overweeg om snel te handelen')
      recommendations.push('Prijzen stijgen snel - je timing is uitstekend')
    }

    if (marketInsights.competitivePosition === 'above') {
      recommendations.push('Je woning is hoger geprijsd dan vergelijkbare woningen')
      recommendations.push('Overweeg een lagere vraagprijs voor snellere verkoop')
    }

    if (marketInsights.timeToSell > 90) {
      recommendations.push('Verwachte verkooptijd is lang - overweeg marketing verbeteringen')
    }

    return recommendations
  }

  private initializeCountryFactors(): void {
    // Initialize country-specific factors for valuation adjustments
    this.countryFactors.set('NL', {
      transactionCosts: 0.08, // 8% transaction costs in Netherlands
      taxRate: 0.02, // 2% transfer tax
      marketVolatility: 0.15,
      seasonalVariation: 0.05
    })

    this.countryFactors.set('UK', {
      transactionCosts: 0.05,
      taxRate: 0.03, // Stamp duty
      marketVolatility: 0.12,
      seasonalVariation: 0.08
    })

    this.countryFactors.set('DE', {
      transactionCosts: 0.10,
      taxRate: 0.035,
      marketVolatility: 0.10,
      seasonalVariation: 0.03
    })

    this.countryFactors.set('FR', {
      transactionCosts: 0.08,
      taxRate: 0.055,
      marketVolatility: 0.13,
      seasonalVariation: 0.06
    })
  }
}

interface CountryFactors {
  transactionCosts: number
  taxRate: number
  marketVolatility: number
  seasonalVariation: number
}

export const europeanValuationEngine = new EuropeanValuationEngine()