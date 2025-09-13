<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-start">
      <div class="flex items-center space-x-4">
        <router-link
          to="/factures"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Facture {{ invoice?.invoiceNumber }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Émise le {{ formatDate(invoice?.issueDate) }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <InvoiceStatusBadge v-if="invoice" :status="invoice.status" />
        
        <div class="flex space-x-2">
          <button
            @click="downloadPdf"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ArrowDownTrayIcon class="h-4 w-4 mr-2" />
            PDF
          </button>
          
          <button
            @click="sendInvoice"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <EnvelopeIcon class="h-4 w-4 mr-2" />
            Envoyer
          </button>
          
          <router-link
            :to="`/factures/${invoice?.id}/edit`"
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

    <div v-else-if="invoice" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informations client -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Informations client
          </h3>
          
          <div class="flex items-center space-x-4">
            <img
              :src="invoice.client.avatar"
              :alt="invoice.client.name"
              class="h-12 w-12 rounded-full"
            />
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ invoice.client.name }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ invoice.client.email }}
              </p>
              <p v-if="invoice.client.phone" class="text-sm text-gray-500 dark:text-gray-400">
                {{ invoice.client.phone }}
              </p>
            </div>
          </div>
        </div>

        <!-- Articles facturés -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Articles facturés
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
                <tr v-for="item in invoice.items" :key="item.id">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ item.description }}
                    </div>
                    <div v-if="item.discountPercent > 0" class="text-sm text-red-600">
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
              <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(invoice.subtotalHt) }}</span>
            </div>
            
            <div v-if="invoice.discountAmount > 0" class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Remise</span>
              <span class="text-red-600">-{{ formatCurrency(invoice.discountAmount) }}</span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">TVA</span>
              <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(invoice.taxAmount) }}</span>
            </div>
            
            <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div class="flex justify-between">
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">Total TTC</span>
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(invoice.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations de facturation -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Date d'échéance</h4>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(invoice.dueDate) }}</p>
            <p v-if="isOverdue" class="text-xs text-red-600">
              {{ getDaysOverdue() }} jours de retard
            </p>
          </div>

          <div v-if="invoice.paymentMethod">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Méthode de paiement</h4>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ getPaymentMethodLabel(invoice.paymentMethod) }}</p>
          </div>

          <div v-if="invoice.paidDate">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Date de paiement</h4>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(invoice.paidDate) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Actions
          </h3>
          
          <button
            v-if="invoice.status !== 'paid'"
            @click="markAsPaid"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
          >
            <CheckIcon class="h-4 w-4 mr-2" />
            Marquer comme payée
          </button>
          
          <button
            @click="sendReminder"
            v-if="invoice.status === 'sent' && isOverdue"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <ExclamationTriangleIcon class="h-4 w-4 mr-2" />
            Envoyer rappel
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
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'
import InvoiceStatusBadge from '../../components/invoices/InvoiceStatusBadge.vue'
import { invoiceService, type Invoice } from '../../services/invoices.ts'

const route = useRoute()
const router = useRouter()

// État
const loading = ref(false)
const invoice = ref<Invoice | null>(null)

// Computed
const isOverdue = computed(() => {
  if (!invoice.value || invoice.value.status === 'paid') return false
  return new Date(invoice.value.dueDate) < new Date()
})

// Méthodes
const loadInvoice = async () => {
  try {
    loading.value = true
    const response = await invoiceService.getInvoice(route.params.id as string)
    invoice.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement de la facture:', error)
    router.push('/factures')
  } finally {
    loading.value = false
  }
}

const downloadPdf = async () => {
  if (!invoice.value) return
  try {
    const blob = await invoiceService.downloadInvoicePdf(invoice.value.id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `facture-${invoice.value.invoiceNumber}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
  }
}

const sendInvoice = async () => {
  if (!invoice.value) return
  try {
    await invoiceService.sendInvoice(invoice.value.id)
    loadInvoice() // Recharger pour mettre à jour le statut
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error)
  }
}

const markAsPaid = async () => {
  if (!invoice.value) return
  try {
    await invoiceService.markInvoiceAsPaid(invoice.value.id)
    loadInvoice() // Recharger pour mettre à jour
  } catch (error) {
    console.error('Erreur lors du marquage:', error)
  }
}

const sendReminder = async () => {
  if (!invoice.value) return
  try {
    await invoiceService.sendPaymentReminder(invoice.value.id)
    // Afficher un message de succès
  } catch (error) {
    console.error('Erreur lors de l\'envoi du rappel:', error)
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

const getDaysOverdue = () => {
  if (!invoice.value) return 0
  const today = new Date()
  const dueDate = new Date(invoice.value.dueDate)
  const diffTime = today.getTime() - dueDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    credit_card: 'Carte bancaire',
    bank_transfer: 'Virement bancaire',
    paypal: 'PayPal',
    cash: 'Espèces',
    check: 'Chèque'
  }
  return labels[method] || method
}

// Lifecycle
onMounted(() => {
  loadInvoice()
})
</script>
