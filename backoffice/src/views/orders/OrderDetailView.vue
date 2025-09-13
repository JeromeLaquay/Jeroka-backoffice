<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-start">
      <div class="flex items-center space-x-4">
        <router-link
          to="/commandes"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Commande {{ order?.orderNumber }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créée le {{ formatDate(order?.createdAt) }} à {{ formatTime(order?.createdAt) }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center space-x-3">
        <OrderStatusBadge v-if="order" :status="order.status" />
        
        <div class="flex space-x-2">
          <router-link
            :to="`/commandes/${order?.id}/edit`"
            class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <PencilIcon class="h-4 w-4 mr-2" />
            Modifier
          </router-link>
          
          <button
            @click="showStatusModal = true"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowPathIcon class="h-4 w-4 mr-2" />
            Changer statut
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Colonne principale -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informations client -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Informations client
          </h3>
          
          <div class="flex items-center space-x-4">
            <img
              :src="order.client.avatar"
              :alt="order.client.name"
              class="h-12 w-12 rounded-full"
            />
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                {{ order.client.name }}
              </h4>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ order.client.email }}
              </p>
              <p v-if="order.client.phone" class="text-sm text-gray-500 dark:text-gray-400">
                {{ order.client.phone }}
              </p>
            </div>
          </div>
        </div>

        <!-- Articles commandés -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Articles commandés
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
                <tr v-for="item in order.items" :key="item.id">
                  <td class="px-6 py-4">
                    <div class="flex items-center space-x-3">
                      <img
                        v-if="item.product?.image"
                        :src="item.product.image"
                        :alt="item.description"
                        class="h-10 w-10 rounded object-cover"
                      />
                      <div class="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center" v-else>
                        <CubeIcon class="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {{ item.description }}
                        </div>
                        <div v-if="item.product?.sku" class="text-sm text-gray-500 dark:text-gray-400">
                          SKU: {{ item.product.sku }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center text-sm text-gray-900 dark:text-gray-100">
                    {{ item.quantity }}
                  </td>
                  <td class="px-6 py-4 text-right text-sm text-gray-900 dark:text-gray-100">
                    {{ formatCurrency(item.unitPrice) }}
                    <div v-if="item.discountPercent > 0" class="text-xs text-red-600">
                      -{{ item.discountPercent }}%
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ formatCurrency(item.totalHt) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Adresses -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Adresse de livraison -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div class="flex items-center mb-4">
              <TruckIcon class="h-5 w-5 text-gray-400 mr-2" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Adresse de livraison
              </h3>
            </div>
            
            <div v-if="order.shippingAddress" class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>{{ order.shippingAddress.line1 }}</p>
              <p v-if="order.shippingAddress.line2">{{ order.shippingAddress.line2 }}</p>
              <p>{{ order.shippingAddress.postalCode }} {{ order.shippingAddress.city }}</p>
              <p>{{ order.shippingAddress.country }}</p>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
              Aucune adresse de livraison
            </p>
          </div>

          <!-- Adresse de facturation -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div class="flex items-center mb-4">
              <DocumentTextIcon class="h-5 w-5 text-gray-400 mr-2" />
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Adresse de facturation
              </h3>
            </div>
            
            <div v-if="order.billingAddress" class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <p>{{ order.billingAddress.line1 }}</p>
              <p v-if="order.billingAddress.line2">{{ order.billingAddress.line2 }}</p>
              <p>{{ order.billingAddress.postalCode }} {{ order.billingAddress.city }}</p>
              <p>{{ order.billingAddress.country }}</p>
            </div>
            <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
              Identique à l'adresse de livraison
            </p>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="order.notes" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Notes
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ order.notes }}
          </p>
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
              <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(order.subtotalHt) }}</span>
            </div>
            
            <div v-if="order.discountAmount > 0" class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Remise</span>
              <span class="text-red-600">-{{ formatCurrency(order.discountAmount) }}</span>
            </div>
            
            <div v-if="order.shippingAmount > 0" class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">Livraison</span>
              <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(order.shippingAmount) }}</span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-400">TVA</span>
              <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(order.taxAmount) }}</span>
            </div>
            
            <div class="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div class="flex justify-between">
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">Total TTC</span>
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(order.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations de commande -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Statut de paiement</h4>
            <PaymentStatusBadge :status="order.paymentStatus" />
          </div>

          <div v-if="order.paymentMethod">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Méthode de paiement</h4>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ getPaymentMethodLabel(order.paymentMethod) }}</p>
          </div>

          <div v-if="order.trackingNumber">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de suivi</h4>
            <p class="text-sm font-mono text-gray-900 dark:text-gray-100">{{ order.trackingNumber }}</p>
          </div>

          <div v-if="order.shippedAt">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Date d'expédition</h4>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(order.shippedAt) }}</p>
          </div>

          <div v-if="order.deliveredAt">
            <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">Date de livraison</h4>
            <p class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(order.deliveredAt) }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-3">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Actions
          </h3>
          
          <button
            @click="generateInvoice"
            :disabled="actionLoading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            <DocumentTextIcon class="h-4 w-4 mr-2" />
            Générer facture
          </button>
          
          <button
            @click="sendConfirmation"
            :disabled="actionLoading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <EnvelopeIcon class="h-4 w-4 mr-2" />
            Envoyer confirmation
          </button>
          
          <button
            v-if="order.status === 'shipped' && order.trackingNumber"
            @click="sendShippingNotification"
            :disabled="actionLoading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            <TruckIcon class="h-4 w-4 mr-2" />
            Notifier expédition
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de changement de statut -->
  <StatusChangeModal
    :show="showStatusModal"
    :current-status="order?.status"
    @update="updateStatus"
    @cancel="showStatusModal = false"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  PencilIcon,
  ArrowPathIcon,
  TruckIcon,
  DocumentTextIcon,
  CubeIcon,
  EnvelopeIcon
} from '@heroicons/vue/24/outline'
import OrderStatusBadge from '../../components/orders/OrderStatusBadge.vue'
import PaymentStatusBadge from '../../components/orders/PaymentStatusBadge.vue'
import StatusChangeModal from '../../components/orders/StatusChangeModal.vue'
import { ordersService, type Order } from '../../services/orders'

