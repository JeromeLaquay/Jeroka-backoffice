import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiService } from '../services/api'

export interface Client {
  id: string
  company_id: string
  type: 'individual' | 'company'
  first_name: string
  last_name: string
  company_name?: string
  email: string
  phone?: string
  mobile?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  country?: string
  siret?: string
  vat_number?: string
  website?: string
  notes?: string
  avatar_url?: string
  status: 'active' | 'inactive' | 'prospect'
  source?: string
  tags?: string[]
  custom_fields?: any
  created_at: string
  updated_at: string
}

export interface ClientFilters {
  search?: string
  status?: 'active' | 'inactive' | 'prospect'
  type?: 'individual' | 'company'
  source?: string
  tags?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface ClientStats {
  total: number
  active: number
  prospects: number
  inactive: number
  companies: number
  individuals: number
  sources: Record<string, number>
  recentActivity: Array<{ date: string; count: number }>
}

export const useClientStore = defineStore('client', () => {
  const clients = ref<Client[]>([])
  const currentClient = ref<Client | null>(null)
  const stats = ref<ClientStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const getClients = async (filters: ClientFilters = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.getClients(filters)
      
      if (response.success && response.data) {
        clients.value = response.data
        return response
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération des clients')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getClientById = async (clientId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.getClients({ id: clientId })
      
      if (response.success && response.data && response.data.length > 0) {
        currentClient.value = response.data[0]
        return response
      } else {
        throw new Error('Client non trouvé')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createClient = async (clientData: Partial<Client>) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.createClient(clientData)
      
      if (response.success) {
        clients.value.unshift(response.data)
        return response
      } else {
        throw new Error(response.message || 'Erreur lors de la création du client')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateClient = async (clientId: string, clientData: Partial<Client>) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.updateClient(clientId, clientData)
      
      if (response.success) {
        const index = clients.value.findIndex(c => c.id === clientId)
        if (index !== -1) {
          clients.value[index] = response.data
        }
        if (currentClient.value?.id === clientId) {
          currentClient.value = response.data
        }
        return response
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour du client')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteClient = async (clientId: string) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.deleteClient(clientId)
      
      if (response.success) {
        clients.value = clients.value.filter(c => c.id !== clientId)
        if (currentClient.value?.id === clientId) {
          currentClient.value = null
        }
        return response
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression du client')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getClientStats = async () => {
    try {
      loading.value = true
      error.value = null
      
      // Pour l'instant, on simule les stats en attendant l'implémentation de l'API
      const response = await apiService.getClients({ limit: 1000 })
      
      if (response.success && response.data) {
        const allClients = response.data
        const statsData: ClientStats = {
          total: allClients.length,
          active: allClients.filter(c => c.status === 'active').length,
          prospects: allClients.filter(c => c.status === 'prospect').length,
          inactive: allClients.filter(c => c.status === 'inactive').length,
          companies: allClients.filter(c => c.type === 'company').length,
          individuals: allClients.filter(c => c.type === 'individual').length,
          sources: allClients.reduce((acc, client) => {
            const source = client.source || 'unknown'
            acc[source] = (acc[source] || 0) + 1
            return acc
          }, {} as Record<string, number>),
          recentActivity: []
        }
        
        stats.value = statsData
        return { success: true, data: statsData }
      } else {
        throw new Error('Erreur lors de la récupération des statistiques')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentClient = () => {
    currentClient.value = null
  }

  return {
    // State
    clients,
    currentClient,
    stats,
    loading,
    error,
    
    // Actions
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    getClientStats,
    clearError,
    clearCurrentClient
  }
})
