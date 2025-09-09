<template>
  <div class="card group hover:shadow-lg transition-shadow duration-300">
    <!-- Image du produit -->
    <div class="relative overflow-hidden rounded-t-lg">
      <router-link :to="`/products/${product.id}`">
        <img
          :src="product.image || '/placeholder-product.jpg'"
          :alt="product.name"
          class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        >
      </router-link>
      
      <!-- Badge de promotion -->
      <div
        v-if="product.discount"
        class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
      >
        -{{ product.discount }}%
      </div>
      
      <!-- Bouton d'ajout au panier -->
      <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          @click="addToCart"
          :disabled="!product.stock || isInCart"
          class="bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :title="isInCart ? 'Déjà dans le panier' : 'Ajouter au panier'"
        >
          <ShoppingCartIcon class="h-5 w-5 text-gray-700" />
        </button>
      </div>
    </div>

    <!-- Contenu du produit -->
    <div class="p-4">
      <!-- Catégorie -->
      <p class="text-sm text-gray-500 mb-1">{{ product.category }}</p>
      
      <!-- Nom du produit -->
      <router-link :to="`/products/${product.id}`" class="block">
        <h3 class="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {{ product.name }}
        </h3>
      </router-link>
      
      <!-- Description -->
      <p class="text-sm text-gray-600 mb-3 line-clamp-2">
        {{ product.description }}
      </p>
      
      <!-- Prix et stock -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-lg font-bold text-gray-900">
            {{ formatPrice(product.price) }}
          </span>
          <span
            v-if="product.originalPrice && product.originalPrice > product.price"
            class="text-sm text-gray-500 line-through"
          >
            {{ formatPrice(product.originalPrice) }}
          </span>
        </div>
        
        <div class="text-sm text-gray-500">
          <span v-if="product.stock > 0" class="text-green-600">
            En stock
          </span>
          <span v-else class="text-red-600">
            Rupture
          </span>
        </div>
      </div>
      
      <!-- Bouton d'ajout au panier (version mobile) -->
      <button
        v-if="!isInCart && product.stock > 0"
        @click="addToCart"
        class="w-full mt-3 btn-primary text-sm md:hidden"
      >
        Ajouter au panier
      </button>
      
      <!-- Indicateur "Déjà dans le panier" -->
      <div
        v-if="isInCart"
        class="w-full mt-3 bg-green-100 text-green-800 text-sm text-center py-2 rounded-lg"
      >
        ✓ Dans le panier
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCartStore } from '@/stores/cart.js'
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()

const isInCart = computed(() => cartStore.isInCart(props.product.id))

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const addToCart = () => {
  if (props.product.stock > 0 && !isInCart.value) {
    cartStore.addToCart(props.product, 1)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
