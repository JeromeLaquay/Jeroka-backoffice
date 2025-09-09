import { apiService, ApiResponse } from './api'

// Types pour les emails
export interface EmailCategory {
  id: string
  name: string
  downloadAttachments: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface EmailSender {
  id: string
  email: string
  name?: string
  categoryId?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Email {
  id: string
  subject: string
  from: string
  to: string
  date: string
  messageId: string
  hasAttachments: boolean
  attachments: EmailAttachment[]
  categoryId?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface EmailAttachment {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  emailId: string
  analyzed: boolean
  analysisResult?: AnalysisResult
  createdAt: string
}

export interface AnalysisResult {
  type: 'facture' | 'devis' | 'auto'
  confidence: number
  amount: number
  currency: string
  extractedData: {
    supplier?: string
    client?: string
    invoiceNumber?: string
    quoteNumber?: string
    date: string
    dueDate?: string
    items: {
      description: string
      quantity: number
      unitPrice: number
      totalPrice: number
    }[]
    tax?: {
      rate: number
      amount: number
    }
    totalHT: number
    totalTTC: number
  }
  suggestions: {
    createInvoice: boolean
    createQuote: boolean
    clientMatch?: string
  }
}

export interface CreateCategoryRequest {
  name: string
  downloadAttachments: boolean
}

export interface UpdateCategoryRequest {
  name?: string
  downloadAttachments?: boolean
}

export interface AssignCategoryRequest {
  categoryId: string | null
}

export interface AnalyzeAttachmentRequest {
  analysisType?: 'facture' | 'devis' | 'auto'
}

export interface ConvertAttachmentRequest {
  convertTo: 'invoice' | 'quote'
  analysisData: AnalysisResult
}

export interface EmailsQueryParams {
  page?: number
  limit?: number
  categoryId?: string
  hasAttachments?: boolean
}

export interface AttachmentsQueryParams {
  page?: number
  limit?: number
  analyzed?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class EmailsService {
  
  // ===== CATÉGORIES =====
  
  async getCategories(): Promise<ApiResponse<EmailCategory[]>> {
    const response = await apiService.axiosInstance.get<ApiResponse<EmailCategory[]>>('/emails/categories')
    return response.data
  }

  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<EmailCategory>> {
    const response = await apiService.axiosInstance.post<ApiResponse<EmailCategory>>('/emails/categories', data)
    return response.data
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<EmailCategory>> {
    const response = await apiService.axiosInstance.put<ApiResponse<EmailCategory>>(`/emails/categories/${id}`, data)
    return response.data
  }

  async deleteCategory(id: string): Promise<ApiResponse> {
    const response = await apiService.axiosInstance.delete<ApiResponse>(`/emails/categories/${id}`)
    return response.data
  }

  // ===== EXPÉDITEURS =====
  
  async getSenders(): Promise<ApiResponse<EmailSender[]>> {
    const response = await apiService.axiosInstance.get<ApiResponse<EmailSender[]>>('/emails/senders')
    return response.data
  }

  async assignSenderToCategory(senderId: string, data: AssignCategoryRequest): Promise<ApiResponse> {
    const response = await apiService.axiosInstance.put<ApiResponse>(`/emails/senders/${senderId}/category`, data)
    return response.data
  }

  // ===== EMAILS =====
  
  async getEmails(params?: EmailsQueryParams): Promise<ApiResponse<PaginatedResponse<Email>>> {
    const response = await apiService.axiosInstance.get<ApiResponse<PaginatedResponse<Email>>>('/emails', { params })
    return response.data
  }

  async syncEmails(): Promise<ApiResponse<{ newEmails: number; downloadedAttachments: number }>> {
    const response = await apiService.axiosInstance.post<ApiResponse<{ newEmails: number; downloadedAttachments: number }>>('/emails/sync')
    return response.data
  }

  // ===== PIÈCES JOINTES =====
  
  async getAttachments(params?: AttachmentsQueryParams): Promise<ApiResponse<PaginatedResponse<EmailAttachment>>> {
    const response = await apiService.axiosInstance.get<ApiResponse<PaginatedResponse<EmailAttachment>>>('/emails/attachments', { params })
    return response.data
  }

  async analyzeAttachment(id: string, data?: AnalyzeAttachmentRequest): Promise<ApiResponse<{ attachmentId: string; analysisResult: AnalysisResult }>> {
    const response = await apiService.axiosInstance.post<ApiResponse<{ attachmentId: string; analysisResult: AnalysisResult }>>(`/emails/attachments/${id}/analyze`, data)
    return response.data
  }

  async convertAttachment(id: string, data: ConvertAttachmentRequest): Promise<ApiResponse<{ documentId: string; type: string; redirectUrl: string }>> {
    const response = await apiService.axiosInstance.post<ApiResponse<{ documentId: string; type: string; redirectUrl: string }>>(`/emails/attachments/${id}/convert`, data)
    return response.data
  }

  async downloadAttachment(id: string): Promise<ApiResponse<{ downloadUrl: string; filename: string }>> {
    const response = await apiService.axiosInstance.get<ApiResponse<{ downloadUrl: string; filename: string }>>(`/emails/attachments/${id}/download`)
    return response.data
  }

  // ===== UTILITAIRES =====
  
  /**
   * Formatage de la taille des fichiers
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Formatage des dates
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Extraction du nom du fichier sans extension
   */
  getFileNameWithoutExtension(filename: string): string {
    return filename.split('.').slice(0, -1).join('.')
  }

  /**
   * Obtenir l'extension du fichier
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Vérifier si un fichier est un PDF
   */
  isPDF(mimeType: string): boolean {
    return mimeType === 'application/pdf'
  }

  /**
   * Obtenir l'icône pour un type de fichier
   */
  getFileIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦'
    return '📎'
  }

  /**
   * Obtenir la couleur du badge pour le statut d'analyse
   */
  getAnalysisStatusColor(analyzed: boolean): 'success' | 'warning' | 'secondary' {
    return analyzed ? 'success' : 'warning'
  }

  /**
   * Obtenir le texte du statut d'analyse
   */
  getAnalysisStatusText(analyzed: boolean): string {
    return analyzed ? 'Analysé' : 'En attente'
  }

  /**
   * Obtenir la couleur du badge pour le type de document
   */
  getDocumentTypeColor(type: string): 'primary' | 'info' | 'success' | 'warning' {
    switch (type) {
      case 'facture': return 'primary'
      case 'devis': return 'info'
      case 'auto': return 'success'
      default: return 'warning'
    }
  }

  /**
   * Obtenir le texte du type de document
   */
  getDocumentTypeText(type: string): string {
    switch (type) {
      case 'facture': return 'Facture'
      case 'devis': return 'Devis'
      case 'auto': return 'Auto-détection'
      default: return 'Inconnu'
    }
  }

  /**
   * Valider les données d'une catégorie
   */
  validateCategoryData(data: CreateCategoryRequest): string[] {
    const errors: string[] = []
    
    if (!data.name || data.name.trim().length === 0) {
      errors.push('Le nom de la catégorie est requis')
    }
    
    if (data.name && data.name.trim().length > 100) {
      errors.push('Le nom de la catégorie ne peut pas dépasser 100 caractères')
    }
    
    return errors
  }

  /**
   * Obtenir les statistiques des emails
   */
  getEmailStats(emails: Email[]): {
    total: number
    withAttachments: number
    categorized: number
    uncategorized: number
  } {
    return {
      total: emails.length,
      withAttachments: emails.filter(email => email.hasAttachments).length,
      categorized: emails.filter(email => email.categoryId).length,
      uncategorized: emails.filter(email => !email.categoryId).length
    }
  }

  /**
   * Obtenir les statistiques des pièces jointes
   */
  getAttachmentStats(attachments: EmailAttachment[]): {
    total: number
    analyzed: number
    unanalyzed: number
    totalSize: number
    avgSize: number
  } {
    const analyzed = attachments.filter(att => att.analyzed).length
    const totalSize = attachments.reduce((sum, att) => sum + att.size, 0)
    
    return {
      total: attachments.length,
      analyzed,
      unanalyzed: attachments.length - analyzed,
      totalSize,
      avgSize: attachments.length > 0 ? totalSize / attachments.length : 0
    }
  }
}

// Instance singleton
export const emailsService = new EmailsService()
export default emailsService
