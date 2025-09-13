<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Comptabilité</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Tableaux de bord et rapports financiers
        </p>
      </div>
      
      <div class="flex space-x-3">
        <select
          v-model="selectedPeriod"
          @change="loadData"
          class="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="month">Ce mois</option>
          <option value="quarter">Ce trimestre</option>
          <option value="year">Cette année</option>
          <option value="custom">Période personnalisée</option>
        </select>
        
        <button
          @click="refreshData"
          :disabled="loading"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <ArrowPathIcon :class="['h-4 w-4 mr-2', { 'animate-spin': loading }]" />
          Actualiser
        </button>
      </div>
    </div>

    <!-- Indicateurs clés -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ArrowUpIcon class="h-8 w-8 text-green-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Chiffre d'affaires</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(stats.totalRevenue) }}</p>
            <p class="text-xs text-green-600">+12% vs mois dernier</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ArrowDownIcon class="h-8 w-8 text-red-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Dépenses</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(stats.totalExpenses) }}</p>
            <p class="text-xs text-red-600">+5% vs mois dernier</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CurrencyEuroIcon class="h-8 w-8 text-blue-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Bénéfice net</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(stats.netProfit) }}</p>
            <p class="text-xs" :class="stats.profitMargin > 0 ? 'text-green-600' : 'text-red-600'">
              {{ stats.profitMargin.toFixed(1) }}% de marge
            </p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <DocumentTextIcon class="h-8 w-8 text-yellow-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">TVA due</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(stats.vatOwed) }}</p>
            <p class="text-xs text-yellow-600">Déclaration mensuelle</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques et tableaux -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Évolution du chiffre d'affaires -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
            Évolution financière
          </h3>
          <div class="flex space-x-2">
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <div class="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              Revenus
            </span>
            <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <div class="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
              Dépenses
            </span>
          </div>
        </div>
        
        <div class="h-64">
          <FinancialChart 
            :revenue-data="stats.monthlyRevenue"
            :expenses-data="stats.monthlyExpenses"
          />
        </div>
      </div>

      <!-- Répartition par catégorie -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Répartition des dépenses
        </h3>
        
        <div class="space-y-3">
          <div v-for="category in stats.categoryBreakdown" :key="category.category" class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-3 h-3 rounded-full mr-3" :style="{ backgroundColor: getCategoryColor(category.category) }"></div>
              <span class="text-sm text-gray-900 dark:text-gray-100">{{ category.category }}</span>
            </div>
            <div class="text-right">
              <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(category.amount) }}</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ category.percentage.toFixed(1) }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions récentes -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
          Transactions récentes
        </h3>
        <div class="flex space-x-2">
          <router-link
            to="/comptabilite/transactions"
            class="text-sm text-primary-600 hover:text-primary-500"
          >
            Voir tout
          </router-link>
          <button
            @click="showAddTransaction = true"
            class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200"
          >
            <PlusIcon class="h-4 w-4 mr-1" />
            Ajouter
          </button>
        </div>
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
                Montant
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="transaction in recentTransactions" :key="transaction.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                <div class="max-w-xs truncate">{{ transaction.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ transaction.category }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <TransactionTypeBadge :type="transaction.type" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right" :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'">
                {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">Rapports</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Générer des rapports comptables</p>
          </div>
          <DocumentChartBarIcon class="h-8 w-8 text-blue-500" />
        </div>
        <div class="mt-4 space-y-2">
          <button
            @click="generateReport('vat')"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Rapport TVA
          </button>
          <button
            @click="generateReport('profit-loss')"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Compte de résultat
          </button>
          <button
            @click="generateReport('cash-flow')"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Flux de trésorerie
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">Import/Export</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">Gérer les données comptables</p>
          </div>
          <ArrowUpTrayIcon class="h-8 w-8 text-green-500" />
        </div>
        <div class="mt-4 space-y-2">
          <button
            @click="showImportModal = true"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Importer transactions
          </button>
          <button
            @click="exportData"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Exporter données
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100">Déclarations</h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">TVA et obligations fiscales</p>
          </div>
          <DocumentTextIcon class="h-8 w-8 text-yellow-500" />
        </div>
        <div class="mt-4 space-y-2">
          <button
            @click="generateVatDeclaration"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Déclaration TVA
          </button>
          <button
            @click="calculateTaxes"
            class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            Calculer taxes
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal d'ajout de transaction -->
  <AddTransactionModal
    :show="showAddTransaction"
    @close="showAddTransaction = false"
    @saved="onTransactionSaved"
  />

  <!-- Modal d'import -->
  <ImportModal
    :show="showImportModal"
    @close="showImportModal = false"
    @imported="onDataImported"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyEuroIcon,
  DocumentTextIcon,
  PlusIcon,
  DocumentChartBarIcon,
  ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'
import FinancialChart from './components/accounting/FinancialChart.vue'
import TransactionTypeBadge from './components/accounting/TransactionTypeBadge.vue'
import AddTransactionModal from './components/accounting/AddTransactionModal.vue'
import ImportModal from './components/accounting/ImportModal.vue'
import { accountingService, type FinancialStats, type Transaction } from '../../services/accounting'

// État
const loading = ref(false)
const selectedPeriod = ref('month')
const showAddTransaction = ref(false)
const showImportModal = ref(false)

const stats = ref<FinancialStats>({
  totalRevenue: 0,
  totalExpenses: 0,
  netProfit: 0,
  profitMargin: 0,
  vatOwed: 0,
  outstandingInvoices: 0,
  overdueInvoices: 0,
  cashFlow: 0,
  monthlyRevenue: [],
  monthlyExpenses: [],
  categoryBreakdown: []
})

const recentTransactions = ref<Transaction[]>([])

// Méthodes
const loadData = async () => {
  loading.value = true
  try {
    // Charger les statistiques financières
    const statsResponse = await accountingService.getFinancialStats(selectedPeriod.value)
    stats.value = statsResponse.data

    // Charger les transactions récentes
    const transactionsResponse = await accountingService.getTransactions({
      limit: 10,
      sortBy: 'date',
      sortOrder: 'desc'
    })
    recentTransactions.value = transactionsResponse.data.transactions
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const generateReport = async (type: string) => {
  try {
    let blob
    switch (type) {
      case 'vat':
        blob = await accountingService.generateVatReport(selectedPeriod.value)
        break
      case 'profit-loss':
        blob = await accountingService.generateProfitLossReport(selectedPeriod.value)
        break
      case 'cash-flow':
        blob = await accountingService.generateCashFlowReport(selectedPeriod.value)
        break
      default:
        return
    }

    // Télécharger le rapport
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `rapport-${type}-${selectedPeriod.value}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur lors de la génération du rapport:', error)
  }
}

const generateVatDeclaration = async () => {
  try {
    await accountingService.generateVatDeclaration(selectedPeriod.value)
    // Afficher un message de succès
  } catch (error) {
    console.error('Erreur lors de la génération de la déclaration TVA:', error)
  }
}

const calculateTaxes = async () => {
  try {
    const response = await accountingService.calculateTaxes(selectedPeriod.value)
    // Afficher les résultats
    console.log('Taxes calculées:', response.data)
  } catch (error) {
    console.error('Erreur lors du calcul des taxes:', error)
  }
}

const exportData = async () => {
  try {
    const blob = await accountingService.exportTransactions({
      format: 'excel',
      dateFrom: getStartOfPeriod(selectedPeriod.value),
      dateTo: getEndOfPeriod(selectedPeriod.value)
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transactions-${selectedPeriod.value}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
  }
}

const onTransactionSaved = () => {
  showAddTransaction.value = false
  loadData()
}

const onDataImported = () => {
  showImportModal.value = false
  loadData()
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

const getCategoryColor = (category: string) => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ]
  const index = category.length % colors.length
  return colors[index]
}

const getStartOfPeriod = (period: string) => {
  const now = new Date()
  switch (period) {
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      return new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0]
    case 'year':
      return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
    default:
      return now.toISOString().split('T')[0]
  }
}

const getEndOfPeriod = (period: string) => {
  const now = new Date()
  switch (period) {
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      return new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0]
    case 'year':
      return new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]
    default:
      return now.toISOString().split('T')[0]
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>