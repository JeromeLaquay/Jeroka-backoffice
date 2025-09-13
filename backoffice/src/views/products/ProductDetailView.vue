<template>
  <div v-if="loading" class="flex justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>

  <div v-else-if="product" class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-start">
      <div class="flex items-center space-x-4">
        <router-link
          to="/produits"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ product.name }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            SKU: {{ product.sku }}
          </p>
        </div>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="duplicateProduct"
          class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          <DocumentDuplicateIcon class="h-4 w-4 mr-2" />
          Dupliquer
        </button>
        
        <router-link
          :to="`/produits/${product.id}/edit`"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PencilIcon class="h-4 w-4 mr-2" />
          Modifier
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informations générales -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Informations générales
            </h3>
          </div>
          
          <div class="px-6 py-4">
            <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ product.name }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ product.sku }}</dd>
              </div>
              
              <div v-if="product.barcode">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Code-barres</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ product.barcode }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Catégorie</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ product.category }}</dd>
              </div>
              
              <div v-if="product.brand">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Marque</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ product.brand }}</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Type</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {{ product.isService ? 'Service' : 'Produit physique' }}
                </dd>
              </div>
              
              <div v-if="product.description" class="md:col-span-2">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ product.description }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Prix et financier -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Prix et informations financières
            </h3>
          </div>
          
          <div class="px-6 py-4">
            <dl class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-6">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Prix unitaire HT</dt>
                <dd class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ formatCurrency(product.unitPrice) }}
                </dd>
              </div>
              
              <div v-if="product.costPrice">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Prix d'achat HT</dt>
                <dd class="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ formatCurrency(product.costPrice) }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de TVA</dt>
                <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ product.vatRate }}%</dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Prix TTC</dt>
                <dd class="mt-1 text-lg font-semibold text-primary-600">
                  {{ formatCurrency(product.unitPrice * (1 + product.vatRate / 100)) }}
                </dd>
              </div>
              
              <div v-if="product.costPrice">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Marge</dt>
                <dd class="mt-1 text-lg font-semibold text-green-600">
                  {{ formatCurrency(product.unitPrice - product.costPrice) }}
                  ({{ Math.round(((product.unitPrice - product.costPrice) / product.unitPrice) * 100) }}%)
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Stock (si produit physique) -->
        <div v-if="!product.isService" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Gestion du stock
            </h3>
            <button
              @click="showStockModal = true"
              class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300"
            >
              <PlusIcon class="h-3 w-3 mr-1" />
              Ajuster
            </button>
          </div>
          
          <div class="px-6 py-4">
            <dl class="grid grid-cols-1 md:grid-cols-4 gap-x-4 gap-y-6">
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Stock actuel</dt>
                <dd class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {{ product.stock.current }} {{ product.unit }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Stock minimum</dt>
                <dd class="mt-1 text-lg text-gray-900 dark:text-gray-100">
                  {{ product.stock.minimum }} {{ product.unit }}
                </dd>
              </div>
              
              <div v-if="product.stock.maximum">
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Stock maximum</dt>
                <dd class="mt-1 text-lg text-gray-900 dark:text-gray-100">
                  {{ product.stock.maximum }} {{ product.unit }}
                </dd>
              </div>
              
              <div>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Valeur du stock</dt>
                <dd class="mt-1 text-lg font-semibold text-primary-600">
                  {{ formatCurrency(product.stock.current * (product.costPrice || product.unitPrice)) }}
                </dd>
              </div>
            </dl>
            
            <div class="mt-4">
              <ProductStockBadge
                :current="product.stock.current"
                :minimum="product.stock.minimum"
                :maximum="product.stock.maximum"
              />
            </div>
          </div>
        </div>

        <!-- Historique du stock -->
        <div v-if="!product.isService && stockHistory.length > 0" class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Historique du stock
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
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Raison
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="movement in stockHistory" :key="movement.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {{ formatDate(movement.createdAt) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      movement.type === 'in' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      movement.type === 'out' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    ]">
                      {{ getMovementTypeLabel(movement.type) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {{ movement.type === 'out' ? '-' : '+' }}{{ movement.quantity }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {{ movement.reason }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {{ movement.user.name }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Colonne latérale -->
      <div class="space-y-6">
        <!-- Statut et badges -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Statut
          </h3>
          
          <div class="space-y-3">
            <ProductStatusBadge :status="product.status" />
            
            <ProductStockBadge
              v-if="!product.isService"
              :current="product.stock.current"
              :minimum="product.stock.minimum"
              :maximum="product.stock.maximum"
            />
            
            <span
              v-if="product.featured"
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            >
              <StarIcon class="h-3 w-3 mr-1" />
              Produit vedette
            </span>
          </div>
        </div>

        <!-- Images -->
        <div v-if="product.images && product.images.length > 0" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Images
          </h3>
          
          <div class="grid grid-cols-2 gap-2">
            <img
              v-for="(image, index) in product.images"
              :key="index"
              :src="image"
              :alt="`${product.name} - Image ${index + 1}`"
              class="w-full h-24 object-cover rounded"
            />
          </div>
        </div>

        <!-- Tags -->
        <div v-if="product.tags && product.tags.length > 0" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Tags
          </h3>
          
          <div class="flex flex-wrap gap-1">
            <span
              v-for="tag in product.tags"
              :key="tag"
              class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Informations système -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Informations système
          </h3>
          
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Créé le</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(product.createdAt) }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Modifié le</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(product.updatedAt) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <CubeIcon class="mx-auto h-12 w-12 text-gray-400" />
    <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">Produit introuvable</h3>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Le produit demandé n'existe pas ou a été supprimé.
    </p>
    <div class="mt-6">
      <router-link
        to="/produits"
        class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Retour aux produits
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeftIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CubeIcon,
  PlusIcon,
  StarIcon
} from '@heroicons/vue/24/outline'
import ProductStatusBadge from '../../components/products/ProductStatusBadge.vue'
import ProductStockBadge from '../../components/products/ProductStockBadge.vue'
import { productService } from '../../services/products'

const route = useRoute()
const router = useRouter()

// État
const loading = ref(false)
const product = ref(null)
const stockHistory = ref([])
const showStockModal = ref(false)

// Méthodes
const loadProduct = async () => {
  try {
    loading.value = true
    const response = await productService.getProduct(route.params.id as string)
    product.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error)
    router.push('/produits')
  } finally {
    loading.value = false
  }
}

const loadStockHistory = async () => {
  if (product.value?.isService) return
  
  try {
    const response = await productService.getStockHistory(route.params.id as string, { limit: 10 })
    stockHistory.value = response.data.movements
  } catch (error) {
    console.error('Erreur lors du chargement de l\'historique:', error)
  }
}

const duplicateProduct = async () => {
  try {
    await productService.duplicateProduct(route.params.id as string)
    router.push('/produits')
  } catch (error) {
    console.error('Erreur lors de la duplication:', error)
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
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMovementTypeLabel = (type: string) => {
  switch (type) {
    case 'in': return 'Entrée'
    case 'out': return 'Sortie'
    case 'adjustment': return 'Ajustement'
    case 'reserved': return 'Réservé'
    case 'released': return 'Libéré'
    default: return type
  }
}

// Lifecycle
onMounted(() => {
  loadProduct()
  loadStockHistory()
})
</script>
