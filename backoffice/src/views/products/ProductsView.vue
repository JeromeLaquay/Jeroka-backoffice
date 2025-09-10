<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Produits</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez votre catalogue de produits et services
        </p>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="refreshProducts"
          :disabled="loading"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          <ArrowPathIcon :class="['h-4 w-4 mr-2', { 'animate-spin': loading }]" />
          Actualiser
        </button>
        
        <button
          @click="showImportModal = true"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <ArrowUpTrayIcon class="h-4 w-4 mr-2" />
          Importer
        </button>
        
        <button
          @click="createProduct"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouveau produit
        </button>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
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
              placeholder="Nom, SKU, code-barres..."
              class="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- Catégorie -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Catégorie
          </label>
          <select
            v-model="filters.category"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            @change="applyFilters"
          >
            <option value="">Toutes les catégories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
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
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="discontinued">Arrêtés</option>
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
            @change="applyFilters"
          >
            <option value="">Tous les types</option>
            <option value="product">Produits</option>
            <option value="service">Services</option>
            <option value="featured">Vedettes</option>
            <option value="low-stock">Stock faible</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CubeIcon class="h-8 w-8 text-blue-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total produits</p>
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
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Actifs</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ stats.active }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-8 w-8 text-yellow-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Stock faible</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ stats.lowStock }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <CurrencyEuroIcon class="h-8 w-8 text-primary-500" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Valeur stock</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ formatCurrency(stats.totalValue) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Affichage en mode grille/liste -->
    <div class="flex justify-between items-center">
      <div class="flex space-x-2">
        <button
          @click="viewMode = 'grid'"
          :class="[
            'p-2 border rounded-md',
            viewMode === 'grid' 
              ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
              : 'border-gray-300 bg-white text-gray-500 hover:text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
          ]"
          title="Affichage grille"
        >
          <Squares2X2Icon class="h-4 w-4" />
        </button>
        <button
          @click="viewMode = 'list'"
          :class="[
            'p-2 border rounded-md',
            viewMode === 'list' 
              ? 'border-primary-500 bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-400' 
              : 'border-gray-300 bg-white text-gray-500 hover:text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400'
          ]"
          title="Affichage liste"
        >
          <ListBulletIcon class="h-4 w-4" />
        </button>
      </div>

      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ (products?.length || 0) }} produit{{ (products?.length || 0) > 1 ? 's' : '' }}
      </div>
    </div>

    <!-- Liste/Grille des produits -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-12">
      <CubeIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Aucun produit</h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ hasFilters ? 'Aucun produit ne correspond à vos critères' : 'Commencez par créer votre premier produit' }}
      </p>
      <div v-if="!hasFilters" class="mt-6">
        <button
          @click="createProduct"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouveau produit
        </button>
      </div>
    </div>

    <!-- Affichage grille -->
    <div
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <ProductSummary
        v-for="product in products"
        :key="product.id"
        :product="product"
        @edit="editProduct"
        @duplicate="duplicateProduct"
        @delete="(id) => { const product = products.find(p => p.id === id); if (product) showDeleteModal(product); }"
      />
    </div>

    <!-- Affichage liste -->
    <div v-else class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Produit
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                SKU
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Catégorie
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prix
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0">
                    <img
                      v-if="product.images && product.images.length > 0"
                      :src="product.images[0]"
                      :alt="product.name"
                      class="h-10 w-10 rounded object-cover"
                    />
                    <div
                      v-else
                      class="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center"
                    >
                      <CubeIcon class="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ product.name }}
                    </div>
                    <div v-if="product.description" class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {{ product.description }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ product.sku }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ product.category }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ formatCurrency(product.unitPrice) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="product.isService" class="text-sm text-gray-500 dark:text-gray-400">
                  Service
                </div>
                <div v-else>
                  <div class="text-sm text-gray-900 dark:text-gray-100">
                    {{ product.stock.current }} {{ product.unit }}
                  </div>
                  <ProductStockBadge
                    :current="product.stock.current"
                    :minimum="product.stock.minimum"
                    :maximum="product.stock.maximum"
                  />
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <ProductStatusBadge :status="product.status" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                    @click="viewProduct(product.id)"
                    class="text-primary-600 hover:text-primary-500"
                    title="Voir détails"
                  >
                    <EyeIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="editProduct(product.id)"
                    class="text-yellow-600 hover:text-yellow-500"
                    title="Modifier"
                  >
                    <PencilIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="duplicateProduct(product.id)"
                    class="text-blue-600 hover:text-blue-500"
                    title="Dupliquer"
                  >
                    <DocumentDuplicateIcon class="h-4 w-4" />
                  </button>
                  <button
                    @click="showDeleteModal(product)"
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
      <div v-if="products.length > 0" class="px-6 py-4 flex items-center justify-between">
        <div class="text-sm text-gray-700 dark:text-gray-300">
          Affichage de {{ ((pagination.page - 1) * pagination.limit) + 1 }} à 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} 
          sur {{ pagination.total }} produits
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

  <!-- Modal de suppression -->
  <DeleteConfirmModal
    :show="showDeleteConfirmation"
    :title="`Supprimer le produit ${productToDelete?.name}`"
    :message="`Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.`"
    @confirm="deleteProduct"
    @cancel="cancelDelete"
  />
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  CubeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyEuroIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowUpTrayIcon
} from '@heroicons/vue/24/outline'
import ProductSummary from '@/components/products/ProductSummary.vue'
import ProductStatusBadge from '@/components/products/ProductStatusBadge.vue'
import ProductStockBadge from '@/components/products/ProductStockBadge.vue'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import { productService } from '@/services/products'
// Fonction debounce simple
const debounce = (func: Function, wait: number) => {
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

const router = useRouter()

// Types
interface Product {
  id: string
  name: string
  description?: string
  sku: string
  category: string
  unitPrice: number
  stock: {
    current: number
    minimum: number
    maximum?: number
  }
  unit: string
  status: string
  featured: boolean
  isService: boolean
  images: string[]
  tags: string[]
}

interface ProductCategory {
  id: string
  name: string
}

interface ProductStats {
  total: number
  active: number
  lowStock: number
  totalValue: number
}

// État
const loading = ref(false)
const products = ref<Product[]>([])
const categories = ref<ProductCategory[]>([])
const stats = ref<ProductStats>({
  total: 0,
  active: 0,
  lowStock: 0,
  totalValue: 0
})

const viewMode = ref<'grid' | 'list'>('grid')
const showImportModal = ref(false)

const filters = reactive({
  search: '',
  category: '',
  status: '',
  type: ''
})

const pagination = reactive({
  page: 1,
  limit: 12,
  total: 0
})

const showDeleteConfirmation = ref(false)
const productToDelete = ref<Product | null>(null)

// Computed
const hasFilters = computed(() => {
  return filters.search || filters.category || filters.status || filters.type
})

// Méthodes
const loadProducts = async () => {
  try {
    loading.value = true
    
    const params = {
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search || undefined,
      category: filters.category || undefined,
      featured: filters.type === 'featured' ? true : undefined,
      lowStock: filters.type === 'low-stock' ? true : undefined
    }

    const response = await productService.getProducts(params)
    products.value = response.data.products || []
    pagination.total = response.data.total || 0

    // Charger les statistiques
    try {
      const statsResponse = await productService.getProductStats()
      stats.value = statsResponse.data || {}
    } catch (statsError) {
      console.error('Erreur lors du chargement des statistiques:', statsError)
      // Continuer même si les stats échouent
    }
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
    // Initialiser avec des valeurs par défaut en cas d'erreur
    products.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await productService.getCategories()
    categories.value = response.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
    // Initialiser avec des valeurs par défaut en cas d'erreur
    categories.value = []
  }
}

const refreshProducts = () => {
  loadProducts()
}

const debouncedSearch = debounce(() => {
  pagination.page = 1
  loadProducts()
}, 500)

const applyFilters = () => {
  pagination.page = 1
  loadProducts()
}

const changePage = (page: number) => {
  pagination.page = page
  loadProducts()
}

const createProduct = () => {
  router.push('/produits/create')
}

const viewProduct = (id: string) => {
  router.push(`/produits/${id}`)
}

const editProduct = (id: string) => {
  router.push(`/produits/${id}/edit`)
}

const duplicateProduct = async (id: string) => {
  try {
    await productService.duplicateProduct(id)
    loadProducts() // Recharger la liste
  } catch (error) {
    console.error('Erreur lors de la duplication:', error)
  }
}

const showDeleteModal = (product: Product) => {
  productToDelete.value = product
  showDeleteConfirmation.value = true
}

const cancelDelete = () => {
  showDeleteConfirmation.value = false
  productToDelete.value = null
}

const deleteProduct = async () => {
  if (!productToDelete.value) return

  try {
    await productService.deleteProduct(productToDelete.value.id)
    loadProducts() // Recharger la liste
    showDeleteConfirmation.value = false
    productToDelete.value = null
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
  }
}

// Utilitaires
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Lifecycle
onMounted(() => {
  loadProducts()
  loadCategories()
})
</script>
