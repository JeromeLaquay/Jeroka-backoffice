import { apiService } from './api'

export interface Person {
  id: string
  type: string
  typeClient: 'individual' | 'company'
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phone?: string
  mobile?: string
  website?: string
  city?: string
  postalCode?: string
  country?: string
  status: 'active' | 'inactive' | 'prospect'
  createdAt: string
  updatedAt: string
}

export interface CreatePersonRequest {
  /** CRM : client (défaut) ou supplier */
  type?: 'client' | 'supplier'
  typeClient?: 'individual' | 'company'
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phone?: string
  mobile?: string
  website?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postalCode?: string
  country?: string
  siret?: string
  vatNumber?: string
  notes?: string
  status?: 'active' | 'inactive' | 'prospect'
  source?: string
}

export interface UpdatePersonRequest extends Partial<CreatePersonRequest> {}

export interface PersonsListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  /** @deprecated Préférer personType (client|supplier) et typeClient (individual|company). */
  type?: string
  personType?: 'client' | 'supplier'
  typeClient?: 'individual' | 'company'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PersonStats {
  total: number
  active: number
  companies: number
  inactive?: number
  prospect?: number
}

export interface PersonStatsParams {
  personType?: 'client' | 'supplier'
}

class PersonsService {
  /**
   * Récupérer la liste des Persons avec filtres et pagination
   */
  async getPersons(params: PersonsListParams = {}) {
    const response = await apiService.axiosInstance.get('/persons', { params })
    return response.data
  }

  /**
   * Récupérer un Person par son ID
   */
  async getPerson(id: string) {
    const response = await apiService.axiosInstance.get(`/persons/${id}`)
    return response.data
  }

  /**
   * Créer un nouveau Person
   */
  async createPerson(data: CreatePersonRequest) {
    const response = await apiService.axiosInstance.post('/persons', data)
    return response.data
  }

  /**
   * Mettre à jour un Person
   */
  async updatePerson(id: string, data: UpdatePersonRequest) {
    const response = await apiService.axiosInstance.put(`/persons/${id}`, data)
    return response.data
  }

  /**
   * Supprimer un Person.
   * L'API renvoie 204 No Content (sans corps) ; responseType: 'text' évite une erreur de parsing JSON.
   */
  async deletePerson(id: string) {
    const response = await apiService.axiosInstance.delete(`/persons/${id}`, {
      responseType: 'text'
    })
    return response.data
  }

  /**
   * Récupérer les statistiques des Persons (optionnellement filtrées par rôle CRM).
   */
  async getPersonStats(params: PersonStatsParams = {}) {
    const response = await apiService.axiosInstance.get('/persons/stats', { params })
    return response.data
  }

  /**
   * Rechercher des Persons par terme
   */
  async searchPersons(searchTerm: string, limit: number = 10) {
    const response = await apiService.axiosInstance.get('/persons', {
      params: {
        search: searchTerm,
        limit,
        page: 1
      }
    })
    return response.data
  }

  /**
   * Obtenir les Persons récents
   */
  async getRecentPersons(limit: number = 5) {
    const response = await apiService.axiosInstance.get('/persons', {
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
   * Obtenir les Persons actifs
   */
  async getActivePersons(params: PersonsListParams = {}) {
    const response = await apiService.axiosInstance.get('/persons', {
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
  async getProspects(params: PersonsListParams = {}) {
    const response = await apiService.axiosInstance.get('/persons', {
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
  async getCompanies(params: PersonsListParams = {}) {
    const response = await apiService.axiosInstance.get('/persons', {
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
  async getIndividuals(params: PersonsListParams = {}) {
    const response = await apiService.axiosInstance.get('/persons', {
      params: {
        ...params,
        type: 'individual'
      }
    })
    return response.data
  }

  /**
   * Exporter les Persons en CSV/Excel
   */
  async exportPersons(params: PersonsListParams & { format: 'csv' | 'excel' }) {
    const response = await apiService.axiosInstance.get('/persons/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Importer des Persons depuis un fichier CSV/Excel
   */
  async importPersons(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiService.axiosInstance.post('/persons/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Uploader l'avatar d'un Person
   */
  async uploadPersonAvatar(personId: string, file: File) {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const response = await apiService.axiosInstance.post(`/persons/${personId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Supprimer l'avatar d'un Person
   */
  async deletePersonAvatar(personId: string) {
    const response = await apiService.axiosInstance.delete(`/persons/${personId}/avatar`)
    return response.data
  }

  /**
   * Obtenir l'historique d'un Person (commandes, factures, etc.)
   */
  async getPersonHistory(personId: string, params?: { type?: string; limit?: number }) {
    const response = await apiService.axiosInstance.get(`/persons/${personId}/history`, { params })
    return response.data
  }

  /**
   * Obtenir les métriques d'un Person
   */
  async getPersonMetrics(personId: string) {
    const response = await apiService.axiosInstance.get(`/Persons/${personId}/metrics`)
    return response.data
  }

  /**
   * Marquer un Person comme favori
   */
  async togglePersonFavorite(personId: string, favorite: boolean) {
    const response = await apiService.axiosInstance.patch(`/persons/${personId}/favorite`, { favorite })
    return response.data
  }

  /**
   * Ajouter une note à un Person
   */
  async addPersonNote(personId: string, note: string) {
    const response = await apiService.axiosInstance.post(`/persons/${personId}/notes`, { note })
    return response.data
  }

  /**
   * Obtenir les notes d'un Person
   */
  async getPersonNotes(PersonId: string) {
    const response = await apiService.axiosInstance.get(`/persons/${PersonId}/notes`)
    return response.data
  }

  /**
   * Fusionner deux Persons
   */
  async mergePersons(primaryPersonId: string, secondaryPersonId: string) {
    const response = await apiService.axiosInstance.post(`/persons/${primaryPersonId}/merge`, {
      secondaryPersonId
    })
    return response.data
  }

  /**
   * Valider un email Person
   */
  async validatePersonEmail(email: string, excludePersonId?: string) {
    const response = await apiService.axiosInstance.post('/persons/validate-email', {
      email,
      excludePersonId
    })
    return response.data
  }

  /**
   * Obtenir les Persons similaires (doublons potentiels)
   */
  async getSimilarPersons(personData: Partial<CreatePersonRequest>) {
    const response = await apiService.axiosInstance.post('/persons/find-similar', personData)
    return response.data
  }
}

export const personsService = new PersonsService()
export default PersonsService
