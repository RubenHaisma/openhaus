import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

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

      if (!this.apiKey) {
        return this.getMockEnergyLabel(address, postalCode)
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
      return this.getMockEnergyLabel(address, postalCode)
    }
  }

  async getEnergyHistory(bagId: string): Promise<EnergyHistory[]> {
    try {
      if (!this.apiKey) {
        return this.getMockEnergyHistory()
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
      return this.getMockEnergyHistory()
    }
  }

  async validateEnergyMeasures(measures: string[], currentLabel: string): Promise<EnergyMeasureValidation[]> {
    try {
      if (!this.apiKey) {
        return this.getMockMeasureValidation(measures, currentLabel)
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
      return this.getMockMeasureValidation(measures, currentLabel)
    }
  }

  async searchNearbyLabels(postalCode: string, radius: number = 500): Promise<EnergyLabel[]> {
    try {
      if (!this.apiKey) {
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

  private getMockEnergyLabel(address: string, postalCode: string): EnergyLabel {
    // Generate realistic mock data based on postal code patterns
    const area = postalCode.substring(0, 4)
    const labelDistribution: Record<string, string> = {
      '1000': 'C', // Amsterdam center - mixed
      '1001': 'D', // Amsterdam - older buildings
      '3000': 'C', // Rotterdam center
      '2500': 'C', // Den Haag center
      '3500': 'B', // Utrecht - newer developments
    }

    const currentLabel = labelDistribution[area] || 'C'
    const energyIndex = this.getLabelEnergyIndex(currentLabel)

    return {
      address,
      postalCode: postalCode.replace(/\s/g, '').toUpperCase(),
      currentLabel,
      labelDate: '2023-06-15',
      validUntil: '2033-06-15',
      energyIndex,
      primaryEnergyUse: energyIndex * 1.2,
      renewableEnergyPercentage: currentLabel <= 'B' ? 25 : 5,
      buildingType: 'Eengezinswoning',
      heatingType: currentLabel <= 'C' ? 'Warmtepomp' : 'Gasketel',
      insulationLevel: currentLabel <= 'B' ? 'Goed' : 'Matig',
      certificateNumber: 'NL-' + Date.now().toString().slice(-8)
    }
  }

  private getMockEnergyHistory(): EnergyHistory[] {
    return [
      {
        date: '2023-06-15',
        label: 'C',
        energyIndex: 150,
        improvements: ['HR++ glas geplaatst', 'Dakisolatie verbeterd']
      },
      {
        date: '2020-03-10',
        label: 'D',
        energyIndex: 180,
        improvements: ['Nieuwe CV-ketel']
      },
      {
        date: '2018-01-15',
        label: 'E',
        energyIndex: 220,
        improvements: []
      }
    ]
  }

  private getMockMeasureValidation(measures: string[], currentLabel: string): EnergyMeasureValidation[] {
    const measureData: Record<string, any> = {
      'heat_pump': {
        valid: true,
        requirements: ['Voldoende isolatie', 'Geschikt verwarmingssysteem'],
        potentialLabelImprovement: this.getImprovedLabel(currentLabel, 2),
        estimatedCost: 15000,
        estimatedSavings: 800
      },
      'insulation': {
        valid: true,
        requirements: ['Toegankelijke spouwmuur', 'Geschikte constructie'],
        potentialLabelImprovement: this.getImprovedLabel(currentLabel, 1),
        estimatedCost: 3500,
        estimatedSavings: 400
      },
      'solar_panels': {
        valid: true,
        requirements: ['Geschikt dak', 'Zuidelijke oriëntatie'],
        potentialLabelImprovement: this.getImprovedLabel(currentLabel, 1),
        estimatedCost: 8000,
        estimatedSavings: 600
      }
    }

    return measures.map(measure => ({
      measure,
      ...measureData[measure] || {
        valid: false,
        requirements: ['Onbekende maatregel'],
        potentialLabelImprovement: currentLabel,
        estimatedCost: 0,
        estimatedSavings: 0
      }
    }))
  }

  private getLabelEnergyIndex(label: string): number {
    const indices: Record<string, number> = {
      'A+++': 50, 'A++': 75, 'A+': 100, 'A': 125,
      'B': 150, 'C': 175, 'D': 200, 'E': 250, 'F': 300, 'G': 350
    }
    return indices[label] || 175
  }

  private getImprovedLabel(currentLabel: string, steps: number): string {
    const labels = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'A+', 'A++', 'A+++']
    const currentIndex = labels.indexOf(currentLabel)
    const newIndex = Math.min(labels.length - 1, currentIndex + steps)
    return labels[newIndex]
  }

  private transformEnergyLabelData(data: any): EnergyLabel {
    return {
      address: data.address,
      postalCode: data.postalCode,
      currentLabel: data.energyLabel || data.label,
      labelDate: data.labelDate || data.registrationDate,
      validUntil: data.validUntil || data.expiryDate,
      energyIndex: data.energyIndex || this.getLabelEnergyIndex(data.energyLabel),
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