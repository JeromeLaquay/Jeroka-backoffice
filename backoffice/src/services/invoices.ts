import { apiService } from './api'

export interface Invoice {
  id: string
  invoiceNumber: string
  orderId?: string
  order?: {
    id: string
    orderNumber: string
  }
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
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  items: InvoiceItem[]
  subtotalHt: number
  discountAmount: number
  taxAmount: number
  totalAmount: number
  currency: string
  issueDate: string
  dueDate: string
  paidDate?: string
  paymentMethod?: string
  paymentTerms: number // Nombre de jours
  notes?: string
  termsAndConditions?: string
  footerText?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
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

export interface CreateInvoiceRequest {
  orderId?: string
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
  dueDate: string
  paymentTerms?: number
  notes?: string
  termsAndConditions?: string
  footerText?: string
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {
  status?: string
  paidDate?: string
  paymentMethod?: string
}

export interface InvoicesListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  period?: string
  clientId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface InvoiceStats {
  total: number
  draft: number
  sent: number
  paid: number
  overdue: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
}

class InvoicesService {
  /**
   * Récupérer la liste des factures avec filtres et pagination
   */
  async getInvoices(params: InvoicesListParams = {}) {
    const response = await apiService.axiosInstance.get('/invoices', { params })
    return response.data
  }

  /**
   * Récupérer une facture par son ID
   */
  async getInvoice(id: string) {
    const response = await apiService.axiosInstance.get(`/invoices/${id}`)
    return response.data
  }

  /**
   * Créer une nouvelle facture
   */
  async createInvoice(data: CreateInvoiceRequest) {
    const response = await apiService.axiosInstance.post('/invoices', data)
    return response.data
  }

  /**
   * Créer une facture depuis une commande
   */
  async createInvoiceFromOrder(orderId: string) {
    const response = await apiService.axiosInstance.post(`/invoices/from-order/${orderId}`)
    return response.data
  }

  /**
   * Mettre à jour une facture
   */
  async updateInvoice(id: string, data: UpdateInvoiceRequest) {
    const response = await apiService.axiosInstance.put(`/invoices/${id}`, data)
    return response.data
  }

  /**
   * Supprimer une facture
   */
  async deleteInvoice(id: string) {
    const response = await apiService.axiosInstance.delete(`/invoices/${id}`)
    return response.data
  }

  /**
   * Changer le statut d'une facture
   */
  async updateInvoiceStatus(id: string, status: string) {
    const response = await apiService.axiosInstance.patch(`/invoices/${id}/status`, { status })
    return response.data
  }

  /**
   * Marquer une facture comme payée
   */
  async markInvoiceAsPaid(id: string, paymentData?: { method?: string; paidDate?: string }) {
    const response = await apiService.axiosInstance.patch(`/invoices/${id}/payment`, {
      status: 'paid',
      paidDate: paymentData?.paidDate || new Date().toISOString(),
      paymentMethod: paymentData?.method
    })
    return response.data
  }

  /**
   * Envoyer une facture par email
   */
  async sendInvoice(id: string, emailData?: { to?: string; subject?: string; message?: string }) {
    const response = await apiService.axiosInstance.post(`/invoices/${id}/send`, emailData)
    return response.data
  }

  /**
   * Télécharger une facture en PDF
   */
  async downloadInvoicePdf(id: string) {
    const response = await apiService.axiosInstance.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Dupliquer une facture
   */
  async duplicateInvoice(id: string) {
    const response = await apiService.axiosInstance.post(`/invoices/${id}/duplicate`)
    return response.data
  }

  /**
   * Récupérer les statistiques des factures
   */
  async getInvoiceStats(period?: string) {
    const params = period ? { period } : {}
    const response = await apiService.axiosInstance.get('/invoices/stats', { params })
    return response.data
  }

  /**
   * Exporter les factures en CSV/Excel
   */
  async exportInvoices(params: InvoicesListParams & { format: 'csv' | 'excel' }) {
    const response = await apiService.axiosInstance.get('/invoices/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Récupérer le prochain numéro de facture
   */
  async getNextInvoiceNumber() {
    const response = await apiService.axiosInstance.get('/invoices/next-number')
    return response.data
  }

  /**
   * Envoyer un rappel de paiement
   */
  async sendPaymentReminder(id: string, reminderData?: { type?: 'first' | 'second' | 'final'; message?: string }) {
    const response = await apiService.axiosInstance.post(`/invoices/${id}/reminder`, reminderData)
    return response.data
  }

  /**
   * Récupérer l'historique des paiements
   */
  async getPaymentHistory(id: string) {
    const response = await apiService.axiosInstance.get(`/invoices/${id}/payments`)
    return response.data
  }

  /**
   * Ajouter un paiement partiel
   */
  async addPartialPayment(id: string, paymentData: { amount: number; date: string; method: string; reference?: string }) {
    const response = await apiService.axiosInstance.post(`/invoices/${id}/payments`, paymentData)
    return response.data
  }
}

export const invoicesService = new InvoicesService()
export default invoicesService
