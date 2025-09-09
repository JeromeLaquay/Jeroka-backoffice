<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div class="p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img 
              :src="authStore.user?.avatar || '/default-avatar.png'" 
              :alt="authStore.user?.name"
              class="h-16 w-16 rounded-full object-cover"
            />
          </div>
          <div class="ml-4">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Bonjour {{ authStore.user?.name }} 👋
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Voici un aperçu de votre activité aujourd'hui
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div 
        v-for="stat in stats" 
        :key="stat.name"
        class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
      >
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component 
                :is="stat.icon" 
                :class="['h-6 w-6', stat.iconColor]" 
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {{ stat.name }}
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stat.value }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div class="text-sm">
            <span :class="[stat.changeColor, 'font-medium']">
              {{ stat.change }}
            </span>
            <span class="text-gray-500 dark:text-gray-400"> depuis le mois dernier</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Chiffre d'affaires -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Chiffre d'affaires (6 derniers mois)
        </h3>
        <div class="h-64 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-center">
          <p class="text-gray-500 dark:text-gray-400">Graphique à venir (Chart.js)</p>
        </div>
      </div>

      <!-- Répartition des ventes -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Répartition des ventes
        </h3>
        <div class="h-64 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-center">
          <p class="text-gray-500 dark:text-gray-400">Graphique à venir (Chart.js)</p>
        </div>
      </div>
    </div>

    <!-- Activités récentes -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Messages de contact -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <EnvelopeIcon class="h-5 w-5 mr-2 text-primary-600" />
            Messages de contact
          </h3>
          <router-link 
            to="/messages" 
            class="text-sm text-primary-600 hover:text-primary-500"
          >
            Voir tout
          </router-link>
        </div>
        <div class="space-y-3">
          <div 
            v-for="message in recentMessages" 
            :key="message.id"
            class="p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            @click="openMessage(message)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ message.name }}
                  </p>
                  <span 
                    v-if="!message.read"
                    class="ml-2 inline-block w-2 h-2 bg-primary-600 rounded-full"
                  ></span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {{ message.email }}
                </p>
                <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                  {{ message.subject }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ message.date }}
                </p>
                <span 
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1',
                    message.type === 'devis' ? 'badge-warning' : 
                    message.type === 'information' ? 'badge-info' : 
                    message.type === 'partnership' ? 'badge-secondary' : 'badge-success'
                  ]"
                >
                  {{ getMessageTypeLabel(message.type) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div v-if="recentMessages.length === 0" class="text-center py-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Aucun nouveau message</p>
        </div>
      </div>

      <!-- Dernières factures -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <DocumentTextIcon class="h-5 w-5 mr-2 text-secondary-600" />
            Dernières factures
          </h3>
          <router-link 
            to="/factures" 
            class="text-sm text-primary-600 hover:text-primary-500"
          >
            Voir tout
          </router-link>
        </div>
        <div class="space-y-3">
          <div 
            v-for="invoice in recentInvoices" 
            :key="invoice.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ invoice.number }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ invoice.client }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ invoice.amount }}
              </p>
              <span 
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  invoice.status === 'paid' ? 'badge-success' : 
                  invoice.status === 'pending' ? 'badge-warning' : 'badge-danger'
                ]"
              >
                {{ invoice.statusText }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Nouveaux clients -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
            <UsersIcon class="h-5 w-5 mr-2 text-success-600" />
            Nouveaux clients
          </h3>
          <div class="flex items-center space-x-2">
            <router-link 
              to="/clients/create" 
              class="text-sm text-success-600 hover:text-success-500"
            >
              Ajouter
            </router-link>
            <span class="text-gray-300">|</span>
            <router-link 
              to="/clients" 
              class="text-sm text-primary-600 hover:text-primary-500"
            >
              Voir tout
            </router-link>
          </div>
        </div>
        <div class="space-y-3">
          <div 
            v-for="client in recentClients" 
            :key="client.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            @click="goToClient(client.id)"
          >
            <div class="flex items-center">
              <img 
                :src="client.avatar || '/default-avatar.png'" 
                :alt="client.name"
                class="h-10 w-10 rounded-full object-cover"
              />
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ client.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ client.company || 'Particulier' }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ client.createdAt }}
              </p>
              <span class="badge badge-info text-xs">
                {{ client.type === 'company' ? 'Entreprise' : 'Particulier' }}
              </span>
            </div>
          </div>
        </div>
        <div v-if="recentClients.length === 0" class="text-center py-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Aucun nouveau client</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  UsersIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  EnvelopeIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

