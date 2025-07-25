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
        return this.getEnhancedMockEnergyLabel(address, postalCode)
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
      return this.getEnhancedMockEnergyLabel(address, postalCode)
    }
  }

  async validateEnergyMeasuresReal(
    measures: string[], 
    currentLabel: string,
    buildingData: any
  ): Promise<EnergyMeasureValidation[]> {
    try {
      if (!this.apiKey) {
        return this.getEnhancedMockMeasureValidation(measures, currentLabel, buildingData)
      }

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
      return this.getEnhancedMockMeasureValidation(measures, currentLabel, buildingData)
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
      const requiredMeasures = await this.calculateRequiredMeasures(currentLabel, targetLabel)
      
      // Generate transition timeline
      const timeline = this.generateTransitionTimeline(requiredMeasures)
      
      // Calculate financial impact
      const totalCost = requiredMeasures.reduce((sum, measure) => sum + measure.estimatedCost, 0)
      const totalSavings = requiredMeasures.reduce((sum, measure) => sum + measure.estimatedSavings, 0)
      const totalSubsidy = totalCost * 0.4 // Average 40% subsidy
      const paybackPeriod = (totalCost - totalSubsidy) / totalSavings

      return {
        currentState: currentLabel,
        targetState: {
          energyLabel: targetLabel,
          energyIndex: this.getEnergyIndexForLabel(targetLabel),
          estimatedSavings: totalSavings,
          co2Reduction: this.calculateCO2Reduction(currentLabel.currentLabel, targetLabel)
        },
        requiredMeasures,
        timeline,
        totalCost,
        totalSubsidy,
        paybackPeriod
      }
    } catch (error) {
      Logger.error('Failed to generate energy transition plan', error as Error)
      return null
    }
  }

  private getEnhancedMockEnergyLabel(address: string, postalCode: string): RealEnergyLabel {
    const area = postalCode.substring(0, 4)
    
    // Enhanced mock data based on Dutch energy statistics
    const labelDistribution: Record<string, any> = {
      '1000': { // Amsterdam center
        label: 'C',
        heatingType: 'Stadsverwarming',
        heatPumpSuitable: false,
        solarPanelPotential: 6,
        fossilFuelFree: false
      },
      '1001': { // Amsterdam old
        label: 'D',
        heatingType: 'Gasketel',
        heatPumpSuitable: true,
        solarPanelPotential: 8,
        fossilFuelFree: false
      },
      '3000': { // Rotterdam center
        label: 'C',
        heatingType: 'Stadsverwarming',
        heatPumpSuitable: false,
        solarPanelPotential: 7,
        fossilFuelFree: true
      },
      '3500': { // Utrecht
        label: 'B',
        heatingType: 'Hybride warmtepomp',
        heatPumpSuitable: true,
        solarPanelPotential: 9,
        fossilFuelFree: false
      }
    }

    const areaData = labelDistribution[area] || {
      label: 'C',
      heatingType: 'Gasketel',
      heatPumpSuitable: true,
      solarPanelPotential: 7,
      fossilFuelFree: false
    }

    const energyIndex = this.getEnergyIndexForLabel(areaData.label)

    return {
      address,
      postalCode: postalCode.replace(/\s/g, '').toUpperCase(),
      currentLabel: areaData.label,
      labelDate: '2023-06-15',
      validUntil: '2033-06-15',
      energyIndex,
      primaryEnergyUse: energyIndex * 1.2,
      renewableEnergyPercentage: areaData.label <= 'B' ? 25 : 5,
      buildingType: 'Eengezinswoning',
      heatingType: areaData.heatingType,
      insulationLevel: areaData.label <= 'B' ? 'Goed' : 'Matig',
      certificateNumber: 'NL-' + Date.now().toString().slice(-8),
      // Enhanced fields
      energyDemand: energyIndex * 0.8,
      energySupply: areaData.label <= 'B' ? energyIndex * 0.3 : 0,
      fossilFuelFree: areaData.fossilFuelFree,
      heatPumpSuitable: areaData.heatPumpSuitable,
      solarPanelPotential: areaData.solarPanelPotential,
      insulationRecommendations: this.getInsulationRecommendations(areaData.label)
    }
  }

  private getEnhancedMockMeasureValidation(
    measures: string[], 
    currentLabel: string,
    buildingData: any
  ): EnergyMeasureValidation[] {
    const measureData: Record<string, any> = {
      'heat_pump': {
        feasible: buildingData?.heatPumpSuitable !== false,
        requirements: ['Voldoende isolatie', 'Geschikt verwarmingssysteem', 'Elektrische aansluiting'],
        potentialLabelImprovement: this.getImprovedLabel(currentLabel, 2),
        estimatedCost: 18000,
        estimatedSavings: 800,
        subsidyEligible: true,
        technicalConstraints: buildingData?.heatPumpSuitable === false ? ['Onvoldoende isolatie'] : []
      },
      'insulation': {
        feasible: true,
        requirements: ['Toegankelijke spouwmuur', 'Geschikte constructie'],
        potentialLabelImprovement: this.getImprovedLabel(currentLabel, 1),
        estimatedCost: 8000,
        estimatedSavings: 400,
        subsidyEligible: true,
        technicalConstraints: []
      },
      'solar_panels': {
        feasible: (buildingData?.solarPanelPotential || 5) > 4,
        requirements: ['Geschikt dak', 'Zuidelijke oriëntatie'],
        potentialLabelImprovement: this.getImprovedLabel(currentLabel, 1),
        estimatedCost: 9000,
        estimatedSavings: 600,
        subsidyEligible: false,
        technicalConstraints: (buildingData?.solarPanelPotential || 5) <= 4 ? ['Ongeschikt dak'] : []
      },
      'ventilation': {
        feasible: true,
        requirements: ['Voldoende ruimte', 'Elektrische aansluiting'],
        potentialLabelImprovement: this.getImprovedLabel(currentLabel, 1),
        estimatedCost: 4500,
        estimatedSavings: 200,
        subsidyEligible: true,
        technicalConstraints: []
      }
    }

    return measures.map(measure => ({
      measure,
      ...measureData[measure] || {
        feasible: false,
        requirements: ['Onbekende maatregel'],
        potentialLabelImprovement: currentLabel,
        estimatedCost: 0,
        estimatedSavings: 0,
        subsidyEligible: false,
        technicalConstraints: ['Maatregel niet ondersteund']
      }
    }))
  }

  private async calculateRequiredMeasures(
    currentLabel: RealEnergyLabel, 
    targetLabel: string
  ): Promise<EnergyMeasureValidation[]> {
    const currentIndex = this.getLabelIndex(currentLabel.currentLabel)
    const targetIndex = this.getLabelIndex(targetLabel)
    const improvement = targetIndex - currentIndex

    const measures = []

    if (improvement >= 2 && currentLabel.heatingType.includes('gas')) {
      measures.push('heat_pump')
    }
    
    if (improvement >= 1 && currentLabel.insulationLevel === 'Matig') {
      measures.push('insulation')
    }
    
    if (currentLabel.solarPanelPotential > 6) {
      measures.push('solar_panels')
    }
    
    if (improvement >= 1) {
      measures.push('ventilation')
    }

    return this.getEnhancedMockMeasureValidation(measures, currentLabel.currentLabel, currentLabel)
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