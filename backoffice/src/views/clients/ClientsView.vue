<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Clients</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez vos clients et leurs informations
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <router-link
          to="/clients/create"
          class="btn-primary inline-flex items-center"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouveau client
        </router-link>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="form-label">Rechercher</label>
          <input
            v-model="searchQuery"
            type="text"
            class="form-input"
            placeholder="Nom, email, entreprise..."
          />
        </div>
        <div>
          <label class="form-label">Statut</label>
          <select v-model="statusFilter" class="form-input">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
        <div>
          <label class="form-label">Type</label>
          <select v-model="typeFilter" class="form-input">
            <option value="">Tous les types</option>
            <option value="individual">Particulier</option>
            <option value="company">Entreprise</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tableau des clients -->
    <div class="card p-0 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="table-header">Client</th>
              <th class="table-header">Contact</th>
              <th class="table-header">Type</th>
              <th class="table-header">Statut</th>
              <th class="table-header">Créé le</th>
              <th class="table-header">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="table-cell text-center py-8">
                <div class="flex justify-center">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="error">
              <td colspan="6" class="table-cell text-center py-8">
                <div class="text-red-600 dark:text-red-400">
                  {{ error }}
                </div>
              </td>
            </tr>
            <tr v-else-if="!clients || clients.length === 0">
              <td colspan="6" class="table-cell text-center py-8">
                <div class="text-gray-500 dark:text-gray-400">
                  {{ hasFilters ? 'Aucun client ne correspond à vos critères' : 'Aucun client trouvé' }}
                </div>
              </td>
            </tr>
            <tr v-else v-for="client in (clients || [])" :key="client.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="table-cell">
                <div class="flex items-center">
                  <img 
                    :src="client.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(client.name) + '&background=6366f1&color=fff'" 
                    :alt="client.name"
                    class="h-10 w-10 rounded-full object-cover"
                  />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ client.name }}
                    </div>
                    <div v-if="client.company" class="text-sm text-gray-500 dark:text-gray-400">
                      {{ client.company }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="table-cell">
                <div class="text-sm text-gray-900 dark:text-gray-100">{{ client.email }}</div>
                <div v-if="client.phone" class="text-sm text-gray-500 dark:text-gray-400">{{ client.phone }}</div>
              </td>
              <td class="table-cell">
                <span class="badge badge-info">
                  {{ client.type === 'individual' ? 'Particulier' : 'Entreprise' }}
                </span>
              </td>
              <td class="table-cell">
                <span 
                  :class="[
                    'badge',
                    client.status === 'active' ? 'badge-success' : 
                    client.status === 'inactive' ? 'badge-warning' :
                    'badge-info'
                  ]"
                >
                  {{ getStatusLabel(client.status) }}
                </span>
              </td>
              <td class="table-cell text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(client.createdAt) }}
              </td>
              <td class="table-cell">
                <div class="flex space-x-2">
                  <router-link
                    :to="`/clients/${client.id}`"
                    class="text-primary-600 hover:text-primary-900 text-sm"
                  >
                    Voir
                  </router-link>
                  <button 
                    @click="confirmDelete(client)"
                    class="text-danger-600 hover:text-danger-900 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.total > pagination.limit" class="bg-white dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Affichage de <span class="font-medium">{{ ((pagination.page - 1) * pagination.limit) + 1 }}</span> 
          à <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
          sur <span class="font-medium">{{ pagination.total }}</span> résultats
        </div>
        <div class="flex space-x-2">
          <button 
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="btn-secondary text-sm py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button 
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="btn-secondary text-sm py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mt-2">Supprimer le client</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer {{ clientToDelete?.name }} ? Cette action est irréversible.
            </p>
          </div>
          <div class="flex justify-center space-x-3 mt-4">
            <button 
              @click="showDeleteModal = false"
              class="btn-secondary text-sm py-2 px-4"
            >
              Annuler
            </button>
            <button 
              @click="deleteClient"
              :disabled="deleting"
              class="btn-danger text-sm py-2 px-4"
            >
              {{ deleting ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { clientsService, type Client } from '@/services/clients'
import { useAuthStore } from '@/stores/auth'

// Stores
const authStore = useAuthStore()

// État
const loading = ref(false)
const deleting = ref(false)
const error = ref('')
const clients = ref<Client[]>([])
const showDeleteModal = ref(false)
const clientToDelete = ref<Client | null>(null)

const searchQuery = ref('')
const statusFilter = ref('')
const typeFilter = ref('')

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// Computed
const hasFilters = computed(() => {
  return searchQuery.value || statusFilter.value || typeFilter.value
})

// Fonctions debounce simple
let searchTimeout: NodeJS.Timeout
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.page = 1
    loadClients()
  }, 500)
}

// Méthodes
const loadClients = async () => {
  try {
    loading.value = true
    error.value = ''
    
    // Vérifier l'authentification
    if (!authStore.isAuthenticated) {
      error.value = 'Vous devez être connecté pour accéder aux clients'
      clients.value = []
      return
    }
    
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: searchQuery.value || undefined,
      status: statusFilter.value || undefined,
      type: typeFilter.value || undefined,
      sortBy: 'created_at',
      sortOrder: 'desc' as const
    }

    const response = await clientsService.getClients(params)
    
    if (response.success && response.data) {
      clients.value = response.data.clients || []
      pagination.total = response.data.total || 0
      pagination.totalPages = response.data.totalPages || 0
    } else {
      clients.value = []
      pagination.total = 0
      pagination.totalPages = 0
    }
  } catch (err) {
    console.error('Erreur lors du chargement des clients:', err)
    error.value = 'Erreur lors du chargement des clients'
    clients.value = []
    pagination.total = 0
    pagination.totalPages = 0
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  pagination.page = page
  loadClients()
}

const applyFilters = () => {
  pagination.page = 1
  loadClients()
}

const confirmDelete = (client: Client) => {
  clientToDelete.value = client
  showDeleteModal.value = true
}

const deleteClient = async () => {
  if (!clientToDelete.value) return

  try {
    deleting.value = true
    const response = await clientsService.deleteClient(clientToDelete.value.id)
    
    if (response.success) {
      showDeleteModal.value = false
      clientToDelete.value = null
      loadClients() // Recharger la liste
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  } finally {
    deleting.value = false
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Actif'
    case 'inactive': return 'Inactif'
    case 'prospect': return 'Prospect'
    default: return status
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

// Watchers
watch(searchQuery, debouncedSearch)
watch([statusFilter, typeFilter], applyFilters)

// Lifecycle
onMounted(() => {
  loadClients()
})
</script>


