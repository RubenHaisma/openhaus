import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'
import { OPEN_DATA_SOURCES, API_KEYS } from './open-data-sources'

export interface RealEnergyLabel {
  address: string
  postalCode: string
  energyLabel: string
  energyIndex: number
  registrationDate: string
  validUntil: string
  buildingType: string
  primaryEnergyUse: number
  renewableEnergyPercentage: number
  certificateNumber: string
  source: 'ep-online' | 'estimated'
}

export class EPOnlineRealAPIService {
  private baseUrl = OPEN_DATA_SOURCES.ENERGY_LABELS.epOnline
  private apiKey = API_KEYS.EP_ONLINE

  constructor() {
    if (!this.apiKey) {
      Logger.warn('EP Online API key not configured - energy labels will be estimated')
    }
  }

  async getEnergyLabel(address: string, postalCode: string): Promise<RealEnergyLabel | null> {
    try {
      const cacheKey = `ep-online-real:${address}:${postalCode.replace(/\s/g, '').toUpperCase()}`
      const cached = await cacheService.get<RealEnergyLabel>(cacheKey, 'ep-online')
      if (cached) return cached

      if (!this.apiKey) {
        // Use estimation based on building characteristics
        return await this.estimateEnergyLabel(address, postalCode)
      }

      // Parse address to get house number
      const { huisnummer, street } = this.parseDutchAddress(address)
      const cleanPostalCode = postalCode.replace(/\s/g, '').toUpperCase()

      if (!huisnummer || !cleanPostalCode) {
        Logger.warn('Invalid address format for EP Online lookup', { address, postalCode })
        return await this.estimateEnergyLabel(address, postalCode)
      }

      // Call EP Online API
      const url = `${this.baseUrl}/PandEnergielabel/Adres`
      const params = new URLSearchParams({
        postcode: cleanPostalCode,
        huisnummer: huisnummer
      })

      const response = await fetch(`${url}?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json',
          'User-Agent': 'WattVrij/1.0 (info@WattVrij.nl)'
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          Logger.info('No energy label found in EP Online', { address, postalCode })
          return await this.estimateEnergyLabel(address, postalCode)
        }
        throw new Error(`EP Online API error: ${response.status}`)
      }

      const data = await response.json()
      const labelData = Array.isArray(data) && data.length > 0 ? data[0] : null

      if (!labelData || !labelData.Energieklasse) {
        Logger.warn('No valid energy label in EP Online response', { address, postalCode })
        return await this.estimateEnergyLabel(address, postalCode)
      }

      const energyLabel: RealEnergyLabel = {
        address,
        postalCode: cleanPostalCode,
        energyLabel: labelData.Energieklasse,
        energyIndex: labelData.EnergieIndex || this.getEnergyIndexForLabel(labelData.Energieklasse),
        registrationDate: labelData.Registratiedatum || '',
        validUntil: labelData.Geldig_tot || '',
        buildingType: labelData.Gebouwtype || 'Woning',
        primaryEnergyUse: labelData.PrimairEnergieverbruik || 0,
        renewableEnergyPercentage: labelData.Aandeel_hernieuwbare_energie || 0,
        certificateNumber: labelData.BAGVerblijfsobjectID || '',
        source: 'ep-online'
      }

      // Cache for 30 days
      await cacheService.set(cacheKey, energyLabel, { ttl: 2592000, prefix: 'ep-online' })

      Logger.info('Real energy label retrieved from EP Online', {
        address,
        postalCode,
        energyLabel: energyLabel.energyLabel
      })

      return energyLabel
    } catch (error) {
      Logger.error('Failed to get energy label from EP Online', error as Error, { address, postalCode })
      // Fallback to estimation
      return await this.estimateEnergyLabel(address, postalCode)
    }
  }

  private async estimateEnergyLabel(address: string, postalCode: string): Promise<RealEnergyLabel | null> {
    try {
      // Get building data from BAG API to estimate energy label
      const buildingData = await this.getBuildingDataFromBAG(address, postalCode)
      
      if (!buildingData) {
        return null
      }

      // Estimate energy label based on construction year and building type
      const estimatedLabel = this.estimateLabelFromBuildingData(buildingData)

      const energyLabel: RealEnergyLabel = {
        address,
        postalCode: postalCode.replace(/\s/g, '').toUpperCase(),
        energyLabel: estimatedLabel,
        energyIndex: this.getEnergyIndexForLabel(estimatedLabel),
        registrationDate: new Date().toISOString(),
        validUntil: '',
        buildingType: buildingData.buildingType || 'Woning',
        primaryEnergyUse: 0,
        renewableEnergyPercentage: 0,
        certificateNumber: '',
        source: 'estimated'
      }

      Logger.info('Energy label estimated from building data', {
        address,
        postalCode,
        estimatedLabel,
        constructionYear: buildingData.constructionYear
      })

      return energyLabel
    } catch (error) {
      Logger.error('Failed to estimate energy label', error as Error)
      return null
    }
  }

  private async getBuildingDataFromBAG(address: string, postalCode: string): Promise<any> {
    try {
      // Use BAG API to get building characteristics
      const bagUrl = OPEN_DATA_SOURCES.ENERGY_LABELS.bagApi
      const { huisnummer } = this.parseDutchAddress(address)
      
      if (!huisnummer) return null

      const url = `${bagUrl}/verblijfsobjecten`
      const params = new URLSearchParams({
        postcode: postalCode.replace(/\s/g, '').toUpperCase(),
        huisnummer: huisnummer
      })

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WattVrij/1.0 (info@WattVrij.nl)'
        }
      })

      if (!response.ok) {
        throw new Error(`BAG API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data._embedded?.verblijfsobjecten?.length > 0) {
        const building = data._embedded.verblijfsobjecten[0]
        return {
          constructionYear: building.oorspronkelijkBouwjaar,
          buildingType: building.gebruiksdoel?.[0] || 'Woonfunctie',
          surfaceArea: building.oppervlakte
        }
      }

      return null
    } catch (error) {
      Logger.error('Failed to get building data from BAG', error as Error)
      return null
    }
  }

  private estimateLabelFromBuildingData(buildingData: any): string {
    const constructionYear = buildingData.constructionYear || 1980

    // Estimate energy label based on construction year
    if (constructionYear >= 2015) return 'A'
    if (constructionYear >= 2010) return 'B'
    if (constructionYear >= 2000) return 'C'
    if (constructionYear >= 1990) return 'D'
    if (constructionYear >= 1980) return 'E'
    if (constructionYear >= 1970) return 'F'
    return 'G'
  }

  private parseDutchAddress(address: string): { huisnummer: string, street: string } {
    // Extract house number from Dutch address
    const match = address.match(/([A-Za-zÀ-ÿ'\-\. ]+)(\d+[A-Za-z]?)/)
    if (match) {
      return { street: match[1].trim(), huisnummer: match[2].trim() }
    }
    
    // Fallback: try to find number at start
    const numberMatch = address.match(/(\d+[A-Za-z]?)\s*([A-Za-zÀ-ÿ'\-\. ]+)/)
    if (numberMatch) {
      return { huisnummer: numberMatch[1].trim(), street: numberMatch[2].trim() }
    }

    return { huisnummer: '', street: address }
  }

  private getEnergyIndexForLabel(label: string): number {
    const indices: Record<string, number> = {
      'A+++': 50, 'A++': 75, 'A+': 100, 'A': 125,
      'B': 150, 'C': 175, 'D': 200, 'E': 250, 'F': 300, 'G': 350
    }
    return indices[label] || 175
  }
}

export const epOnlineRealAPIService = new EPOnlineRealAPIService()