<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Mon panier</h1>

    <div v-if="cartItems.length === 0" class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCartIcon class="h-12 w-12 text-gray-400" />
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
      <p class="text-gray-600 mb-6">Découvrez nos produits et ajoutez-les à votre panier</p>
      <router-link to="/products" class="btn-primary">
        Voir nos produits
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Liste des produits -->
      <div class="lg:col-span-2">
        <div class="space-y-4">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="card p-6"
          >
            <div class="flex items-center space-x-4">
              <!-- Image du produit -->
              <div class="flex-shrink-0">
                <img
                  :src="item.image || '/placeholder-product.jpg'"
                  :alt="item.name"
                  class="w-20 h-20 object-cover rounded-lg"
                >
              </div>

              <!-- Informations du produit -->
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-medium text-gray-900 mb-1">
                  {{ item.name }}
                </h3>
                <p class="text-sm text-gray-500 mb-2">
                  {{ formatPrice(item.price) }} chacun
                </p>
                
                <!-- Contrôles de quantité -->
                <div class="flex items-center space-x-4">
                  <div class="flex items-center border border-gray-300 rounded-lg">
                    <button
                      @click="updateQuantity(item.id, item.quantity - 1)"
                      :disabled="item.quantity <= 1"
                      class="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span class="px-4 py-1 border-x border-gray-300">{{ item.quantity }}</span>
                    <button
                      @click="updateQuantity(item.id, item.quantity + 1)"
                      :disabled="item.quantity >= item.stock"
                      class="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    @click="removeFromCart(item.id)"
                    class="text-red-600 hover:text-red-800 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <!-- Prix total -->
              <div class="flex-shrink-0 text-right">
                <p class="text-lg font-semibold text-gray-900">
                  {{ formatPrice(item.price * item.quantity) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Résumé de la commande -->
      <div class="lg:col-span-1">
        <div class="card p-6 sticky top-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h2>
          
          <div class="space-y-3 mb-6">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Sous-total ({{ cartItemCount }} article{{ cartItemCount > 1 ? 's' : '' }})</span>
              <span class="text-gray-900">{{ formatPrice(cartTotal) }}</span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Livraison</span>
              <span class="text-gray-900">
                {{ cartTotal >= 50 ? 'Gratuite' : formatPrice(9.99) }}
              </span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">TVA</span>
              <span class="text-gray-900">{{ formatPrice(cartTotal * 0.2) }}</span>
            </div>
            
            <hr class="border-gray-200">
            
            <div class="flex justify-between text-lg font-semibold">
              <span class="text-gray-900">Total</span>
              <span class="text-gray-900">
                {{ formatPrice(cartTotal + (cartTotal >= 50 ? 0 : 9.99) + (cartTotal * 0.2)) }}
              </span>
            </div>
          </div>

          <div class="space-y-3">
            <router-link
              to="/checkout"
              class="w-full btn-primary text-center block"
            >
              Passer la commande
            </router-link>
            
            <router-link
              to="/products"
              class="w-full btn-outline text-center block"
            >
              Continuer mes achats
            </router-link>
          </div>

          <!-- Code promo -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-sm font-medium text-gray-900 mb-2">Code promo</h3>
            <div class="flex space-x-2">
              <input
                v-model="promoCode"
                type="text"
                placeholder="Entrez votre code"
                class="flex-1 input-field text-sm"
              >
              <button
                @click="applyPromoCode"
                class="btn-secondary text-sm"
              >
                Appliquer
              </button>
            </div>
            <p v-if="promoMessage" class="text-sm mt-2" :class="promoMessage.type === 'success' ? 'text-green-600' : 'text-red-600'">
              {{ promoMessage.text }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart.js'
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'

const cartStore = useCartStore()

const promoCode = ref('')
const promoMessage = ref(null)

const cartItems = computed(() => cartStore.cartItems)
const cartTotal = computed(() => cartStore.cartTotal)
const cartItemCount = computed(() => cartStore.cartItemCount)

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const updateQuantity = (productId, newQuantity) => {
  cartStore.updateQuantity(productId, newQuantity)
}

const removeFromCart = (productId) => {
  cartStore.removeFromCart(productId)
}

const applyPromoCode = () => {
  // TODO: Implémenter la logique des codes promo
  if (promoCode.value.trim()) {
    promoMessage.value = {
      type: 'error',
      text: 'Code promo non valide'
    }
  } else {
    promoMessage.value = {
      type: 'error',
      text: 'Veuillez entrer un code promo'
    }
  }
  
  setTimeout(() => {
    promoMessage.value = null
  }, 3000)
}
</script>
