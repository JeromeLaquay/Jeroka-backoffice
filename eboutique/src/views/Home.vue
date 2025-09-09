<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Bienvenue chez Jeroka
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-primary-100">
            Découvrez notre sélection de produits de qualité
          </p>
          <router-link
            to="/products"
            class="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Voir nos produits
          </router-link>
        </div>
      </div>
    </section>

    <!-- Produits en vedette -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Produits en vedette
          </h2>
          <p class="text-lg text-gray-600">
            Découvrez nos produits les plus populaires
          </p>
        </div>

        <LoadingSpinner v-if="loading" size="lg" show-text text="Chargement des produits..." />
        
        <div v-else-if="featuredProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        
        <div v-else class="text-center py-12">
          <p class="text-gray-500 text-lg">Aucun produit en vedette pour le moment</p>
        </div>
      </div>
    </section>

    <!-- Produits populaires -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Produits populaires
          </h2>
          <p class="text-lg text-gray-600">
            Les produits les plus appréciés par nos clients
          </p>
        </div>

        <LoadingSpinner v-if="loadingPopular" size="lg" show-text text="Chargement des produits populaires..." />
        
        <div v-else-if="popularProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in popularProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        
        <div v-else class="text-center py-12">
          <p class="text-gray-500 text-lg">Aucun produit populaire pour le moment</p>
        </div>
      </div>
    </section>

    <!-- Section avantages -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TruckIcon class="h-8 w-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Livraison rapide</h3>
            <p class="text-gray-600">Livraison gratuite à partir de 50€</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon class="h-8 w-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Paiement sécurisé</h3>
            <p class="text-gray-600">Vos données sont protégées</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon class="h-8 w-8 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Support client</h3>
            <p class="text-gray-600">Assistance 7j/7</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products.js'
import ProductCard from '@/components/ProductCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import {
  TruckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'

const productsStore = useProductsStore()

const loading = ref(false)
const loadingPopular = ref(false)
const featuredProducts = ref([])
const popularProducts = ref([])

const loadFeaturedProducts = async () => {
  loading.value = true
  try {
    const response = await productsStore.fetchFeaturedProducts(8)
    featuredProducts.value = response.products || response.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des produits en vedette:', error)
  } finally {
    loading.value = false
  }
}

const loadPopularProducts = async () => {
  loadingPopular.value = true
  try {
    const response = await productsStore.fetchPopularProducts(8)
    popularProducts.value = response.products || response.data || []
  } catch (error) {
    console.error('Erreur lors du chargement des produits populaires:', error)
  } finally {
    loadingPopular.value = false
  }
}

onMounted(() => {
  loadFeaturedProducts()
  loadPopularProducts()
})
</script>
