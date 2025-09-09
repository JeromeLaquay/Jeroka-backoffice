import { apiService, ApiResponse } from './api'

// Types pour les publications
export interface Publication {
  id: string
  title: string
  content: string
  hashtags: string
  image?: string
  imageUrl?: string
  platforms: string[]
  type: 'standard' | 'promotion' | 'event' | 'announcement' | 'tutorial'
  status: 'draft' | 'scheduled' | 'published'
  category: string
  keywords: string
  createdAt: string
  updatedAt?: string
  scheduledAt?: string
  publishedAt?: string
  authorId?: string
  views?: number
  likes?: number
  shares?: number
  metadata?: {
    seoTitle?: string
    seoDescription?: string
    slug?: string
  }
}

export interface CreatePublicationRequest {
  title: string
  content: string
  hashtags?: string
  image?: File | string
  platforms: string[]
  type: Publication['type']
  status: Publication['status']
  category?: string
  keywords?: string
  scheduledAt?: string
  metadata?: Publication['metadata']
}

export interface UpdatePublicationRequest extends Partial<CreatePublicationRequest> {
  id: string
}

export interface PublicationFilters {
  search?: string
  status?: string
  platform?: string
  category?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  authorId?: string
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt' | 'scheduledAt' | 'title' | 'views'
  sortOrder?: 'asc' | 'desc'
}

