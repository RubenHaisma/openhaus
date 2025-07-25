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
  private baseUrl = process.env.EP_ONLINE_API_URL || 'https://public.ep-online.nl/api/v5'
  private apiKey = process.env.EP_ONLINE_API_KEY

  constructor() {
    if (!this.apiKey) {
      Logger.warn('EP Online API key not configured - using mock data')
    }
  }

  /**
   * Extracts huisnummer (house number) and street from a Dutch address string.
   * Returns { huisnummer, street }
   */
  private parseDutchAddress(address: string): { huisnummer: string, street: string } {
    // Try to match 'street housenumber' or 'housenumber street'
    let match = address.match(/([A-Za-zÀ-ÿ'\-\. ]+)(\d+[A-Za-z]?)/)
    if (match) {
      return { street: match[1].trim(), huisnummer: match[2].trim() }
    }
    match = address.match(/(\d+[A-Za-z]?)\s*([A-Za-zÀ-ÿ'\-\. ]+)/)
    if (match) {
      return { huisnummer: match[1].trim(), street: match[2].trim() }
    }
    // Fallback: try to split by space and guess
    const parts = address.split(' ').map(p => p.trim()).filter(Boolean)
    if (parts.length >= 2 && /^\d+/.test(parts[0])) {
      return { huisnummer: parts[0], street: parts.slice(1).join(' ') }
    }
    return { huisnummer: '', street: address }
  }

  async getEnergyLabel(address: string, postalCode: string): Promise<EnergyLabel | null> {
    try {
      const cacheKey = `energy-label:${address}:${postalCode.replace(/\s/g, '').toUpperCase()}`
      const cached = await cacheService.get<EnergyLabel>(cacheKey, 'ep-online')
      if (cached) return cached

      if (!this.apiKey) {
        Logger.warn('EP Online API key not configured - cannot retrieve real energy labels')
        return null
      }

      // Parse address to get huisnummer
      const { huisnummer } = this.parseDutchAddress(address)
      const postcode = postalCode.replace(/\s/g, '').toUpperCase()
      if (!huisnummer || !postcode) {
        Logger.warn('Missing huisnummer or postcode for EP-Online lookup', { address, postalCode })
        return null
      }

      // Build the GET URL
      const url = `${this.baseUrl}/PandEnergielabel/Adres?postcode=${encodeURIComponent(postcode)}&huisnummer=${encodeURIComponent(huisnummer)}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': this.apiKey,
          'accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`EP Online API error: ${response.status}`)
      }

      const data = await response.json();
      const labelData = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (!labelData || !labelData.Energieklasse) {
        Logger.warn('No energy label found in EP-Online response', { address, postalCode, data })
        return null
      }
      const energyLabel: EnergyLabel = {
        address: address,
        postalCode: postcode,
        currentLabel: labelData.Energieklasse,
        labelDate: labelData.Registratiedatum || '',
        validUntil: labelData.Geldig_tot || '',
        energyIndex: labelData.EnergieIndex || getLabelEnergyIndex(labelData.Energieklasse),
        primaryEnergyUse: 0,
        renewableEnergyPercentage: labelData.Aandeel_hernieuwbare_energie || 0,
        buildingType: labelData.Gebouwtype || 'Woning',
        heatingType: 'Onbekend',
        insulationLevel: 'Onbekend',
        certificateNumber: labelData.BAGVerblijfsobjectID || ''
      }
      // Cache for 30 days
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