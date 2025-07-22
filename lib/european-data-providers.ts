// European Property Data Providers Integration
// This module handles integration with major European property databases

export interface PropertyDataProvider {
  country: string
  name: string
  apiEndpoint: string
  apiKey?: string
  rateLimit: number
  dataTypes: string[]
}

export interface EuropeanPropertyData {
  id: string
  address: {
    street: string
    houseNumber: string
    postalCode: string
    city: string
    country: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  propertyDetails: {
    type: 'house' | 'apartment' | 'commercial' | 'land'
    constructionYear?: number
    squareMeters?: number
    bedrooms?: number
    bathrooms?: number
    energyLabel?: string
    wozValue?: number // Netherlands specific
    councilTaxBand?: string // UK specific
    einheitswert?: number // Germany specific
  }
  marketData: {
    estimatedValue: number
    lastSalePrice?: number
    lastSaleDate?: string
    pricePerSquareMeter: number
    marketTrend: 'rising' | 'stable' | 'falling'
  }
  legalInfo: {
    ownership: 'freehold' | 'leasehold' | 'ground_lease'
    restrictions?: string[]
    plannedDevelopments?: string[]
  }
}

// Netherlands - Kadaster Integration
export class KadasterProvider {
  private baseUrl = 'https://api.kadaster.nl'
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getPropertyByAddress(address: string, postalCode: string): Promise<EuropeanPropertyData | null> {
    try {
      // BAG API for basic property information
      const bagResponse = await fetch(`${this.baseUrl}/bag/v1/adressen`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json'
        },
        params: new URLSearchParams({
          postcode: postalCode,
          huisnummer: address.match(/\d+/)?.[0] || ''
        })
      })

      if (!bagResponse.ok) throw new Error('BAG API request failed')
      
      const bagData = await bagResponse.json()
      
      // BRK API for ownership and legal information
      const brkResponse = await fetch(`${this.baseUrl}/brk/v1/kadastraalonroerendezaken`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json'
        }
      })

      const brkData = await brkResponse.json()

      // WOZ API for valuation data
      const wozResponse = await fetch(`${this.baseUrl}/woz/v1/waardebeschikkingen`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/json'
        }
      })

      const wozData = await wozResponse.json()

      return this.transformKadasterData(bagData, brkData, wozData)
    } catch (error) {
      console.error('Kadaster API error:', error)
      return null
    }
  }

  private transformKadasterData(bagData: any, brkData: any, wozData: any): EuropeanPropertyData {
    return {
      id: bagData.identificatie,
      address: {
        street: bagData.openbareRuimteNaam,
        houseNumber: bagData.huisnummer.toString(),
        postalCode: bagData.postcode,
        city: bagData.woonplaatsNaam,
        country: 'Netherlands',
        coordinates: {
          lat: bagData.geopoint?.lat,
          lng: bagData.geopoint?.lon
        }
      },
      propertyDetails: {
        type: this.mapPropertyType(bagData.gebruiksdoel),
        constructionYear: bagData.oorspronkelijkBouwjaar,
        squareMeters: bagData.oppervlakte,
        energyLabel: bagData.energielabel,
        wozValue: wozData?.vastgesteldeWaarde
      },
      marketData: {
        estimatedValue: wozData?.vastgesteldeWaarde * 1.2, // Rough market estimation
        pricePerSquareMeter: (wozData?.vastgesteldeWaarde * 1.2) / bagData.oppervlakte,
        marketTrend: 'rising' // Would need additional market data
      },
      legalInfo: {
        ownership: brkData?.eigendomsituatie === 'Eigendom' ? 'freehold' : 'ground_lease',
        restrictions: brkData?.beperkingen || []
      }
    }
  }

  private mapPropertyType(gebruiksdoel: string): 'house' | 'apartment' | 'commercial' | 'land' {
    switch (gebruiksdoel) {
      case 'woonfunctie': return 'house'
      case 'winkelfunctie': return 'commercial'
      default: return 'house'
    }
  }
}

// UK - HM Land Registry Integration
export class UKLandRegistryProvider {
  private baseUrl = 'https://landregistry.data.gov.uk'

  async getPropertyByAddress(address: string, postcode: string): Promise<EuropeanPropertyData | null> {
    try {
      // Price Paid Data API
      const priceResponse = await fetch(`${this.baseUrl}/data/ppi/transaction-record.json`, {
        method: 'GET',
        params: new URLSearchParams({
          propertyAddress: address,
          postcode: postcode
        })
      })

      const priceData = await priceResponse.json()

      // Property Price Data
      const propertyResponse = await fetch(`${this.baseUrl}/data/ppd/transaction-record.json`, {
        method: 'GET',
        params: new URLSearchParams({
          postcode: postcode
        })
      })

      const propertyData = await propertyResponse.json()

      return this.transformUKData(priceData, propertyData, address, postcode)
    } catch (error) {
      console.error('UK Land Registry API error:', error)
      return null
    }
  }

  private transformUKData(priceData: any, propertyData: any, address: string, postcode: string): EuropeanPropertyData {
    const latestTransaction = priceData.result?.primaryTopic
    
    return {
      id: `uk_${postcode}_${address.replace(/\s/g, '_')}`,
      address: {
        street: address,
        houseNumber: address.match(/^\d+/)?.[0] || '',
        postalCode: postcode,
        city: latestTransaction?.propertyAddress?.town || '',
        country: 'United Kingdom'
      },
      propertyDetails: {
        type: this.mapUKPropertyType(latestTransaction?.propertyType),
        squareMeters: undefined, // Not typically available in UK data
      },
      marketData: {
        estimatedValue: latestTransaction?.pricePaid || 0,
        lastSalePrice: latestTransaction?.pricePaid,
        lastSaleDate: latestTransaction?.transactionDate,
        pricePerSquareMeter: 0, // Would need additional data
        marketTrend: 'stable'
      },
      legalInfo: {
        ownership: latestTransaction?.estateType === 'freehold' ? 'freehold' : 'leasehold'
      }
    }
  }

