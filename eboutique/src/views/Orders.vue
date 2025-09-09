<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Mes commandes</h1>

    <div v-if="loading" class="text-center py-12">
      <LoadingSpinner size="lg" show-text text="Chargement de vos commandes..." />
    </div>

    <div v-else-if="orders.length === 0" class="text-center py-12">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ShoppingBagIcon class="h-12 w-12 text-gray-400" />
      </div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Aucune commande</h2>
      <p class="text-gray-600 mb-6">Vous n'avez pas encore passé de commande</p>
      <router-link to="/products" class="btn-primary">
        Découvrir nos produits
      </router-link>
    </div>

    <div v-else class="space-y-6">
      <div
        v-for="order in orders"
        :key="order.id"
        class="card p-6"
      >
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-gray-900">
              Commande #{{ order.id }}
            </h3>
            <p class="text-sm text-gray-500">
              Passée le {{ formatDate(order.createdAt) }}
            </p>
          </div>
          
          <div class="mt-2 sm:mt-0 flex items-center space-x-4">
            <span
              :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getStatusClass(order.status)
              ]"
            >
              {{ getStatusText(order.status) }}
            </span>
            
            <span class="text-lg font-semibold text-gray-900">
              {{ formatPrice(order.total) }}
            </span>
          </div>
        </div>

        <!-- Articles de la commande -->
        <div class="space-y-3 mb-4">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="flex items-center space-x-4"
          >
            <img
              :src="item.image || '/placeholder-product.jpg'"
              :alt="item.name"
              class="w-12 h-12 object-cover rounded"
            >
            <div class="flex-1">
              <h4 class="text-sm font-medium text-gray-900">{{ item.name }}</h4>
              <p class="text-sm text-gray-500">Quantité: {{ item.quantity }}</p>
            </div>
            <p class="text-sm font-medium text-gray-900">
              {{ formatPrice(item.price * item.quantity) }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200">
          <div class="text-sm text-gray-500 mb-2 sm:mb-0">
            <p v-if="order.trackingNumber">
              Numéro de suivi: {{ order.trackingNumber }}
            </p>
            <p v-else>
              Votre commande est en cours de préparation
            </p>
          </div>
          
          <div class="flex space-x-2">
            <router-link
              :to="`/orders/${order.id}`"
              class="btn-outline text-sm"
            >
              Voir les détails
            </router-link>
            
            <button
              v-if="order.status === 'delivered'"
              class="btn-secondary text-sm"
            >
              Commander à nouveau
            </button>
            
            <button
              v-if="canCancelOrder(order.status)"
              @click="cancelOrder(order.id)"
              class="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const loading = ref(false)
const orders = ref([])

// Données de test - à remplacer par un appel API
const mockOrders = [
  {
    id: 'ORD-001',
    status: 'delivered',
    createdAt: '2024-01-15T10:30:00Z',
    total: 89.99,
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
    ]
  },
  {
    id: 'ORD-002',
    status: 'shipped',
    createdAt: '2024-01-20T14:15:00Z',
    total: 45.50,
    trackingNumber: 'TRK987654321',
    items: [
      {
        id: 3,
        name: 'Produit exemple 3',
        price: 45.50,
        quantity: 1,
        image: '/placeholder-product.jpg'
      }
    ]
  },
  {
    id: 'ORD-003',
    status: 'processing',
    createdAt: '2024-01-22T09:45:00Z',
    total: 67.25,
    trackingNumber: null,
    items: [
      {
        id: 4,
        name: 'Produit exemple 4',
        price: 67.25,
        quantity: 1,
        image: '/placeholder-product.jpg'
      }
    ]
  }
]

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

const cancelOrder = async (orderId) => {
  if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
    try {
      // TODO: Implémenter l'annulation de commande
      console.log('Annulation de la commande:', orderId)
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
    }
  }
}

const loadOrders = async () => {
  loading.value = true
  try {
    // TODO: Remplacer par un appel API réel
    // const response = await ordersApi.getUserOrders()
    // orders.value = response.orders || response.data || []
    
    // Utiliser les données de test pour l'instant
    orders.value = mockOrders
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>
