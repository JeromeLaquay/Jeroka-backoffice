<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center space-x-3">
          <div class="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              v-if="product.images && product.images.length > 0"
              :src="product.images[0]"
              :alt="product.name"
              class="h-full w-full object-cover"
            />
            <CubeIcon v-else class="h-6 w-6 text-gray-400" />
          </div>
          
          <div class="flex-1">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              {{ product.name }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              SKU: {{ product.sku }}
            </p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Prix unitaire
            </p>
            <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ formatCurrency(product.unitPrice) }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Stock actuel
            </p>
            <p class="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ product.stock.current }} {{ product.unit }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Catégorie
            </p>
            <p class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ product.category }}
            </p>
          </div>

          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Type
            </p>
            <p class="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ product.isService ? 'Service' : 'Produit' }}
            </p>
          </div>
        </div>

        <div v-if="product.description" class="mt-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ product.description }}
          </p>
        </div>

        <div class="mt-4 flex items-center space-x-3">
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
            Vedette
          </span>
        </div>

        <div v-if="product.tags && product.tags.length > 0" class="mt-3 flex flex-wrap gap-1">
          <span
            v-for="tag in product.tags"
            :key="tag"
            class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <div class="flex flex-col space-y-2 ml-4">
        <button
          @click="$emit('edit', product.id)"
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Modifier"
        >
          <PencilIcon class="h-4 w-4" />
        </button>
        
        <button
          @click="$emit('duplicate', product.id)"
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Dupliquer"
        >
          <DocumentDuplicateIcon class="h-4 w-4" />
        </button>
        
        <button
          @click="$emit('delete', product.id)"
          class="p-2 text-gray-400 hover:text-red-600"
          title="Supprimer"
        >
          <TrashIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  CubeIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/vue/24/outline'
import ProductStatusBadge from './ProductStatusBadge.vue'
import ProductStockBadge from './ProductStockBadge.vue'

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

interface Props {
  product: Product
}

defineProps<Props>()

defineEmits<{
  edit: [id: string]
  duplicate: [id: string]
  delete: [id: string]
}>()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}
</script>
