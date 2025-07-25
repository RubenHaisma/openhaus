import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

function getLabelEnergyIndex(label?: string): number {
  const indices: Record<string, number> = {
    'A+++': 50, 'A++': 75, 'A+': 100, 'A': 125,
    'B': 150, 'C': 175, 'D': 200, 'E': 250, 'F': 300, 'G': 350
  }
  return label ? indices[label] || 175 : 175
}

export interface EnergyLabel {
  address: string
  postalCode: string
  currentLabel: string
  labelDate: string
  validUntil: string
  energyIndex: number
  primaryEnergyUse: number
  renewableEnergyPercentage: number
  buildingType: string
  heatingType: string
  insulationLevel: string
  certificateNumber: string
}

export interface EnergyHistory {
  date: string
  label: string
  energyIndex: number
  improvements: string[]
}

export interface EnergyMeasureValidation {
  measure: string
  valid: boolean
  requirements: string[]
  potentialLabelImprovement: string
  estimatedCost: number
  estimatedSavings: number
}

export class EPOnlineService {
  private baseUrl = process.env.EP_ONLINE_API_URL || 'https://api.ep-online.nl/v1'
  private apiKey = process.env.EP_ONLINE_API_KEY

  constructor() {
    if (!this.apiKey) {
      Logger.warn('EP Online API key not configured - using mock data')
    }
  }

  async getEnergyLabel(address: string, postalCode: string): Promise<EnergyLabel | null> {
    try {
      const cacheKey = `energy-label:${address}:${postalCode.replace(/\s/g, '').toUpperCase()}`
      const cached = await cacheService.get<EnergyLabel>(cacheKey, 'ep-online')
      if (cached) return cached

      // Only proceed if we have a real API key
      if (!this.apiKey) {
        Logger.warn('EP Online API key not configured - cannot retrieve real energy labels')
        return null
      }

      const response = await fetch(`${this.baseUrl}/energy-labels/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          postalCode: postalCode.replace(/\s/g, '').toUpperCase()
        })
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`EP Online API error: ${response.status}`)
      }

      const data = await response.json()
      const energyLabel = this.transformEnergyLabelData(data)

      // Cache for 30 days (energy labels don't change often)
      await cacheService.set(cacheKey, energyLabel, { ttl: 2592000, prefix: 'ep-online' })

      Logger.info('Energy label retrieved from EP Online', { address, postalCode, label: energyLabel.currentLabel })
      return energyLabel
    } catch (error) {
      Logger.error('Failed to get energy label from EP Online', error as Error, { address, postalCode })
      return null
    }
  }

  async getEnergyHistory(bagId: string): Promise<EnergyHistory[]> {
    try {
      if (!this.apiKey) {
        Logger.warn('EP Online API key not configured - cannot retrieve energy history')
        return []
      }

      const response = await fetch(`${this.baseUrl}/energy-labels/history/${bagId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`EP Online API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformEnergyHistory(data)
    } catch (error) {
      Logger.error('Failed to get energy history from EP Online', error as Error)
      return []
    }
  }

  async validateEnergyMeasures(measures: string[], currentLabel: string): Promise<EnergyMeasureValidation[]> {
    try {
      if (!this.apiKey) {
        Logger.warn('EP Online API key not configured - cannot validate energy measures')
        return []
      }

      const response = await fetch(`${this.baseUrl}/energy-measures/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          measures,
          currentLabel
        })
      })

      if (!response.ok) {
        throw new Error(`EP Online API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformMeasureValidation(data)
    } catch (error) {
      Logger.error('Failed to validate energy measures', error as Error)
      return []
    }
  }

  async searchNearbyLabels(postalCode: string, radius: number = 500): Promise<EnergyLabel[]> {
    try {
      if (!this.apiKey) {
        Logger.warn('EP Online API key not configured - cannot search nearby labels')
        return []
      }

      const response = await fetch(`${this.baseUrl}/energy-labels/nearby`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postalCode: postalCode.replace(/\s/g, '').toUpperCase(),
          radius
        })
      })

      if (!response.ok) {
        throw new Error(`EP Online API error: ${response.status}`)
      }

      const data = await response.json()
      return data.labels?.map((label: any) => this.transformEnergyLabelData(label)) || []
    } catch (error) {
      Logger.error('Failed to search nearby energy labels', error as Error)
      return []
    }
  }

  private transformEnergyLabelData(data: any): EnergyLabel {
    return {
      address: data.address,
      postalCode: data.postalCode,
      currentLabel: data.energyLabel || data.label,
      labelDate: data.labelDate || data.registrationDate,
      validUntil: data.validUntil || data.expiryDate,
      energyIndex: data.energyIndex || getLabelEnergyIndex(data.energyLabel),
      primaryEnergyUse: data.primaryEnergyUse || 0,
      renewableEnergyPercentage: data.renewableEnergyPercentage || 0,
      buildingType: data.buildingType || 'Woning',
      heatingType: data.heatingType || 'Onbekend',
      insulationLevel: data.insulationLevel || 'Onbekend',
      certificateNumber: data.certificateNumber || data.id
    }
  }

  private transformEnergyHistory(data: any): EnergyHistory[] {
    return data.history?.map((entry: any) => ({
      date: entry.date,
      label: entry.label,
      energyIndex: entry.energyIndex,
      improvements: entry.improvements || []
    })) || []
  }

  private transformMeasureValidation(data: any): EnergyMeasureValidation[] {
    return data.validations?.map((validation: any) => ({
      measure: validation.measure,
      valid: validation.valid,
      requirements: validation.requirements || [],
      potentialLabelImprovement: validation.potentialLabelImprovement,
      estimatedCost: validation.estimatedCost || 0,
      estimatedSavings: validation.estimatedSavings || 0
    })) || []
  }
}

export const epOnlineService = new EPOnlineService()