<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <router-link
          to="/devis"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon class="h-6 w-6" />
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {{ isEdit ? 'Modifier le devis' : 'Nouveau devis' }}
          </h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ isEdit ? `Modification du devis ${quote?.quote_number}` : 'Créez une nouvelle proposition commerciale' }}
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
          form="quote-form"
          :disabled="loading || !isFormValid"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="mr-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </span>
          {{ isEdit ? 'Mettre à jour' : 'Créer le devis' }}
        </button>
      </div>
    </div>

    <form id="quote-form" @submit.prevent="handleSubmit" class="space-y-6">
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
                  Numéro de devis
                </label>
                <input
                  v-model="form.quoteNumber"
                  type="text"
                  readonly
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm sm:text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'émission *
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
                  Durée de validité
                </label>
                <select
                  v-model="form.validityDays"
                  class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  @change="updateValidUntil"
                >
                  <option :value="15">15 jours</option>
                  <option :value="30">30 jours</option>
                  <option :value="45">45 jours</option>
                  <option :value="60">60 jours</option>
                  <option :value="90">90 jours</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valide jusqu'au
                </label>
                <input
                  v-model="form.validUntil"
                  type="date"
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

          <!-- Articles du devis -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
                Articles
              </h3>
              <button
                type="button"
                @click="addQuoteItem"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800"
              >
                <PlusIcon class="h-4 w-4 mr-2" />
                Ajouter un article
              </button>
            </div>

            <div v-if="form.items.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
              <ClipboardDocumentListIcon class="mx-auto h-12 w-12 mb-4" />
              <p>Aucun article ajouté</p>
              <p class="text-sm">Cliquez sur "Ajouter un article" pour commencer</p>
            </div>

            <div v-else class="space-y-4">
              <QuoteItemRow
                v-for="(item, index) in form.items"
                :key="index"
                :item="item"
                :index="index"
                @update="updateQuoteItem"
                @remove="removeQuoteItem"
              />
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Résumé du devis -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Résumé
            </h3>
            
            <QuoteSummary
              :items="form.items"
              :discount-amount="form.discountAmount"
              @update-discount="form.discountAmount = $event"
            />
          </div>

          <!-- Statut et paramètres -->
          <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut du devis
              </label>
              <select
                v-model="form.status"
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Rejeté</option>
                <option value="expired">Expiré</option>
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
                placeholder="Notes sur le devis..."
                class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conditions générales
              </label>
              <textarea
                v-model="form.termsAndConditions"
                rows="4"
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
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  PlusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/vue/24/outline'
import ClientSelector from '../../components/orders/ClientSelector.vue'
import QuoteItemRow from '../../components/quotes/QuoteItemRow.vue'
import QuoteSummary from '../../components/quotes/QuoteSummary.vue'
import { quoteService, type CreateQuoteRequest, type Quote } from '../../services/quotes'
import { clientsService } from '../../services/persons'

const route = useRoute()
const router = useRouter()

// État
const loading = ref(false)
const quote = ref<Quote | null>(null)
const selectedClient = ref<any>(null)
const clients = ref<any[]>([])

const isEdit = computed(() => !!route.params.id)

const form = reactive<CreateQuoteRequest & any>({
  quoteNumber: '',
  clientId: '',
  items: [],
  status: 'draft',
  issueDate: new Date().toISOString().split('T')[0],
  validityDays: 30,
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
         form.validUntil
})

// Méthodes
const loadQuote = async () => {
  if (!isEdit.value) return

  try {
    loading.value = true
    const response = await quoteService.getQuote(route.params.id as string)
    quote.value = response.data || null
    
    // Pré-remplir le formulaire
    if (quote.value) {
      Object.assign(form, {
        quoteNumber: quote.value.quote_number,
        clientId: quote.value.client_id,
        items: quote.value.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          vatRate: item.vatRate || 20
        })),
        status: quote.value.status,
        issueDate: quote.value.issue_date.split('T')[0],
        validUntil: quote.value.valid_until.split('T')[0],
        notes: quote.value.notes || ''
      })

      // Trouver le client correspondant dans la liste
      const client = clients.value.find(c => c.id === quote.value?.client_id)
      selectedClient.value = client || null
    }
  } catch (error) {
    console.error('Erreur lors du chargement du devis:', error)
  } finally {
    loading.value = false
  }
}

const generateQuoteNumber = async () => {
  try {
    const quoteNumber = await quoteService.generateQuoteNumber()
    form.quoteNumber = quoteNumber
  } catch (error) {
    console.error('Erreur lors de la génération du numéro:', error)
    // Fallback
    form.quoteNumber = `DEV-${Date.now()}`
  }
}

const onClientSelected = (client: any) => {
  selectedClient.value = client
  form.clientId = client.id
}

const addQuoteItem = () => {
  form.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    vatRate: 20
  })
}

const updateQuoteItem = (index: number, item: any) => {
  form.items[index] = item
}

const removeQuoteItem = (index: number) => {
  form.items.splice(index, 1)
}

const updateValidUntil = () => {
  if (form.issueDate && form.validityDays && !isNaN(form.validityDays)) {
    const issueDate = new Date(form.issueDate)
    if (!isNaN(issueDate.getTime())) {
      const validUntil = new Date(issueDate.getTime() + (form.validityDays * 24 * 60 * 60 * 1000))
      form.validUntil = validUntil.toISOString().split('T')[0]
    }
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    loading.value = true

    if (isEdit.value) {
      const response = await quoteService.updateQuote(route.params.id as string, {
        client_id: form.clientId,
        items: form.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          vatRate: item.vatRate || 20
        })),
        valid_until: form.validUntil,
        notes: form.notes,
        status: form.status
      })
      
      if (response.success) {
        router.push('/devis')
      }
    } else {
      const response = await quoteService.createQuote({
        client_id: form.clientId,
        items: form.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent || 0,
          vatRate: item.vatRate || 20
        })),
        valid_until: form.validUntil,
        notes: form.notes
      })
      
      if (response.success) {
        router.push('/devis')
      }
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
  } finally {
    loading.value = false
  }
}
// Méthodes
const loadClients = async () => {
  try {
    const response = await clientsService.getClients({ type: 'client' })
    if (response.success && response.data && Array.isArray(response.data)) {
      // Mapper les clients pour correspondre à l'interface attendue par ClientSelector
      clients.value = response.data.map((client: any) => ({
        ...client,
        avatar_url: client.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(client.name)}&background=a855f7&color=fff`
      }))
    }
  } catch (error) {
    console.error('Erreur lors du chargement des clients:', error)
  }
}

// Watchers
watch([() => form.issueDate, () => form.validityDays], updateValidUntil)

// Lifecycle
onMounted(() => {
  if (isEdit.value) {
    loadQuote()
  } else {
    generateQuoteNumber()
    updateValidUntil()
    loadClients()
  }
})
</script>
