import axios from 'axios'

export interface EnergyLabelData {
  energielabel: string
  energieIndex: number
  geldigTot: string
  opnamedatum: string
  registratiedatum: string
  gebouwklasse: string
  energiebehoefte: number
  energiegebruik: number
  co2Uitstoot: number
}

export interface EnergyImpactCalculation {
  currentLabel: string
  potentialSavings: number
  improvementCosts: number
  paybackPeriod: number
  valueIncrease: number
  recommendations: EnergyRecommendation[]
}

export interface EnergyRecommendation {
  measure: string
  cost: number
  savings: number
  labelImprovement: string
  priority: 'high' | 'medium' | 'low'
}

export class EnergyDataProvider {
  private rvoApiKey: string
  private epOnlineApiKey: string

  constructor() {
    this.rvoApiKey = process.env.RVO_API_KEY! // Rijksdienst voor Ondernemend Nederland
    this.epOnlineApiKey = process.env.EP_ONLINE_API_KEY! // EP-Online database
  }

  async getEnergyLabel(address: string, postalCode: string): Promise<EnergyLabelData | null> {
    try {
      // Query EP-Online database for energy labels
      const response = await axios.get('https://api.ep-online.nl/v1/energielabels', {
        headers: {
          'Authorization': `Bearer ${this.epOnlineApiKey}`,
          'Accept': 'application/json'
        },
        params: {
          postcode: postalCode.replace(/\s/g, ''),
          huisnummer: this.extractHouseNumber(address),
          status: 'definitief'
        }
      })

      if (response.data.energielabels?.length) {
        const label = response.data.energielabels[0]
        return {
          energielabel: label.energielabel,
          energieIndex: label.energieIndex,
          geldigTot: label.geldigTot,
          opnamedatum: label.opnamedatum,
          registratiedatum: label.registratiedatum,
          gebouwklasse: label.gebouwklasse,
          energiebehoefte: label.energiebehoefte,
          energiegebruik: label.energiegebruik,
          co2Uitstoot: label.co2Uitstoot
        }
      }

      return null
    } catch (error) {
      console.error('EP-Online API error:', error)
      return null
    }
  }

  async calculateEnergyImpact(
    currentLabel: string,
    propertyType: string,
    squareMeters: number,
    constructionYear: number
  ): Promise<EnergyImpactCalculation> {
    try {
      // Get energy improvement recommendations from RVO
      const response = await axios.post('https://api.rvo.nl/v1/energiebesparingsmaatregelen', {
        huidigLabel: currentLabel,
        woningtype: propertyType,
        oppervlakte: squareMeters,
        bouwjaar: constructionYear
      }, {
        headers: {
          'Authorization': `Bearer ${this.rvoApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      const recommendations = response.data.maatregelen.map((measure: any) => ({
        measure: measure.maatregel,
        cost: measure.investering,
        savings: measure.jaarlijkseBesparing,
        labelImprovement: measure.labelVerbetering,
        priority: this.calculatePriority(measure.terugverdientijd)
      }))

      const totalCosts = recommendations.reduce((sum: number, rec: EnergyRecommendation) => sum + rec.cost, 0)
      const totalSavings = recommendations.reduce((sum: number, rec: EnergyRecommendation) => sum + rec.savings, 0)
      const paybackPeriod = totalCosts / totalSavings

      // Calculate property value increase based on energy label improvement
      const valueIncrease = await this.calculateValueIncrease(currentLabel, squareMeters)

      return {
        currentLabel,
        potentialSavings: totalSavings,
        improvementCosts: totalCosts,
        paybackPeriod,
        valueIncrease,
        recommendations
      }
    } catch (error) {
      console.error('RVO API error:', error)
      throw new Error('Failed to calculate energy impact')
    }
  }

  async getCurrentEnergyPrices(): Promise<{ electricity: number; gas: number }> {
    try {
      // Get current energy prices from ACM (Autoriteit Consument & Markt)
      const response = await axios.get('https://api.acm.nl/v1/energietarieven/actueel', {
        headers: {
          'Accept': 'application/json'
        }
      })

      return {
        electricity: response.data.elektriciteit.gemiddeldTarief, // €/kWh
        gas: response.data.gas.gemiddeldTarief // €/m³
      }
    } catch (error) {
      console.error('ACM API error:', error)
      // Fallback to recent average prices
      return {
        electricity: 0.30, // €0.30 per kWh
        gas: 1.20 // €1.20 per m³
      }
    }
  }

  private extractHouseNumber(address: string): number {
    const match = address.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  private calculatePriority(paybackPeriod: number): 'high' | 'medium' | 'low' {
    if (paybackPeriod <= 5) return 'high'
    if (paybackPeriod <= 10) return 'medium'
    return 'low'
  }

  private async calculateValueIncrease(currentLabel: string, squareMeters: number): Promise<number> {
    // Energy label improvements typically increase property value
    const labelValues: Record<string, number> = {
      'A+++': 1.10, 'A++': 1.08, 'A+': 1.05, 'A': 1.02,
      'B': 1.00, 'C': 0.98, 'D': 0.95, 'E': 0.92, 'F': 0.88, 'G': 0.85
    }

    const currentMultiplier = labelValues[currentLabel] || 1.0
    const targetMultiplier = labelValues['A'] || 1.02 // Assume improvement to A label

    // Estimate value increase per m² (based on market research)
    const valueIncreasePerSqm = 50 // €50 per m² per label step
    const labelSteps = Object.keys(labelValues).indexOf('A') - Object.keys(labelValues).indexOf(currentLabel)
    
    return Math.max(0, labelSteps * valueIncreasePerSqm * squareMeters)
  }
}

export const energyDataProvider = new EnergyDataProvider()