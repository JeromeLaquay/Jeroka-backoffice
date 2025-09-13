import { apiService, ApiResponse } from './api'

export interface InvoiceItem {
  id: number
  description: string
  quantity: number
  unitPrice: number
  total: number
  discountPercent?: number
  vatRate?: number
}

export interface Invoice {
  id: number
  invoiceNumber: string
  clientId: number
  clientName: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  total: number
  tax: number
  subtotal: number
  dueDate: string
  issueDate: string
  paidDate?: string
  items: InvoiceItem[]
  notes?: string
  termsAndConditions?: string
  paymentTerms?: number
  createdAt: string
}

export interface CreateInvoiceRequest {
  clientId: number
  items: Omit<InvoiceItem, 'id'>[]
  dueDate: string
  notes?: string
}

export interface UpdateInvoiceRequest {
  clientId?: number
  items?: Omit<InvoiceItem, 'id'>[]
  dueDate?: string
  notes?: string
  status?: string
}

export interface InvoiceStats {
  total: number
  paid: number
  pending: number
  overdue: number
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
    clientId?: number
    dateFrom?: string
    dateTo?: string
  }): Promise<ApiResponse<any>> {
    return await apiService.getInvoices(params)
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
  async getInvoicesByStatus(status: string): Promise<ApiResponse<any>> {
    return await this.getInvoices({ status, limit: 100 })
  }

  /**
   * Récupère les factures d'un client
   */
  async getInvoicesByClient(clientId: number): Promise<ApiResponse<any>> {
    return await this.getInvoices({ clientId, limit: 100 })
  }

  /**
   * Récupère les factures en retard
   */
  async getOverdueInvoices(): Promise<ApiResponse<any>> {
    return await this.getInvoicesByStatus('overdue')
  }

  /**
   * Récupère les factures en attente
   */
  async getPendingInvoices(): Promise<ApiResponse<any>> {
    return await this.getInvoicesByStatus('pending')
  }

  /**
   * Récupère les factures payées
   */
  async getPaidInvoices(): Promise<ApiResponse<any>> {
    return await this.getInvoicesByStatus('paid')
  }

  /**
   * Récupère les factures par période
   */
  async getInvoicesByDateRange(dateFrom: string, dateTo: string): Promise<ApiResponse<any>> {
    return await this.getInvoices({ dateFrom, dateTo, limit: 100 })
  }

  /**
   * Génère le prochain numéro de facture
   */
  async getNextInvoiceNumber(): Promise<ApiResponse<{ invoiceNumber: string }>> {
    return await apiService.get('/invoices/next-number')
  }

  /**
   * Calcule le total d'une facture
   */
  calculateInvoiceTotal(items: Omit<InvoiceItem, 'id'>[], taxRate: number = 0.2): {
    subtotal: number
    tax: number
    total: number
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return { subtotal, tax, total }
  }
}

export const invoiceService = new InvoiceService()
export default invoiceService