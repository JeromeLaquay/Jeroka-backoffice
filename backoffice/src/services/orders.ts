import { apiService } from './api'

export interface Order {
  id: string
  orderNumber: string
  clientId: string
  client: {
    id: string
    name: string
    email: string
    avatar_url: string
    phone?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      postalCode?: string
      country?: string
    }
  }
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotalHt: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  shippingAmount: number
  paymentMethod?: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  shippingAddress?: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
  billingAddress?: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
  notes?: string
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId?: string
  product?: {
    id: string
    name: string
    sku?: string
    image?: string
  }
  description: string
  quantity: number
  unitPrice: number
  discountPercent: number
  vatRate: number
  totalHt: number
  totalVat: number
  totalTtc: number
}

export interface CreateOrderRequest {
  clientId: string
  items: {
    productId?: string
    description: string
    quantity: number
    unitPrice: number
    discountPercent?: number
    vatRate?: number
  }[]
  status?: string
  paymentMethod?: string
  shippingAddress?: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
  billingAddress?: {
    line1: string
    line2?: string
    city: string
    postalCode: string
    country: string
  }
  notes?: string
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  status?: string
  paymentStatus?: string
  trackingNumber?: string
}

export interface OrdersListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  period?: string
  clientId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface OrderStats {
  total: number
  pending: number
  confirmed: number
  processing: number
  shipped: number
  delivered: number
  cancelled: number
  revenue: number
  averageOrderValue: number
}

class OrdersService {
  /**
   * Récupérer la liste des commandes avec filtres et pagination
   */
  async getOrders(params: OrdersListParams = {}) {
    const response = await apiService.axiosInstance.get('/orders', { params })
    return response.data
  }

  /**
   * Récupérer une commande par son ID
   */
  async getOrder(id: string) {
    const response = await apiService.axiosInstance.get(`/orders/${id}`)
    return response.data
  }

  /**
   * Créer une nouvelle commande
   */
  async createOrder(data: CreateOrderRequest) {
    const response = await apiService.axiosInstance.post('/orders', data)
    return response.data
  }

  /**
   * Mettre à jour une commande
   */
  async updateOrder(id: string, data: UpdateOrderRequest) {
    const response = await apiService.axiosInstance.put(`/orders/${id}`, data)
    return response.data
  }

  /**
   * Supprimer une commande
   */
  async deleteOrder(id: string) {
    const response = await apiService.axiosInstance.delete(`/orders/${id}`)
    return response.data
  }

  /**
   * Changer le statut d'une commande
   */
  async updateOrderStatus(id: string, status: string) {
    const response = await apiService.axiosInstance.patch(`/orders/${id}/status`, { status })
    return response.data
  }

  /**
   * Marquer une commande comme payée
   */
  async markOrderAsPaid(id: string, paymentData?: { method?: string; transactionId?: string }) {
    const response = await apiService.axiosInstance.patch(`/orders/${id}/payment`, {
      paymentStatus: 'paid',
      ...paymentData
    })
    return response.data
  }

  /**
   * Ajouter un numéro de suivi
   */
  async addTrackingNumber(id: string, trackingNumber: string) {
    const response = await apiService.axiosInstance.patch(`/orders/${id}/tracking`, { trackingNumber })
    return response.data
  }

  /**
   * Récupérer les statistiques des commandes
   */
  async getOrderStats(period?: string) {
    const params = period ? { period } : {}
    const response = await apiService.axiosInstance.get('/orders/stats', { params })
    return response.data
  }

  /**
   * Exporter les commandes en CSV/Excel
   */
  async exportOrders(params: OrdersListParams & { format: 'csv' | 'excel' }) {
    const response = await apiService.axiosInstance.get('/orders/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Récupérer l'historique des changements d'une commande
   */
  async getOrderHistory(id: string) {
    const response = await apiService.axiosInstance.get(`/orders/${id}/history`)
    return response.data
  }

  /**
   * Générer une facture pour une commande
   */
  async generateInvoice(id: string) {
    const response = await apiService.axiosInstance.post(`/orders/${id}/invoice`)
    return response.data
  }

  /**
   * Télécharger une facture en PDF
   */
  async downloadInvoice(orderId: string, invoiceId: string) {
    const response = await apiService.axiosInstance.get(`/orders/${orderId}/invoice/${invoiceId}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Envoyer un email de confirmation de commande
   */
  async sendOrderConfirmation(id: string) {
    const response = await apiService.axiosInstance.post(`/orders/${id}/send-confirmation`)
    return response.data
  }

  /**
   * Envoyer un email de suivi de livraison
   */
  async sendShippingNotification(id: string) {
    const response = await apiService.axiosInstance.post(`/orders/${id}/send-shipping`)
    return response.data
  }

  /**
   * Calculer les frais de livraison
   */
  async calculateShipping(data: {
    items: { weight?: number; dimensions?: any }[]
    address: {
      city: string
      postalCode: string
      country: string
    }
    method?: string
  }) {
    const response = await apiService.axiosInstance.post('/orders/calculate-shipping', data)
    return response.data
  }

  /**
   * Récupérer les méthodes de livraison disponibles
   */
  async getShippingMethods() {
    const response = await apiService.axiosInstance.get('/orders/shipping-methods')
    return response.data
  }

  /**
   * Récupérer les méthodes de paiement disponibles
   */
  async getPaymentMethods() {
    const response = await apiService.axiosInstance.get('/orders/payment-methods')
    return response.data
  }
}

export const ordersService = new OrdersService()
export default ordersService
