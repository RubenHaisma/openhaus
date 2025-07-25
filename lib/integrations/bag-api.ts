import { Logger } from '@/lib/monitoring/logger'
import { cacheService } from '@/lib/cache/redis'

export interface BuildingData {
  bagId: string
  address: string
  postalCode: string
  buildingYear: number
  buildingType: string
  usageFunction: string
  surfaceArea: number
  volume: number
  numberOfFloors: number
  constructionMaterial: string
  roofType: string
  heatingInstallation: string
  energyLabel?: string
  monumentStatus: boolean
  lastRenovation?: number
  coordinates: {
    lat: number
    lng: number
  }
}

export interface ConstructionDetails {
  foundationType: string
  wallMaterial: string
  roofMaterial: string
  windowType: string
  insulationLevel: {
    roof: string
    walls: string
    floor: string
    windows: string
  }
  ventilationSystem: string
  heatingSystem: string
  hotWaterSystem: string
  renewableEnergy: string[]
}

export interface UsagePermit {
  permitNumber: string
  permitType: string
  description: string
  issueDate: string
  validUntil?: string
  status: string
  relatedToEnergy: boolean
}

export class BAGApiService {
  private baseUrl = 'https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2'
  private apiKey = process.env.BAG_API_KEY

  constructor() {
    if (!this.apiKey) {
      Logger.warn('BAG API key not configured - using mock data')
    }
  }

