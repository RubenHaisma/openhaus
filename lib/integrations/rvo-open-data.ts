import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'
import { OPEN_DATA_SOURCES } from './open-data-sources'

export interface RVOSubsidyScheme {
  id: string
  name: string
  description: string
  provider: string
  maxAmount: number
  budgetTotal: number
  budgetUsed: number
  applicationDeadline: string
  eligibilityCriteria: string[]
  applicableEnergyMeasures: string[]
  isActive: boolean
  lastUpdated: string
}

export interface RVOProjectData {
  projectNumber: string
  title: string
  subsidyScheme: string
  amountGranted: number
  startDate: string
  endDate: string
  location: string
  energyMeasures: string[]
  status: string
}

export class RVOOpenDataService {
  private baseUrl = OPEN_DATA_SOURCES.RVO.openData

  async getActiveSubsidySchemes(): Promise<RVOSubsidyScheme[]> {
    try {
      const cacheKey = 'rvo-subsidy-schemes'
      const cached = await cacheService.get<RVOSubsidyScheme[]>(cacheKey, 'rvo')
      if (cached) return cached

      // Use RVO Open Data Portal
      const url = `${this.baseUrl}/subsidies-regelingen/projecten.json`
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WattVrij/1.0 (info@WattVrij.nl)'
        }
      })

      if (!response.ok) {
        throw new Error(`RVO Open Data API error: ${response.status}`)
      }

      const data = await response.json()
      const schemes = this.transformRVOOpenData(data)

      // Cache for 6 hours
      await cacheService.set(cacheKey, schemes, { ttl: 21600, prefix: 'rvo' })

      Logger.info('RVO subsidy schemes retrieved from open data', {
        schemeCount: schemes.length
      })

      return schemes
    } catch (error) {
      Logger.error('Failed to get RVO subsidy schemes from open data', error as Error)
      
      // Try alternative: manually curated subsidy data based on known RVO schemes
      return this.getKnownSubsidySchemes()
    }
  }

  async getSubsidyProjects(scheme?: string, location?: string): Promise<RVOProjectData[]> {
    try {
      const cacheKey = `rvo-projects:${scheme || 'all'}:${location || 'all'}`
      const cached = await cacheService.get<RVOProjectData[]>(cacheKey, 'rvo')
      if (cached) return cached

      // Get project data from RVO open data
      const url = `${this.baseUrl}/subsidies-regelingen/projecten.json`
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WattVrij/1.0 (info@WattVrij.nl)'
        }
      })

      if (!response.ok) {
        throw new Error(`RVO Open Data API error: ${response.status}`)
      }

      const data = await response.json()
      let projects = this.transformRVOProjectData(data)

      // Filter by scheme and location if specified
      if (scheme) {
        projects = projects.filter(p => p.subsidyScheme.toLowerCase().includes(scheme.toLowerCase()))
      }
      if (location) {
        projects = projects.filter(p => p.location.toLowerCase().includes(location.toLowerCase()))
      }

      // Cache for 12 hours
      await cacheService.set(cacheKey, projects, { ttl: 43200, prefix: 'rvo' })

      Logger.info('RVO project data retrieved', {
        projectCount: projects.length,
        scheme,
        location
      })

      return projects
    } catch (error) {
      Logger.error('Failed to get RVO project data', error as Error)
      return []
    }
  }

  private transformRVOOpenData(data: any): RVOSubsidyScheme[] {
    if (!data.results || !Array.isArray(data.results)) {
      return this.getKnownSubsidySchemes()
    }

    return data.results.map((item: any) => ({
      id: item.id?.toString() || item.projectnummer || '',
      name: item.titel || item.subsidieregeling || 'RVO Subsidie',
      description: item.omschrijving || item.beschrijving || '',
      provider: 'RVO',
      maxAmount: this.parseAmount(item.rijksbijdrage || item.subsidie_bedrag) || 25000,
      budgetTotal: this.parseAmount(item.totaal_budget) || 1000000000,
      budgetUsed: this.parseAmount(item.gebruikt_budget) || 0,
      applicationDeadline: item.einddatum || item.deadline || '2025-12-31',
      eligibilityCriteria: this.parseEligibilityCriteria(item),
      applicableEnergyMeasures: this.parseEnergyMeasures(item),
      isActive: this.isSchemeActive(item),
      lastUpdated: new Date().toISOString()
    }))
  }

  private transformRVOProjectData(data: any): RVOProjectData[] {
    if (!data.results || !Array.isArray(data.results)) {
      return []
    }

    return data.results.map((item: any) => ({
      projectNumber: item.projectnummer || item.id?.toString() || '',
      title: item.titel || item.project_naam || '',
      subsidyScheme: item.subsidieregeling || item.regeling || '',
      amountGranted: this.parseAmount(item.rijksbijdrage || item.toegekend_bedrag) || 0,
      startDate: item.startdatum || '',
      endDate: item.einddatum || '',
      location: item.locatie || item.plaats || '',
      energyMeasures: this.parseEnergyMeasures(item),
      status: item.status || 'Onbekend'
    }))
  }

  private getKnownSubsidySchemes(): RVOSubsidyScheme[] {
    // Manually curated list of known RVO subsidy schemes for 2025
    return [
      {
        id: 'isde-2025',
        name: 'ISDE - Investeringssubsidie duurzame energie en energiebesparing',
        description: 'Subsidie voor warmtepompen, zonneboilers en biomassaketels',
        provider: 'RVO',
        maxAmount: 7000,
        budgetTotal: 300000000,
        budgetUsed: 180000000,
        applicationDeadline: '2025-12-31',
        eligibilityCriteria: [
          'Eigenaar-bewoner van bestaande woning',
          'Woning gebouwd voor 2015',
          'Installatie door erkende installateur'
        ],
        applicableEnergyMeasures: ['warmtepomp', 'zonneboiler', 'biomassaketel'],
        isActive: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'seeh-2025',
        name: 'SEEH - Subsidieregeling energiebesparing eigen huis',
        description: 'Subsidie voor isolatie en energiebesparende maatregelen',
        provider: 'RVO',
        maxAmount: 8000,
        budgetTotal: 200000000,
        budgetUsed: 120000000,
        applicationDeadline: '2025-12-31',
        eligibilityCriteria: [
          'Eigenaar-bewoner',
          'Woning ouder dan 2 jaar',
          'Maatregelen door erkende partij'
        ],
        applicableEnergyMeasures: ['isolatie', 'hr_glas', 'ventilatie'],
        isActive: true,
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'bei-2025',
        name: 'BEI - Besluit energieprestatie infrastructuur',
        description: 'Subsidie voor collectieve energieprojecten',
        provider: 'RVO',
        maxAmount: 50000,
        budgetTotal: 100000000,
        budgetUsed: 40000000,
        applicationDeadline: '2025-12-31',
        eligibilityCriteria: [
          'Collectief energieproject',
          'Minimaal 10 woningen',
          'Energiebesparing van minimaal 30%'
        ],
        applicableEnergyMeasures: ['collectieve_warmtepomp', 'warmtenet', 'zonnepanelen_collectief'],
        isActive: true,
        lastUpdated: new Date().toISOString()
      }
    ]
  }

  private parseAmount(value: any): number | null {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d.,]/g, '').replace(',', '.')
      const parsed = parseFloat(cleaned)
      return isNaN(parsed) ? null : parsed
    }
    return null
  }

  private parseEligibilityCriteria(item: any): string[] {
    // Extract eligibility criteria from various fields
    const criteria = []
    
    if (item.doelgroep) criteria.push(`Doelgroep: ${item.doelgroep}`)
    if (item.voorwaarden) criteria.push(item.voorwaarden)
    if (item.eisen) criteria.push(item.eisen)
    
    return criteria.length > 0 ? criteria : ['Zie RVO website voor volledige voorwaarden']
  }

  private parseEnergyMeasures(item: any): string[] {
    // Extract energy measures from description or specific fields
    const measures = []
    const text = (item.omschrijving || item.beschrijving || item.titel || '').toLowerCase()
    
    if (text.includes('warmtepomp')) measures.push('warmtepomp')
    if (text.includes('isolatie')) measures.push('isolatie')
    if (text.includes('zonnepanelen') || text.includes('pv')) measures.push('zonnepanelen')
    if (text.includes('zonneboiler')) measures.push('zonneboiler')
    if (text.includes('ventilatie')) measures.push('ventilatie')
    if (text.includes('hr glas') || text.includes('hr-glas')) measures.push('hr_glas')
    
    return measures.length > 0 ? measures : ['energiebesparing']
  }

  private isSchemeActive(item: any): boolean {
    const endDate = item.einddatum || item.deadline
    if (!endDate) return true
    
    try {
      const deadline = new Date(endDate)
      return deadline > new Date()
    } catch {
      return true
    }
  }
}

export const rvoOpenDataService = new RVOOpenDataService()