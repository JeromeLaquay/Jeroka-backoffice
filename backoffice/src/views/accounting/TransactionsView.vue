<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez toutes vos transactions financières
        </p>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="showAddTransaction = true"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouvelle transaction
        </button>
        
        <button
          @click="showImportModal = true"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <ArrowUpTrayIcon class="h-4 w-4 mr-2" />
          Importer
        </button>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recherche
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Rechercher..."
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            v-model="filters.type"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Tous</option>
            <option value="income">Recettes</option>
            <option value="expense">Dépenses</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date de début
          </label>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date de fin
          </label>
          <input
            v-model="filters.dateTo"
            type="date"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <button
          @click="resetFilters"
          class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Réinitialiser les filtres
        </button>
        
        <button
          @click="exportTransactions"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
          Exporter
        </button>
      </div>
    </div>

    <!-- Tableau des transactions -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
          {{ transactions.length }} transaction(s)
        </h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Catégorie
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Montant HT
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                TVA
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Total TTC
              </th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="transaction in paginatedTransactions" :key="transaction.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <div class="max-w-xs">
                  <div class="font-medium">{{ transaction.description }}</div>
                  <div v-if="transaction.reference" class="text-gray-500 dark:text-gray-400 text-xs">
                    Réf: {{ transaction.reference }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ transaction.category }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <TransactionTypeBadge :type="transaction.type" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right text-gray-900 dark:text-gray-100">
                {{ formatCurrency(transaction.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                {{ formatCurrency(transaction.vatAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right" :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'">
                {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount + transaction.vatAmount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                <div class="flex justify-center space-x-2">
                  <button
                    @click="editTransaction(transaction)"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="deleteTransaction(transaction.id)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
      <div class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Affichage de {{ ((currentPage - 1) * itemsPerPage) + 1 }} à {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} sur {{ filteredTransactions.length }} transactions
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Précédent
            </button>
            <span class="text-sm text-gray-700 dark:text-gray-300">
              Page {{ currentPage }} sur {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modales -->
  <AddTransactionModal
    :show="showAddTransaction"
    @close="showAddTransaction = false"
    @saved="onTransactionSaved"
  />

  <ImportModal
    :show="showImportModal"
    @close="showImportModal = false"
    @imported="onDataImported"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  PlusIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import TransactionTypeBadge from '../../components/accounting/TransactionTypeBadge.vue'
import AddTransactionModal from '../../components/accounting/AddTransactionModal.vue'
import ImportModal from '../../components/accounting/ImportModal.vue'
import { accountingService, type Transaction } from '../../services/accounting'

// État
const transactions = ref<Transaction[]>([])
const showAddTransaction = ref(false)
const showImportModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10

const filters = ref({
  search: '',
  type: '',
  dateFrom: '',
  dateTo: ''
})

// Données mockées pour la démonstration
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'income',
    category: 'Ventes',
    description: 'Vente site web e-commerce',
    amount: 2500,
    vatAmount: 500,
    vatRate: 20,
    date: '2024-01-15',
    reference: 'VTE-2024-001',
    paymentMethod: 'bank_transfer',
    status: 'completed',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    type: 'expense',
    category: 'Fournitures',
    description: 'Achat serveur cloud',
    amount: 150,
    vatAmount: 30,
    vatRate: 20,
    date: '2024-01-14',
    reference: 'ACH-2024-001',
    paymentMethod: 'card',
    status: 'completed',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z'
  },
  {
    id: '3',
    type: 'income',
    category: 'Services',
    description: 'Consulting SEO',
    amount: 800,
    vatAmount: 160,
    vatRate: 20,
    date: '2024-01-13',
    reference: 'CON-2024-001',
    paymentMethod: 'bank_transfer',
    status: 'completed',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z'
  }
]

// Computed
const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(t => 
      t.description.toLowerCase().includes(search) ||
      t.category.toLowerCase().includes(search) ||
      t.reference?.toLowerCase().includes(search)
    )
  }

  if (filters.value.type) {
    filtered = filtered.filter(t => t.type === filters.value.type)
  }

  if (filters.value.dateFrom) {
    filtered = filtered.filter(t => t.date >= filters.value.dateFrom)
  }

  if (filters.value.dateTo) {
    filtered = filtered.filter(t => t.date <= filters.value.dateTo)
  }

  return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage))

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredTransactions.value.slice(start, end)
})

// Méthodes
const loadTransactions = async () => {
  try {
    // Pour la démonstration, on utilise des données mockées
    transactions.value = mockTransactions
    
    // En production, utilisez l'API :
    // const response = await accountingService.getTransactions({
    //   limit: 100,
    //   sortBy: 'date',
    //   sortOrder: 'desc'
    // })
    // transactions.value = response.data.transactions
  } catch (error) {
    console.error('Erreur lors du chargement des transactions:', error)
  }
}

const resetFilters = () => {
  filters.value = {
    search: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  }
  currentPage.value = 1
}

const exportTransactions = async () => {
  try {
    // const blob = await accountingService.exportTransactions({
    //   format: 'excel',
    //   ...filters.value
    // })
    
    // const url = window.URL.createObjectURL(blob)
    // const link = document.createElement('a')
    // link.href = url
    // link.download = `transactions-${new Date().toISOString().split('T')[0]}.xlsx`
    // link.click()
    // window.URL.revokeObjectURL(url)
    
    // Pour la démonstration
    alert('Export en cours de développement')
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
  }
}

const editTransaction = (transaction: Transaction) => {
  console.log('Édition de la transaction:', transaction.id)
  // TODO: Implémenter l'édition
}

const deleteTransaction = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
    try {
      // await accountingService.deleteTransaction(id)
      
      // Pour la démonstration
      transactions.value = transactions.value.filter(t => t.id !== id)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const onTransactionSaved = () => {
  showAddTransaction.value = false
  loadTransactions()
}

const onDataImported = () => {
  showImportModal.value = false
  loadTransactions()
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

// Watchers
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadTransactions()
})
</script>
