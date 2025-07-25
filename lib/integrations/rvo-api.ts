import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

export interface SubsidyScheme {
  id: string
  name: string
  provider: string
  description: string
  maxAmount: number
  eligibilityCriteria: Record<string, any>
  applicableEnergyMeasures: string[]
  validFrom: string
  validUntil: string
  budgetRemaining: number
  applicationDeadline: string
  isActive: boolean
}

export interface EligibilityResult {
  eligible: boolean
  eligibleSchemes: SubsidyScheme[]
  totalMaxSubsidy: number
  requirements: string[]
  nextSteps: string[]
}

export interface ContractorCertification {
  kvkNumber: string
  companyName: string
  certifications: {
    rvo: boolean
    isso: boolean
    komo: boolean
    validUntil: string
  }
  specialties: string[]
  serviceArea: string[]
  rating: number
  projectsCompleted: number
}

export interface ApplicationResult {
  success: boolean
  referenceNumber?: string
  estimatedProcessingTime?: string
  requiredDocuments?: string[]
  error?: string
}

export class RVOApiService {
  private baseUrl = process.env.RVO_API_URL || 'https://api.rvo.nl/v1'
  private apiKey = process.env.RVO_API_KEY

  constructor() {
    if (!this.apiKey) {
      Logger.warn('RVO API key not configured - using mock data')
    }
  }

