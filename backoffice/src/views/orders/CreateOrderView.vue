<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <router-link
          to="/commandes"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ isEdit ? 'Modifier la commande' : 'Nouvelle commande' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ isEdit ? `Modification de la commande ${order?.orderNumber}` : 'Créez une nouvelle commande pour un client' }}
          </p>
        </div>
      </div>
      
      <div class="flex space-x-3">
        <button
          type="button"
          @click="$router.go(-1)"
          class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          type="submit"
          form="order-form"
          :disabled="loading || !isFormValid"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="mr-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </span>
          {{ isEdit ? 'Mettre à jour' : 'Créer la commande' }}
        </button>
      </div>
    </div>

    <form id="order-form" @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Sélection du client -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Client
            </h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sélectionner un client *
                </label>
                <ClientSelector
                  v-model="form.clientId"
                  :selected-client="selectedClient"
                  @client-selected="onClientSelected"
                  :required="true"
                />
              </div>

              <!-- Informations du client sélectionné -->
              <div v-if="selectedClient" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div class="flex items-center space-x-3">
                  <img
                    :src="selectedClient.avatar_url"
                    :alt="selectedClient.name"
                    class="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ selectedClient.name }}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      {{ selectedClient.email }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Articles de la commande -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Articles
              </h3>
              <button
                type="button"
                @click="addOrderItem"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Ajouter un article
              </button>
            </div>

            <div v-if="form.items.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              <ShoppingCartIcon class="mx-auto h-12 w-12 mb-4" />
              <p>Aucun article ajouté</p>
              <p class="text-sm">Cliquez sur "Ajouter un article" pour commencer</p>
            </div>

            <div v-else class="space-y-4">
              <OrderItemRow
                v-for="(item, index) in form.items"
                :key="index"
                :item="item"
                :index="index"
                @update="updateOrderItem"
                @remove="removeOrderItem"
              />
            </div>
          </div>

          <!-- Adresses -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Adresse de livraison -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Adresse de livraison
              </h3>
              <AddressForm
                v-model="form.shippingAddress"
                :from-client="selectedClient?.address"
                @copy-from-client="copyShippingFromClient"
              />
            </div>

            <!-- Adresse de facturation -->
            <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Adresse de facturation
              </h3>
              <div class="mb-4">
                <label class="flex items-center">
                  <input
                    v-model="sameAsShipping"
                    type="checkbox"
                    class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Identique à l'adresse de livraison
                  </span>
                </label>
              </div>
              <AddressForm
                v-if="!sameAsShipping"
                v-model="form.billingAddress"
                :from-client="selectedClient?.address"
                @copy-from-client="copyBillingFromClient"
              />
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Résumé de la commande -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Résumé
            </h3>
            
            <OrderSummary
              :items="form.items"
              :shipping-amount="form.shippingAmount"
              :discount-amount="form.discountAmount"
              @update-shipping="form.shippingAmount = $event"
              @update-discount="form.discountAmount = $event"
            />
          </div>

          <!-- Statut et paiement -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut de la commande
              </label>
              <select
                v-model="form.status"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmée</option>
                <option value="processing">En cours</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Méthode de paiement
              </label>
              <select
                v-model="form.paymentMethod"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Sélectionner...</option>
                <option value="credit_card">Carte bancaire</option>
                <option value="bank_transfer">Virement bancaire</option>
                <option value="paypal">PayPal</option>
                <option value="cash">Espèces</option>
                <option value="check">Chèque</option>
              </select>
            </div>

            <div v-if="isEdit">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Numéro de suivi
              </label>
              <input
                v-model="form.trackingNumber"
                type="text"
                placeholder="Numéro de suivi de livraison"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <!-- Notes -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes internes
            </label>
            <textarea
              v-model="form.notes"
              rows="4"
              placeholder="Notes sur la commande..."
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            ></textarea>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  PlusIcon,
  ShoppingCartIcon
} from '@heroicons/vue/24/outline'
import ClientSelector from '../../components/orders/ClientSelector.vue'
import OrderItemRow from '../../components/orders/OrderItemRow.vue'
import AddressForm from '../../components/orders/AddressForm.vue'
import OrderSummary from '../../components/orders/OrderSummary.vue'
import { ordersService, type CreateOrderRequest, type Order } from '../../services/orders'

const route = useRoute()
const router = useRouter()

// État
const loading = ref(false)
const order = ref<Order | null>(null)
const selectedClient = ref<any>(null)
const sameAsShipping = ref(true)

const isEdit = computed(() => !!route.params.id)

const form = reactive<CreateOrderRequest & any>({
  clientId: '',
  items: [],
  status: 'pending',
  paymentMethod: '',
  shippingAddress: {
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'France'
  },
  billingAddress: {
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'France'
  },
  shippingAmount: 0,
  discountAmount: 0,
  notes: '',
  trackingNumber: ''
})

// Computed
const isFormValid = computed(() => {
  return form.clientId && 
         form.items.length > 0 && 
         form.items.every((item: any) => item.description && item.quantity > 0 && item.unitPrice >= 0)
})

// Watchers
watch(sameAsShipping, (value) => {
  if (value) {
    form.billingAddress = { ...form.shippingAddress }
  }
})

watch(() => form.shippingAddress, (value) => {
  if (sameAsShipping.value) {
    form.billingAddress = { ...value }
  }
}, { deep: true })

// Méthodes
const loadOrder = async () => {
  if (!isEdit.value) return

  try {
    loading.value = true
    const response = await ordersService.getOrder(route.params.id as string)
    order.value = response.data
    
    // Vérifier que la commande existe
    if (!order.value) {
      throw new Error('Commande non trouvée')
    }
    
    // Pré-remplir le formulaire
    Object.assign(form, {
      clientId: order.value.clientId,
      items: order.value.items.map(item => ({
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent || 0,
        vatRate: item.vatRate || 20
      })),
      status: order.value.status,
      paymentMethod: order.value.paymentMethod,
      shippingAddress: order.value.shippingAddress || form.shippingAddress,
      billingAddress: order.value.billingAddress || form.billingAddress,
      notes: order.value.notes || '',
      trackingNumber: order.value.trackingNumber || ''
    })

    selectedClient.value = order.value.client
  } catch (error) {
    console.error('Erreur lors du chargement de la commande:', error)
  } finally {
    loading.value = false
  }
}

const onClientSelected = (client: any) => {
  selectedClient.value = client
  form.clientId = client.id
}

const addOrderItem = () => {
  form.items.push({
    productId: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    vatRate: 20
  })
}

const updateOrderItem = (index: number, item: any) => {
  form.items[index] = item
}

const removeOrderItem = (index: number) => {
  form.items.splice(index, 1)
}

const copyShippingFromClient = () => {
  if (selectedClient.value?.address) {
    Object.assign(form.shippingAddress, selectedClient.value.address)
  }
}

const copyBillingFromClient = () => {
  if (selectedClient.value?.address) {
    Object.assign(form.billingAddress, selectedClient.value.address)
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    loading.value = true
    
    const orderData = {
      ...form,
      billingAddress: sameAsShipping.value ? form.shippingAddress : form.billingAddress
    }

    if (isEdit.value) {
      await ordersService.updateOrder(route.params.id as string, orderData)
    } else {
      await ordersService.createOrder(orderData)
    }

    router.push('/commandes')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  if (isEdit.value) {
    loadOrder()
  }
})
</script>
