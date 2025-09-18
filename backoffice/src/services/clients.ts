import { apiService } from './api'

export interface Client {
  id: string
  type: 'client' | 'supplier'
  type_label: 'Particulier' | 'Entreprise'
  first_name: string
  last_name: string
  company_name?: string
  name: string // Nom complet formaté
  company?: string
  email: string
  phone?: string
  mobile?: string
  website?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  country?: string
  siret?: string
  vat_number?: string
  notes?: string
  avatar_url?: string
  status: 'active' | 'inactive' | 'prospect'
  source?: string
  tags?: string[]
  created_at: string
  updated_at: string
  company_id: string
  custom_fields?: Record<string, any>
}

export interface CreateClientRequest {
  type: 'client' | 'supplier'
  type_label: 'Particulier' | 'Entreprise'
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phone?: string
  mobile?: string
  website?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    postalCode?: string
    country?: string
  }
  siret?: string
  vatNumber?: string
  notes?: string
  status?: 'active' | 'inactive' | 'prospect'
  source?: string
  tags?: string[]
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

export interface ClientsListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  type?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ClientStats {
  total: number
  active: number
  inactive: number
  prospects: number
  companies: number
  individuals: number
}

class ClientsService {
  /**
   * Récupérer la liste des clients avec filtres et pagination
   */
  async getClients(params: ClientsListParams = {}) {
    const response = await apiService.axiosInstance.get('/clients', { params })
    return response.data
  }

  /**
   * Récupérer un client par son ID
   */
  async getClient(id: string) {
    const response = await apiService.axiosInstance.get(`/clients/${id}`)
    return response.data
  }

  /**
   * Créer un nouveau client
   */
  async createClient(data: CreateClientRequest) {
    const response = await apiService.axiosInstance.post('/clients', data)
    return response.data
  }

  /**
   * Mettre à jour un client
   */
  async updateClient(id: string, data: UpdateClientRequest) {
    const response = await apiService.axiosInstance.put(`/clients/${id}`, data)
    return response.data
  }

  /**
   * Supprimer un client
   */
  async deleteClient(id: string) {
    const response = await apiService.axiosInstance.delete(`/clients/${id}`)
    return response.data
  }

  /**
   * Récupérer les statistiques des clients
   */
  async getClientStats() {
    const response = await apiService.axiosInstance.get('/clients/stats')
    return response.data
  }

  /**
   * Rechercher des clients par terme
   */
  async searchClients(searchTerm: string, limit: number = 10) {
    const response = await apiService.axiosInstance.get('/clients', {
      params: {
        search: searchTerm,
        limit,
        page: 1
      }
    })
    return response.data
  }

  /**
   * Obtenir les clients récents
   */
  async getRecentClients(limit: number = 5) {
    const response = await apiService.axiosInstance.get('/clients', {
      params: {
        limit,
        page: 1,
        sortBy: 'created_at',
        sortOrder: 'desc'
      }
    })
    return response.data
  }

  /**
   * Obtenir les clients actifs
   */
  async getActiveClients(params: ClientsListParams = {}) {
    const response = await apiService.axiosInstance.get('/clients', {
      params: {
        ...params,
        status: 'active'
      }
    })
    return response.data
  }

  /**
   * Obtenir les prospects
   */
  async getProspects(params: ClientsListParams = {}) {
    const response = await apiService.axiosInstance.get('/clients', {
      params: {
        ...params,
        status: 'prospect'
      }
    })
    return response.data
  }

  /**
   * Obtenir les entreprises
   */
  async getCompanies(params: ClientsListParams = {}) {
    const response = await apiService.axiosInstance.get('/clients', {
      params: {
        ...params,
        type: 'company'
      }
    })
    return response.data
  }

  /**
   * Obtenir les particuliers
   */
  async getIndividuals(params: ClientsListParams = {}) {
    const response = await apiService.axiosInstance.get('/clients', {
      params: {
        ...params,
        type: 'individual'
      }
    })
    return response.data
  }

  /**
   * Exporter les clients en CSV/Excel
   */
  async exportClients(params: ClientsListParams & { format: 'csv' | 'excel' }) {
    const response = await apiService.axiosInstance.get('/clients/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Importer des clients depuis un fichier CSV/Excel
   */
  async importClients(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiService.axiosInstance.post('/clients/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Uploader l'avatar d'un client
   */
  async uploadClientAvatar(clientId: string, file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await apiService.axiosInstance.post(`/clients/${clientId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Supprimer l'avatar d'un client
   */
  async deleteClientAvatar(clientId: string) {
    const response = await apiService.axiosInstance.delete(`/clients/${clientId}/avatar`)
    return response.data
  }

  /**
   * Obtenir l'historique d'un client (commandes, factures, etc.)
   */
  async getClientHistory(clientId: string, params?: { type?: string; limit?: number }) {
    const response = await apiService.axiosInstance.get(`/clients/${clientId}/history`, { params })
    return response.data
  }

  /**
   * Obtenir les métriques d'un client
   */
  async getClientMetrics(clientId: string) {
    const response = await apiService.axiosInstance.get(`/clients/${clientId}/metrics`)
    return response.data
  }

  /**
   * Marquer un client comme favori
   */
  async toggleClientFavorite(clientId: string, favorite: boolean) {
    const response = await apiService.axiosInstance.patch(`/clients/${clientId}/favorite`, { favorite })
    return response.data
  }

  /**
   * Ajouter une note à un client
   */
  async addClientNote(clientId: string, note: string) {
    const response = await apiService.axiosInstance.post(`/clients/${clientId}/notes`, { note })
    return response.data
  }

  /**
   * Obtenir les notes d'un client
   */
  async getClientNotes(clientId: string) {
    const response = await apiService.axiosInstance.get(`/clients/${clientId}/notes`)
    return response.data
  }

  /**
   * Fusionner deux clients
   */
  async mergeClients(primaryClientId: string, secondaryClientId: string) {
    const response = await apiService.axiosInstance.post(`/clients/${primaryClientId}/merge`, {
      secondaryClientId
    })
    return response.data
  }

  /**
   * Valider un email client
   */
  async validateClientEmail(email: string, excludeClientId?: string) {
    const response = await apiService.axiosInstance.post('/clients/validate-email', {
      email,
      excludeClientId
    })
    return response.data
  }

  /**
   * Obtenir les clients similaires (doublons potentiels)
   */
  async getSimilarClients(clientData: Partial<CreateClientRequest>) {
    const response = await apiService.axiosInstance.post('/clients/find-similar', clientData)
    return response.data
  }
}

export const clientsService = new ClientsService()
export default clientsService
