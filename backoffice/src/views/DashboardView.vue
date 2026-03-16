<template>
  <div class="space-y-6" data-cy="dashboard-page">
    <!-- Welcome Section -->
    <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
      <div class="p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img 
              :src="authStore.user?.avatar_url || '/default-avatar.png'" 
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
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" data-cy="dashboard-stats" v-if="topStats.length">
      <div 
        v-for="stat in topStats" 
        :key="stat.name"
        :data-cy="`stat-${stat.name}`"
        class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg"
      >
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <component 
                :is="getIcon(stat.icon)" 
                :class="['h-6 w-6', getIconColor(stat.iconColor)]" 
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
        <div class="h-64 relative">
          <Bar v-if="revenueChartData" :data="revenueChartData" :options="revenueChartOptions" />
          <div v-else class="h-64 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <p class="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
          </div>
        </div>
      </div>

      <!-- Répartition des ventes -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Répartition des factures
        </h3>
        <div class="h-64 relative flex items-center justify-center">
          <Doughnut v-if="salesChartData" :data="salesChartData" :options="salesChartOptions" />
          <div v-else class="h-64 bg-gray-50 dark:bg-gray-700 rounded-md flex items-center justify-center">
            <p class="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
          </div>
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
            v-for="message in stats?.recent_messages" 
            :key="message.id"
            class="p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {{ `${message.first_name} ${message.last_name}` }}
                  </p>
                  <span 
                    v-if="message.status === 'unread'"
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
                  {{ formatDate(message.created_at) }}
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
        <div v-if="stats?.recent_messages?.length === 0" class="text-center py-4">
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
            v-for="invoice in stats?.recent_invoices" 
            :key="invoice.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            <div>
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ invoice.invoice_number }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ invoice.client_name || '—' }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ formatCurrency(parseFloat(String(invoice.total_ttc))) }}
              </p>
              <span 
                  :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    invoice.status === 'paid' ? 'badge-success' : 
                    invoice.status === 'pending' ? 'badge-warning' :
                    invoice.status === 'sent' ? 'badge-info' : 'badge-danger'
                  ]"
                >
                  {{ getInvoiceStatusLabel(invoice.status) }}
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
            v-for="client in stats?.recent_clients" 
            :key="client.id"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            @click="goToClient(client.id)"
          >
            <div class="flex items-center">
              <img 
                :src="'/default-avatar.png'" 
                :alt="`${client.first_name} ${client.last_name}`"
                class="h-10 w-10 rounded-full object-cover"
              />
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {{ `${client.first_name} ${client.last_name}` }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(client.created_at) }}
              </p>
              
            </div>
          </div>
        </div>
        <div v-if="stats?.recent_clients?.length === 0" class="text-center py-4">
          <p class="text-sm text-gray-500 dark:text-gray-400">Aucun nouveau client</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { dashboardService, DashboardStats } from '../services/dashboard'
import {
  UsersIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const router = useRouter()
const authStore = useAuthStore()

const stats = ref<DashboardStats | null>(null)
const topStats = ref<TopStat[]>([])

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Aoû',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc'
}

const revenueChartData = computed(() => {
  const monthly = (stats.value as any)?.monthly_revenue
  if (!monthly?.length) return null
  const sorted = [...monthly].sort((a: any, b: any) => a.month.localeCompare(b.month))
  return {
    labels: sorted.map((m: any) => {
      const [year, month] = m.month.split('-')
      return `${MONTH_LABELS[month] || m.month} ${year}`
    }),
    datasets: [{
      label: 'CA (€)',
      data: sorted.map((m: any) => Number(m.total)),
      backgroundColor: 'rgba(139, 92, 246, 0.7)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 1,
      borderRadius: 4
    }]
  }
})

const revenueChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { callback: (v: any) => v + ' €' } }
  }
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Payée', pending: 'En attente', sent: 'Envoyée',
  draft: 'Brouillon', cancelled: 'Annulée', overdue: 'En retard'
}
const STATUS_COLORS = ['#22c55e', '#f59e0b', '#3b82f6', '#9ca3af', '#ef4444', '#f97316']

const salesChartData = computed(() => {
  const counts = (stats.value as any)?.invoice_status_counts
  if (!counts || !Object.keys(counts).length) return null
  const entries = Object.entries(counts) as [string, number][]
  return {
    labels: entries.map(([s]) => STATUS_LABELS[s] || s),
    datasets: [{
      data: entries.map(([, v]) => v),
      backgroundColor: STATUS_COLORS.slice(0, entries.length)
    }]
  }
})

const salesChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } }
}

interface TopStat {
  name: string
  value: number
  change: string
  icon: string
  iconColor: string
  changeColor: string
}

const getMessageTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'website': 'Site web',
    'email': 'Email',
    'phone': 'Téléphone',
    'devis': 'Devis',
    'information': 'Info',
    'partnership': 'Partenariat',
    'other': 'Autre'
  }
  return labels[type] || 'Autre'
}

const getInvoiceStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'draft': 'Brouillon',
    'sent': 'Envoyée',
    'pending': 'En attente',
    'paid': 'Payée',
    'cancelled': 'Annulée',
    'overdue': 'En retard'
  }
  return labels[status] || status
}

const goToClient = (clientId: string) => {
  router.push(`/clients/${clientId}`)
}

const loadStats = async () => {
  const response = await dashboardService.getStats()
  stats.value = response
  const n = (v: unknown) => Number(v ?? 0)
  topStats.value = [
    {
      name: 'Clients',
      value: n(response?.total_clients),
      change: n(response?.new_clients_month),
      icon: 'UsersIcon',
      iconColor: 'green',
      changeColor: 'text-green-600'
    },
    {
      name: 'Messages',
      value: n(response?.total_messages),
      change: n(response?.new_messages_week),
      icon: 'EnvelopeIcon',
      iconColor: 'blue',
      changeColor: 'text-blue-600'
    },
    {
      name: 'Factures',
      value: n(response?.total_invoices),
      change: n(response?.new_invoices_month),
      icon: 'DocumentTextIcon',
      iconColor: 'secondary',
      changeColor: 'text-secondary-600'
    },
    {
      name: 'Devis',
      value: n(response?.total_quotes),
      change: n(response?.new_quotes_month),
      icon: 'ClipboardDocumentListIcon',
      iconColor: 'primary',
      changeColor: 'text-primary-600'
    }
  ]
}




const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

// Mappers pour icônes/couleurs envoyées par l'API
const getIcon = (iconName: string) => {
  const map: Record<string, any> = {
    UsersIcon,
    DocumentTextIcon,
    EnvelopeIcon,
    ClipboardDocumentListIcon
  }
  return map[iconName] || DocumentTextIcon
}

const getIconColor = (color: string) => {
  const map: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  }
  return map[color] || 'text-gray-600'
}

onMounted(() => {
  loadStats()
})
</script>