  async getSubsidySchemes(): Promise<SubsidyScheme[]> {
    try {
      // Check cache first
      const cached = await cacheService.get<SubsidyScheme[]>('subsidy-schemes', 'rvo')
      if (cached) return cached

      if (!this.apiKey) {
        return this.getMockSubsidySchemes()
      }

      const response = await fetch(`${this.baseUrl}/subsidies/schemes`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`RVO API error: ${response.status}`)
      }

      const data = await response.json()
      const schemes = this.transformRVOSchemes(data)

      // Cache for 1 hour
      await cacheService.set('subsidy-schemes', schemes, { ttl: 3600, prefix: 'rvo' })

      return schemes
    } catch (error) {
      Logger.error('Failed to fetch RVO subsidy schemes', error as Error)
      return this.getMockSubsidySchemes()
    }
  }

  async checkEligibility(propertyData: {
    address: string
    postalCode: string
    energyLabel: string
    constructionYear: number
    propertyType: string
    ownerOccupied: boolean
    householdIncome?: number
  }): Promise<EligibilityResult> {
    try {
      if (!this.apiKey) {
        return this.getMockEligibilityResult(propertyData)
      }

      const response = await fetch(`${this.baseUrl}/subsidies/eligibility`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(propertyData)
      })

      if (!response.ok) {
        throw new Error(`RVO API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformEligibilityResult(data)
    } catch (error) {
      Logger.error('Failed to check RVO eligibility', error as Error)
      return this.getMockEligibilityResult(propertyData)
    }
  }

  async getContractorCertifications(kvkNumber: string): Promise<ContractorCertification | null> {
    try {
      if (!this.apiKey) {
        return this.getMockContractorCertification(kvkNumber)
      }

      const response = await fetch(`${this.baseUrl}/contractors/${kvkNumber}/certifications`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`RVO API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformContractorData(data)
    } catch (error) {
      Logger.error('Failed to get contractor certifications', error as Error)
      return this.getMockContractorCertification(kvkNumber)
    }
  }

  async submitApplication(applicationData: {
    schemeId: string
    propertyData: any
    applicantData: any
    projectDetails: any
  }): Promise<ApplicationResult> {
    try {
      if (!this.apiKey) {
        return {
          success: true,
          referenceNumber: 'MOCK-' + Date.now(),
          estimatedProcessingTime: '6-8 weeks',
          requiredDocuments: ['Energy label', 'Property ownership proof', 'Contractor quotes']
        }
      }

      const response = await fetch(`${this.baseUrl}/subsidies/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: errorData.message || 'Application submission failed'
        }
      }

      const data = await response.json()
      return {
        success: true,
        referenceNumber: data.referenceNumber,
        estimatedProcessingTime: data.estimatedProcessingTime,
        requiredDocuments: data.requiredDocuments
      }
    } catch (error) {
      Logger.error('Failed to submit RVO application', error as Error)
      return {
        success: false,
        error: 'Application submission failed'
      }
    }
  }

  private getMockSubsidySchemes(): SubsidyScheme[] {
    return [
      {
        id: 'isde-2024',
        name: 'ISDE Subsidie 2024',
        provider: 'RVO',
        description: 'Subsidie voor duurzame energie in bestaande woningen',
        maxAmount: 7000,
        eligibilityCriteria: {
          propertyAge: 'Voor 2018',
          ownerOccupied: true,
          energyLabel: 'C of lager'
        },
        applicableEnergyMeasures: ['heat_pump', 'solar_boiler', 'biomass_boiler'],
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        budgetRemaining: 85,
        applicationDeadline: '2024-12-31',
        isActive: true
      },
      {
        id: 'seeh-2024',
        name: 'SEEH Subsidie 2024',
        provider: 'RVO',
        description: 'Subsidie energiebesparende maatregelen eigen huis',
        maxAmount: 8000,
        eligibilityCriteria: {
          propertyAge: 'Voor 2018',
          ownerOccupied: true,
          incomeLimit: 43000
        },
        applicableEnergyMeasures: ['insulation', 'hr_glass', 'ventilation'],
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
        budgetRemaining: 72,
        applicationDeadline: '2024-12-31',
        isActive: true
      }
    ]
  }

  private getMockEligibilityResult(propertyData: any): EligibilityResult {
    const schemes = this.getMockSubsidySchemes()
    const eligibleSchemes = schemes.filter(scheme => {
      // Simple mock eligibility logic
      if (propertyData.constructionYear > 2018) return false
      if (propertyData.energyLabel === 'A' || propertyData.energyLabel === 'A+') return false
      return true
    })

    return {
      eligible: eligibleSchemes.length > 0,
      eligibleSchemes,
      totalMaxSubsidy: eligibleSchemes.reduce((sum, scheme) => sum + scheme.maxAmount, 0),
      requirements: [
        'Woning moet voor 2018 gebouwd zijn',
        'Eigenaar-bewoner',
        'Energielabel C of lager'
      ],
      nextSteps: [
        'Vraag offertes aan bij gecertificeerde installateurs',
        'Dien subsidieaanvraag in vóór start werkzaamheden',
        'Bewaar alle facturen en certificaten'
      ]
    }
  }

  private getMockContractorCertification(kvkNumber: string): ContractorCertification {
    return {
      kvkNumber,
      companyName: 'Mock Energy Solutions',
      certifications: {
        rvo: true,
        isso: true,
        komo: false,
        validUntil: '2025-12-31'
      },
      specialties: ['heat_pump', 'insulation', 'solar_panels'],
      serviceArea: ['Noord-Holland', 'Utrecht'],
      rating: 4.7,
      projectsCompleted: 156
    }
  }

  private transformRVOSchemes(data: any): SubsidyScheme[] {
    // Transform RVO API response to our format
    return data.schemes?.map((scheme: any) => ({
      id: scheme.id,
      name: scheme.name,
      provider: scheme.provider || 'RVO',
      description: scheme.description,
      maxAmount: scheme.maxAmount,
      eligibilityCriteria: scheme.eligibilityCriteria,
      applicableEnergyMeasures: scheme.applicableEnergyMeasures,
      validFrom: scheme.validFrom,
      validUntil: scheme.validUntil,
      budgetRemaining: scheme.budgetRemaining,
      applicationDeadline: scheme.applicationDeadline,
      isActive: scheme.isActive
    })) || []
  }

  private transformEligibilityResult(data: any): EligibilityResult {
    return {
      eligible: data.eligible,
      eligibleSchemes: data.eligibleSchemes || [],
      totalMaxSubsidy: data.totalMaxSubsidy || 0,
      requirements: data.requirements || [],
      nextSteps: data.nextSteps || []
    }
  }

  private transformContractorData(data: any): ContractorCertification {
    return {
      kvkNumber: data.kvkNumber,
      companyName: data.companyName,
      certifications: data.certifications,
      specialties: data.specialties || [],
      serviceArea: data.serviceArea || [],
      rating: data.rating || 0,
      projectsCompleted: data.projectsCompleted || 0
    }
  }
}

export const rvoApiService = new RVOApiService()