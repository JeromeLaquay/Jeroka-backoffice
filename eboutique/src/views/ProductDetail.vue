<template>
  <div v-if="loading" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <LoadingSpinner size="lg" show-text text="Chargement du produit..." />
  </div>

  <div v-else-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Breadcrumb -->
    <nav class="mb-8">
      <ol class="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <router-link to="/" class="hover:text-primary-600">Accueil</router-link>
        </li>
        <li>/</li>
        <li>
          <router-link to="/products" class="hover:text-primary-600">Produits</router-link>
        </li>
        <li>/</li>
        <li class="text-gray-900">{{ product.name }}</li>
      </ol>
    </nav>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Image du produit -->
      <div>
        <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            :src="product.image || '/placeholder-product.jpg'"
            :alt="product.name"
            class="w-full h-full object-cover"
          >
        </div>
      </div>

      <!-- Informations du produit -->
      <div>
        <div class="mb-6">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            {{ product.name }}
          </h1>
          <p class="text-lg text-gray-600 mb-4">
            {{ product.description }}
          </p>
          
          <!-- Prix -->
          <div class="flex items-center space-x-4 mb-6">
            <span class="text-3xl font-bold text-gray-900">
              {{ formatPrice(product.price) }}
            </span>
            <span
              v-if="product.originalPrice && product.originalPrice > product.price"
              class="text-xl text-gray-500 line-through"
            >
              {{ formatPrice(product.originalPrice) }}
            </span>
            <span
              v-if="product.discount"
              class="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded"
            >
              -{{ product.discount }}%
            </span>
          </div>

          <!-- Stock -->
          <div class="mb-6">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                product.stock > 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              ]"
            >
              {{ product.stock > 0 ? `En stock (${product.stock} disponibles)` : 'Rupture de stock' }}
            </span>
          </div>
        </div>

        <!-- Quantité et ajout au panier -->
        <div class="mb-8">
          <div class="flex items-center space-x-4 mb-4">
            <label class="text-sm font-medium text-gray-700">Quantité :</label>
            <div class="flex items-center border border-gray-300 rounded-lg">
              <button
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
                class="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span class="px-4 py-2 border-x border-gray-300">{{ quantity }}</span>
              <button
                @click="increaseQuantity"
                :disabled="quantity >= product.stock"
                class="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>

          <div class="flex space-x-4">
            <button
              @click="addToCart"
              :disabled="!product.stock || isInCart"
              class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCartIcon class="h-5 w-5 mr-2" />
              {{ isInCart ? 'Déjà dans le panier' : 'Ajouter au panier' }}
            </button>
            
            <button
              @click="toggleWishlist"
              class="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              :class="{ 'bg-red-50 border-red-300 text-red-600': isInWishlist }"
            >
              <HeartIcon :class="['h-5 w-5', isInWishlist ? 'fill-current' : '']" />
            </button>
          </div>
        </div>

        <!-- Informations supplémentaires -->
        <div class="border-t border-gray-200 pt-6">
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">Catégorie</h3>
              <p class="text-sm text-gray-600">{{ product.category }}</p>
            </div>
            
            <div v-if="product.sku">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Référence</h3>
              <p class="text-sm text-gray-600">{{ product.sku }}</p>
            </div>
            
            <div v-if="product.weight">
              <h3 class="text-sm font-medium text-gray-900 mb-2">Poids</h3>
              <p class="text-sm text-gray-600">{{ product.weight }}g</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Produits similaires -->
    <div v-if="relatedProducts.length > 0" class="mt-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">Produits similaires</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="relatedProduct in relatedProducts"
          :key="relatedProduct.id"
          :product="relatedProduct"
        />
      </div>
    </div>
  </div>

  <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
      <p class="text-gray-600 mb-8">Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
      <router-link to="/products" class="btn-primary">
        Voir tous les produits
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products.js'
import { useCartStore } from '@/stores/cart.js'
import ProductCard from '@/components/ProductCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ShoppingCartIcon, HeartIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const loading = ref(false)
const quantity = ref(1)
const isInWishlist = ref(false)
const relatedProducts = ref([])

const product = computed(() => productsStore.currentProduct)
const isInCart = computed(() => cartStore.isInCart(product.value?.id))

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = () => {
  if (product.value.stock > 0 && !isInCart.value) {
    cartStore.addToCart(product.value, quantity.value)
  }
}

const toggleWishlist = () => {
  isInWishlist.value = !isInWishlist.value
  // TODO: Implémenter la logique de wishlist
}

const loadProduct = async () => {
  loading.value = true
  try {
    await productsStore.fetchProduct(route.params.id)
    
    // Charger des produits similaires
    if (product.value) {
      // TODO: Implémenter la logique pour charger des produits similaires
      // relatedProducts.value = await productsStore.fetchRelatedProducts(product.value.id)
    }
  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>
