import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

export interface RealEnergyLabel {
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
  // Enhanced fields for energy assessment
  energyDemand: number
  energySupply: number
  fossilFuelFree: boolean
  heatPumpSuitable: boolean
  solarPanelPotential: number
  insulationRecommendations: string[]
}

export interface EnergyMeasureValidation {
  measure: string
  feasible: boolean
  requirements: string[]
  potentialLabelImprovement: string
  estimatedCost: number
  estimatedSavings: number
  subsidyEligible: boolean
  technicalConstraints: string[]
}

export class EPOnlineRealService {
  private baseUrl = process.env.EP_ONLINE_API_URL || 'https://api.ep-online.nl/v1'
  private apiKey = process.env.EP_ONLINE_API_KEY

  constructor() {
    if (!this.apiKey) {
      Logger.warn('EP Online API key not configured - using enhanced mock data')
    }
  }

  async getRealEnergyLabel(address: string, postalCode: string): Promise<RealEnergyLabel | null> {
    try {
      const cacheKey = `real-energy-label:${address}:${postalCode.replace(/\s/g, '').toUpperCase()}`
      const cached = await cacheService.get<RealEnergyLabel>(cacheKey, 'ep-online')
      if (cached) return cached

      if (!this.apiKey) {
        throw new Error('No real EP Online API key configured')
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
      const energyLabel = this.transformRealEnergyLabelData(data)

      // Cache for 30 days
      await cacheService.set(cacheKey, energyLabel, { ttl: 2592000, prefix: 'ep-online' })

      Logger.info('Real energy label retrieved from EP Online', { 
        address, 
        postalCode, 
        label: energyLabel.currentLabel 
      })
      
      return energyLabel
    } catch (error) {
      Logger.error('Failed to get real energy label from EP Online', error as Error, { address, postalCode })
      throw new Error('No real energy label available')
    }
  }

  async validateEnergyMeasuresReal(
    measures: string[], 
    currentLabel: string,
    buildingData: any
  ): Promise<EnergyMeasureValidation[]> {
    if (!this.apiKey) {
      throw new Error('No real EP Online API key configured')
    }

    try {
      const response = await fetch(`${this.baseUrl}/energy-measures/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          measures,
          currentLabel,
          buildingData
        })
      })

      if (!response.ok) {
        throw new Error(`EP Online API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformMeasureValidation(data)
    } catch (error) {
      Logger.error('Failed to validate energy measures', error as Error)
      throw new Error('No energy measures validation available')
    }
  }

  async getEnergyTransitionPlan(
    address: string, 
    postalCode: string,
    targetLabel: string = 'A'
  ): Promise<{
    currentState: RealEnergyLabel
    targetState: any
    requiredMeasures: EnergyMeasureValidation[]
    timeline: any[]
    totalCost: number
    totalSubsidy: number
    paybackPeriod: number
  } | null> {
    try {
      const currentLabel = await this.getRealEnergyLabel(address, postalCode)
      if (!currentLabel) return null

      // Calculate required measures to reach target
      throw new Error('No real energy transition plan available')
      
      // Generate transition timeline
      // (rest van de code niet meer nodig, want alleen echte data is toegestaan)
    } catch (error) {
      Logger.error('Failed to generate energy transition plan', error as Error)
      throw new Error('No real energy transition plan available')
    }
  }

  private async calculateRequiredMeasures(
    currentLabel: RealEnergyLabel, 
    targetLabel: string
  ): Promise<EnergyMeasureValidation[]> {
    throw new Error('No real required measures calculation available')
  }

  private generateTransitionTimeline(measures: EnergyMeasureValidation[]): any[] {
    return [
      {
        phase: 'Voorbereiding',
        duration: '2-4 weken',
        tasks: ['Offertes aanvragen', 'Subsidies aanvragen', 'Vergunningen regelen'],
        measures: []
      },
      {
        phase: 'Isolatie',
        duration: '1-2 weken',
        tasks: ['Dakisolatie', 'Muurisolatie', 'Vloerisolatie'],
        measures: measures.filter(m => m.measure === 'insulation')
      },
      {
        phase: 'Installaties',
        duration: '1-2 weken',
        tasks: ['Warmtepomp', 'Ventilatie', 'Zonnepanelen'],
        measures: measures.filter(m => ['heat_pump', 'ventilation', 'solar_panels'].includes(m.measure))
      },
      {
        phase: 'Afronding',
        duration: '1 week',
        tasks: ['Testen', 'Certificering', 'Oplevering'],
        measures: []
      }
    ]
  }

  private getEnergyIndexForLabel(label: string): number {
    const indices: Record<string, number> = {
      'A+++': 50, 'A++': 75, 'A+': 100, 'A': 125,
      'B': 150, 'C': 175, 'D': 200, 'E': 250, 'F': 300, 'G': 350
    }
    return indices[label] || 175
  }

  private getLabelIndex(label: string): number {
    const labels = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'A+', 'A++', 'A+++']
    return labels.indexOf(label)
  }

  private getImprovedLabel(currentLabel: string, steps: number): string {
    const labels = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'A+', 'A++', 'A+++']
    const currentIndex = labels.indexOf(currentLabel)
    const newIndex = Math.min(labels.length - 1, currentIndex + steps)
    return labels[newIndex]
  }

