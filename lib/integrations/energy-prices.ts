import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

export interface EnergyPrice {
  type: 'gas' | 'electricity'
  pricePerUnit: number
  unit: string
  supplier: string
  tariffType: 'variable' | 'fixed'
  contractDuration: number
  validFrom: string
  validUntil: string
  region?: string
}

export interface PriceForecast {
  type: 'gas' | 'electricity'
  currentPrice: number
  forecast3Months: number
  forecast6Months: number
  forecast12Months: number
  confidence: number
  factors: string[]
  lastUpdated: string
}

export interface RegionalPrices {
  region: string
  gasPrice: number
  electricityPrice: number
  averageMonthlyBill: number
  priceComparison: {
    national: number
    regional: number
    difference: number
  }
}

export interface EnergyMarketData {
  currentPrices: EnergyPrice[]
  forecasts: PriceForecast[]
  marketTrends: {
    gasPrice: { trend: 'up' | 'down' | 'stable', percentage: number }
    electricityPrice: { trend: 'up' | 'down' | 'stable', percentage: number }
  }
  lastUpdated: string
}

export class EnergyPriceService {
  private baseUrl = process.env.ENERGY_PRICE_API_URL || 'https://api.energieprijs.nl/v1'
  private apiKey = process.env.ENERGY_PRICE_API_KEY

  constructor() {
    if (!this.apiKey) {
      Logger.warn('Energy Price API key not configured - using mock data')
    }
  }

