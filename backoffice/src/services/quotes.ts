import { apiService } from './api'

export interface Quote {
  id: string
  quoteNumber: string
  clientId: string
  client: {
    id: string
    name: string
    email: string
    avatar: string
    phone?: string
    company?: string
    address?: {
      line1?: string
      line2?: string
      city?: string
      postalCode?: string
      country?: string
    }
  }
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  items: QuoteItem[]
  subtotalHt: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  currency: string
  issueDate: string
  validUntil: string
  acceptedDate?: string
  rejectedDate?: string
  notes?: string
  termsAndConditions?: string
  footerText?: string
  validityDays: number
  convertedToInvoice?: boolean
  invoiceId?: string
  createdAt: string
  updatedAt: string
}

export interface QuoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discountPercent: number
  vatRate: number
  totalHt: number
  totalVat: number
  totalTtc: number
}

export interface CreateQuoteRequest {
  clientId: string
  items: {
    description: string
    quantity: number
    unitPrice: number
    discountPercent?: number
    vatRate?: number
  }[]
  status?: string
  issueDate: string
  validityDays?: number
  validUntil?: string
  notes?: string
  termsAndConditions?: string
  footerText?: string
}

export interface UpdateQuoteRequest extends Partial<CreateQuoteRequest> {
  status?: string
  acceptedDate?: string
  rejectedDate?: string
}

export interface QuotesListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  period?: string
  clientId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface QuoteStats {
  total: number
  draft: number
  sent: number
  accepted: number
  rejected: number
  expired: number
  totalAmount: number
  acceptedAmount: number
  pendingAmount: number
  conversionRate: number
}

class QuotesService {
  /**
   * Récupérer la liste des devis avec filtres et pagination
   */
  async getQuotes(params: QuotesListParams = {}) {
    const response = await apiService.api.get('/quotes', { params })
    return response.data
  }

  /**
   * Récupérer un devis par son ID
   */
  async getQuote(id: string) {
    const response = await apiService.api.get(`/quotes/${id}`)
    return response.data
  }

  /**
   * Créer un nouveau devis
   */
  async createQuote(data: CreateQuoteRequest) {
    const response = await apiService.api.post('/quotes', data)
    return response.data
  }

  /**
   * Mettre à jour un devis
   */
  async updateQuote(id: string, data: UpdateQuoteRequest) {
    const response = await apiService.api.put(`/quotes/${id}`, data)
    return response.data
  }

  /**
   * Supprimer un devis
   */
  async deleteQuote(id: string) {
    const response = await apiService.api.delete(`/quotes/${id}`)
    return response.data
  }

  /**
   * Changer le statut d'un devis
   */
  async updateQuoteStatus(id: string, status: string) {
    const response = await apiService.api.patch(`/quotes/${id}/status`, { status })
    return response.data
  }

  /**
   * Accepter un devis
   */
  async acceptQuote(id: string, acceptanceData?: { acceptedDate?: string; notes?: string }) {
    const response = await apiService.api.patch(`/quotes/${id}/accept`, {
      status: 'accepted',
      acceptedDate: acceptanceData?.acceptedDate || new Date().toISOString(),
      notes: acceptanceData?.notes
    })
    return response.data
  }

  /**
   * Rejeter un devis
   */
  async rejectQuote(id: string, rejectionData?: { rejectedDate?: string; reason?: string }) {
    const response = await apiService.api.patch(`/quotes/${id}/reject`, {
      status: 'rejected',
      rejectedDate: rejectionData?.rejectedDate || new Date().toISOString(),
      reason: rejectionData?.reason
    })
    return response.data
  }

  /**
   * Convertir un devis en facture
   */
  async convertToInvoice(id: string, invoiceData?: { issueDate?: string; dueDate?: string }) {
    const response = await apiService.api.post(`/quotes/${id}/convert-to-invoice`, invoiceData)
    return response.data
  }

  /**
   * Envoyer un devis par email
   */
  async sendQuote(id: string, emailData?: { to?: string; subject?: string; message?: string }) {
    const response = await apiService.api.post(`/quotes/${id}/send`, emailData)
    return response.data
  }

  /**
   * Télécharger un devis en PDF
   */
  async downloadQuotePdf(id: string) {
    const response = await apiService.api.get(`/quotes/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Dupliquer un devis
   */
  async duplicateQuote(id: string) {
    const response = await apiService.api.post(`/quotes/${id}/duplicate`)
    return response.data
  }

  /**
   * Récupérer les statistiques des devis
   */
  async getQuoteStats(period?: string) {
    const params = period ? { period } : {}
    const response = await apiService.api.get('/quotes/stats', { params })
    return response.data
  }

  /**
   * Exporter les devis en CSV/Excel
   */
  async exportQuotes(params: QuotesListParams & { format: 'csv' | 'excel' }) {
    const response = await apiService.api.get('/quotes/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Récupérer le prochain numéro de devis
   */
  async getNextQuoteNumber() {
    const response = await apiService.api.get('/quotes/next-number')
    return response.data
  }

  /**
   * Envoyer un rappel pour un devis
   */
  async sendQuoteReminder(id: string, reminderData?: { type?: 'follow-up' | 'expiration'; message?: string }) {
    const response = await apiService.api.post(`/quotes/${id}/reminder`, reminderData)
    return response.data
  }

  /**
   * Récupérer l'historique d'un devis
   */
  async getQuoteHistory(id: string) {
    const response = await apiService.api.get(`/quotes/${id}/history`)
    return response.data
  }

  /**
   * Prolonger la validité d'un devis
   */
  async extendQuoteValidity(id: string, extensionData: { validUntil: string; notifyClient?: boolean }) {
    const response = await apiService.api.patch(`/quotes/${id}/extend`, extensionData)
    return response.data
  }

  /**
   * Récupérer les modèles de devis
   */
  async getQuoteTemplates() {
    const response = await apiService.api.get('/quotes/templates')
    return response.data
  }

  /**
   * Créer un devis à partir d'un modèle
   */
  async createQuoteFromTemplate(templateId: string, data: { clientId: string; customizations?: any }) {
    const response = await apiService.api.post(`/quotes/templates/${templateId}/create`, data)
    return response.data
  }
}

export const quotesService = new QuotesService()
export default quotesService
