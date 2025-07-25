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
        Logger.warn('Energy Price API key not configured - cannot retrieve real gas prices')
        return []
      }

      // NED API: https://api.ned.nl/v1/utilizations
      // Voor gas: type=0 (All), point=0 (Nederland), granularity=5 (Hour), classification=2 (Current), activity=1 (Providing)
      const url = 'https://api.ned.nl/v1/utilizations?point=0&type=0&granularity=5&granularitytimezone=1&classification=2&activity=1'
      const response = await fetch(url, {
        headers: {
          'X-AUTH-TOKEN': this.apiKey,
          'accept': 'application/ld+json'
        }
      })

      if (!response.ok) {
        Logger.error('NED API (gas) niet bereikbaar', new Error(`Status: ${response.status}`))
        return []
      }

      const data = await response.json()
      if (!Array.isArray(data) && !Array.isArray(data['hydra:member'])) {
        Logger.error('NED API (gas) response heeft onverwacht formaat', new Error('No array in response'))
        return []
      }
      const items = Array.isArray(data) ? data : data['hydra:member']
      const prices: EnergyPrice[] = items.map((item: any) => ({
        type: 'gas',
        pricePerUnit: item.price || item.capacity || 0,
        unit: 'kWh',
        supplier: 'NED',
        tariffType: 'variable',
        contractDuration: 0,
        validFrom: item.validfrom,
        validUntil: item.validto,
        region: 'NL'
      }))
      await cacheService.set('gas-prices', prices, { ttl: 3600, prefix: 'energy' })
      return prices
    } catch (error) {
      Logger.error('Failed to fetch gas prices from NED API', error as Error)
      return []
    }
  }

  async getCurrentElectricityPrices(): Promise<EnergyPrice[]> {
    try {
      const cached = await cacheService.get<EnergyPrice[]>('electricity-prices', 'energy')
      if (cached) return cached

      if (!this.apiKey) {
        Logger.warn('Energy Price API key not configured - cannot retrieve real electricity prices')
        return []
      }

      // NED API: https://api.ned.nl/v1/utilizations
      // Voor elektriciteit: type=2 (Solar), point=0 (Nederland), granularity=5 (Hour), classification=2 (Current), activity=1 (Providing)
      const url = 'https://api.ned.nl/v1/utilizations?point=0&type=2&granularity=5&granularitytimezone=1&classification=2&activity=1'
      const response = await fetch(url, {
        headers: {
          'X-AUTH-TOKEN': this.apiKey,
          'accept': 'application/ld+json'
        }
      })

      if (!response.ok) {
        Logger.error('NED API (electricity) niet bereikbaar', new Error(`Status: ${response.status}`))
        return []
      }

      const data = await response.json()
      if (!Array.isArray(data) && !Array.isArray(data['hydra:member'])) {
        Logger.error('NED API (electricity) response heeft onverwacht formaat', new Error('No array in response'))
        return []
      }
      const items = Array.isArray(data) ? data : data['hydra:member']
      const prices: EnergyPrice[] = items.map((item: any) => ({
        type: 'electricity',
        pricePerUnit: item.price || item.capacity || 0,
        unit: 'kWh',
        supplier: 'NED',
        tariffType: 'variable',
        contractDuration: 0,
        validFrom: item.validfrom,
        validUntil: item.validto,
        region: 'NL'
      }))
      await cacheService.set('electricity-prices', prices, { ttl: 3600, prefix: 'energy' })
      return prices
    } catch (error) {
      Logger.error('Failed to fetch electricity prices from NED API', error as Error)
      return []
    }
  }

  async getPriceForecasts(): Promise<PriceForecast[]> {
    try {
      const cached = await cacheService.get<PriceForecast[]>('price-forecasts', 'energy')
      if (cached) return cached

      if (!this.apiKey) {
        Logger.warn('Energy Price API key not configured - cannot retrieve price forecasts')
        return []
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
      return []
    }
  }

  async getRegionalPrices(region: string): Promise<RegionalPrices> {
    try {
      const cacheKey = `regional-prices:${region}`
      const cached = await cacheService.get<RegionalPrices>(cacheKey, 'energy')
      if (cached) return cached

      if (!this.apiKey) {
        Logger.warn('Energy Price API key not configured - cannot retrieve regional prices')
        throw new Error('Energy Price API key required for regional prices')
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
      throw error
    }
  }

  async getMarketData(): Promise<EnergyMarketData> {
    try {
      const [gasPrices, electricityPrices, forecasts] = await Promise.all([
        this.getCurrentGasPrices(),
        this.getCurrentElectricityPrices(),
        this.getPriceForecasts()
      ])

      if (gasPrices.length === 0 || electricityPrices.length === 0) {
        throw new Error('No real energy price data available - API keys required')
      }

      return {
        currentPrices: [...gasPrices, ...electricityPrices],
        forecasts,
        marketTrends: {
          gasPrice: { trend: 'stable', percentage: 0 },
          electricityPrice: { trend: 'stable', percentage: 0 }
        },
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      Logger.error('Failed to get market data', error as Error)
      throw error
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
    // Adjust this logic to match the actual structure of your API response
    return {
      region: data.region || '',
      gasPrice: data.gasPrice || 0,
      electricityPrice: data.electricityPrice || 0,
      averageMonthlyBill: data.averageMonthlyBill || 0,
      priceComparison: data.priceComparison || {
        national: 0,
        regional: 0,
        difference: 0
      }
    }
  }
}

export const energyPriceService = new EnergyPriceService()