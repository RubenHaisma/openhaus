import paypal from '@paypal/checkout-server-sdk'

const environment = process.env.NODE_ENV === 'production' 
  ? new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    )
  : new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    )

const client = new paypal.core.PayPalHttpClient(environment)

export interface PayPalPaymentData {
  amount: string
  currency: string
  description?: string
  returnUrl: string
  cancelUrl: string
}

export class PayPalPaymentProcessor {
  async createOrder(data: PayPalPaymentData): Promise<any> {
    try {
      const request = new paypal.orders.OrdersCreateRequest()
      request.prefer('return=representation')
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: data.currency,
            value: data.amount
          },
          description: data.description
        }],
        application_context: {
          return_url: data.returnUrl,
          cancel_url: data.cancelUrl,
          brand_name: 'OpenHaus',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW'
        }
      })

      const order = await client.execute(request)
      return order.result
    } catch (error) {
      console.error('PayPal order creation failed:', error)
      throw new Error('PayPal payment processing failed')
    }
  }

  async captureOrder(orderId: string): Promise<any> {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(orderId)
      request.requestBody({})
      
      const capture = await client.execute(request)
      return capture.result
    } catch (error) {
      console.error('PayPal order capture failed:', error)
      throw new Error('PayPal payment capture failed')
    }
  }

  async processRefund(captureId: string, amount?: string, currency?: string): Promise<any> {
    try {
      const request = new paypal.payments.CapturesRefundRequest(captureId)
      request.requestBody({
        amount: amount && currency ? {
          value: amount,
          currency_code: currency
        } : undefined
      })

      const refund = await client.execute(request)
      return refund.result
    } catch (error) {
      console.error('PayPal refund processing failed:', error)
      throw new Error('PayPal refund processing failed')
    }
  }
}

export const paypalProcessor = new PayPalPaymentProcessor()