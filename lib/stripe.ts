import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export const PAYMENT_METHODS = {
  IDEAL: 'ideal',
  SEPA: 'sepa_debit',
  CARD: 'card'
} as const