<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Factures</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez toutes vos factures clients
        </p>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="refreshInvoices"
          :disabled="loading"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <ArrowPathIcon :class="['h-4 w-4 mr-2', { 'animate-spin': loading }]" />
          Actualiser
        </button>
        
        <router-link
          to="/factures/create"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouvelle facture
        </router-link>
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
              placeholder="Numéro de facture, client..."
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
            @change="applyFilters"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyée</option>
            <option value="paid">Payée</option>
            <option value="overdue">En retard</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>

        <!-- Période -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Période
          </label>
          <select
            v-model="filters.period"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            @change="applyFilters"
          >
            <option value="">Toute période</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <DocumentTextIcon class="h-8 w-8 text-blue-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total factures</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CheckCircleIcon class="h-8 w-8 text-green-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Payées</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ stats.paid }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-8 w-8 text-red-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">En retard</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ stats.overdue }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CurrencyEuroIcon class="h-8 w-8 text-primary-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">CA facturé</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(stats.totalAmount) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Liste des factures -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-4 py-5 sm:p-6">
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <div v-else-if="invoices.length === 0" class="text-center py-8">
          <DocumentTextIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucune facture</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ hasFilters ? 'Aucune facture ne correspond à vos critères' : 'Commencez par créer votre première facture' }}
          </p>
          <div v-if="!hasFilters" class="mt-6">
            <router-link
              to="/factures/create"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Nouvelle facture
            </router-link>
          </div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Facture
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Échéance
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Statut
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Montant
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex flex-col">
                    <router-link
                      :to="`/factures/${invoice.id}`"
                      class="text-sm font-medium text-primary-600 hover:text-primary-500"
                    >
                      {{ invoice.invoiceNumber }}
                    </router-link>
                    <div v-if="invoice.order" class="text-xs text-gray-500 dark:text-gray-400">
                      Commande: {{ invoice.order.orderNumber }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 flex-shrink-0">
                      <img
                        :src="invoice.client.avatar"
                        :alt="invoice.client.name"
                        class="h-8 w-8 rounded-full"
                      />
                    </div>
                    <div class="ml-3">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {{ invoice.client.name }}
                      </div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">
                        {{ invoice.client.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {{ formatDate(invoice.issueDate) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ formatDate(invoice.dueDate) }}
                  </div>
                  <div v-if="isOverdue(invoice)" class="text-xs text-red-600">
                    {{ getDaysOverdue(invoice) }} jours de retard
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <InvoiceStatusBadge :status="invoice.status" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ formatCurrency(invoice.totalAmount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end space-x-2">
                    <router-link
                      :to="`/factures/${invoice.id}`"
                      class="text-primary-600 hover:text-primary-500"
                      title="Voir détails"
                    >
                      <EyeIcon class="h-4 w-4" />
                    </router-link>
                    <button
                      @click="downloadPdf(invoice.id)"
                      class="text-gray-600 hover:text-gray-500"
                      title="Télécharger PDF"
                    >
                      <ArrowDownTrayIcon class="h-4 w-4" />
                    </button>
                    <button
                      @click="sendInvoice(invoice.id)"
                      class="text-blue-600 hover:text-blue-500"
                      title="Envoyer par email"
                    >
                      <EnvelopeIcon class="h-4 w-4" />
                    </button>
                    <router-link
                      :to="`/factures/${invoice.id}/edit`"
                      class="text-yellow-600 hover:text-yellow-500"
                      title="Modifier"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </router-link>
                    <button
                      @click="showDeleteModal(invoice)"
                      class="text-red-600 hover:text-red-500"
                      title="Supprimer"
                    >
                      <TrashIcon class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="invoices.length > 0" class="mt-6 flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {{ ((pagination.page - 1) * pagination.limit) + 1 }} à 
            {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
            sur {{ pagination.total }} factures
          </div>
          
          <div class="flex space-x-2">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-md"
            >
              <ChevronLeftIcon class="h-4 w-4" />
            </button>
            
            <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ pagination.page }} / {{ Math.ceil(pagination.total / pagination.limit) }}
            </span>
            
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= Math.ceil(pagination.total / pagination.limit)"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-md"
            >
              <ChevronRightIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de suppression -->
  <DeleteConfirmModal
    :show="showDeleteConfirmation"
    :title="`Supprimer la facture ${invoiceToDelete?.invoiceNumber}`"
    :message="`Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.`"
    @confirm="deleteInvoice"
    @cancel="cancelDelete"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyEuroIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge.vue'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import { invoiceService } from '@/services/invoices'
import { debounce } from 'lodash-es'

// Types
interface Invoice {
  id: string
  invoiceNumber: string
  order?: {
    id: string
    orderNumber: string
  }
  client: {
    id: string
    name: string
    email: string
    avatar: string
  }
  status: string
  totalAmount: number
  issueDate: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

interface InvoiceStats {
  total: number
  paid: number
  overdue: number
  totalAmount: number
}

// État
const loading = ref(false)
const invoices = ref<Invoice[]>([])
const stats = ref<InvoiceStats>({
  total: 0,
  paid: 0,
  overdue: 0,
  totalAmount: 0
})

const filters = reactive({
  search: '',
  status: '',
  period: ''
})

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0
})

const showDeleteConfirmation = ref(false)
const invoiceToDelete = ref<Invoice | null>(null)

// Computed
const hasFilters = computed(() => {
  return filters.search || filters.status || filters.period
})

// Méthodes
const loadInvoices = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search || undefined,
      status: filters.status || undefined,
      period: filters.period || undefined
    }

    const response = await invoiceService.getInvoices(params)
    invoices.value = response.data.invoices
    pagination.total = response.data.total

    // Charger les statistiques
    const statsResponse = await invoiceService.getInvoiceStats()
    stats.value = statsResponse.data
  } catch (error) {
    console.error('Erreur lors du chargement des factures:', error)
  } finally {
    loading.value = false
  }
}

const refreshInvoices = () => {
  loadInvoices()
}

const debouncedSearch = debounce(() => {
  pagination.page = 1
  loadInvoices()
}, 500)

const applyFilters = () => {
  pagination.page = 1
  loadInvoices()
}

const changePage = (page: number) => {
  pagination.page = page
  loadInvoices()
}

const showDeleteModal = (invoice: Invoice) => {
  invoiceToDelete.value = invoice
  showDeleteConfirmation.value = true
}

const cancelDelete = () => {
  showDeleteConfirmation.value = false
  invoiceToDelete.value = null
}

const deleteInvoice = async () => {
  if (!invoiceToDelete.value) return

  try {
    await invoiceService.deleteInvoice(invoiceToDelete.value.id)
    loadInvoices() // Recharger la liste
    showDeleteConfirmation.value = false
    invoiceToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

const downloadPdf = async (invoiceId: string) => {
  try {
    const blob = await invoiceService.downloadInvoicePdf(invoiceId)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `facture-${invoiceId}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
  }
}

const sendInvoice = async (invoiceId: string) => {
  try {
    await invoiceService.sendInvoice(invoiceId)
    // Afficher un message de succès
    loadInvoices() // Recharger pour mettre à jour le statut
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error)
  }
}

// Utilitaires
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const isOverdue = (invoice: Invoice) => {
  return invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date()
}

const getDaysOverdue = (invoice: Invoice) => {
  const today = new Date()
  const dueDate = new Date(invoice.dueDate)
  const diffTime = today.getTime() - dueDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Lifecycle
onMounted(() => {
  loadInvoices()
})
</script>