// Interface pour les messages de contact
interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  type: 'devis' | 'information' | 'partnership' | 'other'
  date: string
  read: boolean
  createdAt: string
}

const stats = ref([
  {
    name: 'Total Clients',
    value: '1,247',
    change: '+12%',
    changeColor: 'text-success-600',
    icon: UsersIcon,
    iconColor: 'text-primary-600'
  },
  {
    name: 'Factures ce mois',
    value: '89',
    change: '+5%',
    changeColor: 'text-success-600',
    icon: DocumentTextIcon,
    iconColor: 'text-secondary-600'
  },
  {
    name: 'Chiffre d\'affaires',
    value: '47 832 €',
    change: '+23%',
    changeColor: 'text-success-600',
    icon: CurrencyDollarIcon,
    iconColor: 'text-success-600'
  },
  {
    name: 'Commandes en cours',
    value: '24',
    change: '-2%',
    changeColor: 'text-danger-600',
    icon: ShoppingCartIcon,
    iconColor: 'text-warning-600'
  }
])

const recentInvoices = ref([
  {
    id: '1',
    number: 'F-2024-001',
    client: 'Société ABC',
    amount: '1 250 €',
    status: 'paid',
    statusText: 'Payée'
  },
  {
    id: '2',
    number: 'F-2024-002',
    client: 'Entreprise XYZ',
    amount: '950 €',
    status: 'pending',
    statusText: 'En attente'
  },
  {
    id: '3',
    number: 'F-2024-003',
    client: 'SARL Martin',
    amount: '750 €',
    status: 'overdue',
    statusText: 'En retard'
  }
])

// Messages de contact récents
const recentMessages = ref<ContactMessage[]>([
  {
    id: '1',
    name: 'Alice Moreau',
    email: 'alice.moreau@exemple.fr',
    subject: 'Demande de devis pour site web',
    message: 'Bonjour, je souhaiterais obtenir un devis pour la création d\'un site vitrine pour mon entreprise...',
    type: 'devis',
    date: 'Il y a 2h',
    read: false,
    createdAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    name: 'Thomas Dupont',
    email: 'thomas.dupont@tech.fr',
    subject: 'Information sur l\'automatisation',
    message: 'Nous aimerions en savoir plus sur vos solutions d\'automatisation...',
    type: 'information',
    date: 'Il y a 4h',
    read: false,
    createdAt: '2024-01-20T08:15:00Z'
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@agency.com',
    subject: 'Proposition de partenariat',
    message: 'Nous sommes une agence de marketing et souhaiterions explorer des opportunités...',
    type: 'partnership',
    date: 'Hier',
    read: true,
    createdAt: '2024-01-19T14:20:00Z'
  }
])

const recentClients = ref([
  {
    id: '1',
    name: 'Marie Dubois',
    company: 'Tech Solutions SARL',
    type: 'company',
    createdAt: 'Il y a 2 jours',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Pierre Martin',
    company: 'Design Studio',
    type: 'company',
    createdAt: 'Il y a 3 jours',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Sophie Bernard',
    company: '',
    type: 'individual',
    createdAt: 'Il y a 5 jours',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
  }
])

// Fonctions pour la gestion des messages
const getMessageTypeLabel = (type: string) => {
  const labels = {
    'devis': 'Devis',
    'information': 'Info',
    'partnership': 'Partenariat',
    'other': 'Autre'
  }
  return labels[type as keyof typeof labels] || 'Autre'
}

const openMessage = (message: ContactMessage) => {
  // TODO: Ouvrir une modal ou rediriger vers la vue détaillée du message
  console.log('Ouverture du message:', message)
  // Marquer comme lu
  message.read = true
  // Ici on pourrait faire un appel API pour mettre à jour le statut
}

const goToClient = (clientId: string) => {
  router.push(`/clients/${clientId}`)
}

onMounted(() => {
  // Initialiser l'authentification si nécessaire
  authStore.initializeAuth()
})
</script>
