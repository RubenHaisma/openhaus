import axios from 'axios'

export interface ShippingAddress {
  name: string
  company?: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

export interface Package {
  weight: number
  length: number
  width: number
  height: number
  value?: number
}

export interface ShippingRate {
  carrier: string
  service: string
  rate: number
  currency: string
  deliveryDays?: number
  deliveryDate?: string
}

export interface ShipmentData {
  from: ShippingAddress
  to: ShippingAddress
  package: Package
  service?: string
}

export class FedExShipping {
  private apiKey: string
  private apiSecret: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.FEDEX_API_KEY!
    this.apiSecret = process.env.FEDEX_API_SECRET!
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://apis.fedex.com' 
      : 'https://apis-sandbox.fedex.com'
  }

  async getRates(shipment: ShipmentData): Promise<ShippingRate[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/rate/v1/rates/quotes`, {
        accountNumber: {
          value: process.env.FEDEX_ACCOUNT_NUMBER
        },
        requestedShipment: {
          shipper: {
            address: this.formatAddress(shipment.from)
          },
          recipient: {
            address: this.formatAddress(shipment.to)
          },
          pickupType: 'USE_SCHEDULED_PICKUP',
          serviceType: shipment.service || 'FEDEX_GROUND',
          packagingType: 'YOUR_PACKAGING',
          requestedPackageLineItems: [{
            weight: {
              units: 'LB',
              value: shipment.package.weight
            },
            dimensions: {
              length: shipment.package.length,
              width: shipment.package.width,
              height: shipment.package.height,
              units: 'IN'
            }
          }]
        }
      }, {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      })

      return this.parseRatesResponse(response.data)
    } catch (error) {
      console.error('FedEx rate calculation failed:', error)
      throw new Error('Failed to calculate shipping rates')
    }
  }

  async createShipment(shipment: ShipmentData): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/ship/v1/shipments`, {
        labelResponseOptions: 'URL_ONLY',
        requestedShipment: {
          shipper: {
            contact: {
              personName: shipment.from.name,
              phoneNumber: shipment.from.phone
            },
            address: this.formatAddress(shipment.from)
          },
          recipients: [{
            contact: {
              personName: shipment.to.name,
              phoneNumber: shipment.to.phone
            },
            address: this.formatAddress(shipment.to)
          }],
          pickupType: 'USE_SCHEDULED_PICKUP',
          serviceType: shipment.service || 'FEDEX_GROUND',
          packagingType: 'YOUR_PACKAGING',
          requestedPackageLineItems: [{
            weight: {
              units: 'LB',
              value: shipment.package.weight
            },
            dimensions: {
              length: shipment.package.length,
              width: shipment.package.width,
              height: shipment.package.height,
              units: 'IN'
            }
          }]
        }
      }, {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      console.error('FedEx shipment creation failed:', error)
      throw new Error('Failed to create shipment')
    }
  }

  async trackShipment(trackingNumber: string): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/track/v1/trackingnumbers`, {
        includeDetailedScans: true,
        trackingInfo: [{
          trackingNumberInfo: {
            trackingNumber
          }
        }]
      }, {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      })

      return response.data
    } catch (error) {
      console.error('FedEx tracking failed:', error)
      throw new Error('Failed to track shipment')
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      return response.data.access_token
    } catch (error) {
      console.error('FedEx authentication failed:', error)
      throw new Error('Failed to authenticate with FedEx')
    }
  }

  private formatAddress(address: ShippingAddress): any {
    return {
      streetLines: [address.street1, address.street2].filter(Boolean),
      city: address.city,
      stateOrProvinceCode: address.state,
      postalCode: address.zip,
      countryCode: address.country
    }
  }

  private parseRatesResponse(data: any): ShippingRate[] {
    const rates: ShippingRate[] = []
    
    if (data.output?.rateReplyDetails) {
      for (const detail of data.output.rateReplyDetails) {
        if (detail.ratedShipmentDetails) {
          for (const shipment of detail.ratedShipmentDetails) {
            rates.push({
              carrier: 'FedEx',
              service: detail.serviceType,
              rate: shipment.totalNetCharge,
              currency: shipment.currency,
              deliveryDate: detail.operationalDetail?.deliveryDate
            })
          }
        }
      }
    }

    return rates
  }
}

export class UPSShipping {
  private apiKey: string
  private username: string
  private password: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.UPS_API_KEY!
    this.username = process.env.UPS_USERNAME!
    this.password = process.env.UPS_PASSWORD!
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://onlinetools.ups.com' 
      : 'https://wwwcie.ups.com'
  }

  async getRates(shipment: ShipmentData): Promise<ShippingRate[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/ship/v1/rating/Rate`, {
        RateRequest: {
          Request: {
            RequestOption: 'Rate',
            TransactionReference: {
              CustomerContext: 'Rating and Service'
            }
          },
          Shipment: {
            Shipper: {
              Name: shipment.from.name,
              Address: this.formatAddress(shipment.from)
            },
            ShipTo: {
              Name: shipment.to.name,
              Address: this.formatAddress(shipment.to)
            },
            Package: [{
              PackagingType: {
                Code: '02'
              },
              Dimensions: {
                UnitOfMeasurement: {
                  Code: 'IN'
                },
                Length: shipment.package.length.toString(),
                Width: shipment.package.width.toString(),
                Height: shipment.package.height.toString()
              },
              PackageWeight: {
                UnitOfMeasurement: {
                  Code: 'LBS'
                },
                Weight: shipment.package.weight.toString()
              }
            }]
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${await this.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      })

      return this.parseRatesResponse(response.data)
    } catch (error) {
      console.error('UPS rate calculation failed:', error)
      throw new Error('Failed to calculate UPS shipping rates')
    }
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/security/v1/oauth/token`, {
        grant_type: 'client_credentials'
      }, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      return response.data.access_token
    } catch (error) {
      console.error('UPS authentication failed:', error)
      throw new Error('Failed to authenticate with UPS')
    }
  }

  private formatAddress(address: ShippingAddress): any {
    return {
      AddressLine: [address.street1, address.street2].filter(Boolean),
      City: address.city,
      StateProvinceCode: address.state,
      PostalCode: address.zip,
      CountryCode: address.country
    }
  }

  private parseRatesResponse(data: any): ShippingRate[] {
    const rates: ShippingRate[] = []
    
    if (data.RateResponse?.RatedShipment) {
      const shipments = Array.isArray(data.RateResponse.RatedShipment) 
        ? data.RateResponse.RatedShipment 
        : [data.RateResponse.RatedShipment]

      for (const shipment of shipments) {
        rates.push({
          carrier: 'UPS',
          service: shipment.Service?.Code || 'Ground',
          rate: parseFloat(shipment.TotalCharges?.MonetaryValue || '0'),
          currency: shipment.TotalCharges?.CurrencyCode || 'USD'
        })
      }
    }

    return rates
  }
}

export const fedexShipping = new FedExShipping()
export const upsShipping = new UPSShipping()