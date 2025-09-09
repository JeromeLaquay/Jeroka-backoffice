<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-start">
      <div class="flex items-center space-x-4">
        <router-link
          to="/devis"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Devis {{ quote?.quoteNumber }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Émis le {{ formatDate(quote?.issueDate) }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <QuoteStatusBadge v-if="quote" :status="quote.status" />
        
        <div class="flex space-x-2">
          <button
            @click="downloadPdf"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
            PDF
          </button>
          
          <button
            @click="sendQuote"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <EnvelopeIcon class="h-4 w-4 mr-2" />
            Envoyer
          </button>
          
          <button
            v-if="quote?.status === 'accepted' && !quote.convertedToInvoice"
            @click="convertToInvoice"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <DocumentTextIcon class="h-4 w-4 mr-2" />
            Convertir en facture
          </button>
          
          <router-link
            :to="`/devis/${quote?.id}/edit`"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <PencilIcon class="h-4 w-4 mr-2" />
            Modifier
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="quote" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informations client -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Informations client
          </h3>
          
          <div class="flex items-center space-x-4">
            <img
              :src="quote.client.avatar"
              :alt="quote.client.name"
              class="h-12 w-12 rounded-full"
            />
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ quote.client.name }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ quote.client.email }}
              </p>
              <p v-if="quote.client.phone" class="text-sm text-gray-500 dark:text-gray-400">
                {{ quote.client.phone }}
              </p>
            </div>
          </div>
        </div>

        <!-- Articles du devis -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Articles proposés
            </h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Article
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prix unitaire
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="item in quote.items" :key="item.id">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ item.description }}
                    </div>
                    <div v-if="item.discountPercent > 0" class="text-sm text-green-600">
                      Remise: {{ item.discountPercent }}%
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {{ item.quantity }}
                  </td>
                  <td class="px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-100">
                    {{ formatCurrency(item.unitPrice) }}
                  </td>
                  <td class="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ formatCurrency(item.totalHt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Résumé financier -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Résumé financier
          </h3>
          
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Sous-total HT</span>
              <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(quote.subtotalHt) }}</span>
            </div>
            
            <div v-if="quote.discountAmount > 0" class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Remise</span>
              <span class="text-green-600">-{{ formatCurrency(quote.discountAmount) }}</span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">TVA</span>
              <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(quote.taxAmount) }}</span>
            </div>
            
            <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div class="flex justify-between">
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">Total TTC</span>
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(quote.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations de devis -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Validité</h4>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(quote.validUntil) }}</p>
            <p v-if="isExpired" class="text-xs text-red-600">
              Expiré depuis {{ getDaysExpired() }} jours
            </p>
            <p v-else-if="isExpiringSoon" class="text-xs text-yellow-600">
              Expire dans {{ getDaysUntilExpiry() }} jours
            </p>
          </div>

          <div v-if="quote.acceptedDate">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Date d'acceptation</h4>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(quote.acceptedDate) }}</p>
          </div>

          <div v-if="quote.rejectedDate">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Date de rejet</h4>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(quote.rejectedDate) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Actions
          </h3>
          
          <button
            v-if="quote.status === 'sent'"
            @click="acceptQuote"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <CheckIcon class="h-4 w-4 mr-2" />
            Marquer comme accepté
          </button>
          
          <button
            v-if="quote.status === 'sent'"
            @click="rejectQuote"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <XMarkIcon class="h-4 w-4 mr-2" />
            Marquer comme rejeté
          </button>
          
          <button
            v-if="isExpired && quote.status === 'sent'"
            @click="extendValidity"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ClockIcon class="h-4 w-4 mr-2" />
            Prolonger la validité
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  PencilIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import QuoteStatusBadge from '@/components/quotes/QuoteStatusBadge.vue'
import { quotesService, type Quote } from '@/services/quotes'

const route = useRoute()
const router = useRouter()

// État
const loading = ref(false)
const quote = ref<Quote | null>(null)

// Computed
const isExpired = computed(() => {
  if (!quote.value || quote.value.status === 'accepted') return false
  return new Date(quote.value.validUntil) < new Date()
})

const isExpiringSoon = computed(() => {
  if (!quote.value || quote.value.status === 'accepted') return false
  const validUntil = new Date(quote.value.validUntil)
  const today = new Date()
  const diffDays = Math.ceil((validUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= 7 && diffDays > 0
})

// Méthodes
const loadQuote = async () => {
  try {
    loading.value = true
    const response = await quotesService.getQuote(route.params.id as string)
    quote.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement du devis:', error)
    router.push('/devis')
  } finally {
    loading.value = false
  }
}

const downloadPdf = async () => {
  if (!quote.value) return
  try {
    const blob = await quotesService.downloadQuotePdf(quote.value.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `devis-${quote.value.quoteNumber}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
  }
}

const sendQuote = async () => {
  if (!quote.value) return
  try {
    await quotesService.sendQuote(quote.value.id)
    loadQuote() // Recharger pour mettre à jour le statut
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error)
  }
}

const acceptQuote = async () => {
  if (!quote.value) return
  try {
    await quotesService.acceptQuote(quote.value.id)
    loadQuote() // Recharger pour mettre à jour
  } catch (error) {
    console.error('Erreur lors de l\'acceptation:', error)
  }
}

const rejectQuote = async () => {
  if (!quote.value) return
  try {
    await quotesService.rejectQuote(quote.value.id)
    loadQuote() // Recharger pour mettre à jour
  } catch (error) {
    console.error('Erreur lors du rejet:', error)
  }
}

const convertToInvoice = async () => {
  if (!quote.value) return
  try {
    const response = await quotesService.convertToInvoice(quote.value.id)
    // Rediriger vers la facture créée
    router.push(`/factures/${response.data.invoiceId}`)
  } catch (error) {
    console.error('Erreur lors de la conversion:', error)
  }
}

const extendValidity = async () => {
  if (!quote.value) return
  try {
    const newValidUntil = new Date()
    newValidUntil.setDate(newValidUntil.getDate() + 30) // +30 jours
    await quotesService.extendQuoteValidity(quote.value.id, {
      validUntil: newValidUntil.toISOString(),
      notifyClient: true
    })
    loadQuote() // Recharger pour mettre à jour
  } catch (error) {
    console.error('Erreur lors de la prolongation:', error)
  }
}

// Utilitaires
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getDaysExpired = () => {
  if (!quote.value) return 0
  const today = new Date()
  const validUntil = new Date(quote.value.validUntil)
  const diffTime = today.getTime() - validUntil.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getDaysUntilExpiry = () => {
  if (!quote.value) return 0
  const today = new Date()
  const validUntil = new Date(quote.value.validUntil)
  const diffTime = validUntil.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Lifecycle
onMounted(() => {
  loadQuote()
})
</script>
