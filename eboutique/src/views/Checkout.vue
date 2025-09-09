<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Finaliser la commande</h1>

    <div v-if="cartItems.length === 0" class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingCartIcon class="h-12 w-12 text-gray-400" />
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Votre panier est vide</h2>
      <p class="text-gray-600 mb-6">Ajoutez des produits à votre panier avant de passer commande</p>
      <router-link to="/products" class="btn-primary">
        Voir nos produits
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Formulaire de commande -->
      <div>
        <form @submit.prevent="handleCheckout" class="space-y-8">
          <!-- Informations de livraison -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Adresse de livraison</h2>
            
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  v-model="shipping.firstName"
                  type="text"
                  required
                  class="input-field"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  v-model="shipping.lastName"
                  type="text"
                  required
                  class="input-field"
                >
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                v-model="shipping.address"
                type="text"
                required
                class="input-field"
              >
            </div>

            <div class="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                <input
                  v-model="shipping.postalCode"
                  type="text"
                  required
                  class="input-field"
                >
              </div>
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                <input
                  v-model="shipping.city"
                  type="text"
                  required
                  class="input-field"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                v-model="shipping.phone"
                type="tel"
                required
                class="input-field"
              >
            </div>
          </div>

          <!-- Informations de facturation -->
          <div class="card p-6">
            <div class="flex items-center mb-4">
              <input
                id="same-as-shipping"
                v-model="sameAsShipping"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <label for="same-as-shipping" class="ml-2 block text-sm text-gray-900">
                Même adresse que la livraison
              </label>
            </div>

            <div v-if="!sameAsShipping">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Adresse de facturation</h2>
              
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    v-model="billing.firstName"
                    type="text"
                    required
                    class="input-field"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    v-model="billing.lastName"
                    type="text"
                    required
                    class="input-field"
                  >
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  v-model="billing.address"
                  type="text"
                  required
                  class="input-field"
                >
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                  <input
                    v-model="billing.postalCode"
                    type="text"
                    required
                    class="input-field"
                  >
                </div>
                <div class="col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    v-model="billing.city"
                    type="text"
                    required
                    class="input-field"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Mode de paiement -->
          <div class="card p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Mode de paiement</h2>
            
            <div class="space-y-3">
              <div class="flex items-center">
                <input
                  id="card"
                  v-model="paymentMethod"
                  type="radio"
                  value="card"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                >
                <label for="card" class="ml-2 block text-sm text-gray-900">
                  Carte bancaire
                </label>
              </div>
              
              <div class="flex items-center">
                <input
                  id="paypal"
                  v-model="paymentMethod"
                  type="radio"
                  value="paypal"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                >
                <label for="paypal" class="ml-2 block text-sm text-gray-900">
                  PayPal
                </label>
              </div>
            </div>
          </div>

          <!-- Bouton de commande -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LoadingSpinner v-if="loading" size="sm" />
            <span v-else>Confirmer la commande</span>
          </button>
        </form>
      </div>

      <!-- Résumé de la commande -->
      <div>
        <div class="card p-6 sticky top-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h2>
          
          <!-- Articles -->
          <div class="space-y-4 mb-6">
            <div
              v-for="item in cartItems"
              :key="item.id"
              class="flex items-center space-x-4"
            >
              <img
                :src="item.image || '/placeholder-product.jpg'"
                :alt="item.name"
                class="w-12 h-12 object-cover rounded"
              >
              <div class="flex-1">
                <h3 class="text-sm font-medium text-gray-900">{{ item.name }}</h3>
                <p class="text-sm text-gray-500">Quantité: {{ item.quantity }}</p>
              </div>
              <p class="text-sm font-medium text-gray-900">
                {{ formatPrice(item.price * item.quantity) }}
              </p>
            </div>
          </div>

          <!-- Totaux -->
          <div class="space-y-3 border-t border-gray-200 pt-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Sous-total</span>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart.js'
import { useAuthStore } from '@/stores/auth.js'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ShoppingCartIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const loading = ref(false)
const sameAsShipping = ref(true)
const paymentMethod = ref('card')

const shipping = reactive({
  firstName: '',
  lastName: '',
  address: '',
  postalCode: '',
  city: '',
  phone: ''
})

const billing = reactive({
  firstName: '',
  lastName: '',
  address: '',
  postalCode: '',
  city: ''
})

const cartItems = computed(() => cartStore.cartItems)
const cartTotal = computed(() => cartStore.cartTotal)

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Copier les informations de livraison vers la facturation
watch(sameAsShipping, (value) => {
  if (value) {
    Object.keys(billing).forEach(key => {
      billing[key] = shipping[key]
    })
  }
})

const handleCheckout = async () => {
  loading.value = true
  
  try {
    // TODO: Implémenter la logique de commande
    const orderData = {
      items: cartItems.value,
      shipping,
      billing: sameAsShipping.value ? shipping : billing,
      paymentMethod: paymentMethod.value,
      total: cartTotal.value + (cartTotal.value >= 50 ? 0 : 9.99) + (cartTotal.value * 0.2)
    }
    
    console.log('Données de commande:', orderData)
    
    // Simuler une commande réussie
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Vider le panier
    cartStore.clearCart()
    
    // Rediriger vers la page de confirmation
    router.push('/orders')
  } catch (error) {
    console.error('Erreur lors de la commande:', error)
  } finally {
    loading.value = false
  }
}

// Initialiser avec les informations utilisateur si connecté
if (authStore.isLoggedIn && authStore.userInfo) {
  const user = authStore.userInfo
  shipping.firstName = user.firstName || ''
  shipping.lastName = user.lastName || ''
  shipping.phone = user.phone || ''
}
</script>
