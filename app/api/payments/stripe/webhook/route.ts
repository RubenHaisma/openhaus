import { NextRequest, NextResponse } from 'next/server'
import { stripeProcessor } from '@/lib/payments/stripe'
import { orderManager } from '@/lib/marketplace/orders'
import { emailService } from '@/lib/integrations/email'
import { Logger } from '@/lib/monitoring/logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    // Verify webhook signature
    const event = await stripeProcessor.handleWebhook(body, signature)

    Logger.info('Stripe webhook received', {
      eventType: event.type,
      eventId: event.id,
    })

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as any)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object as any)
        break

      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object as any)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as any)
        break

      case 'charge.dispute.created':
        await handleDispute(event.data.object as any)
        break

      default:
        Logger.info('Unhandled Stripe webhook event', { eventType: event.type })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    Logger.error('Stripe webhook processing failed', error as Error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) return

    // Update order status
    const order = await orderManager.updateOrderStatus(orderId, 'paid', {
      paymentIntentId: paymentIntent.id,
      paidAt: new Date().toISOString(),
    })

    Logger.transaction('payment_success', paymentIntent.amount / 100, paymentIntent.currency, {
      orderId,
      paymentIntentId: paymentIntent.id,
      customerId: paymentIntent.customer,
    })

    // Send confirmation email
    await emailService.sendOrderConfirmation(order.buyer_id, {
      orderNumber: order.order_number,
      amount: order.amount,
      currency: order.currency,
      id: order.id,
    })

    // Send payment confirmation
    await emailService.sendPaymentConfirmation(order.buyer_id, {
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      transactionId: paymentIntent.id,
      id: paymentIntent.id,
    })
  } catch (error) {
    Logger.error('Payment success handling failed', error as Error, {
      paymentIntentId: paymentIntent.id,
    })
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const orderId = paymentIntent.metadata?.orderId
    if (!orderId) return

    // Update order status
    await orderManager.updateOrderStatus(orderId, 'cancelled', {
      paymentIntentId: paymentIntent.id,
      failureReason: paymentIntent.last_payment_error?.message,
      failedAt: new Date().toISOString(),
    })

    Logger.transaction('payment_failure', paymentIntent.amount / 100, paymentIntent.currency, {
      orderId,
      paymentIntentId: paymentIntent.id,
      failureReason: paymentIntent.last_payment_error?.message,
    })

    // Send failure notification
    // Implementation would send email to customer about payment failure
  } catch (error) {
    Logger.error('Payment failure handling failed', error as Error, {
      paymentIntentId: paymentIntent.id,
    })
  }
}

async function handleSubscriptionPayment(invoice: any) {
  try {
    Logger.transaction('subscription_payment', invoice.amount_paid / 100, invoice.currency, {
      subscriptionId: invoice.subscription,
      customerId: invoice.customer,
      invoiceId: invoice.id,
    })

    // Handle subscription payment success
    // Implementation would update subscription status, send receipt, etc.
  } catch (error) {
    Logger.error('Subscription payment handling failed', error as Error, {
      invoiceId: invoice.id,
    })
  }
}

async function handleSubscriptionCancellation(subscription: any) {
  try {
    Logger.audit('Subscription cancelled', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      cancelledAt: new Date(subscription.canceled_at * 1000).toISOString(),
    })

    // Handle subscription cancellation
    // Implementation would update user account, send confirmation email, etc.
  } catch (error) {
    Logger.error('Subscription cancellation handling failed', error as Error, {
      subscriptionId: subscription.id,
    })
  }
}

async function handleDispute(charge: any) {
  try {
    Logger.security('Payment dispute created', {
      chargeId: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency,
      reason: charge.dispute?.reason,
    })

    // Handle dispute
    // Implementation would notify relevant parties, gather evidence, etc.
  } catch (error) {
    Logger.error('Dispute handling failed', error as Error, {
      chargeId: charge.id,
    })
  }
}