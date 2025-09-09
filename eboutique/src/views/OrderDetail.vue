<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner size="lg" show-text text="Chargement de la commande..." />
    </div>

    <div v-else-if="order" class="space-y-8">
      <!-- En-tête de la commande -->
      <div class="card p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Commande #{{ order.id }}
            </h1>
            <p class="text-gray-500">
              Passée le {{ formatDate(order.createdAt) }}
            </p>
          </div>
          
          <div class="mt-4 sm:mt-0">
            <span
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                getStatusClass(order.status)
              ]"
            >
              {{ getStatusText(order.status) }}
            </span>
          </div>
        </div>

        <!-- Informations de suivi -->
        <div v-if="order.trackingNumber" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center">
            <TruckIcon class="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p class="text-sm font-medium text-blue-900">
                Votre commande a été expédiée
              </p>
              <p class="text-sm text-blue-700">
                Numéro de suivi: {{ order.trackingNumber }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Articles de la commande -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Articles commandés</h2>
        
        <div class="space-y-4">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0"
          >
            <img
              :src="item.image || '/placeholder-product.jpg'"
              :alt="item.name"
              class="w-16 h-16 object-cover rounded-lg"
            >
            <div class="flex-1">
              <h3 class="font-medium text-gray-900">{{ item.name }}</h3>
              <p class="text-sm text-gray-500">Quantité: {{ item.quantity }}</p>
              <p class="text-sm text-gray-500">{{ formatPrice(item.price) }} chacun</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900">
                {{ formatPrice(item.price * item.quantity) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Adresses -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Adresse de livraison -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Adresse de livraison</h3>
          <div class="text-sm text-gray-600">
            <p class="font-medium">{{ order.shipping.firstName }} {{ order.shipping.lastName }}</p>
            <p>{{ order.shipping.address }}</p>
            <p>{{ order.shipping.postalCode }} {{ order.shipping.city }}</p>
            <p v-if="order.shipping.phone">{{ order.shipping.phone }}</p>
          </div>
        </div>

        <!-- Adresse de facturation -->
        <div class="card p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Adresse de facturation</h3>
          <div class="text-sm text-gray-600">
            <p class="font-medium">{{ order.billing.firstName }} {{ order.billing.lastName }}</p>
            <p>{{ order.billing.address }}</p>
            <p>{{ order.billing.postalCode }} {{ order.billing.city }}</p>
          </div>
        </div>
      </div>

      <!-- Résumé financier -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h3>
        
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Sous-total</span>
            <span class="text-gray-900">{{ formatPrice(order.subtotal) }}</span>
          </div>
          
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Livraison</span>
            <span class="text-gray-900">{{ formatPrice(order.shippingCost) }}</span>
          </div>
          
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">TVA</span>
            <span class="text-gray-900">{{ formatPrice(order.tax) }}</span>
          </div>
          
          <hr class="border-gray-200">
          
          <div class="flex justify-between text-lg font-semibold">
            <span class="text-gray-900">Total</span>
            <span class="text-gray-900">{{ formatPrice(order.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row sm:justify-between space-y-3 sm:space-y-0">
        <router-link to="/orders" class="btn-outline">
          Retour aux commandes
        </router-link>
        
        <div class="flex space-x-3">
          <button
            v-if="order.status === 'delivered'"
            class="btn-secondary"
          >
            Commander à nouveau
          </button>
          
          <button
            v-if="canCancelOrder(order.status)"
            @click="cancelOrder"
            class="text-red-600 hover:text-red-800 font-medium"
          >
            Annuler la commande
          </button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">Commande non trouvée</h1>
      <p class="text-gray-600 mb-8">La commande que vous recherchez n'existe pas ou a été supprimée.</p>
      <router-link to="/orders" class="btn-primary">
        Voir mes commandes
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { TruckIcon } from '@heroicons/vue/24/outline'

const route = useRoute()

const loading = ref(false)
const order = ref(null)

// Données de test - à remplacer par un appel API
const mockOrder = {
  id: 'ORD-001',
  status: 'delivered',
  createdAt: '2024-01-15T10:30:00Z',
  total: 89.99,
  subtotal: 74.99,
  shippingCost: 9.99,
  tax: 15.00,
  trackingNumber: 'TRK123456789',
  items: [
    {
      id: 1,
      name: 'Produit exemple 1',
      price: 29.99,
      quantity: 2,
      image: '/placeholder-product.jpg'
    },
    {
      id: 2,
      name: 'Produit exemple 2',
      price: 29.99,
      quantity: 1,
      image: '/placeholder-product.jpg'
    }
  ],
  shipping: {
    firstName: 'Jean',
    lastName: 'Dupont',
    address: '123 Rue de la Paix',
    postalCode: '75001',
    city: 'Paris',
    phone: '01 23 45 67 89'
  },
  billing: {
    firstName: 'Jean',
    lastName: 'Dupont',
    address: '123 Rue de la Paix',
    postalCode: '75001',
    city: 'Paris'
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'En attente',
    processing: 'En cours de traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
    refunded: 'Remboursée'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const canCancelOrder = (status) => {
  return ['pending', 'processing'].includes(status)
}

const cancelOrder = async () => {
  if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
    try {
      // TODO: Implémenter l'annulation de commande
      console.log('Annulation de la commande:', order.value.id)
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
    }
  }
}

const loadOrder = async () => {
  loading.value = true
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await ordersApi.getOrder(route.params.id)
    // order.value = response.order || response.data
    
    // Utiliser les données de test pour l'instant
    order.value = mockOrder
  } catch (error) {
    console.error('Erreur lors du chargement de la commande:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>
