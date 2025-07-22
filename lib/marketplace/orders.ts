import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderUpdate = Database['public']['Tables']['orders']['Update']

export interface CreateOrderData {
  buyerId: string
  sellerId: string
  propertyId: string
  amount: number
  currency: string
  paymentMethod: string
  shippingAddress?: any
  notes?: string
}

export interface OrderFilters {
  status?: string
  buyerId?: string
  sellerId?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
}

export class OrderManager {
  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const orderData: OrderInsert = {
        buyer_id: data.buyerId,
        seller_id: data.sellerId,
        property_id: data.propertyId,
        amount: data.amount,
        currency: data.currency,
        payment_method: data.paymentMethod,
        status: 'pending',
        shipping_address: data.shippingAddress,
        notes: data.notes,
        order_number: this.generateOrderNumber(),
      }

      const { data: order, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single()

      if (error) throw error
      return order
    } catch (error) {
      console.error('Order creation failed:', error)
      throw new Error('Failed to create order')
    }
  }

  async updateOrderStatus(orderId: string, status: string, metadata?: any): Promise<Order> {
    try {
      const updateData: OrderUpdate = {
        status,
        metadata: metadata || {},
        updated_at: new Date().toISOString(),
      }

      const { data: order, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return order
    } catch (error) {
      console.error('Order status update failed:', error)
      throw new Error('Failed to update order status')
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(*),
          seller:profiles!orders_seller_id_fkey(*),
          property:properties(*)
        `)
        .eq('id', orderId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return order
    } catch (error) {
      console.error('Order retrieval failed:', error)
      return null
    }
  }

  async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(*),
          seller:profiles!orders_seller_id_fkey(*),
          property:properties(*)
        `)

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.buyerId) {
        query = query.eq('buyer_id', filters.buyerId)
      }
      if (filters.sellerId) {
        query = query.eq('seller_id', filters.sellerId)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount)
      }
      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount)
      }

      const { data: orders, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw error
      return orders || []
    } catch (error) {
      console.error('Orders retrieval failed:', error)
      return []
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const updateData: OrderUpdate = {
        status: 'cancelled',
        metadata: { cancellation_reason: reason },
        updated_at: new Date().toISOString(),
      }

      const { data: order, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error
      return order
    } catch (error) {
      console.error('Order cancellation failed:', error)
      throw new Error('Failed to cancel order')
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `OH-${timestamp}-${random}`
  }
}

export const orderManager = new OrderManager()