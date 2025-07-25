import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

export interface ContractorVerification {
  kvkNumber: string
  companyName: string
  isActive: boolean
  registrationDate: string
  businessAddress: string
  contactInfo: {
    phone?: string
    email?: string
    website?: string
  }
  certifications: {
    rvo: RVOCertification[]
    isso: ISSOCertification[]
    komo: KOMOCertification[]
    manufacturer: ManufacturerCertification[]
  }
  insurance: InsuranceInfo
  financialHealth: FinancialHealth
  projectHistory: ProjectHistory
  qualityScore: QualityScore
}

export interface RVOCertification {
  type: string // 'warmtepomp', 'isolatie', 'zonnepanelen'
  number: string
  validFrom: string
  validUntil: string
  scope: string[]
  status: 'active' | 'suspended' | 'expired'
}

export interface ISSOCertification {
  type: string // 'WP-ketel', 'WP-lucht', 'WP-bodem'
  level: string
  validUntil: string
  status: 'active' | 'expired'
}

export interface KOMOCertification {
  productType: string
  certificateNumber: string
  validUntil: string
  scope: string[]
}

export interface ManufacturerCertification {
  manufacturer: string // 'Daikin', 'Mitsubishi', 'Viessmann'
  productLines: string[]
  level: string // 'Bronze', 'Silver', 'Gold', 'Platinum'
  validUntil: string
}

export interface InsuranceInfo {
  liability: {
    insured: boolean
    amount: number
    validUntil: string
    provider: string
  }
  professional: {
    insured: boolean
    amount: number
    validUntil: string
  }
  warranty: {
    provided: boolean
    duration: number // years
    scope: string[]
  }
}

export interface FinancialHealth {
  creditRating: string // 'AAA', 'AA', 'A', 'BBB', 'BB', 'B'
  paymentBehavior: string // 'excellent', 'good', 'average', 'poor'
  bankruptcyRisk: 'low' | 'medium' | 'high'
  lastUpdated: string
}

export interface ProjectHistory {
  totalProjects: number
  completedProjects: number
  averageProjectValue: number
  specialtyBreakdown: Record<string, number>
  customerSatisfaction: number
  onTimeCompletion: number
  budgetAdherence: number
  recentProjects: RecentProject[]
}

export interface RecentProject {
  type: string
  value: number
  completionDate: string
  customerRating: number
  onTime: boolean
  onBudget: boolean
}

export interface QualityScore {
  overall: number // 0-100
  breakdown: {
    certifications: number
    experience: number
    customerSatisfaction: number
    financialStability: number
    compliance: number
  }
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: string
}

export class ContractorVerificationService {
  private kvkApiUrl = 'https://api.kvk.nl/api/v1'
  private rvoApiUrl = process.env.RVO_API_URL || 'https://api.rvo.nl/v1'
  private kvkApiKey = process.env.KVK_API_KEY
  private rvoApiKey = process.env.RVO_API_KEY

  constructor() {
    if (!this.kvkApiKey) {
      Logger.warn('KVK API key not configured - using enhanced mock data')
    }
    if (!this.rvoApiKey) {
      Logger.warn('RVO API key not configured - using enhanced mock data')
    }
  }

  async verifyContractor(kvkNumber: string): Promise<ContractorVerification | null> {
    try {
      const cacheKey = `contractor-verification:${kvkNumber}`
      const cached = await cacheService.get<ContractorVerification>(cacheKey, 'contractors')
      if (cached) return cached

      if (!this.kvkApiKey || !this.rvoApiKey) {
        throw new Error('No real KVK or RVO API key configured')
      }

      // Get basic company info from KVK
      const companyInfo = await this.getKVKCompanyInfo(kvkNumber)
      if (!companyInfo) return null

      // Get RVO certifications
      const rvoCertifications = await this.getRVOCertifications(kvkNumber)
      
      // Get ISSO certifications
      const issoCertifications = await this.getISSOCertifications(kvkNumber)
      
      // Get insurance information
      const insuranceInfo = await this.getInsuranceInfo(kvkNumber)
      
      // Get financial health
      const financialHealth = await this.getFinancialHealth(kvkNumber)
      
      // Get project history
      const projectHistory = await this.getProjectHistory(kvkNumber)
      
      // Calculate quality score
      const qualityScore = this.calculateQualityScore({
        certifications: { rvo: rvoCertifications, isso: issoCertifications },
        financialHealth,
        projectHistory
      })

      const verification: ContractorVerification = {
        kvkNumber,
        companyName: companyInfo.name,
        isActive: companyInfo.isActive,
        registrationDate: companyInfo.registrationDate,
        businessAddress: companyInfo.address,
        contactInfo: companyInfo.contactInfo,
        certifications: {
          rvo: rvoCertifications,
          isso: issoCertifications,
          komo: [],
          manufacturer: []
        },
        insurance: insuranceInfo,
        financialHealth,
        projectHistory,
        qualityScore
      }

      // Cache for 24 hours
      await cacheService.set(cacheKey, verification, { ttl: 86400, prefix: 'contractors' })

      Logger.audit('Contractor verified', {
        kvkNumber,
        companyName: verification.companyName,
        qualityScore: verification.qualityScore.overall,
        rvoVerified: verification.certifications.rvo.length > 0
      })

      return verification
    } catch (error) {
      Logger.error('Contractor verification failed', error as Error, { kvkNumber })
      throw new Error('No real contractor verification data available')
    }
  }

