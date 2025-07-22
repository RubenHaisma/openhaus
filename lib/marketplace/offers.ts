import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Offer = Database['public']['Tables']['offers']['Row']
type OfferInsert = Database['public']['Tables']['offers']['Insert']
type OfferUpdate = Database['public']['Tables']['offers']['Update']

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
      const offerData: OfferInsert = {
        property_id: data.propertyId,
        buyer_id: data.buyerId,
        seller_id: data.sellerId,
        amount: data.amount,
        currency: data.currency,
        message: data.message,
        expires_at: data.expiresAt,
        conditions: data.conditions || [],
        status: 'pending',
      }

      const { data: offer, error } = await supabase
        .from('offers')
        .insert(offerData)
        .select()
        .single()

      if (error) throw error

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
    status: 'accepted' | 'rejected' | 'countered' | 'expired',
    counterAmount?: number,
    message?: string
  ): Promise<Offer> {
    try {
      const updateData: OfferUpdate = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === 'countered' && counterAmount) {
        updateData.counter_amount = counterAmount
        updateData.counter_message = message
      }

      const { data: offer, error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', offerId)
        .select()
        .single()

      if (error) throw error

      // Send notification based on status
      await this.sendOfferNotification(offerId, `offer_${status}`)

      return offer
    } catch (error) {
      console.error('Offer status update failed:', error)
      throw new Error('Failed to update offer status')
    }
  }

  async getOffer(offerId: string): Promise<Offer | null> {
    try {
      const { data: offer, error } = await supabase
        .from('offers')
        .select(`
          *,
          buyer:profiles!offers_buyer_id_fkey(*),
          seller:profiles!offers_seller_id_fkey(*),
          property:properties(*)
        `)
        .eq('id', offerId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return offer
    } catch (error) {
      console.error('Offer retrieval failed:', error)
      return null
    }
  }

  async getOffers(filters: OfferFilters = {}): Promise<Offer[]> {
    try {
      let query = supabase
        .from('offers')
        .select(`
          *,
          buyer:profiles!offers_buyer_id_fkey(*),
          seller:profiles!offers_seller_id_fkey(*),
          property:properties(*)
        `)

      if (filters.propertyId) {
        query = query.eq('property_id', filters.propertyId)
      }
      if (filters.buyerId) {
        query = query.eq('buyer_id', filters.buyerId)
      }
      if (filters.sellerId) {
        query = query.eq('seller_id', filters.sellerId)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount)
      }
      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount)
      }

      const { data: offers, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw error
      return offers || []
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
    return this.updateOfferStatus(offerId, 'countered', counterAmount, message)
  }

  async acceptOffer(offerId: string): Promise<{ offer: Offer; orderId: string }> {
    try {
      const offer = await this.updateOfferStatus(offerId, 'accepted')
      
      // Create order from accepted offer
      const { orderManager } = await import('./orders')
      const order = await orderManager.createOrder({
        buyerId: offer.buyer_id,
        sellerId: offer.seller_id,
        propertyId: offer.property_id,
        amount: offer.amount,
        currency: offer.currency,
        paymentMethod: 'pending',
        notes: `Order created from accepted offer ${offerId}`,
      })

      return { offer, orderId: order.id }
    } catch (error) {
      console.error('Offer acceptance failed:', error)
      throw new Error('Failed to accept offer')
    }
  }

  async rejectOffer(offerId: string, message?: string): Promise<Offer> {
    try {
      const updateData: OfferUpdate = {
        status: 'rejected',
        rejection_message: message,
        updated_at: new Date().toISOString(),
      }

      const { data: offer, error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', offerId)
        .select()
        .single()

      if (error) throw error

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