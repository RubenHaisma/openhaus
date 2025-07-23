import Stripe from 'stripe'
import { PaymentIntent, PaymentMethod } from '@stripe/stripe-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
})

export interface PaymentData {
  amount: number
  currency: string
  customerId?: string
  paymentMethodId?: string
  metadata?: Record<string, string>
}

export interface RefundData {
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}

export class StripePaymentProcessor {
  async createPaymentIntent(data: PaymentData): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency,
        customer: data.customerId,
        payment_method: data.paymentMethodId,
        metadata: data.metadata || {},
        automatic_payment_methods: {
          enabled: true,
        },
      })

      return paymentIntent as PaymentIntent
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error)
      throw new Error('Payment processing failed')
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
      return paymentIntent as PaymentIntent
    } catch (error) {
      console.error('Stripe payment confirmation failed:', error)
      throw new Error('Payment confirmation failed')
    }
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      })
      return customer
    } catch (error) {
      console.error('Stripe customer creation failed:', error)
      throw new Error('Customer creation failed')
    }
  }

  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      })
      return subscription
    } catch (error) {
      console.error('Stripe subscription creation failed:', error)
      throw new Error('Subscription creation failed')
    }
  }

  async processRefund(data: RefundData): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: data.paymentIntentId,
        amount: data.amount ? Math.round(data.amount * 100) : undefined,
        reason: data.reason,
      })
      return refund
    } catch (error) {
      console.error('Stripe refund processing failed:', error)
      throw new Error('Refund processing failed')
    }
  }

  async handleWebhook(body: string, signature: string): Promise<Stripe.Event> {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
      return event
    } catch (error) {
      console.error('Stripe webhook verification failed:', error)
      throw new Error('Webhook verification failed')
    }
  }
}

export const stripeProcessor = new StripePaymentProcessor()