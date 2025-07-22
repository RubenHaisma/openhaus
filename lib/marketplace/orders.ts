import { prisma } from '@/lib/prisma'
import { Order, OrderStatus } from '@prisma/client'

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
      const order = await prisma.order.create({
        data: {
          buyerId: data.buyerId,
          sellerId: data.sellerId,
          propertyId: data.propertyId,
          amount: data.amount,
          currency: data.currency,
          paymentMethod: data.paymentMethod,
          status: OrderStatus.PENDING,
          shippingAddress: data.shippingAddress,
          notes: data.notes,
          orderNumber: this.generateOrderNumber()
        },
        include: {
          buyer: true,
          seller: true,
          property: true
        }
      })

      return order
    } catch (error) {
      console.error('Order creation failed:', error)
      throw new Error('Failed to create order')
    }
  }

  async updateOrderStatus(orderId: string, status: string, metadata?: any): Promise<Order> {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: status as OrderStatus,
          metadata: metadata || {},
          updatedAt: new Date()
        },
        include: {
          buyer: true,
          seller: true,
          property: true
        }
      })

      return order
    } catch (error) {
      console.error('Order status update failed:', error)
      throw new Error('Failed to update order status')
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          buyer: true,
          seller: true,
          property: true
        }
      })

      return order
    } catch (error) {
      console.error('Order retrieval failed:', error)
      return null
    }
  }

  async getOrders(filters: OrderFilters = {}): Promise<Order[]> {
    try {
      const where: any = {}

      if (filters.status) where.status = filters.status as OrderStatus
      if (filters.buyerId) where.buyerId = filters.buyerId
      if (filters.sellerId) where.sellerId = filters.sellerId
      if (filters.dateFrom) where.createdAt = { gte: new Date(filters.dateFrom) }
      if (filters.dateTo) {
        where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) }
      }
      if (filters.minAmount) where.amount = { gte: filters.minAmount }
      if (filters.maxAmount) {
        where.amount = { ...where.amount, lte: filters.maxAmount }
      }

      const orders = await prisma.order.findMany({
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

      return orders
    } catch (error) {
      console.error('Orders retrieval failed:', error)
      return []
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<Order> {
    try {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          metadata: { cancellation_reason: reason },
          updatedAt: new Date()
        },
        include: {
          buyer: true,
          seller: true,
          property: true
        }
      })

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