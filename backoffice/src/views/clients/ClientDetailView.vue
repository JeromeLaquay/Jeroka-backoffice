<template>
  <div v-if="loading" class="flex justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>

  <div v-else-if="error" class="text-center py-12">
    <div class="text-red-600 dark:text-red-400 mb-4">
      {{ error }}
    </div>
    <router-link to="/clients" class="btn-primary">
      Retour aux clients
    </router-link>
  </div>

  <div class="space-y-6" v-else-if="client">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div class="flex items-center space-x-4">
        <router-link 
          to="/clients" 
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ client.name }}
          </h1>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {{ client.company_name || 'Client particulier' }}
          </p>
        </div>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <router-link 
          :to="`/clients/${client.id}/edit`"
          class="btn-secondary"
        >
          Modifier
        </router-link>
        <router-link 
          :to="`/factures/create?clientId=${client.id}`"
          class="btn-primary"
        >
          Nouvelle facture
        </router-link>
      </div>
    </div>

    <!-- Informations principales -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Détails du client -->
      <div class="lg:col-span-2 space-y-6">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Informations de contact
          </h3>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ client.email }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ client.phone || 'Non renseigné' }}</dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Adresse</dt>
              <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {{ fullAddress }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Historique des commandes -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Historique des commandes
          </h3>
          <div class="space-y-3">
            <div 
              v-for="order in recentOrders" 
              :key="order.id"
              class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
            >
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ order.number }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ order.date }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ order.amount }}
                </p>
                <span 
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    order.status === 'completed' ? 'badge-success' : 
                    order.status === 'pending' ? 'badge-warning' : 'badge-danger'
                  ]"
                >
                  {{ order.statusText }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Statistiques -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Statistiques
          </h3>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Total des commandes</dt>
              <dd class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ stats.totalOrders }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Chiffre d'affaires</dt>
              <dd class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ stats.totalRevenue }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Dernière commande</dt>
              <dd class="text-sm text-gray-900 dark:text-gray-100">{{ stats.lastOrder }}</dd>
            </div>
          </dl>
        </div>

        <!-- Statut -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Statut du client
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Statut</span>
              <span 
                :class="[
                  'badge',
                  client.status === 'active' ? 'badge-success' : 'badge-warning'
                ]"
              >
                {{ client.status === 'active' ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Type</span>
              <span class="badge badge-info">
                {{ client.type === 'individual' ? 'Particulier' : 'Entreprise' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600 dark:text-gray-400">Client depuis</span>
              <span class="text-sm text-gray-900 dark:text-gray-100">
                {{ client.created_at }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
    <p class="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { clientsService, type Client } from '../../services/clients'

const route = useRoute()

const loading = ref(false)
const error = ref('')

// Interface déjà importée du service

interface Order {
  id: string
  number: string
  date: string
  amount: string
  status: 'completed' | 'pending' | 'cancelled'
  statusText: string
}

const client = ref<Client | null>(null)
const recentOrders = ref<Order[]>([])
const stats = ref({
  totalOrders: 0,
  totalRevenue: '0 €',
  lastOrder: 'Aucune'
})

const fullAddress = computed(() => {

  const parts = [
    client.value?.address_line1,
    client.value?.address_line2,
    client.value?.postal_code && client.value?.city ? `${client.value?.postal_code} ${client.value?.city}` : client.value?.city,
    client.value?.country
  ].filter(Boolean)
  
  return parts.join(', ') || 'Non renseignée'
})

const loadClientData = async () => {
  const clientId = route.params.id as string
  
  try {
    loading.value = true
    error.value = ''
    
    const response = await clientsService.getClient(clientId)
    
    if (response.success) {
      client.value = response.data
      console.log('client', client.value)
      
      // TODO: Charger les commandes récentes et stats depuis l'API
      // Pour l'instant on garde des données de simulation
      recentOrders.value = [
        {
          id: '1',
          number: 'CMD-2024-001',
          date: '15/01/2024',
          amount: '1 250 €',
          status: 'completed',
          statusText: 'Terminée'
        },
        {
          id: '2',
          number: 'CMD-2024-002',
          date: '08/01/2024',
          amount: '890 €',
          status: 'pending',
          statusText: 'En cours'
        }
      ]
      
      stats.value = {
        totalOrders: 12,
        totalRevenue: '15 480 €',
        lastOrder: '15/01/2024'
      }
    } else {
      error.value = 'Client introuvable'
    }
  } catch (err) {
    console.error('Erreur lors du chargement du client:', err)
    error.value = 'Erreur lors du chargement du client'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return 'Actif'
    case 'inactive': return 'Inactif'
    case 'prospect': return 'Prospect'
    default: return status
  }
}

onMounted(() => {
  loadClientData()
})
</script>


