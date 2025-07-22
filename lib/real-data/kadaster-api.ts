import axios from 'axios'

export interface KadasterPropertyData {
  identificatie: string
  openbareRuimteNaam: string
  huisnummer: number
  postcode: string
  woonplaatsNaam: string
  gebruiksdoel: string[]
  oppervlakte: number
  oorspronkelijkBouwjaar: number
  energielabel?: string
  wozWaarde?: number
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface WOZData {
  vastgesteldeWaarde: number
  waardepeildatum: string
  beschikkingsnummer: string
}

export class KadasterAPIClient {
  private baseUrl = 'https://api.bag.kadaster.nl/lvbag/individuelebevragingen/v2'
  private apiKey: string

  constructor() {
    this.apiKey = process.env.KADASTER_API_KEY!
    if (!this.apiKey) {
      throw new Error('KADASTER_API_KEY environment variable is required')
    }
  }

  async getPropertyByAddress(address: string, postalCode: string): Promise<KadasterPropertyData | null> {
    try {
      // Clean postal code (remove spaces)
      const cleanPostalCode = postalCode.replace(/\s/g, '')
      
      // Extract house number from address
      const houseNumberMatch = address.match(/(\d+)/)
      if (!houseNumberMatch) {
        throw new Error('Could not extract house number from address')
      }
      const houseNumber = parseInt(houseNumberMatch[1])

      // First, get the address ID (nummeraanduiding)
      const addressResponse = await axios.get(`${this.baseUrl}/nummeraanduidingen`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/hal+json'
        },
        params: {
          postcode: cleanPostalCode,
          huisnummer: houseNumber
        }
      })

      if (!addressResponse.data._embedded?.nummeraanduidingen?.length) {
        return null
      }

      const nummeraanduiding = addressResponse.data._embedded.nummeraanduidingen[0]
      
      // Get detailed address information
      const detailResponse = await axios.get(`${this.baseUrl}/nummeraanduidingen/${nummeraanduiding.identificatie}`, {
        headers: {
          'X-Api-Key': this.apiKey,
          'Accept': 'application/hal+json'
        }
      })

      const addressDetail = detailResponse.data

      // Get building information (verblijfsobject)
      let buildingData = null
      if (addressDetail._links?.bijbehorendeVerblijfsobjecten) {
        const buildingResponse = await axios.get(addressDetail._links.bijbehorendeVerblijfsobjecten.href, {
          headers: {
            'X-Api-Key': this.apiKey,
            'Accept': 'application/hal+json'
          }
        })
        
        if (buildingResponse.data._embedded?.verblijfsobjecten?.length) {
          buildingData = buildingResponse.data._embedded.verblijfsobjecten[0]
        }
      }

      return {
        identificatie: nummeraanduiding.identificatie,
        openbareRuimteNaam: addressDetail.openbareRuimteNaam,
        huisnummer: addressDetail.huisnummer,
        postcode: addressDetail.postcode,
        woonplaatsNaam: addressDetail.woonplaatsNaam,
        gebruiksdoel: buildingData?.gebruiksdoelen || [],
        oppervlakte: buildingData?.oppervlakte || 0,
        oorspronkelijkBouwjaar: buildingData?.oorspronkelijkBouwjaar || 0,
        coordinates: buildingData?.geometrie ? {
          lat: buildingData.geometrie.coordinates[1],
          lng: buildingData.geometrie.coordinates[0]
        } : undefined
      }
    } catch (error) {
      console.error('Kadaster API error:', error)
      throw new Error('Failed to fetch property data from Kadaster')
    }
  }

  async getWOZValue(propertyId: string): Promise<WOZData | null> {
    try {
      // Note: WOZ data requires separate API access through municipalities
      // This is a placeholder for the actual WOZ API integration
      const response = await axios.get(`https://api.woz.nl/v1/waardebeschikkingen`, {
        headers: {
          'Authorization': `Bearer ${process.env.WOZ_API_KEY}`,
          'Accept': 'application/json'
        },
        params: {
          verblijfsobjectIdentificatie: propertyId
        }
      })

      if (response.data.waardebeschikkingen?.length) {
        const wozData = response.data.waardebeschikkingen[0]
        return {
          vastgesteldeWaarde: wozData.vastgesteldeWaarde,
          waardepeildatum: wozData.waardepeildatum,
          beschikkingsnummer: wozData.beschikkingsnummer
        }
      }

      return null
    } catch (error) {
      console.error('WOZ API error:', error)
      return null
    }
  }
}

export const kadasterClient = new KadasterAPIClient()