  async getBuildingData(address: string, postalCode: string): Promise<BuildingData | null> {
    try {
      const cacheKey = `bag-building:${address}:${postalCode.replace(/\s/g, '').toUpperCase()}`
      const cached = await cacheService.get<BuildingData>(cacheKey, 'bag')
      if (cached) return cached

      if (!this.apiKey) {
        return this.getMockBuildingData(address, postalCode)
      }

      // First, get the BAG ID from address
      const bagId = await this.getBagIdFromAddress(address, postalCode)
      if (!bagId) return null

      // Then get detailed building data
      const response = await fetch(`${this.baseUrl}/verblijfsobjecten/${bagId}`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`BAG API error: ${response.status}`)
      }

      const data = await response.json()
      const buildingData = this.transformBuildingData(data)

      // Cache for 7 days (building data doesn't change often)
      await cacheService.set(cacheKey, buildingData, { ttl: 604800, prefix: 'bag' })

      Logger.info('Building data retrieved from BAG', { address, postalCode, bagId })
      return buildingData
    } catch (error) {
      Logger.error('Failed to get building data from BAG', error as Error, { address, postalCode })
      return this.getMockBuildingData(address, postalCode)
    }
  }

  async getConstructionDetails(bagId: string): Promise<ConstructionDetails | null> {
    try {
      if (!this.apiKey) {
        return this.getMockConstructionDetails()
      }

      const response = await fetch(`${this.baseUrl}/verblijfsobjecten/${bagId}/details`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`BAG API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformConstructionDetails(data)
    } catch (error) {
      Logger.error('Failed to get construction details from BAG', error as Error)
      return this.getMockConstructionDetails()
    }
  }

  async getUsagePermits(bagId: string): Promise<UsagePermit[]> {
    try {
      if (!this.apiKey) {
        return this.getMockUsagePermits()
      }

      const response = await fetch(`${this.baseUrl}/verblijfsobjecten/${bagId}/gebruiksvergunningen`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`BAG API error: ${response.status}`)
      }

      const data = await response.json()
      return this.transformUsagePermits(data)
    } catch (error) {
      Logger.error('Failed to get usage permits from BAG', error as Error)
      return this.getMockUsagePermits()
    }
  }

  private async getBagIdFromAddress(address: string, postalCode: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/adressen`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey!,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          postcode: postalCode.replace(/\s/g, '').toUpperCase(),
          huisnummer: this.extractHouseNumber(address)
        })
      })

      if (!response.ok) return null

      const data = await response.json()
      return data._embedded?.adressen?.[0]?.verblijfsobject?.identificatie || null
    } catch (error) {
      Logger.error('Failed to get BAG ID from address', error as Error)
      return null
    }
  }

  private extractHouseNumber(address: string): number {
    const match = address.match(/\d+/)
    return match ? parseInt(match[0]) : 1
  }

  private getMockBuildingData(address: string, postalCode: string): BuildingData {
    const area = postalCode.substring(0, 4)
    
    // Generate realistic data based on postal code area
    const buildingYearRanges: Record<string, number> = {
      '1000': 1920, // Amsterdam center - old
      '1001': 1900, // Amsterdam - very old
      '3000': 1950, // Rotterdam center - post-war
      '2500': 1930, // Den Haag center
      '3500': 1960, // Utrecht - newer
    }

    const baseYear = buildingYearRanges[area] || 1970
    const buildingYear = baseYear + Math.floor(Math.random() * 30)

    return {
      bagId: 'BAG-' + Date.now().toString(),
      address,
      postalCode: postalCode.replace(/\s/g, '').toUpperCase(),
      buildingYear,
      buildingType: 'Woonhuis',
      usageFunction: 'Woonfunctie',
      surfaceArea: 100 + Math.floor(Math.random() * 100),
      volume: 300 + Math.floor(Math.random() * 200),
      numberOfFloors: Math.floor(Math.random() * 3) + 1,
      constructionMaterial: buildingYear < 1950 ? 'Baksteen' : 'Beton',
      roofType: 'Hellend dak',
      heatingInstallation: buildingYear > 2000 ? 'HR-ketel' : 'Conventionele ketel',
      monumentStatus: buildingYear < 1920,
      lastRenovation: buildingYear < 1980 ? 2010 + Math.floor(Math.random() * 14) : undefined,
      coordinates: {
        lat: 52.3676 + (Math.random() - 0.5) * 0.1,
        lng: 4.9041 + (Math.random() - 0.5) * 0.1
      }
    }
  }

  private getMockConstructionDetails(): ConstructionDetails {
    return {
      foundationType: 'Gewapend beton',
      wallMaterial: 'Baksteen met spouwmuur',
      roofMaterial: 'Dakpannen',
      windowType: 'HR++ glas',
      insulationLevel: {
        roof: 'Goed geïsoleerd',
        walls: 'Matig geïsoleerd',
        floor: 'Basis isolatie',
        windows: 'HR++ glas'
      },
      ventilationSystem: 'Mechanische ventilatie',
      heatingSystem: 'CV-ketel op gas',
      hotWaterSystem: 'Combiketel',
      renewableEnergy: []
    }
  }

  private getMockUsagePermits(): UsagePermit[] {
    return [
      {
        permitNumber: 'VG-2023-001234',
        permitType: 'Gebruiksvergunning',
        description: 'Woonfunctie eengezinswoning',
        issueDate: '2023-01-15',
        status: 'Geldig',
        relatedToEnergy: false
      }
    ]
  }

  private transformBuildingData(data: any): BuildingData {
    const verblijfsobject = data.verblijfsobject || data

    return {
      bagId: verblijfsobject.identificatie,
      address: this.formatAddress(verblijfsobject),
      postalCode: verblijfsobject.postcode,
      buildingYear: verblijfsobject.oorspronkelijkBouwjaar || new Date().getFullYear() - 30,
      buildingType: verblijfsobject.typeWoonobject || 'Woning',
      usageFunction: verblijfsobject.gebruiksdoel?.[0] || 'Woonfunctie',
      surfaceArea: verblijfsobject.oppervlakte || 100,
      volume: verblijfsobject.inhoud || 300,
      numberOfFloors: verblijfsobject.aantalVerdiepingen || 2,
      constructionMaterial: verblijfsobject.bouwmateriaal || 'Baksteen',
      roofType: verblijfsobject.daktype || 'Hellend dak',
      heatingInstallation: verblijfsobject.verwarmingsinstallatie || 'CV-ketel',
      monumentStatus: verblijfsobject.monumentStatus || false,
      lastRenovation: verblijfsobject.laatsteRenovatie,
      coordinates: {
        lat: verblijfsobject.geometrie?.coordinates?.[1] || 52.3676,
        lng: verblijfsobject.geometrie?.coordinates?.[0] || 4.9041
      }
    }
  }

  private transformConstructionDetails(data: any): ConstructionDetails {
    return {
      foundationType: data.funderingstype || 'Onbekend',
      wallMaterial: data.wandmateriaal || 'Baksteen',
      roofMaterial: data.dakmateriaal || 'Dakpannen',
      windowType: data.raamtype || 'Dubbel glas',
      insulationLevel: {
        roof: data.isolatie?.dak || 'Onbekend',
        walls: data.isolatie?.muren || 'Onbekend',
        floor: data.isolatie?.vloer || 'Onbekend',
        windows: data.isolatie?.ramen || 'Onbekend'
      },
      ventilationSystem: data.ventilatiesysteem || 'Natuurlijke ventilatie',
      heatingSystem: data.verwarmingssysteem || 'CV-ketel',
      hotWaterSystem: data.warmwatersysteem || 'Combiketel',
      renewableEnergy: data.duurzameEnergie || []
    }
  }

  private transformUsagePermits(data: any): UsagePermit[] {
    return data.vergunningen?.map((permit: any) => ({
      permitNumber: permit.vergunningnummer,
      permitType: permit.type,
      description: permit.omschrijving,
      issueDate: permit.afgiftedatum,
      validUntil: permit.vervaldatum,
      status: permit.status,
      relatedToEnergy: permit.energiegerelateerd || false
    })) || []
  }

  private formatAddress(verblijfsobject: any): string {
    const straat = verblijfsobject.openbareRuimte?.naam || ''
    const huisnummer = verblijfsobject.huisnummer || ''
    const huisletter = verblijfsobject.huisletter || ''
    const toevoeging = verblijfsobject.huisnummertoevoeging || ''
    
    return `${straat} ${huisnummer}${huisletter}${toevoeging}`.trim()
  }
}

export const bagApiService = new BAGApiService()