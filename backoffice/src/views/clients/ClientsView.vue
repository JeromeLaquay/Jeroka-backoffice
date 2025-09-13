<template>
  <div class="clients-view">
    <!-- En-tête avec statistiques -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Gestion des Clients</h1>
      
      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <UsersIcon class="h-6 w-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Clients</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon class="h-6 w-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Clients Actifs</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.active }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <UserPlusIcon class="h-6 w-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Prospects</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.prospects }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-4 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <BuildingOfficeIcon class="h-6 w-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Entreprises</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.companies }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres et actions -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <!-- Filtres -->
        <div class="flex flex-wrap gap-4 items-center">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Rechercher un client..."
              class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="debouncedSearch"
            />
          </div>
          
          <select v-model="filters.status" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="prospect">Prospect</option>
            <option value="inactive">Inactif</option>
          </select>
          
          <select v-model="filters.type" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Tous les types</option>
            <option value="individual">Particulier</option>
            <option value="company">Entreprise</option>
          </select>
        </div>
        
        <!-- Actions -->
        <div class="flex gap-2">
          <button
            @click="refreshClients"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowPathIcon class="h-4 w-4 inline mr-2" />
            Actualiser
          </button>
          <button
            @click="createClient"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon class="h-4 w-4 inline mr-2" />
            Nouveau Client
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des clients -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Créé le
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="client in clients" :key="client.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700">
                        {{ getInitials(client.first_name, client.last_name) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ client.first_name }} {{ client.last_name }}
                    </div>
                    <div v-if="client.company_name" class="text-sm text-gray-500">
                      {{ client.company_name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="client.type === 'company' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                  {{ client.type === 'company' ? 'Entreprise' : 'Particulier' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ client.email }}</div>
                <div v-if="client.phone" class="text-sm text-gray-500">{{ client.phone }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(client.status)">
                  {{ getStatusLabel(client.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(client.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button
                    @click="viewClient(client.id)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    Voir
                  </button>
                  <button
                    @click="editClient(client.id)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    Modifier
                  </button>
                  <button
                    @click="deleteClient(client.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="previousPage"
            :disabled="pagination.page === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page === pagination.totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Affichage de
              <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
              à
              <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
              sur
              <span class="font-medium">{{ pagination.total }}</span>
              résultats
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                @click="previousPage"
                :disabled="pagination.page === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === pagination.page
                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="nextPage"
                :disabled="pagination.page === pagination.totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Confirmer la suppression</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="confirmDelete"
              class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 mr-2"
            >
              Supprimer
            </button>
            <button
              @click="cancelDelete"
              class="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  UsersIcon, CheckCircleIcon, UserPlusIcon, BuildingOfficeIcon, 
  MagnifyingGlassIcon, ArrowPathIcon, PlusIcon, ExclamationTriangleIcon 
} from '@heroicons/vue/24/outline'
import { useClientStore } from '../../stores/clientStore'

const router = useRouter()
const clientStore = useClientStore()

// État réactif
const clients = ref<any[]>([])
const stats = ref({
  total: 0,
  active: 0,
  prospects: 0,
  inactive: 0,
  companies: 0,
  individuals: 0
})
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})
const filters = ref({
  search: '',
  status: '' as 'active' | 'inactive' | 'prospect' | '',
  type: '' as 'individual' | 'company' | '',
  source: '',
  tags: [] as string[]
})

// État pour la suppression
const showDeleteModal = ref(false)
const clientToDelete = ref<string | null>(null)

// Computed
const visiblePages = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.totalPages
  const pages = []
  
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }
  return pages
})

// Méthodes
const loadClients = async () => {
  try {
    // Filtrer les valeurs vides
    const cleanFilters = Object.fromEntries(
      Object.entries(filters.value).filter(([_, value]) => 
        value !== '' && value !== null && value !== undefined && 
        (Array.isArray(value) ? value.length > 0 : true)
      )
    )
    
    const response = await clientStore.getClients({
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...cleanFilters
    })
    
    if (response.success && response.data) {
      clients.value = response.data
      // Pour l'instant, on simule la pagination
      pagination.value = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        total: response.data.length,
        totalPages: Math.ceil(response.data.length / pagination.value.limit)
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des clients:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await clientStore.getClientStats()
    
    if (response.success && response.data) {
      stats.value = response.data
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}

const refreshClients = () => {
  loadClients()
  loadStats()
}

const createClient = () => {
  router.push('/clients/create')
}

const viewClient = (clientId: string) => {
  router.push(`/clients/${clientId}`)
}

const editClient = (clientId: string) => {
  router.push(`/clients/${clientId}/edit`)
}

const deleteClient = (clientId: string) => {
  clientToDelete.value = clientId
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!clientToDelete.value) return
  
  try {
    const response = await clientStore.deleteClient(clientToDelete.value)
    
    if (response.success) {
      showDeleteModal.value = false
      clientToDelete.value = null
      refreshClients()
    }
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  clientToDelete.value = null
}

// Pagination
const previousPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
    loadClients()
  }
}

const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++
    loadClients()
  }
}

const goToPage = (page: number) => {
  pagination.value.page = page
  loadClients()
}

// Filtres
const debouncedSearch = debounce(() => {
  pagination.value.page = 1
  loadClients()
}, 300)

// Utilitaires
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'prospect':
      return 'bg-yellow-100 text-yellow-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'prospect':
      return 'Prospect'
    case 'inactive':
      return 'Inactif'
    default:
      return status
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR')
}

// Fonction de debounce
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Watchers
watch(() => filters.value.status, () => {
  pagination.value.page = 1
  loadClients()
})

watch(() => filters.value.type, () => {
  pagination.value.page = 1
  loadClients()
})

// Lifecycle
onMounted(() => {
  loadClients()
  loadStats()
})
</script>

<style scoped>
.clients-view {
  padding: 1.5rem;
}
</style>