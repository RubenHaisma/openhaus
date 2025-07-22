import { Client, Environment, ApiError } from 'square'

const client = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN!,
  environment: process.env.NODE_ENV === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
})

const { paymentsApi, customersApi, refundsApi } = client

export interface SquarePaymentData {
  amount: number
  currency: string
  sourceId: string
  customerId?: string
  note?: string
}

export class SquarePaymentProcessor {
  async createPayment(data: SquarePaymentData): Promise<any> {
    try {
      const requestBody = {
        sourceId: data.sourceId,
        amountMoney: {
          amount: BigInt(Math.round(data.amount * 100)),
          currency: data.currency as any,
        },
        customerId: data.customerId,
        note: data.note,
        idempotencyKey: this.generateIdempotencyKey(),
      }

      const response = await paymentsApi.createPayment(requestBody)
      return response.result.payment
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Square API Error:', error.errors)
      } else {
        console.error('Square payment processing failed:', error)
      }
      throw new Error('Square payment processing failed')
    }
  }

  async createCustomer(givenName: string, familyName: string, emailAddress: string): Promise<any> {
    try {
      const requestBody = {
        givenName,
        familyName,
        emailAddress,
      }

      const response = await customersApi.createCustomer(requestBody)
      return response.result.customer
    } catch (error) {
      console.error('Square customer creation failed:', error)
      throw new Error('Square customer creation failed')
    }
  }

  async processRefund(paymentId: string, amount?: number, currency?: string): Promise<any> {
    try {
      const requestBody = {
        idempotencyKey: this.generateIdempotencyKey(),
        amountMoney: amount && currency ? {
          amount: BigInt(Math.round(amount * 100)),
          currency: currency as any,
        } : undefined,
        paymentId,
      }

      const response = await refundsApi.refundPayment(requestBody)
      return response.result.refund
    } catch (error) {
      console.error('Square refund processing failed:', error)
      throw new Error('Square refund processing failed')
    }
  }

  private generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

export const squareProcessor = new SquarePaymentProcessor()