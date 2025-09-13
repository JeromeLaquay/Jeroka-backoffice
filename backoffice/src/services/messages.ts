import { apiService } from './api'

export interface ContactMessage {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  priority: 'low' | 'medium' | 'high'
  source: 'website' | 'email' | 'phone' | 'other'
  prompt: string
  response: string
  tags?: string[]
  ipAddress?: string
  userAgent?: string
  referrer?: string
  attachments?: string[]
  replies?: MessageReply[]
  createdAt: string
  updatedAt: string
  readAt?: string
  repliedAt?: string
}

export interface MessageReply {
  id: string
  messageId: string
  content: string
  isFromCustomer: boolean
  authorId?: string
  authorName: string
  createdAt: string
  attachments?: string[]
}

export interface MessageStats {
  total: number
  new: number
  read: number
  replied: number
  archived: number
  todayCount: number
  weekCount: number
  monthCount: number
  averageResponseTime: number
  responseRate: number
}

export interface CreateMessageRequest {
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
  source?: string
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
}

export interface UpdateMessageRequest {
  status?: 'new' | 'read' | 'replied' | 'archived'
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
}

export interface ReplyToMessageRequest {
  content: string
  attachments?: File[]
}

export interface MessagesListParams {
  page?: number
  limit?: number
  search?: string
  status?: 'new' | 'read' | 'replied' | 'archived'
  priority?: 'low' | 'medium' | 'high'
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface BulkActionRequest {
  messageIds: string[]
  action: 'markAsRead' | 'markAsUnread' | 'archive' | 'delete' | 'assignTo'
  assignTo?: string
}

class MessagesService {
  /**
   * Transformer les données du backend vers le frontend
   */
  private transformMessageFromBackend(backendMessage: any): ContactMessage {
    return {
      id: backendMessage.id,
      firstName: backendMessage.first_name || backendMessage.firstName,
      lastName: backendMessage.last_name || backendMessage.lastName,
      email: backendMessage.email,
      phone: backendMessage.phone,
      company: backendMessage.company,
      subject: backendMessage.subject,
      message: backendMessage.message,
      status: backendMessage.status,
      priority: backendMessage.priority,
      source: backendMessage.source || 'website',
      tags: backendMessage.tags || [],
      ipAddress: backendMessage.ip_address,
      userAgent: backendMessage.user_agent,
      referrer: backendMessage.referrer,
      attachments: backendMessage.attachments || [],
      replies: backendMessage.replies || [],
      createdAt: backendMessage.created_at || backendMessage.createdAt,
      updatedAt: backendMessage.updated_at || backendMessage.updatedAt,
      readAt: backendMessage.read_at || backendMessage.readAt,
      repliedAt: backendMessage.replied_at || backendMessage.repliedAt
    }
  }

  /**
   * Transformer les données du frontend vers le backend
   */
  private transformMessageToBackend(frontendMessage: any): any {
    return {
      first_name: frontendMessage.firstName,
      last_name: frontendMessage.lastName,
      email: frontendMessage.email,
      phone: frontendMessage.phone,
      company: frontendMessage.company,
      subject: frontendMessage.subject,
      message: frontendMessage.message,
      status: frontendMessage.status,
      priority: frontendMessage.priority,
      source: frontendMessage.source,
      tags: frontendMessage.tags,
    }
  }

  /**
   * Récupérer les statistiques des messages
   */
  async getMessagesStats() {
    const response = await apiService.axiosInstance.get('/messages/stats')
    return response.data
  }

  /**
   * Récupérer les messages avec filtres et pagination
   */
  async getMessages(params: MessagesListParams = {}) {
    const response = await apiService.axiosInstance.get('/messages', { params })
    const transformedMessages = response.data.data?.messages?.map((msg: any) => 
      this.transformMessageFromBackend(msg)
    ) || []
    
    return {
      ...response.data,
      data: {
        ...response.data.data,
        messages: transformedMessages
      }
    }
  }

  /**
   * Récupérer un message par son ID
   */
  async getMessage(id: string) {
    const response = await apiService.axiosInstance.get(`/messages/${id}`)
    return {
      ...response.data,
      data: this.transformMessageFromBackend(response.data.data)
    }
  }

  /**
   * Créer un nouveau message de contact (depuis le formulaire public)
   */
  async createMessage(data: CreateMessageRequest) {
    const transformedData = this.transformMessageToBackend(data)
    const response = await apiService.axiosInstance.post('/messages', transformedData)
    return {
      ...response.data,
      data: this.transformMessageFromBackend(response.data.data)
    }
  }

  /**
   * Mettre à jour un message
   */
  async updateMessage(id: string, data: UpdateMessageRequest) {
    const transformedData = this.transformMessageToBackend(data)
    const response = await apiService.axiosInstance.put(`/messages/${id}`, transformedData)
    return {
      ...response.data,
      data: this.transformMessageFromBackend(response.data.data)
    }
  }

  /**
   * Supprimer un message
   */
  async deleteMessage(id: string) {
    const response = await apiService.axiosInstance.delete(`/messages/${id}`)
    return response.data
  }

  /**
   * Marquer un message comme lu
   */
  async markAsRead(id: string) {
    const response = await apiService.axiosInstance.post(`/messages/${id}/mark-read`)
    return response.data
  }

  /**
   * Marquer un message comme non lu
   */
  async markAsUnread(id: string) {
    const response = await apiService.axiosInstance.post(`/messages/${id}/mark-unread`)
    return response.data
  }

  /**
   * Mettre à jour le statut d'un message
   */
  async updateMessageStatus(id: string, data: { status: 'new' | 'read' | 'replied' | 'archived' }) {
    const response = await apiService.axiosInstance.put(`/messages/${id}`, data)
    return response.data
  }

