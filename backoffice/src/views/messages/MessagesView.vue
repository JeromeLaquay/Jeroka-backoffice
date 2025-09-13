<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages de contact</h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les messages reçus via le formulaire de contact
        </p>
      </div>
      <div class="mt-4 sm:mt-0 flex space-x-3">
        <button
          @click="markAllAsRead"
          class="btn-secondary inline-flex items-center"
        >
          <CheckIcon class="h-4 w-4 mr-2" />
          Tout marquer comme lu
        </button>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-4">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <EnvelopeIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total messages
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ messages.length }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ExclamationCircleIcon class="h-6 w-6 text-warning-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Non lus
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ unreadCount }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <DocumentTextIcon class="h-6 w-6 text-success-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Demandes de devis
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ quotesCount }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UserGroupIcon class="h-6 w-6 text-secondary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Partenariats
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ partnershipsCount }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="form-label">Rechercher</label>
          <input
            v-model="searchQuery"
            type="text"
            class="form-input"
            placeholder="Nom, email, sujet..."
          />
        </div>
        <div>
          <label class="form-label">Type</label>
          <select v-model="typeFilter" class="form-input">
            <option value="">Tous les types</option>
            <option value="devis">Demande de devis</option>
            <option value="information">Information</option>
            <option value="partnership">Partenariat</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label class="form-label">Statut</label>
          <select v-model="statusFilter" class="form-input">
            <option value="">Tous les statuts</option>
            <option value="unread">Non lu</option>
            <option value="read">Lu</option>
          </select>
        </div>
        <div>
          <label class="form-label">Date</label>
          <select v-model="dateFilter" class="form-input">
            <option value="">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Liste des messages -->
    <div class="card p-0 overflow-hidden">
      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div 
          v-for="message in filteredMessages" 
          :key="message.id"
          :class="[
            'p-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors',
            message.status === 'new' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
          ]"
          @click="openMessage(message)"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start space-x-4 flex-1 min-w-0">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ getMessageInitials(message) }}
                  </span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ getMessageName(message) }}
                  </p>
                  <span 
                    v-if="message.status === 'new'"
                    class="ml-2 inline-block w-2 h-2 bg-primary-600 rounded-full"
                  ></span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ message.email }}
                </p>
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {{ message.subject }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                  {{ message.message }}
                </p>
              </div>
            </div>
            <div class="flex flex-col items-end space-y-2">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(message.createdAt) }}
              </p>
              <span 
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getMessageType(message) === 'devis' ? 'badge-warning' : 
                  getMessageType(message) === 'information' ? 'badge-info' : 
                  getMessageType(message) === 'partnership' ? 'badge-secondary' : 'badge-success'
                ]"
              >
                {{ getMessageTypeLabel(getMessageType(message)) }}
              </span>
              <div class="flex space-x-2">
                <button
                  @click.stop="toggleRead(message)"
                  class="text-primary-600 hover:text-primary-900 text-xs"
                >
                  {{ message.status === 'new' ? 'Marquer lu' : 'Marquer non lu' }}
                </button>
                <button
                  @click.stop="deleteMessage(message.id)"
                  class="text-danger-600 hover:text-danger-900 text-xs"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="filteredMessages.length === 0" class="text-center py-12">
        <EnvelopeIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          Aucun message trouvé
        </h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ searchQuery || typeFilter || statusFilter ? 'Essayez de modifier vos filtres' : 'Aucun message de contact pour le moment' }}
        </p>
      </div>
    </div>
  </div>

  <!-- Modal de détail du message -->
  <div 
    v-if="selectedMessage" 
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeMessage"
  >
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"></div>
      
      <div 
        class="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
        @click.stop
      >
        <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div class="flex items-start justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
              Message de {{ getMessageName(selectedMessage) }}
            </h3>
            <button
              @click="closeMessage"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Nom</label>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ getMessageName(selectedMessage) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ selectedMessage.email }}</p>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Sujet</label>
              <p class="text-sm text-gray-900 dark:text-gray-100">{{ selectedMessage.subject }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
              <span 
                :class="[
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  getMessageType(selectedMessage) === 'devis' ? 'badge-warning' : 
                  getMessageType(selectedMessage) === 'information' ? 'badge-info' : 
                  getMessageType(selectedMessage) === 'partnership' ? 'badge-secondary' : 'badge-success'
                ]"
              >
                {{ getMessageTypeLabel(getMessageType(selectedMessage)) }}
              </span>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Message</label>
              <div class="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p class="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{{ selectedMessage.message }}</p>
              </div>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-500 dark:text-gray-400">Date de réception</label>
              <p class="text-sm text-gray-900 dark:text-gray-100">{{ formatDate(selectedMessage.createdAt) }}</p>
            </div>
          </div>

          <!-- Bloc Brouillon IA -->
          <div class="mt-6 border-t border-gray-200 dark:border-gray-600 pt-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <svg class="h-4 w-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Brouillon de réponse (IA)
              </h4>
              <div class="flex gap-2">
                <select v-model="aiOptions.tone" class="form-input h-9 text-sm">
                  <option value="professionnel">Professionnel</option>
                  <option value="amical">Amical</option>
                  <option value="formel">Formel</option>
                  <option value="concis">Concis</option>
                </select>
                <select v-model="aiOptions.language" class="form-input h-9 text-sm">
                  <option value="fr">FR</option>
                  <option value="en">EN</option>
                </select>
                <button
                  @click="generateAIDraft(selectedMessage)"
                  :disabled="aiLoading"
                  class="btn-primary text-sm px-3 py-1"
                >
                  <svg v-if="aiLoading" class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ aiLoading ? 'Génération...' : 'Générer IA' }}
                </button>
              </div>
            </div>

            <textarea
              v-model="aiDraft"
              rows="8"
              placeholder="Le brouillon généré par l'IA apparaîtra ici. Vous pouvez le modifier avant envoi."
              class="w-full form-input text-sm"
            ></textarea>

            <div class="mt-3 flex gap-2 justify-end">
              <button
                @click="copyDraftToClipboard"
                class="btn-secondary text-sm px-3 py-1"
                :disabled="!aiDraft"
              >
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copier
              </button>
              <a
                v-if="selectedMessage"
                :href="`mailto:${selectedMessage.email}?subject=${encodeURIComponent('Re: ' + selectedMessage.subject)}&body=${encodeURIComponent(aiDraft)}`"
                class="btn-success text-sm px-3 py-1"
                :class="{ 'pointer-events-none opacity-60': !aiDraft }"
              >
                <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Ouvrir email
              </a>
            </div>
          </div>
        </div>
        
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 sm:px-6 sm:flex sm:flex-row-reverse">
          <button
            v-if="getMessageType(selectedMessage) === 'devis'"
            @click="createQuote(selectedMessage)"
            class="btn-primary mb-3 sm:mb-0 sm:ml-3"
          >
            Créer un devis
          </button>
          <a
            :href="`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}&body=${selectedMessage.response}`"
            class="btn-secondary mb-3 sm:mb-0 sm:ml-3"
          >
            Répondre par email
          </a>
          <button
            @click="closeMessage"
            class="btn-secondary"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  EnvelopeIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  CheckIcon,
  XMarkIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'
