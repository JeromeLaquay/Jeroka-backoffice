<template>
  <div class="space-y-6" data-cy="clients-page">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Clients</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez votre base de données clients et prospects
        </p>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="refreshClients"
          class="btn-secondary inline-flex items-center"
        >
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Actualiser
        </button>
        
        <button
          @click="createClient"
          data-cy="create-client-button"
          class="btn-primary inline-flex items-center"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouveau Client
        </button>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-4">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Clients
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats.total }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-6 w-6 text-success-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Clients Actifs
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats.active }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UserPlusIcon class="h-6 w-6 text-warning-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Prospects
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats.prospects }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BuildingOfficeIcon class="h-6 w-6 text-secondary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Entreprises
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats.companies }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Recherche -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recherche
          </label>
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              v-model="filters.search"
              type="text"
              placeholder="Nom, email, entreprise..."
              data-cy="client-search-input"
              class="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              @input="debouncedSearch"
            />
          </div>
        </div>
        
        <!-- Statut -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Statut
          </label>
          <select 
            v-model="filters.status" 
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="prospect">Prospect</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
        
        <!-- Type -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select 
            v-model="filters.type" 
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Tous les types</option>
            <option value="individual">Particulier</option>
            <option value="company">Entreprise</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tableau des clients -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="table-header">
                Client
              </th>
              <th class="table-header">
                Type
              </th>
              <th class="table-header">
                Contact
              </th>
              <th class="table-header">
                Statut
              </th>
              <th class="table-header">
                Créé le
              </th>
              <th class="table-header text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="client in clients" :key="client.id" class="table-row">
              <td class="table-cell">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {{ getInitials(client.first_name, client.last_name) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ client.first_name }} {{ client.last_name }}
                    </div>
                    <div v-if="client.company_name" class="text-sm text-gray-500 dark:text-gray-400">
                      {{ client.company_name }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="table-cell">
                <span class="badge" :class="client.type === 'company' ? 'badge-primary' : 'badge-success'">
                  {{ client.type === 'company' ? 'Entreprise' : 'Particulier' }}
                </span>
              </td>
              <td class="table-cell">
                <div class="text-sm text-gray-900 dark:text-gray-100">{{ client.email }}</div>
                <div v-if="client.phone" class="text-sm text-gray-500 dark:text-gray-400">{{ client.phone }}</div>
              </td>
              <td class="table-cell">
                <span class="badge" :class="getStatusClass(client.status)">
                  {{ getStatusLabel(client.status) }}
                </span>
              </td>
              <td class="table-cell text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(client.created_at) }}
              </td>
              <td class="table-cell text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button
                    @click="viewClient(client.id)"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Voir
                  </button>
                  <button
                    @click="editClient(client.id)"
                    class="text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-300"
                  >
                    Modifier
                  </button>
                  <button
                    @click="deleteClient(client.id)"
                    class="text-danger-600 hover:text-danger-900 dark:text-danger-400 dark:hover:text-danger-300"
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
      <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="previousPage"
            :disabled="pagination.page === 1"
            class="btn-secondary disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page === pagination.totalPages"
            class="btn-secondary disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
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
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
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
                    ? 'z-10 bg-primary-50 dark:bg-primary-900 border-primary-500 text-primary-600 dark:text-primary-300'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="nextPage"
                :disabled="pagination.page === pagination.totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-100 dark:bg-danger-900">
            <ExclamationTriangleIcon class="h-6 w-6 text-danger-600 dark:text-danger-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4">Confirmer la suppression</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
            </p>
          </div>
          <div class="items-center px-4 py-3">
            <button
              @click="confirmDelete"
              class="btn-danger w-full mb-3"
            >
              Supprimer
            </button>
            <button
              @click="cancelDelete"
              class="btn-secondary w-full"
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
      return 'badge-success'
    case 'prospect':
      return 'badge-warning'
    case 'inactive':
      return 'badge-danger'
    default:
      return 'badge-secondary'
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