const route = useRoute()
const router = useRouter()

// État
const loading = ref(false)
const actionLoading = ref(false)
const order = ref<Order | null>(null)
const showStatusModal = ref(false)

// Méthodes
const loadOrder = async () => {
  try {
    loading.value = true
    const response = await ordersService.getOrder(route.params.id as string)
    order.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement de la commande:', error)
    router.push('/commandes')
  } finally {
    loading.value = false
  }
}

const updateStatus = async (newStatus: string) => {
  try {
    actionLoading.value = true
    await ordersService.updateOrderStatus(order.value!.id, newStatus)
    await loadOrder() // Recharger pour mettre à jour
    showStatusModal.value = false
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
  } finally {
    actionLoading.value = false
  }
}

const generateInvoice = async () => {
  try {
    actionLoading.value = true
    await ordersService.generateInvoice(order.value!.id)
    // Recharger ou afficher un message de succès
  } catch (error) {
    console.error('Erreur lors de la génération de la facture:', error)
  } finally {
    actionLoading.value = false
  }
}

const sendConfirmation = async () => {
  try {
    actionLoading.value = true
    await ordersService.sendOrderConfirmation(order.value!.id)
    // Afficher un message de succès
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la confirmation:', error)
  } finally {
    actionLoading.value = false
  }
}

const sendShippingNotification = async () => {
  try {
    actionLoading.value = true
    await ordersService.sendShippingNotification(order.value!.id)
    // Afficher un message de succès
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error)
  } finally {
    actionLoading.value = false
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

const formatTime = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
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
  loadOrder()
})
</script>
