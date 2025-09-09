<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- En-tête -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">
        Nos produits
      </h1>
      <p class="text-gray-600">
        Découvrez notre sélection de produits de qualité
      </p>
    </div>

    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar avec filtres -->
      <div class="lg:w-64 flex-shrink-0">
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtres</h3>
          
          <!-- Recherche -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Recherche
            </label>
            <input
              v-model="searchQuery"
              @input="handleSearch"
              type="text"
              placeholder="Rechercher un produit..."
              class="input-field"
            >
          </div>

          <!-- Catégories -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              v-model="selectedCategory"
              @change="handleFilterChange"
              class="input-field"
            >
              <option value="">Toutes les catégories</option>
              <option
                v-for="category in categories"
                :key="category"
                :value="category"
              >
                {{ category }}
              </option>
            </select>
          </div>

          <!-- Prix -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Prix
            </label>
            <div class="space-y-2">
              <input
                v-model.number="minPrice"
                @input="handleFilterChange"
                type="number"
                placeholder="Prix min"
                class="input-field"
              >
              <input
                v-model.number="maxPrice"
                @input="handleFilterChange"
                type="number"
                placeholder="Prix max"
                class="input-field"
              >
            </div>
          </div>

          <!-- Tri -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Trier par
            </label>
            <select
              v-model="sortBy"
              @change="handleFilterChange"
              class="input-field"
            >
              <option value="name">Nom (A-Z)</option>
              <option value="price-asc">Prix (croissant)</option>
              <option value="price-desc">Prix (décroissant)</option>
            </select>
          </div>

          <!-- Bouton reset -->
          <button
            @click="resetFilters"
            class="w-full btn-secondary"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      <!-- Contenu principal -->
      <div class="flex-1">
        <!-- Résultats et tri -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div class="mb-4 sm:mb-0">
            <p class="text-gray-600">
              {{ totalProducts }} produit{{ totalProducts > 1 ? 's' : '' }} trouvé{{ totalProducts > 1 ? 's' : '' }}
            </p>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">Vue :</span>
            <button
              @click="viewMode = 'grid'"
              :class="[
                'p-2 rounded',
                viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <Squares2X2Icon class="h-5 w-5" />
            </button>
            <button
              @click="viewMode = 'list'"
              :class="[
                'p-2 rounded',
                viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
              ]"
            >
              <ListBulletIcon class="h-5 w-5" />
            </button>
          </div>
        </div>

        <!-- Loading -->
        <LoadingSpinner v-if="loading" size="lg" show-text text="Chargement des produits..." />

        <!-- Grille des produits -->
        <div
          v-else-if="products.length > 0"
          :class="[
            'grid gap-6',
            viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          ]"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
          />
        </div>

        <!-- Aucun résultat -->
        <div v-else class="text-center py-12">
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon class="h-12 w-12 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p class="text-gray-500 mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <button
            @click="resetFilters"
            class="btn-primary"
          >
            Réinitialiser les filtres
          </button>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-12 flex justify-center">
          <nav class="flex items-center space-x-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-2 text-sm font-medium rounded-md',
                page === currentPage
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              ]"
            >
              {{ page }}
            </button>
            
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products.js'
import ProductCard from '@/components/ProductCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

const loading = ref(false)
const viewMode = ref('grid')
const searchQuery = ref('')
const selectedCategory = ref('')
const minPrice = ref(null)
const maxPrice = ref(null)
const sortBy = ref('name')
const currentPage = ref(1)
const limit = ref(12)

const products = computed(() => productsStore.products)
const categories = computed(() => productsStore.categories)
const totalProducts = computed(() => productsStore.pagination.total)
const totalPages = computed(() => productsStore.pagination.totalPages)

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const loadProducts = async () => {
  loading.value = true
  
  try {
    const params = {
      page: currentPage.value,
      limit: limit.value,
      search: searchQuery.value,
      category: selectedCategory.value,
      minPrice: minPrice.value,
      maxPrice: maxPrice.value,
      sort: sortBy.value
    }
    
    // Nettoyer les paramètres vides
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === '' || params[key] === undefined) {
        delete params[key]
      }
    })
    
    await productsStore.fetchProducts(params)
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    await productsStore.fetchCategories()
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadProducts()
}

const handleFilterChange = () => {
  currentPage.value = 1
  loadProducts()
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  minPrice.value = null
  maxPrice.value = null
  sortBy.value = 'name'
  currentPage.value = 1
  loadProducts()
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadProducts()
  }
}

// Initialiser depuis les paramètres de l'URL
const initFromRoute = () => {
  if (route.query.search) {
    searchQuery.value = route.query.search
  }
  if (route.query.category) {
    selectedCategory.value = route.query.category
  }
  if (route.query.page) {
    currentPage.value = parseInt(route.query.page)
  }
}

// Mettre à jour l'URL quand les filtres changent
const updateURL = () => {
  const query = {}
  
  if (searchQuery.value) query.search = searchQuery.value
  if (selectedCategory.value) query.category = selectedCategory.value
  if (minPrice.value) query.minPrice = minPrice.value
  if (maxPrice.value) query.maxPrice = maxPrice.value
  if (sortBy.value !== 'name') query.sort = sortBy.value
  if (currentPage.value > 1) query.page = currentPage.value
  
  router.replace({ query })
}

watch([searchQuery, selectedCategory, minPrice, maxPrice, sortBy, currentPage], updateURL)

onMounted(() => {
  initFromRoute()
  loadCategories()
  loadProducts()
})
</script>
