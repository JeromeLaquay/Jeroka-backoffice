import { apiService, ApiResponse } from './api'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  discount_percent?: number
  vat_number?: number
}

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  client_name: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  total: number
  tax: number
  subtotal: number
  due_date: string
  issue_date: string
  paid_date?: string
  items: InvoiceItem[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateInvoiceRequest {
  client_id: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
    discount_percent?: number
    vat_number?: number
  }>
  due_date: string
  notes?: string
  status?: 'draft' | 'sent'
}

export interface UpdateInvoiceRequest {
  client_id?: string
  items?: Array<{
    description: string
    quantity: number
    unit_price: number
    discount_percent?: number
    vat_number?: number
  }>
  due_date?: string
  notes?: string
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  subtotal?: number
  tax?: number
  total?: number
}

export interface InvoiceStats {
  total: number
  draft: number
  sent: number
  paid: number
  overdue: number
  cancelled: number
  totalRevenue: number
  averageInvoice: number
}

export interface InvoicesListResponse {
  invoices: Invoice[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class InvoiceService {
  /**
   * Récupère la liste des factures avec pagination et filtres
   */
  async getInvoices(params?: {
    page?: number
    limit?: number
    status?: string
    clientId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<ApiResponse<InvoicesListResponse>> {
    return await apiService.getInvoices(params) as unknown as ApiResponse<InvoicesListResponse>
  }

  /**
   * Récupère une facture par son ID
   */
  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return await apiService.getInvoice(id)
  }

  /**
   * Crée une nouvelle facture
   */
  async createInvoice(data: CreateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    return await apiService.createInvoice(data)
  }

  /**
   * Met à jour une facture
   */
  async updateInvoice(id: string, data: UpdateInvoiceRequest): Promise<ApiResponse<Invoice>> {
    return await apiService.updateInvoice(id, data)
  }

  /**
   * Supprime une facture
   */
  async deleteInvoice(id: string): Promise<ApiResponse> {
    return await apiService.deleteInvoice(id)
  }

  /**
   * Met à jour le statut d'une facture
   */
  async updateInvoiceStatus(id: string, status: string): Promise<ApiResponse<Invoice>> {
    return await apiService.updateInvoiceStatus(id, status)
  }

  /**
   * Récupère les statistiques des factures
   */
  async getInvoiceStats(): Promise<ApiResponse<InvoiceStats>> {
    return await apiService.getInvoiceStats()
  }

  /**
   * Marque une facture comme payée
   */
  async markAsPaid(id: string): Promise<ApiResponse<Invoice>> {
    return await this.updateInvoiceStatus(id, 'paid')
  }

  /**
   * Marque une facture comme envoyée
   */
  async markAsSent(id: string): Promise<ApiResponse<Invoice>> {
    return await this.updateInvoiceStatus(id, 'sent')
  }

  /**
   * Annule une facture
   */
  async cancelInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return await this.updateInvoiceStatus(id, 'cancelled')
  }

  /**
   * Récupère les factures par statut
   */
  async getInvoicesByStatus(status: string): Promise<ApiResponse<InvoicesListResponse>> {
    return await this.getInvoices({ status, limit: 100 })
  }

  /**
   * Récupère les factures d'un client
   */
  async getInvoicesByClient(clientId: string): Promise<ApiResponse<InvoicesListResponse>> {
    return await this.getInvoices({ clientId, limit: 100 })
  }

  /**
   * Récupère les factures en retard
   */
  async getOverdueInvoices(): Promise<ApiResponse<InvoicesListResponse>> {
    return await this.getInvoicesByStatus('overdue')
  }

  /**
   * Récupère les factures en attente
   */
  async getPendingInvoices(): Promise<ApiResponse<InvoicesListResponse>> {
    return await this.getInvoicesByStatus('sent')
  }

  /**
   * Récupère les factures payées
   */
  async getPaidInvoices(): Promise<ApiResponse<InvoicesListResponse>> {
    return await this.getInvoicesByStatus('paid')
  }

  /**
   * Récupère les factures par période
   */
  async getInvoicesByDateRange(dateFrom: string, dateTo: string): Promise<ApiResponse<InvoicesListResponse>> {
    return await this.getInvoices({ dateFrom, dateTo, limit: 100 })
  }

  /**
   * Génère le prochain numéro de facture
   */
  async getNextInvoiceNumber(): Promise<ApiResponse<{ invoiceNumber: string }>> {
    return await apiService.getNextInvoiceNumber()
  }

  /**
   * Calcule le total d'une facture
   */
  calculateInvoiceTotal(items: Array<{
    quantity: number
    unit_price: number
    discount_percent?: number
  }>, taxRate: number = 0.2): {
    subtotal: number
    tax: number
    total: number
  } {
    const subtotal = items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price
      const discount = item.discount_percent ? (itemTotal * item.discount_percent / 100) : 0
      return sum + (itemTotal - discount)
    }, 0)
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return { subtotal, tax, total }
  }
}

export const invoiceService = new InvoiceService()
export default invoiceService