  /**
   * Archiver un message
   */
  async archiveMessage(id: string) {
    const response = await apiService.axiosInstance.post(`/messages/${id}/archive`)
    return response.data
  }

  /**
   * Restaurer un message archivé
   */
  async unarchiveMessage(id: string) {
    const response = await apiService.axiosInstance.post(`/messages/${id}/unarchive`)
    return response.data
  }

  /**
   * Répondre à un message
   */
  async replyToMessage(id: string, data: ReplyToMessageRequest) {
    const formData = new FormData()
    formData.append('content', data.content)
    
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file)
      })
    }

    const response = await apiService.axiosInstance.post(`/messages/${id}/reply`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Récupérer les réponses d'un message
   */
  async getMessageReplies(id: string) {
    const response = await apiService.axiosInstance.get(`/messages/${id}/replies`)
    return response.data
  }

  /**
   * Assigner un message à un utilisateur
   */
  async assignMessage(id: string, userId: string) {
    const response = await apiService.axiosInstance.post(`/messages/${id}/assign`, {
      userId
    })
    return response.data
  }

  /**
   * Désassigner un message
   */
  async unassignMessage(id: string) {
    const response = await apiService.axiosInstance.post(`/messages/${id}/unassign`)
    return response.data
  }

  /**
   * Ajouter des tags à un message
   */
  async addTags(id: string, tags: string[]) {
    const response = await apiService.axiosInstance.post(`/messages/${id}/tags`, { tags })
    return response.data
  }

  /**
   * Supprimer des tags d'un message
   */
  async removeTags(id: string, tags: string[]) {
    const response = await apiService.axiosInstance.delete(`/messages/${id}/tags`, {
      data: { tags }
    })
    return response.data
  }

  /**
   * Actions en lot sur plusieurs messages
   */
  async bulkAction(data: BulkActionRequest) {
    const response = await apiService.axiosInstance.post('/messages/bulk-action', data)
    return response.data
  }

  /**
   * Marquer tous les messages comme lus
   */
  async markAllAsRead() {
    const response = await apiService.axiosInstance.post('/messages/mark-all-read')
    return response.data
  }

  /**
   * Exporter les messages
   */
  async exportMessages(params: MessagesListParams & { format: 'csv' | 'excel' | 'pdf' }) {
    const response = await apiService.axiosInstance.get('/messages/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Importer des messages
   */
  async importMessages(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiService.axiosInstance.post('/messages/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Recherche avancée de messages
   */
  async searchMessages(query: string, filters?: {
    status?: string[]
    priority?: string[]
    dateRange?: { from: string; to: string }
    tags?: string[]
  }) {
    const response = await apiService.axiosInstance.post('/messages/search', {
      query,
      filters
    })
    return response.data
  }

  /**
   * Récupérer les tags disponibles
   */
  async getTags() {
    const response = await apiService.axiosInstance.get('/messages/tags')
    return response.data
  }

  /**
   * Créer un nouveau tag
   */
  async createTag(name: string, color?: string) {
    const response = await apiService.axiosInstance.post('/messages/tags', {
      name,
      color
    })
    return response.data
  }

  /**
   * Supprimer un tag
   */
  async deleteTag(tagId: string) {
    const response = await apiService.axiosInstance.delete(`/messages/tags/${tagId}`)
    return response.data
  }

  /**
   * Récupérer les templates de réponse
   */
  async getReplyTemplates() {
    const response = await apiService.axiosInstance.get('/messages/reply-templates')
    return response.data
  }

  /**
   * Créer un template de réponse
   */
  async createReplyTemplate(data: {
    name: string
    subject: string
    content: string
    category?: string
  }) {
    const response = await apiService.axiosInstance.post('/messages/reply-templates', data)
    return response.data
  }

  /**
   * Mettre à jour un template de réponse
   */
  async updateReplyTemplate(id: string, data: {
    name?: string
    subject?: string
    content?: string
    category?: string
  }) {
    const response = await apiService.axiosInstance.put(`/messages/reply-templates/${id}`, data)
    return response.data
  }

  /**
   * Supprimer un template de réponse
   */
  async deleteReplyTemplate(id: string) {
    const response = await apiService.axiosInstance.delete(`/messages/reply-templates/${id}`)
    return response.data
  }

  /**
   * Obtenir les métriques de performance
   */
  async getPerformanceMetrics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const response = await apiService.axiosInstance.get('/messages/metrics', {
      params: { period }
    })
    return response.data
  }

  /**
   * Configurer les notifications pour les nouveaux messages
   */
  async updateNotificationSettings(settings: {
    emailNotifications: boolean
    pushNotifications: boolean
    slackWebhook?: string
    notifyOnPriority?: string[]
  }) {
    const response = await apiService.axiosInstance.put('/messages/notification-settings', settings)
    return response.data
  }

  /**
   * Créer une règle d'auto-assignation
   */
  async createAutoAssignRule(rule: {
    name: string
    conditions: any
    actions: any
    isActive: boolean
  }) {
    const response = await apiService.axiosInstance.post('/messages/auto-assign-rules', rule)
    return response.data
  }

  /**
   * Générer un brouillon de réponse IA
   */
  async generateAIDraft(messageId: string, options: {
    tone?: 'professionnel' | 'amical' | 'formel' | 'concis'
    language?: 'fr' | 'en'
  }) {
    const response = await apiService.axiosInstance.post(`/messages/${messageId}/ai-draft`, options)
    return response.data
  }

  /**
   * Récupérer les règles d'auto-assignation
   */
  async getAutoAssignRules() {
    const response = await apiService.axiosInstance.get('/messages/auto-assign-rules')
    return response.data
  }
}

export const messagesService = new MessagesService()
export default messagesService