  private getInsulationRecommendations(label: string): string[] {
    if (label >= 'C') return ['Isolatie is voldoende']
    
    return [
      'Dakisolatie verbeteren',
      'Spouwmuurisolatie toevoegen',
      'Vloerisolatie aanbrengen',
      'HR++ glas plaatsen'
    ]
  }

  private calculateCO2Reduction(currentLabel: string, targetLabel: string): number {
    const currentIndex = this.getEnergyIndexForLabel(currentLabel)
    const targetIndex = this.getEnergyIndexForLabel(targetLabel)
    const reduction = (currentIndex - targetIndex) / currentIndex
    return Math.round(reduction * 3000) // Average household CO2 emissions
  }

  private transformRealEnergyLabelData(data: any): RealEnergyLabel {
    return {
      address: data.address,
      postalCode: data.postalCode,
      currentLabel: data.energyLabel || data.label,
      labelDate: data.labelDate || data.registrationDate,
      validUntil: data.validUntil || data.expiryDate,
      energyIndex: data.energyIndex || this.getEnergyIndexForLabel(data.energyLabel),
      primaryEnergyUse: data.primaryEnergyUse || 0,
      renewableEnergyPercentage: data.renewableEnergyPercentage || 0,
      buildingType: data.buildingType || 'Woning',
      heatingType: data.heatingType || 'Onbekend',
      insulationLevel: data.insulationLevel || 'Onbekend',
      certificateNumber: data.certificateNumber || data.id,
      // Enhanced fields
      energyDemand: data.energyDemand || 0,
      energySupply: data.energySupply || 0,
      fossilFuelFree: data.fossilFuelFree || false,
      heatPumpSuitable: data.heatPumpSuitable || true,
      solarPanelPotential: data.solarPanelPotential || 5,
      insulationRecommendations: data.insulationRecommendations || []
    }
  }

  private transformMeasureValidation(data: any): EnergyMeasureValidation[] {
    return data.validations?.map((validation: any) => ({
      measure: validation.measure,
      feasible: validation.feasible,
      requirements: validation.requirements || [],
      potentialLabelImprovement: validation.potentialLabelImprovement,
      estimatedCost: validation.estimatedCost || 0,
      estimatedSavings: validation.estimatedSavings || 0,
      subsidyEligible: validation.subsidyEligible || false,
      technicalConstraints: validation.technicalConstraints || []
    })) || []
  }
}

export const epOnlineRealService = new EPOnlineRealService()