import { messagesService, type ContactMessage, type MessageStats } from '../../services/messages'

const router = useRouter()

// État
const loading = ref(false)
const messages = ref<ContactMessage[]>([])
const selectedMessage = ref<ContactMessage | null>(null)
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const dateFilter = ref('')

// État IA
const aiLoading = ref(false)
const aiDraft = ref('')
const aiOptions = ref({ tone: 'professionnel', language: 'fr' })

const stats = ref<MessageStats>({
  total: 0,
  new: 0,
  read: 0,
  replied: 0,
  archived: 0,
  todayCount: 0,
  weekCount: 0,
  monthCount: 0,
  averageResponseTime: 0,
  responseRate: 0
})
const filters = ref({
  search: '',
  status: '',
  priority: '',
  dateFrom: '',
  dateTo: ''
})
const currentPage = ref(1)
const itemsPerPage = 20

// Utilitaires pour les messages
const getMessageName = (message: ContactMessage | null) => {
  if (!message) return 'Inconnu'
  const firstName = message.firstName || ''
  const lastName = message.lastName || ''
  return `${firstName} ${lastName}`.trim() || 'Inconnu'
}

const getMessageInitials = (message: ContactMessage) => {
  if (!message) return '?'
  const firstName = message.firstName || ''
  const lastName = message.lastName || ''
  const firstInitial = firstName.charAt(0).toUpperCase()
  const lastInitial = lastName.charAt(0).toUpperCase()
  return firstInitial + lastInitial || '?'
}

const getMessageType = (message: ContactMessage | null) => {
  if (!message) return 'other'
  
  // Détecter le type basé sur les tags ou le contenu
  if (message.tags?.includes('devis') || message.subject.toLowerCase().includes('devis')) {
    return 'devis'
  }
  if (message.tags?.includes('partnership') || message.subject.toLowerCase().includes('partenariat')) {
    return 'partnership'
  }
  if (message.tags?.includes('information') || message.subject.toLowerCase().includes('information')) {
    return 'information'
  }
  return 'other'
}

const getMessageTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    'devis': 'Demande de devis',
    'information': 'Information',
    'partnership': 'Partenariat',
    'other': 'Autre'
  }
  return labels[type] || type
}

