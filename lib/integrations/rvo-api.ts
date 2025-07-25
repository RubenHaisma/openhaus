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
        Logger.warn('RVO API key niet geconfigureerd - probeer open data endpoint van RVO')
        // Open data endpoint (voorbeeld):
        const openDataUrl = 'https://data.rvo.nl/subsidies-regelingen/projecten?format=json'
        const response = await fetch(openDataUrl)
        if (!response.ok) {
          Logger.error('RVO open data endpoint niet bereikbaar', new Error(`Status: ${response.status}`))
          return []
        }
        const data = await response.json()
        // Transformeer open data naar SubsidyScheme[]
        const schemes = (data?.results || []).map((item: any) => ({
          id: item.id?.toString() || item.projectnummer || '',
          name: item.titel || item.subsidieregeling || 'RVO Subsidie',
          provider: 'RVO',
          description: item.omschrijving || '',
          maxAmount: item.rijksbijdrage || 0,
          eligibilityCriteria: {}, // Open data bevat geen criteria per project
          applicableEnergyMeasures: [], // Niet gestructureerd in open data
          validFrom: item.startdatum || '',
          validUntil: item.einddatum || '',
          budgetRemaining: 0, // Niet beschikbaar in open data
          applicationDeadline: item.einddatum || '',
          isActive: true // Geen status in open data, ga uit van actief
        }))
        // Cache voor 1 uur
        await cacheService.set('subsidy-schemes', schemes, { ttl: 3600, prefix: 'rvo' })
        return schemes
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
      return []
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
        Logger.warn('RVO API key not configured - cannot check real eligibility')
        return {
          eligible: false,
          eligibleSchemes: [],
          totalMaxSubsidy: 0,
          requirements: ['RVO API key required for real eligibility check'],
          nextSteps: ['Configure RVO API access']
        }
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
      return {
        eligible: false,
        eligibleSchemes: [],
        totalMaxSubsidy: 0,
        requirements: ['API error occurred'],
        nextSteps: ['Try again later']
      }
    }
  }

  async getContractorCertifications(kvkNumber: string): Promise<ContractorCertification | null> {
    try {
      if (!this.apiKey) {
        Logger.warn('RVO API key not configured - cannot verify contractor certifications')
        return null
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
      return null
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
        Logger.warn('RVO API key not configured - cannot submit real applications')
        return {
          success: false,
          error: 'RVO API key required for real application submission'
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