export interface PublicationsListResponse {
  publications: Publication[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface PublicationStats {
  total: number
  published: number
  scheduled: number
  draft: number
  totalViews: number
  totalLikes: number
  totalShares: number
  byPlatform: Record<string, number>
  byCategory: Record<string, number>
  recentActivity: Array<{
    id: string
    type: 'created' | 'published' | 'scheduled' | 'updated'
    publicationId: string
    publicationTitle: string
    timestamp: string
  }>
}

export interface SchedulePublicationRequest {
  id: string
  scheduledAt: string
  platforms?: string[]
}

export interface DuplicatePublicationRequest {
  id: string
  title?: string
  modifications?: Partial<CreatePublicationRequest>
}

class PublicationsService {
  /**
   * Récupère la liste des publications avec filtres
   */
  async getPublications(filters?: PublicationFilters): Promise<ApiResponse<PublicationsListResponse>> {
    return await apiService.getPublications(filters)
  }

  /**
   * Récupère une publication par son ID
   */
  async getPublication(id: string): Promise<ApiResponse<Publication>> {
    const response = await apiService.axiosInstance.get<ApiResponse<Publication>>(`/publications/${id}`)
    return response.data
  }

  /**
   * Crée une nouvelle publication
   */
  async createPublication(data: CreatePublicationRequest): Promise<ApiResponse<Publication>> {
    let payload = { ...data }

    // Gestion de l'upload d'image si nécessaire
    if (data.image instanceof File) {
      const imageUrl = await this.uploadImage(data.image)
      payload = { ...payload, image: imageUrl, imageUrl }
    }

    return await apiService.createPublication(payload)
  }

  /**
   * Met à jour une publication existante
   */
  async updatePublication(data: UpdatePublicationRequest): Promise<ApiResponse<Publication>> {
    const { id, ...updateData } = data
    let payload = { ...updateData }

    // Gestion de l'upload d'image si nécessaire
    if (updateData.image instanceof File) {
      const imageUrl = await this.uploadImage(updateData.image)
      payload = { ...payload, image: imageUrl, imageUrl }
    }

    return await apiService.updatePublication(id, payload)
  }

  /**
   * Supprime une publication
   */
  async deletePublication(id: string): Promise<ApiResponse> {
    return await apiService.deletePublication(id)
  }

  /**
   * Publie immédiatement une publication
   */
  async publishPublication(id: string, platforms?: string[]): Promise<ApiResponse> {
    const payload = platforms ? { platforms } : {}
    return await apiService.publishPublication(id)
  }

  /**
   * Programme une publication pour une date future
   */
  async schedulePublication(data: SchedulePublicationRequest): Promise<ApiResponse> {
    const response = await apiService.axiosInstance.post<ApiResponse>(`/publications/${data.id}/schedule`, {
      scheduledAt: data.scheduledAt,
      platforms: data.platforms
    })
    return response.data
  }

  /**
   * Annule la programmation d'une publication
   */
  async unschedulePublication(id: string): Promise<ApiResponse> {
    const response = await apiService.axiosInstance.post<ApiResponse>(`/publications/${id}/unschedule`)
    return response.data
  }

  /**
   * Duplique une publication
   */
  async duplicatePublication(data: DuplicatePublicationRequest): Promise<ApiResponse<Publication>> {
    const response = await apiService.axiosInstance.post<ApiResponse<Publication>>(`/publications/${data.id}/duplicate`, {
      title: data.title,
      modifications: data.modifications
    })
    return response.data
  }

  /**
   * Récupère les statistiques des publications
   */
  async getPublicationStats(filters?: {
    dateFrom?: string
    dateTo?: string
    platform?: string
  }): Promise<ApiResponse<PublicationStats>> {
    const response = await apiService.axiosInstance.get<ApiResponse<PublicationStats>>('/publications/stats', {
      params: filters
    })
    return response.data
  }

  /**
   * Récupère l'aperçu d'une publication pour les réseaux sociaux
   */
  async getPublicationPreview(id: string, platform: string): Promise<ApiResponse<{
    platform: string
    preview: {
      title: string
      content: string
      image?: string
      hashtags: string[]
      estimatedReach?: number
      suggestedImprovements?: string[]
    }
  }>> {
    const response = await apiService.axiosInstance.get<ApiResponse<any>>(`/publications/${id}/preview/${platform}`)
    return response.data
  }

  /**
   * Upload une image pour une publication
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', 'publication')

    const response = await apiService.axiosInstance.post<ApiResponse<{ url: string, filename: string }>>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (response.data.success && response.data.data) {
      return response.data.data.url
    }

    throw new Error('Erreur lors de l\'upload de l\'image')
  }

  /**
   * Supprime une image de publication
   */
  async deleteImage(imageUrl: string): Promise<ApiResponse> {
    const response = await apiService.axiosInstance.delete<ApiResponse>('/uploads/image', {
      data: { imageUrl }
    })
    return response.data
  }

  /**
   * Récupère les modèles de publications
   */
  async getPublicationTemplates(): Promise<ApiResponse<Array<{
    id: string
    name: string
    description: string
    type: Publication['type']
    template: Partial<CreatePublicationRequest>
  }>>> {
    const response = await apiService.axiosInstance.get<ApiResponse<any>>('/publications/templates')
    return response.data
  }

  /**
   * Sauvegarde un modèle de publication
   */
  async saveAsTemplate(publicationId: string, templateName: string, description?: string): Promise<ApiResponse> {
    const response = await apiService.axiosInstance.post<ApiResponse>(`/publications/${publicationId}/save-as-template`, {
      name: templateName,
      description
    })
    return response.data
  }

  /**
   * Récupère l'historique des publications
   */
  async getPublicationHistory(id: string): Promise<ApiResponse<Array<{
    id: string
    action: 'created' | 'updated' | 'published' | 'scheduled' | 'deleted'
    timestamp: string
    userId: string
    changes?: Record<string, any>
    comment?: string
  }>>> {
    const response = await apiService.axiosInstance.get<ApiResponse<any>>(`/publications/${id}/history`)
    return response.data
  }

  /**
   * Analyse le contenu d'une publication (longueur, hashtags, etc.)
   */
  async analyzeContent(content: {
    title: string
    content: string
    hashtags?: string
    platforms: string[]
  }): Promise<ApiResponse<{
    analysis: {
      titleLength: number
      contentLength: number
      hashtagCount: number
      readabilityScore: number
      platformCompatibility: Record<string, {
        compatible: boolean
        warnings: string[]
        suggestions: string[]
      }>
      seoScore?: number
      suggestions: string[]
    }
  }>> {
    const response = await apiService.axiosInstance.post<ApiResponse<any>>('/publications/analyze', content)
    return response.data
  }

  /**
   * Récupère les suggestions de hashtags
   */
  async getHashtagSuggestions(content: string, category?: string): Promise<ApiResponse<{
    suggestions: Array<{
      hashtag: string
      popularity: number
      relevance: number
      category: string
    }>
  }>> {
    const response = await apiService.axiosInstance.post<ApiResponse<any>>('/publications/hashtag-suggestions', {
      content,
      category
    })
    return response.data
  }

  /**
   * Optimise automatiquement le contenu pour les plateformes sélectionnées
   */
  async optimizeForPlatforms(content: {
    title: string
    content: string
    platforms: string[]
  }): Promise<ApiResponse<{
    optimized: Record<string, {
      title: string
      content: string
      hashtags: string[]
      recommendations: string[]
    }>
  }>> {
    const response = await apiService.axiosInstance.post<ApiResponse<any>>('/publications/optimize', content)
    return response.data
  }

  /**
   * Récupère les statistiques de performance d'une publication
   */
  async getPublicationPerformance(id: string): Promise<ApiResponse<{
    views: number
    likes: number
    shares: number
    comments: number
    clickThroughRate: number
    engagement: number
    platformStats: Record<string, {
      views: number
      likes: number
      shares: number
      comments: number
    }>
    demographics?: {
      age: Record<string, number>
      gender: Record<string, number>
      location: Record<string, number>
    }
  }>> {
    const response = await apiService.axiosInstance.get<ApiResponse<any>>(`/publications/${id}/performance`)
    return response.data
  }

  /**
   * Recherche de publications avec recherche full-text
   */
  async searchPublications(query: string, filters?: Omit<PublicationFilters, 'search'>): Promise<ApiResponse<PublicationsListResponse>> {
    const response = await apiService.axiosInstance.get<ApiResponse<PublicationsListResponse>>('/publications/search', {
      params: { query, ...filters }
    })
    return response.data
  }

  /**
   * Exporte les publications (CSV, Excel)
   */
  async exportPublications(format: 'csv' | 'excel', filters?: PublicationFilters): Promise<ApiResponse<{
    downloadUrl: string
    filename: string
  }>> {
    const response = await apiService.axiosInstance.post<ApiResponse<any>>('/publications/export', {
      format,
      filters
    })
    return response.data
  }

  /**
   * Importe des publications depuis un fichier
   */
  async importPublications(file: File, options?: {
    updateExisting?: boolean
    dryRun?: boolean
  }): Promise<ApiResponse<{
    imported: number
    updated: number
    errors: Array<{
      row: number
      error: string
    }>
    preview?: Publication[]
  }>> {
    const formData = new FormData()
    formData.append('file', file)
    if (options) {
      formData.append('options', JSON.stringify(options))
    }

    const response = await apiService.axiosInstance.post<ApiResponse<any>>('/publications/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Génère du contenu de publication avec l'IA
   */
  async generateContent(config: {
    topic: string
    contentType: string
    targetAudience: string
    tone: string
    platforms: string[]
    keywords?: string
    callToAction?: string
    length: string
    generateImage?: boolean
  }): Promise<ApiResponse<{
    title: string
    content: string
    hashtags: string
    image?: string
    suggestedKeywords?: string
    metadata?: {
      confidence: number
      suggestions: string[]
      imageGenerated?: boolean
    }
  }>> {
    const response = await apiService.axiosInstance.post<ApiResponse<any>>('/publications/generate-content', config)
    return response.data
  }
}

// Instance singleton
export const publicationsService = new PublicationsService()
export default publicationsService
