import { apiService, ApiResponse } from './api'

// Types pour les annonces
export interface Announcement {
  id: string
  title: string
  summary: string
  content: string
  type: 'feature' | 'update' | 'maintenance' | 'security' | 'announcement'
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  version?: string
  targetAudience: string[]
  isPinned: boolean
  sendNotification: boolean
  views: number
  createdAt: string
  updatedAt?: string
  scheduledAt?: string
  publishedAt?: string
  author: {
    id: string
    name: string
    email: string
  }
}

export interface CreateAnnouncementRequest {
  title: string
  summary: string
  content: string
  type: Announcement['type']
  priority: Announcement['priority']
  status: Announcement['status']
  version?: string
  targetAudience: string[]
  isPinned: boolean
  sendNotification: boolean
  scheduledAt?: string
  authorId?: string
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {
  id: string
}

export interface AnnouncementFilters {
  search?: string
  type?: string
  status?: string
  priority?: string
  authorId?: string
  targetAudience?: string
}

class AnnouncementsService {
  /**
   * Récupère la liste des annonces avec filtres
   */
  async getAnnouncements(filters?: AnnouncementFilters): Promise<ApiResponse<Announcement[]>> {
    const params = new URLSearchParams()
    
    if (filters?.search) params.append('search', filters.search)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.authorId) params.append('authorId', filters.authorId)
    if (filters?.targetAudience) params.append('targetAudience', filters.targetAudience)

    const response = await apiService.axiosInstance.get<ApiResponse<Announcement[]>>(
      `/announcements?${params.toString()}`
    )
    return response.data
  }

  /**
   * Récupère une annonce par son ID
   */
  async getAnnouncement(id: string): Promise<ApiResponse<Announcement>> {
    const response = await apiService.axiosInstance.get<ApiResponse<Announcement>>(`/announcements/${id}`)
    return response.data
  }

  /**
   * Crée une nouvelle annonce
   */
  async createAnnouncement(data: CreateAnnouncementRequest): Promise<ApiResponse<Announcement>> {
    const response = await apiService.axiosInstance.post<ApiResponse<Announcement>>('/announcements', data)
    return response.data
  }

  /**
   * Met à jour une annonce
   */
  async updateAnnouncement(data: UpdateAnnouncementRequest): Promise<ApiResponse<Announcement>> {
    const { id, ...updateData } = data
    const response = await apiService.axiosInstance.put<ApiResponse<Announcement>>(`/announcements/${id}`, updateData)
    return response.data
  }

  /**
   * Supprime une annonce
   */
  async deleteAnnouncement(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.axiosInstance.delete<ApiResponse<void>>(`/announcements/${id}`)
    return response.data
  }

  /**
   * Publie une annonce immédiatement
   */
  async publishAnnouncement(id: string): Promise<ApiResponse<Announcement>> {
    const response = await apiService.axiosInstance.post<ApiResponse<Announcement>>(`/announcements/${id}/publish`)
    return response.data
  }

  /**
   * Archive une annonce
   */
  async archiveAnnouncement(id: string): Promise<ApiResponse<Announcement>> {
    const response = await apiService.axiosInstance.post<ApiResponse<Announcement>>(`/announcements/${id}/archive`)
    return response.data
  }

  /**
   * Incrémente le compteur de vues d'une annonce
   */
  async incrementViews(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.axiosInstance.post<ApiResponse<void>>(`/announcements/${id}/view`)
    return response.data
  }

  /**
   * Récupère les annonces publiques (pour les utilisateurs finaux)
   */
  async getPublicAnnouncements(filters?: {
    targetAudience?: string
    limit?: number
    includeArchived?: boolean
  }): Promise<ApiResponse<Announcement[]>> {
    const params = new URLSearchParams()
    
    if (filters?.targetAudience) params.append('targetAudience', filters.targetAudience)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.includeArchived) params.append('includeArchived', 'true')