  async bulkVerifyContractors(kvkNumbers: string[]): Promise<ContractorVerification[]> {
    const verifications = await Promise.all(
      kvkNumbers.map(kvkNumber => this.verifyContractor(kvkNumber))
    )
    
    return verifications.filter(v => v !== null) as ContractorVerification[]
  }

  async searchVerifiedContractors(criteria: {
    specialty?: string
    location?: string
    minQualityScore?: number
    certificationRequired?: string[]
    maxDistance?: number
  }): Promise<ContractorVerification[]> {
    throw new Error('No real contractor search implemented')
  }

  private async getKVKCompanyInfo(kvkNumber: string): Promise<any> {
    try {
      if (!this.kvkApiKey) {
        throw new Error('No real KVK API key configured')
      }

      const response = await fetch(`${this.kvkApiUrl}/companies/${kvkNumber}`, {
        headers: {
          'apikey': this.kvkApiKey,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`KVK API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        name: data.name,
        isActive: data.status === 'active',
        registrationDate: data.registrationDate,
        address: data.addresses?.[0]?.formattedAddress,
        contactInfo: {
          phone: data.contactInformation?.phoneNumber,
          email: data.contactInformation?.emailAddress,
          website: data.contactInformation?.website
        }
      }
    } catch (error) {
      Logger.error('KVK API call failed', error as Error)
      throw error
    }
  }

  private async getRVOCertifications(kvkNumber: string): Promise<RVOCertification[]> {
    try {
      if (!this.rvoApiKey) {
        throw new Error('No real RVO API key configured')
      }

      const response = await fetch(`${this.rvoApiUrl}/contractors/${kvkNumber}/certifications`, {
        headers: {
          'Authorization': `Bearer ${this.rvoApiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`RVO API error: ${response.status}`)
      }

      const data = await response.json()
      return data.certifications || []
    } catch (error) {
      Logger.error('RVO certification check failed', error as Error)
      return []
    }
  }

  private async getISSOCertifications(kvkNumber: string): Promise<ISSOCertification[]> {
    throw new Error('No real ISSO certification implemented')
  }

  private async getInsuranceInfo(kvkNumber: string): Promise<InsuranceInfo> {
    throw new Error('No real insurance info implemented')
  }

  private async getFinancialHealth(kvkNumber: string): Promise<FinancialHealth> {
    throw new Error('No real financial health info implemented')
  }

  private async getProjectHistory(kvkNumber: string): Promise<ProjectHistory> {
    throw new Error('No real project history implemented')
  }

  private calculateQualityScore(data: {
    certifications: any
    financialHealth: FinancialHealth
    projectHistory: ProjectHistory
  }): QualityScore {
    let score = 0
    const breakdown = {
      certifications: 0,
      experience: 0,
      customerSatisfaction: 0,
      financialStability: 0,
      compliance: 0
    }

    // Certifications (30%)
    const rvoCount = data.certifications.rvo?.length || 0
    const issoCount = data.certifications.isso?.length || 0
    breakdown.certifications = Math.min(100, (rvoCount * 20) + (issoCount * 15))
    score += breakdown.certifications * 0.3

    // Experience (20%)
    const projectCount = data.projectHistory.totalProjects
    breakdown.experience = Math.min(100, projectCount * 2)
    score += breakdown.experience * 0.2

    // Customer satisfaction (25%)
    breakdown.customerSatisfaction = data.projectHistory.customerSatisfaction * 20
    score += breakdown.customerSatisfaction * 0.25

    // Financial stability (15%)
    const creditScore = this.getCreditScore(data.financialHealth.creditRating)
    breakdown.financialStability = creditScore
    score += breakdown.financialStability * 0.15

    // Compliance (10%)
    const onTimeRate = data.projectHistory.onTimeCompletion
    breakdown.compliance = onTimeRate
    score += breakdown.compliance * 0.1

    const overall = Math.round(score)
    const riskLevel = overall >= 80 ? 'low' : overall >= 60 ? 'medium' : 'high'
    const recommendation = this.getRecommendation(overall, breakdown)

    return {
      overall,
      breakdown,
      riskLevel,
      recommendation
    }
  }

  private getCreditScore(rating: string): number {
    const scores: Record<string, number> = {
      'AAA': 100, 'AA': 90, 'A': 80, 'BBB': 70, 'BB': 60, 'B': 50
    }
    return scores[rating] || 40
  }

  private getRecommendation(score: number, breakdown: any): string {
    if (score >= 85) return 'Uitstekende keuze - hoge kwaliteit en betrouwbaarheid'
    if (score >= 75) return 'Goede keuze - betrouwbare installateur'
    if (score >= 65) return 'Acceptabel - controleer referenties extra'
    if (score >= 50) return 'Voorzichtigheid geboden - vraag garanties'
    return 'Niet aanbevolen - zoek alternatief'
  }
}

export const contractorVerificationService = new ContractorVerificationService()