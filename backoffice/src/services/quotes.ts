import { apiService, ApiResponse } from './api'

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  discount_percent?: number
  vat_number?: number
}

export interface Quote {
  id: string
  quote_number: string
  client_id: string
  client_name?: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted'
  total: number
  tax: number
  subtotal: number
  valid_until: string
  issue_date: string
  items: QuoteItem[]
  notes?: string
  created_at: string
}

export interface CreateQuoteRequest {
  client_id: string
  items: Omit<QuoteItem, 'id'>[]
  valid_until: string
  notes?: string
}

export interface UpdateQuoteRequest {
  client_id?: string
  items?: Omit<QuoteItem, 'id'>[]
  valid_until?: string
  notes?: string
  status?: string
}

export interface QuoteStats {
  total: number
  sent: number
  accepted: number
  expired: number
  totalValue: number
  averageQuote: number
}

export interface QuotesListResponse {
  quotes: Quote[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ConvertQuoteResponse {
  quote: Quote
  invoice: any // Invoice type from invoice service
}

class QuoteService {
  /**
   * Récupère la liste des devis avec pagination et filtres
   */
  async getQuotes(params?: {
    page?: number
    limit?: number
    status?: string
    clientId?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<ApiResponse<QuotesListResponse>> {
    return await apiService.getQuotes(params)
  }

  /**
   * Récupère un devis par son ID
   */
  async getQuote(id: string): Promise<ApiResponse<Quote>> {
    return await apiService.getQuote(id)
  }

  /**
   * Crée un nouveau devis
   */
  async createQuote(data: CreateQuoteRequest): Promise<ApiResponse<Quote>> {
    return await apiService.createQuote(data)
  }

  /**
   * Met à jour un devis
   */
  async updateQuote(id: string, data: UpdateQuoteRequest): Promise<ApiResponse<Quote>> {
    return await apiService.updateQuote(id, data)
  }

  /**
   * Supprime un devis
   */
  async deleteQuote(id: string): Promise<ApiResponse> {
    return await apiService.deleteQuote(id)
  }

  /**
   * Met à jour le statut d'un devis
   */
  async updateQuoteStatus(id: string, status: string): Promise<ApiResponse<Quote>> {
    return await apiService.updateQuoteStatus(id, status)
  }

  /**
   * Convertit un devis en facture
   */
  async convertQuoteToInvoice(id: string): Promise<ApiResponse<ConvertQuoteResponse>> {
    return await apiService.convertQuoteToInvoice(id)
  }

  /**
   * Récupère les statistiques des devis
   */
  async getQuoteStats(): Promise<ApiResponse<QuoteStats>> {
    return await apiService.getQuoteStats()
  }

  /**
   * Envoie un devis (change le statut à 'sent')
   */
  async sendQuote(id: string): Promise<ApiResponse<Quote>> {
    return await this.updateQuoteStatus(id, 'sent')
  }

  /**
   * Accepte un devis
   */
  async acceptQuote(id: string): Promise<ApiResponse<Quote>> {
    return await this.updateQuoteStatus(id, 'accepted')
  }

  /**
   * Rejette un devis
   */
  async rejectQuote(id: string): Promise<ApiResponse<Quote>> {
    return await this.updateQuoteStatus(id, 'rejected')
  }

  /**
   * Récupère les devis par statut
   */
  async getQuotesByStatus(status: string): Promise<ApiResponse<QuotesListResponse>> {
    return await this.getQuotes({ status, limit: 100 })
  }

  /**
   * Récupère les devis d'un client
   */
  async getQuotesByClient(clientId: string): Promise<ApiResponse<QuotesListResponse>> {
    return await this.getQuotes({ clientId, limit: 100 })
  }

  /**
   * Récupère les devis expirés
   */
  async getExpiredQuotes(): Promise<ApiResponse<QuotesListResponse>> {
    return await this.getQuotesByStatus('expired')
  }

  /**
   * Récupère les devis en attente
   */
  async getPendingQuotes(): Promise<ApiResponse<QuotesListResponse>> {
    return await this.getQuotesByStatus('sent')
  }

  /**
   * Récupère les devis acceptés
   */
  async getAcceptedQuotes(): Promise<ApiResponse<QuotesListResponse>> {
    return await this.getQuotesByStatus('accepted')
  }

  /**
   * Récupère les devis par période
   */
  async getQuotesByDateRange(dateFrom: string, dateTo: string): Promise<ApiResponse<QuotesListResponse>> {
    return await this.getQuotes({ dateFrom, dateTo, limit: 100 })
  }

  /**
   * Vérifie si un devis est expiré
   */
  isQuoteExpired(validUntil: string): boolean {
    return new Date(validUntil) < new Date()
  }

  /**
   * Calcule le nombre de jours restants avant expiration
   */
  getDaysUntilExpiration(validUntil: string): number {
    const now = new Date()
    const expiration = new Date(validUntil)
    const diffTime = expiration.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Calcule le total d'un devis
   */
  calculateQuoteTotal(items: Omit<QuoteItem, 'id'>[], taxRate: number = 0.2): {
    subtotal: number
    tax: number
    total: number
  } {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    const tax = subtotal * taxRate
    const total = subtotal + tax

    return { subtotal, tax, total }
  }

  /**
   * Télécharge le PDF d'un devis
   */
  async downloadQuotePdf(id: string): Promise<Blob> {
    const response = await apiService.axiosInstance.get(`/quotes/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Convertit un devis en facture
   */
  async convertToInvoice(id: string): Promise<ApiResponse> {
    return await apiService.axiosInstance.post(`/quotes/${id}/convert`)
  }

  /**
   * Génère un numéro de devis unique
   */
  generateQuoteNumber(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    return `QUO-${year}-${month}${day}-${random}`
  }
}

export const quoteService = new QuoteService()
export default quoteService