  async getCurrentGasPrices(): Promise<EnergyPrice[]> {
    try {
      const cached = await cacheService.get<EnergyPrice[]>('gas-prices', 'energy')
      if (cached) return cached

      if (!this.apiKey) {
        return this.getMockGasPrices()
      }

      const response = await fetch(`${this.baseUrl}/prices/gas`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Energy Price API error: ${response.status}`)
      }

      const data = await response.json()
      const prices = this.transformPriceData(data, 'gas')

      // Cache for 1 hour
      await cacheService.set('gas-prices', prices, { ttl: 3600, prefix: 'energy' })

      return prices
    } catch (error) {
      Logger.error('Failed to fetch gas prices', error as Error)
      return this.getMockGasPrices()
    }
  }

  async getCurrentElectricityPrices(): Promise<EnergyPrice[]> {
    try {
      const cached = await cacheService.get<EnergyPrice[]>('electricity-prices', 'energy')
      if (cached) return cached

      if (!this.apiKey) {
        return this.getMockElectricityPrices()
      }

      const response = await fetch(`${this.baseUrl}/prices/electricity`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Energy Price API error: ${response.status}`)
      }

      const data = await response.json()
      const prices = this.transformPriceData(data, 'electricity')

      // Cache for 1 hour
      await cacheService.set('electricity-prices', prices, { ttl: 3600, prefix: 'energy' })

      return prices
    } catch (error) {
      Logger.error('Failed to fetch electricity prices', error as Error)
      return this.getMockElectricityPrices()
    }
  }

  async getPriceForecasts(): Promise<PriceForecast[]> {
    try {
      const cached = await cacheService.get<PriceForecast[]>('price-forecasts', 'energy')
      if (cached) return cached

      if (!this.apiKey) {
        return this.getMockPriceForecasts()
      }

      const response = await fetch(`${this.baseUrl}/forecasts`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Energy Price API error: ${response.status}`)
      }

      const data = await response.json()
      const forecasts = this.transformForecastData(data)

      // Cache for 6 hours
      await cacheService.set('price-forecasts', forecasts, { ttl: 21600, prefix: 'energy' })

      return forecasts
    } catch (error) {
      Logger.error('Failed to fetch price forecasts', error as Error)
      return this.getMockPriceForecasts()
    }
  }

  async getRegionalPrices(region: string): Promise<RegionalPrices> {
    try {
      const cacheKey = `regional-prices:${region}`
      const cached = await cacheService.get<RegionalPrices>(cacheKey, 'energy')
      if (cached) return cached

      if (!this.apiKey) {
        return this.getMockRegionalPrices(region)
      }

      const response = await fetch(`${this.baseUrl}/prices/regional/${region}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Energy Price API error: ${response.status}`)
      }

      const data = await response.json()
      const regionalPrices = this.transformRegionalData(data)

      // Cache for 2 hours
      await cacheService.set(cacheKey, regionalPrices, { ttl: 7200, prefix: 'energy' })

      return regionalPrices
    } catch (error) {
      Logger.error('Failed to fetch regional prices', error as Error)
      return this.getMockRegionalPrices(region)
    }
  }

  async getMarketData(): Promise<EnergyMarketData> {
    try {
      const [gasPrices, electricityPrices, forecasts] = await Promise.all([
        this.getCurrentGasPrices(),
        this.getCurrentElectricityPrices(),
        this.getPriceForecasts()
      ])

      return {
        currentPrices: [...gasPrices, ...electricityPrices],
        forecasts,
        marketTrends: {
          gasPrice: { trend: 'down', percentage: -5.2 },
          electricityPrice: { trend: 'stable', percentage: 1.1 }
        },
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      Logger.error('Failed to get market data', error as Error)
      throw error
    }
  }

  private getMockGasPrices(): EnergyPrice[] {
    return [
      {
        type: 'gas',
        pricePerUnit: 1.45,
        unit: '€/m³',
        supplier: 'Vattenfall',
        tariffType: 'variable',
        contractDuration: 12,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31'
      },
      {
        type: 'gas',
        pricePerUnit: 1.38,
        unit: '€/m³',
        supplier: 'Eneco',
        tariffType: 'fixed',
        contractDuration: 24,
        validFrom: '2024-01-01',
        validUntil: '2025-12-31'
      },
      {
        type: 'gas',
        pricePerUnit: 1.52,
        unit: '€/m³',
        supplier: 'Essent',
        tariffType: 'variable',
        contractDuration: 12,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31'
      }
    ]
  }

  private getMockElectricityPrices(): EnergyPrice[] {
    return [
      {
        type: 'electricity',
        pricePerUnit: 0.28,
        unit: '€/kWh',
        supplier: 'Vattenfall',
        tariffType: 'variable',
        contractDuration: 12,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31'
      },
      {
        type: 'electricity',
        pricePerUnit: 0.26,
        unit: '€/kWh',
        supplier: 'Eneco',
        tariffType: 'fixed',
        contractDuration: 24,
        validFrom: '2024-01-01',
        validUntil: '2025-12-31'
      },
      {
        type: 'electricity',
        pricePerUnit: 0.31,
        unit: '€/kWh',
        supplier: 'Essent',
        tariffType: 'variable',
        contractDuration: 12,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31'
      }
    ]
  }

  private getMockPriceForecasts(): PriceForecast[] {
    return [
      {
        type: 'gas',
        currentPrice: 1.45,
        forecast3Months: 1.38,
        forecast6Months: 1.32,
        forecast12Months: 1.28,
        confidence: 0.75,
        factors: ['Mild winter expected', 'Increased LNG imports', 'Renewable energy growth'],
        lastUpdated: new Date().toISOString()
      },
      {
        type: 'electricity',
        currentPrice: 0.28,
        forecast3Months: 0.27,
        forecast6Months: 0.25,
        forecast12Months: 0.23,
        confidence: 0.68,
        factors: ['Solar capacity expansion', 'Wind energy growth', 'Grid improvements'],
        lastUpdated: new Date().toISOString()
      }
    ]
  }

  private getMockRegionalPrices(region: string): RegionalPrices {
    const baseGasPrice = 1.45
    const baseElectricityPrice = 0.28
    
    // Regional variations
    const regionalMultipliers: Record<string, number> = {
      'Noord-Holland': 1.05,
      'Zuid-Holland': 1.02,
      'Utrecht': 1.03,
      'Noord-Brabant': 0.98,
      'Gelderland': 0.96,
      'Overijssel': 0.94,
      'Groningen': 0.92
    }

    const multiplier = regionalMultipliers[region] || 1.0
    const gasPrice = baseGasPrice * multiplier
    const electricityPrice = baseElectricityPrice * multiplier

    return {
      region,
      gasPrice,
      electricityPrice,
      averageMonthlyBill: (gasPrice * 150) + (electricityPrice * 300), // Typical usage
      priceComparison: {
        national: baseGasPrice + baseElectricityPrice,
        regional: gasPrice + electricityPrice,
        difference: ((gasPrice + electricityPrice) - (baseGasPrice + baseElectricityPrice)) / (baseGasPrice + baseElectricityPrice) * 100
      }
    }
  }

  private transformPriceData(data: any, type: 'gas' | 'electricity'): EnergyPrice[] {
    return data.prices?.map((price: any) => ({
      type,
      pricePerUnit: price.pricePerUnit,
      unit: price.unit,
      supplier: price.supplier,
      tariffType: price.tariffType,
      contractDuration: price.contractDuration,
      validFrom: price.validFrom,
      validUntil: price.validUntil,
      region: price.region
    })) || []
  }

  private transformForecastData(data: any): PriceForecast[] {
    return data.forecasts?.map((forecast: any) => ({
      type: forecast.type,
      currentPrice: forecast.currentPrice,
      forecast3Months: forecast.forecast3Months,
      forecast6Months: forecast.forecast6Months,
      forecast12Months: forecast.forecast12Months,
      confidence: forecast.confidence,
      factors: forecast.factors || [],
      lastUpdated: forecast.lastUpdated
    })) || []
  }

  private transformRegionalData(data: any): RegionalPrices {
    return {
      region: data.region,
      gasPrice: data.gasPrice,
      electricityPrice: data.electricityPrice,
      averageMonthlyBill: data.averageMonthlyBill,
      priceComparison: data.priceComparison
    }
  }
}

export const energyPriceService = new EnergyPriceService()