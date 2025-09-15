<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <router-link
          to="/factures"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ isEdit ? 'Modifier la facture' : 'Nouvelle facture' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ isEdit ? `Modification de la facture ${invoice?.invoice_number}` : 'Créez une nouvelle facture pour un client' }}
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
          form="invoice-form"
          :disabled="loading || !isFormValid"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="mr-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </span>
          {{ isEdit ? 'Mettre à jour' : 'Créer la facture' }}
        </button>
      </div>
    </div>

    <form id="invoice-form" @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Colonne principale -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Informations générales -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Informations générales
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro de facture
                </label>
                <input
                  v-model="form.invoiceNumber"
                  type="text"
                  readonly
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commande liée
                </label>
                <select
                  v-model="form.orderId"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  @change="onOrderSelected"
                >
                  <option value="">Aucune commande</option>
                  <option v-for="order in availableOrders" :key="order.id" :value="order.id">
                    {{ order.orderNumber }} - {{ order.client.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de facture *
                </label>
                <input
                  v-model="form.issueDate"
                  type="date"
                  required
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'échéance *
                </label>
                <input
                  v-model="form.dueDate"
                  type="date"
                  required
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Sélection du client -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Client
            </h3>
            
            <ClientSelector
              v-model="form.clientId"
              :selected-client="selectedClient"
              :clients="clients"
              @client-selected="onClientSelected"
              :required="true"
            />

            <!-- Informations du client sélectionné -->
            <div v-if="selectedClient" class="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div class="flex items-center space-x-3">
                <img
                  :src="selectedClient.avatar"
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

          <!-- Articles de la facture -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Articles
              </h3>
              <button
                type="button"
                @click="addInvoiceItem"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Ajouter un article
              </button>
            </div>

            <div v-if="form.items.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              <DocumentTextIcon class="mx-auto h-12 w-12 mb-4" />
              <p>Aucun article ajouté</p>
              <p class="text-sm">Cliquez sur "Ajouter un article" pour commencer</p>
            </div>

            <div v-else class="space-y-4">
              <InvoiceItemRow
                v-for="(item, index) in form.items"
                :key="index"
                :item="item"
                :index="index"
                @update="updateInvoiceItem"
                @remove="removeInvoiceItem"
              />
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Résumé de la facture -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Résumé
            </h3>
            
            <InvoiceSummary
              :items="form.items"
              :discount-amount="form.discountAmount"
              @update-discount="form.discountAmount = $event"
            />
          </div>

          <!-- Statut et paramètres -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut de la facture
              </label>
              <select
                v-model="form.status"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyée</option>
                <option value="paid">Payée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conditions de paiement
              </label>
              <select
                v-model="form.paymentTerms"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                @change="updateDueDate"
              >
                <option :value="0">Immédiat</option>
                <option :value="15">15 jours</option>
                <option :value="30">30 jours</option>
                <option :value="45">45 jours</option>
                <option :value="60">60 jours</option>
              </select>
            </div>
          </div>

          <!-- Notes -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes internes
              </label>
              <textarea
                v-model="form.notes"
                rows="3"
                placeholder="Notes sur la facture..."
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conditions générales
              </label>
              <textarea
                v-model="form.termsAndConditions"
                rows="3"
                placeholder="Conditions générales de vente..."
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  PlusIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import ClientSelector from '../../components/orders/ClientSelector.vue'
import InvoiceItemRow from '../../components/invoices/InvoiceItemRow.vue'
import InvoiceSummary from '../../components/invoices/InvoiceSummary.vue'
import { invoiceService, type CreateInvoiceRequest, type Invoice } from '../../services/invoices'
import { clientsService } from '../../services/clients'

const route = useRoute()
const router = useRouter()

// État
const loading = ref(false)
const invoice = ref<Invoice | null>(null)
const selectedClient = ref<any>(null)
const availableOrders = ref<any[]>([])
const clients = ref<any[]>([])

const isEdit = computed(() => !!route.params.id)

const form = reactive<CreateInvoiceRequest & any>({
  invoiceNumber: '',
  orderId: '',
  clientId: '',
  items: [],
  status: 'draft',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  paymentTerms: 30,
  discountAmount: 0,
  notes: '',
  termsAndConditions: ''
})

// Computed
const isFormValid = computed(() => {
  return form.clientId && 
         form.items.length > 0 && 
         form.items.every((item: any) => item.description && item.quantity > 0 && item.unitPrice >= 0) &&
         form.issueDate &&
         form.dueDate
})

// Méthodes
const loadClients = async () => {
  try {
    const response = await clientsService.getClients({ limit: 100 })
    if (response.success && response.data) {
      // Mapper les clients pour correspondre à l'interface attendue par ClientSelector
      clients.value = response.data.clients.map((client: any) => ({
        ...client,
        avatar_url: client.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=a855f7&color=fff`
      }))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des clients:', error)
  }
}

const loadInvoice = async () => {
  if (!isEdit.value) return

  try {
    loading.value = true
    const response = await invoiceService.getInvoice(route.params.id as string)
    invoice.value = response.data || null
    
    // Vérifier que la facture existe
    if (!invoice.value) {
      throw new Error('Facture non trouvée')
    }
    
    // Pré-remplir le formulaire
    Object.assign(form, {
      invoiceNumber: invoice.value.invoice_number,
      orderId: '',
      clientId: invoice.value.client_id,
      items: invoice.value.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        discountPercent: item.discount_percent || 0,
        vatRate: item.vat_rate || 20
      })),
      status: invoice.value.status,
      issueDate: invoice.value.issue_date.split('T')[0],
      dueDate: invoice.value.due_date.split('T')[0],
      paymentTerms: 30,
      notes: invoice.value.notes || '',
      termsAndConditions: ''
    })

    selectedClient.value = { id: invoice.value.client_id, name: invoice.value.client_name }
  } catch (error) {
    console.error('Erreur lors du chargement de la facture:', error)
  } finally {
    loading.value = false
  }
}

const generateInvoiceNumber = async () => {
  try {
    const response = await invoiceService.getNextInvoiceNumber()
    form.invoiceNumber = response.data?.invoiceNumber || `FAC-${Date.now()}`
  } catch (error) {
    console.error('Erreur lors de la génération du numéro:', error)
    // Fallback
    form.invoiceNumber = `FAC-${Date.now()}`
  }
}

const onClientSelected = (client: any) => {
  selectedClient.value = client
  form.clientId = client.id
}

const onOrderSelected = () => {
  if (form.orderId) {
    // Charger les détails de la commande et pré-remplir les articles
    // Implementation dépendante de l'API
  }
}

const addInvoiceItem = () => {
  form.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    vatRate: 20
  })
}

const updateInvoiceItem = (index: number, item: any) => {
  form.items[index] = item
}

const removeInvoiceItem = (index: number) => {
  form.items.splice(index, 1)
}

const updateDueDate = () => {
  if (form.issueDate && form.paymentTerms) {
    const issueDate = new Date(form.issueDate)
    const dueDate = new Date(issueDate.getTime() + (form.paymentTerms * 24 * 60 * 60 * 1000))
    form.dueDate = dueDate.toISOString().split('T')[0]
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    loading.value = true

    const invoiceData = {
      client_id: form.clientId,
      items: form.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent,
        vat_rate: item.vatRate
      })),
      due_date: form.dueDate,
      notes: form.notes,
      status: form.status || 'draft'
    }

    if (isEdit.value) {
      await invoiceService.updateInvoice(route.params.id as string, invoiceData)
    } else {
      await invoiceService.createInvoice(invoiceData)
    }

    router.push('/factures')
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadClients() // Charger les clients dans tous les cas
  if (isEdit.value) {
    loadInvoice()
  } else {
    generateInvoiceNumber()
    updateDueDate()
  }
})
</script>