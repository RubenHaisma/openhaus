import { prisma } from '@/lib/prisma'
import { Offer, OfferStatus } from '@prisma/client'

export interface CreateOfferData {
  propertyId: string
  buyerId: string
  sellerId: string
  amount: number
  currency: string
  message?: string
  expiresAt?: string
  conditions?: string[]
}

export interface OfferFilters {
  propertyId?: string
  buyerId?: string
  sellerId?: string
  status?: string
  minAmount?: number
  maxAmount?: string
}

export class OfferManager {
  async createOffer(data: CreateOfferData): Promise<Offer> {
    try {
      const offer = await prisma.offer.create({
        data: {
          propertyId: data.propertyId,
          buyerId: data.buyerId,
          sellerId: data.sellerId,
          amount: data.amount,
          currency: data.currency,
          message: data.message,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
          conditions: data.conditions || [],
          status: OfferStatus.PENDING
        },
        include: {
          buyer: true,
          seller: true,
          property: true
        }
      })

      // Send notification to seller
      await this.sendOfferNotification(offer.id, 'new_offer')

      return offer
    } catch (error) {
      console.error('Offer creation failed:', error)
      throw new Error('Failed to create offer')
    }
  }

  async updateOfferStatus(
    offerId: string, 
    status: OfferStatus,
    counterAmount?: number,
    message?: string
  ): Promise<Offer> {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      }

      if (status === OfferStatus.COUNTERED && counterAmount) {
        updateData.counterAmount = counterAmount
        updateData.counterMessage = message
      }

      const offer = await prisma.offer.update({
        where: { id: offerId },
        data: updateData,
        include: {
          buyer: true,
          seller: true,
          property: true
        }
      })

      // Send notification based on status
      await this.sendOfferNotification(offerId, `offer_${status.toLowerCase()}`)

      return offer
    } catch (error) {
      console.error('Offer status update failed:', error)
      throw new Error('Failed to update offer status')
    }
  }

  async getOffer(offerId: string): Promise<Offer | null> {
    try {
      const offer = await prisma.offer.findUnique({
        where: { id: offerId },
        include: {
          buyer: true,
          seller: true,
          property: true
        }
      })

      return offer
    } catch (error) {
      console.error('Offer retrieval failed:', error)
      return null
    }
  }

  async getOffers(filters: OfferFilters = {}): Promise<Offer[]> {
    try {
      const where: any = {}

      if (filters.propertyId) where.propertyId = filters.propertyId
      if (filters.buyerId) where.buyerId = filters.buyerId
      if (filters.sellerId) where.sellerId = filters.sellerId
      if (filters.status) where.status = filters.status as OfferStatus
      if (filters.minAmount) where.amount = { gte: filters.minAmount }
      if (filters.maxAmount) {
        where.amount = { ...where.amount, lte: parseFloat(filters.maxAmount) }
      }

      const offers = await prisma.offer.findMany({
        where,
        include: {
          buyer: true,
          seller: true,
          property: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return offers
    } catch (error) {
      console.error('Offers retrieval failed:', error)
      return []
    }
  }

  async negotiateOffer(
    offerId: string,
    counterAmount: number,
    message?: string
  ): Promise<Offer> {
    return this.updateOfferStatus(offerId, OfferStatus.COUNTERED, counterAmount, message)
  }

  async acceptOffer(offerId: string): Promise<{ offer: Offer; orderId: string }> {
    try {
      const offer = await this.updateOfferStatus(offerId, OfferStatus.ACCEPTED)
      
      // Create order from accepted offer
      const { orderManager } = await import('./orders')
      const order = await orderManager.createOrder({
        buyerId: offer.buyerId,
        sellerId: offer.sellerId,
        propertyId: offer.propertyId,
        amount: Number(offer.amount),
        currency: offer.currency,
        paymentMethod: 'pending',
        notes: `Order created from accepted offer ${offerId}`
      })

      return { offer, orderId: order.id }
    } catch (error) {
      console.error('Offer acceptance failed:', error)
      throw new Error('Failed to accept offer')
    }
  }

  async rejectOffer(offerId: string, message?: string): Promise<Offer> {
    try {
      const offer = await prisma.offer.update({
        where: { id: offerId },
        data: {
          status: OfferStatus.REJECTED,
          rejectionMessage: message,
          updatedAt: new Date()
        },
        include: {
          buyer: true,
          seller: true,
          property: true
        }
      }
      )

      await this.sendOfferNotification(offerId, 'offer_rejected')

      return offer
    } catch (error) {
      console.error('Offer rejection failed:', error)
      throw new Error('Failed to reject offer')
    }
  }

  private async sendOfferNotification(offerId: string, type: string): Promise<void> {
    try {
      // Implementation would integrate with notification service
      console.log(`Sending ${type} notification for offer ${offerId}`)
    } catch (error) {
      console.error('Notification sending failed:', error)
    }
  }
}

export const offerManager = new OfferManager()