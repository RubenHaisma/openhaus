import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

export interface MarketData {
  averagePrice: number
  pricePerSquareMeter: number
  averageDaysOnMarket: number
  priceChange: number
  salesVolume: number
  lastUpdated: string
  source: string
}

export interface InterestRates {
  mortgage: number
  savings: number
  lastUpdated: string
  source: string
}

export class MarketDataProvider {
  async getCurrentInterestRates(): Promise<InterestRates> {
    try {
      // Check cache first
      const cached = await cacheService.get<InterestRates>('interest-rates', 'market')
      if (cached) return cached

      // Try to get real interest rates from financial APIs
      try {
        // In production, this would call real financial APIs
        // For now, we need real API integration
        throw new Error('Real financial API integration required')
      } catch (apiError) {
        Logger.error('Failed to get real interest rates', apiError as Error)
        throw new Error('Real interest rate data not available - financial API required')
      }
    } catch (error) {
      Logger.error('Failed to get current interest rates', error as Error)
      throw error
    }
  }

  async getMarketData(postalCode: string): Promise<MarketData> {
    try {
      const area = postalCode.substring(0, 4)
      const cacheKey = `market-data:${area}`
      
      // Check cache first
      const cached = await cacheService.get<MarketData>(cacheKey, 'market')
      if (cached) return cached

      // Try to fetch real market data from CBS or other APIs
      try {
        const marketData = await this.fetchRealMarketDataForArea(area)
        
        // Cache for 6 hours
        await cacheService.set(cacheKey, marketData, { ttl: 21600, prefix: 'market' })
        
        return marketData
      } catch (apiError) {
        Logger.error('Failed to get real market data', apiError as Error)
        throw new Error('Real market data not available - CBS/NVM API required')
      }
    } catch (error) {
      Logger.error('Failed to get market data', error as Error)
      throw error
    }
  }

  private async fetchRealMarketDataForArea(area: string): Promise<MarketData> {
    try {
      // In production, integrate with CBS Open Data API
      const cbsResponse = await fetch(`https://opendata.cbs.nl/ODataApi/odata/83989NED/TypedDataSet?$filter=RegioS eq '${area}'`)
      
      if (!cbsResponse.ok) {
        throw new Error(`CBS API error: ${cbsResponse.status}`)
      }
      
      const cbsData = await cbsResponse.json()
      
      // Process CBS data to extract market metrics
      return this.processCBSMarketData(cbsData, area)
    } catch (error) {
      Logger.error('Failed to fetch real market data from CBS', error as Error)
      throw error
    }
  }

  private processCBSMarketData(cbsData: any, area: string): MarketData {
    // Process real CBS data structure
    if (!cbsData.value || cbsData.value.length === 0) {
      throw new Error('No CBS data available for this area')
    }

    const data = cbsData.value[0] // Get first result
    
    return {
      averagePrice: data.GemiddeldeWoningwaarde_1 || 0,
      pricePerSquareMeter: data.PrijsPerVierkanteMeter_2 || 0,
      averageDaysOnMarket: data.GemiddeldeTijdOpMarkt_3 || 0,
      priceChange: data.PrijsveranderingJaarOpJaar_4 || 0,
      salesVolume: data.AantalVerkopen_5 || 0,
      lastUpdated: new Date().toISOString(),
      source: 'CBS Open Data API'
    }
  }

  async getComparableSales(postalCode: string, propertyType: string, squareMeters: number): Promise<Array<{
    address: string
    soldPrice: number
    soldDate: string
    squareMeters: number
    pricePerSqm: number
  }>> {
    try {
      const cacheKey = `comparable-sales:${postalCode}:${propertyType}:${squareMeters}`
      
      // Check cache first
      const cached = await cacheService.get<any[]>(cacheKey, 'market')
      if (cached) return cached

      // Try to get real comparable sales data
      try {
        // In production, integrate with NVM or other real estate APIs
        const nvmResponse = await fetch(`https://api.nvm.nl/v1/sales?postalCode=${postalCode}&propertyType=${propertyType}`)
        
        if (!nvmResponse.ok) {
          throw new Error(`NVM API error: ${nvmResponse.status}`)
        }
        
        const nvmData = await nvmResponse.json()
        const comparableSales = this.processNVMSalesData(nvmData)
        
        // Cache for 24 hours
        await cacheService.set(cacheKey, comparableSales, { ttl: 86400, prefix: 'sales' })
        
        return comparableSales
      } catch (apiError) {
        Logger.error('Failed to get real comparable sales', apiError as Error)
        throw new Error('Real comparable sales data not available - NVM API required')
      }
    } catch (error) {
      Logger.error('Failed to get comparable sales', error as Error)
      return []
    }
  }

  private processNVMSalesData(nvmData: any): Array<{
    address: string
    soldPrice: number
    soldDate: string
    squareMeters: number
    pricePerSqm: number
  }> {
    if (!nvmData.sales || nvmData.sales.length === 0) {
      return []
    }

    return nvmData.sales.map((sale: any) => ({
      address: sale.address,
      soldPrice: sale.soldPrice,
      soldDate: sale.soldDate,
      squareMeters: sale.squareMeters,
      pricePerSqm: Math.round(sale.soldPrice / sale.squareMeters)
    }))
  }
}

export const marketDataProvider = new MarketDataProvider()