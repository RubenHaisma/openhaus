import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'
import { OPEN_DATA_SOURCES } from './open-data-sources'

export interface RealEnergyPrice {
  type: 'gas' | 'electricity'
  price: number
  unit: string
  provider: string
  timestamp: string
  source: string
}

export interface EnergyPriceComparison {
  gas: {
    anwb: number | null
    market: number | null
    average: number
  }
  electricity: {
    anwb: number | null
    market: number | null
    average: number
  }
  lastUpdated: string
}

export class RealEnergyPriceService {
  private sources = OPEN_DATA_SOURCES.ENERGY_PRICES

  async getCurrentEnergyPrices(): Promise<EnergyPriceComparison> {
    try {
      const cacheKey = 'real-energy-prices'
      const cached = await cacheService.get<EnergyPriceComparison>(cacheKey, 'energy')
      if (cached) return cached

      const [anwbGas, anwbElectricity, marketPrices] = await Promise.all([
        this.getANWBGasPrice(),
        this.getANWBElectricityPrice(),
        this.getMarketPrices()
      ])

      const comparison: EnergyPriceComparison = {
        gas: {
          anwb: anwbGas,
          market: marketPrices.gas,
          average: this.calculateAverage([anwbGas, marketPrices.gas])
        },
        electricity: {
          anwb: anwbElectricity,
          market: marketPrices.electricity,
          average: this.calculateAverage([anwbElectricity, marketPrices.electricity])
        },
        lastUpdated: new Date().toISOString()
      }

      // Cache for 1 hour
      await cacheService.set(cacheKey, comparison, { ttl: 3600, prefix: 'energy' })

      Logger.info('Real energy prices retrieved', {
        gasANWB: anwbGas,
        electricityANWB: anwbElectricity,
        gasMarket: marketPrices.gas,
        electricityMarket: marketPrices.electricity
      })

      return comparison
    } catch (error) {
      Logger.error('Failed to get real energy prices', error as Error)
      throw new Error('Real energy price data not available')
    }
  }

  private async getANWBGasPrice(): Promise<number | null> {
    try {
      const response = await fetch(this.sources.anwbGas, {
        headers: {
          'User-Agent': 'WattVrij/1.0 (info@WattVrij.nl)'
        }
      })

      if (!response.ok) {
        throw new Error(`ANWB gas price API error: ${response.status}`)
      }

      const priceText = await response.text()
      const price = parseFloat(priceText.replace(',', '.'))

      if (isNaN(price) || price <= 0 || price > 10) {
        throw new Error('Invalid gas price from ANWB')
      }

      return price
    } catch (error) {
      Logger.error('Failed to get ANWB gas price', error as Error)
      return null
    }
  }

  private async getANWBElectricityPrice(): Promise<number | null> {
    try {
      const response = await fetch(this.sources.anwbElectricity, {
        headers: {
          'User-Agent': 'WattVrij/1.0 (info@WattVrij.nl)'
        }
      })

      if (!response.ok) {
        throw new Error(`ANWB electricity price API error: ${response.status}`)
      }

      const priceText = await response.text()
      const price = parseFloat(priceText.replace(',', '.'))

      if (isNaN(price) || price <= 0 || price > 2) {
        throw new Error('Invalid electricity price from ANWB')
      }

      return price
    } catch (error) {
      Logger.error('Failed to get ANWB electricity price', error as Error)
      return null
    }
  }

  private async getMarketPrices(): Promise<{ gas: number | null, electricity: number | null }> {
    try {
      // Try to get market prices from Energievergelijker or similar free API
      // For now, return null as we need to implement this with a real API
      return { gas: null, electricity: null }
    } catch (error) {
      Logger.error('Failed to get market energy prices', error as Error)
      return { gas: null, electricity: null }
    }
  }

  private calculateAverage(prices: (number | null)[]): number {
    const validPrices = prices.filter(p => p !== null) as number[]
    if (validPrices.length === 0) return 0
    return validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
  }

  async getEnergyPriceHistory(days: number = 30): Promise<RealEnergyPrice[]> {
    try {
      // This would require a historical price API
      // For now, return empty array as most free APIs don't provide history
      Logger.warn('Energy price history not available with current free APIs')
      return []
    } catch (error) {
      Logger.error('Failed to get energy price history', error as Error)
      return []
    }
  }
}

export const realEnergyPriceService = new RealEnergyPriceService()