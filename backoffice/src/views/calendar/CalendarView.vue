<template>
  <div class="calendar-view">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestion du Calendrier</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">Configurez vos disponibilités et gérez vos rendez-vous</p>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <nav class="flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Disponibilités -->
      <div v-if="activeTab === 'availability'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Règles de Disponibilité</h2>
          <button
            @click="showAddAvailabilityModal = true"
            class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon class="w-4 h-4 inline mr-2" />
            Ajouter une règle
          </button>
        </div>

        <!-- Liste des règles de disponibilité -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Règles configurées</h3>
          </div>
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="rule in availabilityRules"
              :key="rule.id"
              class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <CalendarIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ getDayName(rule.dayOfWeek) }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ rule.startTime }} - {{ rule.endTime }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    rule.isActive
                      ? 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
                      : 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200'
                  ]"
                >
                  {{ rule.isActive ? 'Actif' : 'Inactif' }}
                </span>
                <button
                  @click="editAvailabilityRule(rule)"
                  class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="deleteAvailabilityRule(rule.id)"
                  class="text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rendez-vous -->
      <div v-if="activeTab === 'appointments'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Rendez-vous</h2>
          <div class="flex space-x-2">
            <input
              v-model="appointmentDateFilter"
              type="date"
              class="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2"
            />
            <button
              @click="refreshAppointments"
              class="bg-secondary-600 text-white px-4 py-2 rounded-lg hover:bg-secondary-700 transition-colors"
            >
              <ArrowPathIcon class="w-4 h-4 inline mr-2" />
              Actualiser
            </button>
          </div>
        </div>

        <!-- Liste des rendez-vous -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Rendez-vous à venir</h3>
          </div>
          <div class="divide-y divide-gray-200 dark:divide-gray-700">
            <div
              v-for="appointment in filteredAppointments"
              :key="appointment.id"
              class="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div class="flex items-center space-x-4">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
                    <UserIcon class="w-5 h-5 text-success-600 dark:text-success-400" />
                  </div>
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {{ appointment.clientName }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ formatDate(appointment.date) }} - {{ appointment.startTime }} - {{ appointment.endTime }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ appointment.clientEmail }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button
                  @click="editAppointment(appointment)"
                  class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="deleteAppointment(appointment.id)"
                  class="text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Synchronisation Google -->
      <div v-if="activeTab === 'google'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Synchronisation Google Calendar</h2>
          <button
            @click="syncWithGoogle"
            :disabled="isSyncing"
            class="bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon :class="['w-4 h-4 inline mr-2', isSyncing ? 'animate-spin' : '']" />
            {{ isSyncing ? 'Synchronisation...' : 'Synchroniser' }}
          </button>
        </div>

        <!-- Statut de synchronisation -->
        <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <CalendarIcon class="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Google Calendar</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Dernière synchronisation: {{ lastSyncDate || 'Jamais' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddAvailabilityModal
      v-if="showAddAvailabilityModal"
      @close="showAddAvailabilityModal = false"
      @save="handleAddAvailability"
    />

    <EditAvailabilityModal
      v-if="showEditAvailabilityModal"
      :rule="selectedAvailabilityRule"
      @close="showEditAvailabilityModal = false"
      @save="handleEditAvailability"
    />

    <EditAppointmentModal
      v-if="showEditAppointmentModal"
      :appointment="selectedAppointment"
      @close="showEditAppointmentModal = false"
      @save="handleEditAppointment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, 
  CalendarIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  UserIcon 
} from '@heroicons/vue/24/outline'
import AddAvailabilityModal from './components/calendar/AddAvailabilityModal.vue'
import EditAvailabilityModal from './components/calendar/EditAvailabilityModal.vue'
import EditAppointmentModal from './components/calendar/EditAppointmentModal.vue'
import { useCalendarStore } from './stores/calendar'

// Store
const calendarStore = useCalendarStore()

// State
const activeTab = ref('availability')
const showAddAvailabilityModal = ref(false)
const showEditAvailabilityModal = ref(false)
const showEditAppointmentModal = ref(false)
const selectedAvailabilityRule = ref(null)
const selectedAppointment = ref(null)
const appointmentDateFilter = ref('')
const isSyncing = ref(false)
const lastSyncDate = ref(null)

// Tabs
const tabs = [
  { id: 'availability', name: 'Disponibilités' },
  { id: 'appointments', name: 'Rendez-vous' },
  { id: 'google', name: 'Google Calendar' }
]

// Computed
const availabilityRules = computed(() => calendarStore.availabilityRules)
const appointments = computed(() => calendarStore.appointments)

const filteredAppointments = computed(() => {
  if (!appointmentDateFilter.value) return appointments.value
  
  return appointments.value.filter(appointment => 
    appointment.date === appointmentDateFilter.value
  )
})

// Methods
const getDayName = (dayOfWeek: number) => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  return days[dayOfWeek]
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const editAvailabilityRule = (rule: any) => {
  selectedAvailabilityRule.value = rule
  showEditAvailabilityModal.value = true
}

const deleteAvailabilityRule = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette règle de disponibilité ?')) {
    await calendarStore.deleteAvailabilityRule(id)
  }
}

const editAppointment = (appointment: any) => {
  selectedAppointment.value = appointment
  showEditAppointmentModal.value = true
}

const deleteAppointment = async (id: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
    await calendarStore.deleteAppointment(id)
  }
}

const refreshAppointments = async () => {
  await calendarStore.fetchAppointments()
}

const syncWithGoogle = async () => {
  isSyncing.value = true
  try {
    await calendarStore.syncWithGoogle()
    lastSyncDate.value = new Date().toLocaleString('fr-FR')
  } catch (error) {
    console.error('Erreur lors de la synchronisation:', error)
  } finally {
    isSyncing.value = false
  }
}

const handleAddAvailability = async (rule: any) => {
  await calendarStore.addAvailabilityRule(rule)
  showAddAvailabilityModal.value = false
}

const handleEditAvailability = async (rule: any) => {
  await calendarStore.updateAvailabilityRule(rule)
  showEditAvailabilityModal.value = false
}

const handleEditAppointment = async (appointment: any) => {
  await calendarStore.updateAppointment(appointment)
  showEditAppointmentModal.value = false
}

// Lifecycle
onMounted(async () => {
  await calendarStore.fetchAvailabilityRules()
  await calendarStore.fetchAppointments()
})
</script>

<style scoped>
.calendar-view {
  @apply p-6 bg-gray-50 dark:bg-gray-900 min-h-screen;
}

.tab-content {
  @apply min-h-96;
}

/* Transitions pour les changements de thème */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
</style>