    const response = await apiService.axiosInstance.get<ApiResponse<Announcement[]>>(
      `/announcements/public?${params.toString()}`
    )
    return response.data
  }

  /**
   * Marque une annonce comme lue pour l'utilisateur actuel
   */
  async markAsRead(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.axiosInstance.post<ApiResponse<void>>(`/announcements/${id}/read`)
    return response.data
  }

  /**
   * Récupère les statistiques des annonces
   */
  async getAnnouncementStats(): Promise<ApiResponse<{
    total: number
    published: number
    scheduled: number
    draft: number
    archived: number
    totalViews: number
    averageViews: number
    byType: Record<string, number>
    byPriority: Record<string, number>
    recentActivity: Array<{
      date: string
      published: number
      views: number
    }>
  }>> {
    const response = await apiService.axiosInstance.get<ApiResponse<any>>('/announcements/stats')
    return response.data
  }

  /**
   * Envoie une notification push pour une annonce
   */
  async sendNotification(id: string, options?: {
    title?: string
    message?: string
    targetAudience?: string[]
  }): Promise<ApiResponse<{
    sent: number
    failed: number
    details: Array<{
      userId: string
      status: 'sent' | 'failed'
      error?: string
    }>
  }>> {
    const response = await apiService.axiosInstance.post<ApiResponse<any>>(`/announcements/${id}/notify`, options)
    return response.data
  }

  /**
   * Duplique une annonce
   */
  async duplicateAnnouncement(id: string, modifications?: Partial<CreateAnnouncementRequest>): Promise<ApiResponse<Announcement>> {
    const response = await apiService.axiosInstance.post<ApiResponse<Announcement>>(`/announcements/${id}/duplicate`, modifications)
    return response.data
  }

  /**
   * Validation des données d'annonce
   */
  validateAnnouncementData(data: Partial<CreateAnnouncementRequest>): string[] {
    const errors: string[] = []

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Le titre est requis')
    } else if (data.title.length > 200) {
      errors.push('Le titre ne peut pas dépasser 200 caractères')
    }

    if (!data.summary || data.summary.trim().length === 0) {
      errors.push('Le résumé est requis')
    } else if (data.summary.length > 500) {
      errors.push('Le résumé ne peut pas dépasser 500 caractères')
    }

    if (!data.content || data.content.trim().length === 0) {
      errors.push('Le contenu est requis')
    } else if (data.content.length > 10000) {
      errors.push('Le contenu ne peut pas dépasser 10000 caractères')
    }

    if (!data.type) {
      errors.push('Le type d\'annonce est requis')
    }

    if (!data.priority) {
      errors.push('La priorité est requise')
    }

    if (data.status === 'scheduled' && !data.scheduledAt) {
      errors.push('La date de publication est requise pour une annonce programmée')
    }

    if (data.scheduledAt) {
      const scheduledDate = new Date(data.scheduledAt)
      if (scheduledDate <= new Date()) {
        errors.push('La date de publication doit être dans le futur')
      }
    }

    if (data.targetAudience && data.targetAudience.length === 0) {
      errors.push('Au moins un public cible doit être sélectionné')
    }

    return errors
  }

  /**
   * Formate une annonce pour l'affichage
   */
  formatAnnouncement(announcement: Announcement): Announcement & {
    formattedDate: string
    isRecent: boolean
    isUrgent: boolean
    readingTime: number
  } {
    const now = new Date()
    const createdAt = new Date(announcement.createdAt)
    const daysDiff = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    
    // Estimation du temps de lecture (250 mots par minute)
    const wordCount = announcement.content.split(' ').length
    const readingTime = Math.ceil(wordCount / 250)

    return {
      ...announcement,
      formattedDate: this.formatDate(announcement.createdAt),
      isRecent: daysDiff <= 7,
      isUrgent: announcement.priority === 'critical' || announcement.priority === 'high',
      readingTime
    }
  }

  /**
   * Formate une date pour l'affichage
   */
  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Recherche dans les annonces
   */
  searchAnnouncements(announcements: Announcement[], query: string): Announcement[] {
    if (!query.trim()) return announcements

    const searchTerms = query.toLowerCase().split(' ')
    
    return announcements.filter(announcement => {
      const searchableText = [
        announcement.title,
        announcement.summary,
        announcement.content,
        announcement.type,
        announcement.priority,
        announcement.author.name,
        announcement.version || ''
      ].join(' ').toLowerCase()

      return searchTerms.every(term => searchableText.includes(term))
    })
  }

  /**
   * Filtre les annonces par critères
   */
  filterAnnouncements(announcements: Announcement[], filters: AnnouncementFilters): Announcement[] {
    return announcements.filter(announcement => {
      if (filters.type && announcement.type !== filters.type) return false
      if (filters.status && announcement.status !== filters.status) return false
      if (filters.priority && announcement.priority !== filters.priority) return false
      if (filters.authorId && announcement.author.id !== filters.authorId) return false
      if (filters.targetAudience && !announcement.targetAudience.includes(filters.targetAudience)) return false
      
      return true
    })
  }
}

// Instance singleton
export const announcementsService = new AnnouncementsService()
export default announcementsService