// Méthodes
const loadMessages = async () => {
  loading.value = true
  try {
    const response = await messagesService.getMessages({
      page: currentPage.value,
      limit: itemsPerPage,
      search: searchQuery.value || filters.value.search,
      status: (statusFilter.value as 'new' | 'read' | 'replied' | 'archived') || filters.value.status || undefined,
      priority: (filters.value.priority as 'low' | 'medium' | 'high') || undefined,
      dateFrom: dateFilter.value || filters.value.dateFrom || undefined,
      dateTo: filters.value.dateTo || undefined
    })
    messages.value = response.data.messages || []
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const response = await messagesService.getMessagesStats()
    stats.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
  }
}


const markAllAsRead = async () => {
  try {
    await messagesService.markAllAsRead()
    await loadMessages()
    await loadStats()
  } catch (error) {
    console.error('Erreur lors du marquage global:', error)
  }
}


const deleteMessage = async (messageId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
    try {
      await messagesService.deleteMessage(messageId)
      await loadMessages()
      await loadStats()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

const openMessage = (message: ContactMessage) => {
  selectedMessage.value = message
  // Marquer comme lu si ce n'est pas déjà fait
  if (message.status === 'new') {
    toggleRead(message)
  }
}

const closeMessage = () => {
  selectedMessage.value = null
  aiDraft.value = '' // Reset du brouillon IA
}

const toggleRead = async (message: ContactMessage) => {
  try {
    const newStatus = message.status === 'new' ? 'read' : 'new'
    await messagesService.updateMessageStatus(message.id, { status: newStatus })
    message.status = newStatus
    if (newStatus === 'read' && !message.readAt) {
      message.readAt = new Date().toISOString()
    }
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error)
  }
}

const createQuote = (message: ContactMessage) => {
  // Rediriger vers la création de devis avec les données du message
  router.push({
    name: 'CreateQuote',
    query: {
      clientName: getMessageName(message),
      clientEmail: message.email,
      clientPhone: message.phone || '',
      clientCompany: message.company || '',
      fromMessage: message.id
    }
  })
  closeMessage()
}

// Méthodes IA
const generateAIDraft = async (message: ContactMessage) => {
  aiLoading.value = true
  try {
    // Appel API pour génération IA
    const { data } = await messagesService.generateAIDraft(message.id, {
      tone: aiOptions.value.tone as 'professionnel' | 'amical' | 'formel' | 'concis',
      language: aiOptions.value.language as 'fr' | 'en'
    })
    aiDraft.value = data.draft
    selectedMessage.value!.response = data.draft
    console.log("selectedMessage", selectedMessage.value!.response)
  } catch (e) {
    console.error('Erreur génération IA:', e)
  } finally {
    aiLoading.value = false
  }
}

const copyDraftToClipboard = async () => {
  if (!aiDraft.value) return
  try {
    await navigator.clipboard.writeText(aiDraft.value)
    alert('Brouillon copié dans le presse-papier.')
  } catch {
    alert('Impossible de copier. Sélectionnez et copiez manuellement.')
  }
}

// Computed
const filteredMessages = computed(() => {
  let filtered = [...messages.value]
  
  // Filtrage par recherche
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filtered = filtered.filter(message => 
      getMessageName(message).toLowerCase().includes(search) ||
      message.email.toLowerCase().includes(search) ||
      message.subject.toLowerCase().includes(search) ||
      message.message.toLowerCase().includes(search)
    )
  }
  
  // Filtrage par type (basé sur les tags ou le sujet)
  if (typeFilter.value) {
    filtered = filtered.filter(message => {
      if (typeFilter.value === 'devis') {
        return message.tags?.includes('devis') || message.subject.toLowerCase().includes('devis')
      }
      if (typeFilter.value === 'partnership') {
        return message.tags?.includes('partnership') || message.subject.toLowerCase().includes('partenariat')
      }
      if (typeFilter.value === 'information') {
        return message.tags?.includes('information') || message.subject.toLowerCase().includes('information')
      }
      return true
    })
  }
  
  // Filtrage par statut
  if (statusFilter.value) {
    const status = statusFilter.value === 'unread' ? 'new' : statusFilter.value
    filtered = filtered.filter(message => message.status === status)
  }
  
  return filtered
})

// Statistiques calculées
const unreadCount = computed(() => 
  messages.value.filter(m => m.status === 'new').length
)

const quotesCount = computed(() => 
  messages.value.filter(m => 
    m.tags?.includes('devis') || 
    m.subject.toLowerCase().includes('devis')
  ).length
)

const partnershipsCount = computed(() => 
  messages.value.filter(m => 
    m.tags?.includes('partnership') || 
    m.subject.toLowerCase().includes('partenariat')
  ).length
)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}


// Lifecycle
onMounted(async () => {
  await Promise.all([loadMessages(), loadStats()])
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