  private mapUKPropertyType(propertyType: string): 'house' | 'apartment' | 'commercial' | 'land' {
    switch (propertyType?.toLowerCase()) {
      case 'detached': return 'house'
      case 'semi-detached': return 'house'
      case 'terraced': return 'house'
      case 'flat': return 'apartment'
      case 'maisonette': return 'apartment'
      default: return 'house'
    }
  }
}

// Germany - Property Data Integration (via third-party APIs)
export class GermanyPropertyProvider {
  private immoscoutApiKey: string

  constructor(apiKey: string) {
    this.immoscoutApiKey = apiKey
  }

  async getPropertyByAddress(address: string, postalCode: string): Promise<EuropeanPropertyData | null> {
    try {
      // Note: Germany doesn't have a centralized public property database
      // This would integrate with services like ImmobilienScout24 API
      const response = await fetch('https://rest.immobilienscout24.de/restapi/api/search/v1.0/search/region', {
        headers: {
          'Authorization': `Bearer ${this.immoscoutApiKey}`,
          'Accept': 'application/json'
        },
        params: new URLSearchParams({
          geocodes: postalCode,
          realestatetype: 'housebuy'
        })
      })

      const data = await response.json()
      return this.transformGermanData(data, address, postalCode)
    } catch (error) {
      console.error('Germany property API error:', error)
      return null
    }
  }

  private transformGermanData(data: any, address: string, postalCode: string): EuropeanPropertyData {
    // Transform ImmobilienScout24 data to our standard format
    return {
      id: `de_${postalCode}_${address.replace(/\s/g, '_')}`,
      address: {
        street: address,
        houseNumber: address.match(/\d+/)?.[0] || '',
        postalCode: postalCode,
        city: data.city || '',
        country: 'Germany'
      },
      propertyDetails: {
        type: 'house',
        squareMeters: data.livingSpace,
        bedrooms: data.numberOfRooms,
        energyLabel: data.energyEfficiencyClass
      },
      marketData: {
        estimatedValue: data.price?.value || 0,
        pricePerSquareMeter: data.price?.value / data.livingSpace,
        marketTrend: 'rising'
      },
      legalInfo: {
        ownership: 'freehold'
      }
    }
  }
}

// France - Property Data Integration
export class FrancePropertyProvider {
  async getPropertyByAddress(address: string, postalCode: string): Promise<EuropeanPropertyData | null> {
    try {
      // Integration with French property databases would go here
      // This is a placeholder implementation
      return {
        id: `fr_${postalCode}_${address.replace(/\s/g, '_')}`,
        address: {
          street: address,
          houseNumber: address.match(/\d+/)?.[0] || '',
          postalCode: postalCode,
          city: '',
          country: 'France'
        },
        propertyDetails: {
          type: 'house'
        },
        marketData: {
          estimatedValue: 0,
          pricePerSquareMeter: 0,
          marketTrend: 'stable'
        },
        legalInfo: {
          ownership: 'freehold'
        }
      }
    } catch (error) {
      console.error('France property API error:', error)
      return null
    }
  }
}

// Main European Property Data Service
export class EuropeanPropertyDataService {
  private providers: Map<string, any> = new Map()

  constructor() {
    // Initialize providers with API keys from environment
    this.providers.set('NL', new KadasterProvider(process.env.KADASTER_API_KEY || ''))
    this.providers.set('UK', new UKLandRegistryProvider())
    this.providers.set('DE', new GermanyPropertyProvider(process.env.IMMOSCOUT_API_KEY || ''))
    this.providers.set('FR', new FrancePropertyProvider())
  }

  async getPropertyData(address: string, postalCode: string, country: string): Promise<EuropeanPropertyData | null> {
    const provider = this.providers.get(country.toUpperCase())
    if (!provider) {
      throw new Error(`No provider available for country: ${country}`)
    }

    return await provider.getPropertyByAddress(address, postalCode)
  }

  async getMultiCountryData(address: string, postalCode: string): Promise<EuropeanPropertyData[]> {
    const results: EuropeanPropertyData[] = []
    
    // Try to determine country from postal code format
    const country = this.detectCountryFromPostalCode(postalCode)
    
    if (country) {
      const data = await this.getPropertyData(address, postalCode, country)
      if (data) results.push(data)
    }

    return results
  }

  private detectCountryFromPostalCode(postalCode: string): string | null {
    // Netherlands: 1234 AB format
    if (/^\d{4}\s?[A-Z]{2}$/.test(postalCode)) return 'NL'
    
    // UK: Various formats like SW1A 1AA, M1 1AA, B33 8TH
    if (/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/.test(postalCode)) return 'UK'
    
    // Germany: 12345 format
    if (/^\d{5}$/.test(postalCode)) return 'DE'
    
    // France: 12345 format (same as Germany, would need additional logic)
    if (/^\d{5}$/.test(postalCode)) return 'FR'
    
    return null
  }
}

export const europeanPropertyService = new EuropeanPropertyDataService()