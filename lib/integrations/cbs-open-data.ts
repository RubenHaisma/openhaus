import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'
import { OPEN_DATA_SOURCES } from './open-data-sources'

export interface CBSEnergyData {
  region: string
  year: number
  totalHouseholds: number
  energyConsumptionGas: number
  energyConsumptionElectricity: number
  renewableEnergyPercentage: number
  averageEnergyLabel: string
  co2Emissions: number
}

export interface CBSHousingData {
  region: string
  averageHousePrice: number
  priceChange: number
  transactionVolume: number
  averageDaysOnMarket: number
  housingStock: number
}

export interface CBSRegionalStats {
  region: string
  population: number
  households: number
  averageIncome: number
  energyTransitionProgress: number
}

export class CBSOpenDataService {
  private baseUrl = OPEN_DATA_SOURCES.CBS.baseUrl
  private endpoints = OPEN_DATA_SOURCES.CBS.endpoints

  async getEnergyStatistics(region?: string): Promise<CBSEnergyData[]> {
    try {
      const cacheKey = `cbs-energy-stats:${region || 'all'}`
      const cached = await cacheService.get<CBSEnergyData[]>(cacheKey, 'cbs')
      if (cached) return cached

      const url = `${this.baseUrl}/${this.endpoints.energyStatistics}/TypedDataSet`
      const params = new URLSearchParams({
        '$format': 'json',
        '$top': '1000'
      })

      if (region) {
        params.append('$filter', `RegioS eq '${region}'`)
      }

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WattVrij/1.0 (info@WattVrij.nl)'
        }
      })

      if (!response.ok) {
        throw new Error(`CBS API error: ${response.status}`)
      }

      const data = await response.json()
      const energyData = this.transformCBSEnergyData(data.value || [])

      // Cache for 24 hours
      await cacheService.set(cacheKey, energyData, { ttl: 86400, prefix: 'cbs' })

      Logger.info('CBS energy statistics retrieved', {
        region: region || 'all',
        recordCount: energyData.length
      })

      return energyData
    } catch (error) {
      Logger.error('Failed to get CBS energy statistics', error as Error)
      throw new Error('CBS energy data not available')
    }
  }

  async getHousingMarketData(region?: string): Promise<CBSHousingData[]> {
    try {
      const cacheKey = `cbs-housing-market:${region || 'all'}`
      const cached = await cacheService.get<CBSHousingData[]>(cacheKey, 'cbs')
      if (cached) return cached

      const url = `${this.baseUrl}/${this.endpoints.housingStatistics}/TypedDataSet`
      const params = new URLSearchParams({
        '$format': 'json',
        '$top': '1000'
      })

      if (region) {
        params.append('$filter', `RegioS eq '${region}'`)
      }

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WattVrij/1.0 (info@WattVrij.nl)'
        }
      })

      if (!response.ok) {
        throw new Error(`CBS API error: ${response.status}`)
      }

      const data = await response.json()
      const housingData = this.transformCBSHousingData(data.value || [])

      // Cache for 6 hours
      await cacheService.set(cacheKey, housingData, { ttl: 21600, prefix: 'cbs' })

      Logger.info('CBS housing market data retrieved', {
        region: region || 'all',
        recordCount: housingData.length
      })

      return housingData
    } catch (error) {
      Logger.error('Failed to get CBS housing market data', error as Error)
      throw new Error('CBS housing market data not available')
    }
  }

  async getRegionalStatistics(): Promise<CBSRegionalStats[]> {
    try {
      const cacheKey = 'cbs-regional-stats'
      const cached = await cacheService.get<CBSRegionalStats[]>(cacheKey, 'cbs')
      if (cached) return cached

      const url = `${this.baseUrl}/${this.endpoints.regionalData}/TypedDataSet`
      const params = new URLSearchParams({
        '$format': 'json',
        '$top': '500'
      })

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WattVrij/1.0 (info@WattVrij.nl)'
        }
      })

      if (!response.ok) {
        throw new Error(`CBS API error: ${response.status}`)
      }

      const data = await response.json()
      const regionalStats = this.transformCBSRegionalData(data.value || [])

      // Cache for 24 hours
      await cacheService.set(cacheKey, regionalStats, { ttl: 86400, prefix: 'cbs' })

      Logger.info('CBS regional statistics retrieved', {
        recordCount: regionalStats.length
      })

      return regionalStats
    } catch (error) {
      Logger.error('Failed to get CBS regional statistics', error as Error)
      throw new Error('CBS regional statistics not available')
    }
  }

  private transformCBSEnergyData(data: any[]): CBSEnergyData[] {
    return data.map(item => ({
      region: item.RegioS || 'Unknown',
      year: parseInt(item.Perioden) || new Date().getFullYear(),
      totalHouseholds: parseInt(item.TotaalHuishoudens_1) || 0,
      energyConsumptionGas: parseFloat(item.GasverbruikHuishoudens_2) || 0,
      energyConsumptionElectricity: parseFloat(item.ElektriciteitsverbruikHuishoudens_3) || 0,
      renewableEnergyPercentage: parseFloat(item.AandeelDuurzameEnergie_4) || 0,
      averageEnergyLabel: item.GemiddeldEnergielabel_5 || 'C',
      co2Emissions: parseFloat(item.CO2UitstootHuishoudens_6) || 0
    }))
  }

  private transformCBSHousingData(data: any[]): CBSHousingData[] {
    return data.map(item => ({
      region: item.RegioS || 'Unknown',
      averageHousePrice: parseFloat(item.GemiddeldeWoningprijs_1) || 0,
      priceChange: parseFloat(item.PrijsveranderingJaarOpJaar_2) || 0,
      transactionVolume: parseInt(item.AantalTransacties_3) || 0,
      averageDaysOnMarket: parseInt(item.GemiddeldeTijdTeKoop_4) || 0,
      housingStock: parseInt(item.TotaalWoningvoorraad_5) || 0
    }))
  }

  private transformCBSRegionalData(data: any[]): CBSRegionalStats[] {
    return data.map(item => ({
      region: item.RegioS || 'Unknown',
      population: parseInt(item.TotaalInwoners_1) || 0,
      households: parseInt(item.TotaalHuishoudens_2) || 0,
      averageIncome: parseFloat(item.GemiddeldInkomen_3) || 0,
      energyTransitionProgress: parseFloat(item.EnergietransitieVoortgang_4) || 0
    }))
  }
}

export const cbsOpenDataService = new CBSOpenDataService()