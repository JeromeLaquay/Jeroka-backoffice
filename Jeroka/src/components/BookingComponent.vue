<template>
  <div class="booking-component bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Prendre un rendez-vous</h2>
      <p class="text-gray-600">Sélectionnez un créneau disponible pour votre rendez-vous</p>
    </div>

    <!-- Progress Steps -->
    <div class="mb-8">
      <div class="flex items-center justify-center space-x-4">
        <div 
          v-for="(step, index) in steps" 
          :key="step.id"
          class="flex items-center"
        >
          <div 
            :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              currentStep >= index 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            ]"
          >
            {{ index + 1 }}
          </div>
          <span 
            :class="[
              'ml-2 text-sm font-medium',
              currentStep >= index ? 'text-blue-600' : 'text-gray-500'
            ]"
          >
            {{ step.name }}
          </span>
          <ChevronRightIcon 
            v-if="index < steps.length - 1"
            class="w-4 h-4 text-gray-400 mx-2"
          />
        </div>
      </div>
    </div>

    <!-- Step 1: Date Selection -->
    <div v-if="currentStep === 0" class="space-y-6">
      <h3 class="text-lg font-semibold text-gray-900">Sélectionnez une date</h3>
      
      <!-- Calendar -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        <!-- Days of week -->
        <div 
          v-for="day in daysOfWeek" 
          :key="day"
          class="text-center text-sm font-medium text-gray-500 py-2"
        >
          {{ day }}
        </div>
        
        <!-- Calendar days -->
        <div
          v-for="day in calendarDays"
          :key="day.date"
          @click="selectDate(day.date)"
          :class="[
            'text-center py-2 rounded-lg cursor-pointer transition-colors',
            day.isCurrentMonth 
              ? 'text-gray-900 hover:bg-blue-50' 
              : 'text-gray-400',
            day.isToday 
              ? 'bg-blue-100 text-blue-600' 
              : '',
            selectedDate === day.date 
              ? 'bg-blue-600 text-white' 
              : ''
          ]"
        >
          {{ day.day }}
        </div>
      </div>
      
      <button
        @click="nextStep"
        :disabled="!selectedDate"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuer
      </button>
    </div>

    <!-- Step 2: Time Selection -->
    <div v-if="currentStep === 1" class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Sélectionnez un créneau</h3>
        <button
          @click="prevStep"
          class="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeftIcon class="w-4 h-4 mr-1" />
          Retour
        </button>
      </div>
      
      <div class="text-center text-gray-600 mb-4">
        {{ formatSelectedDate(selectedDate) }}
      </div>
      
      <!-- Time slots -->
      <div v-if="loading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">Chargement des créneaux...</p>
      </div>
      
      <div v-else-if="availableSlots.length === 0" class="text-center py-8">
        <CalendarIcon class="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <p class="text-gray-600">Aucun créneau disponible pour cette date</p>
      </div>
      
      <div v-else class="grid grid-cols-2 gap-3">
        <button
          v-for="slot in availableSlots"
          :key="slot.id"
          @click="selectTimeSlot(slot)"
          :class="[
            'py-3 px-4 rounded-lg border text-center transition-colors',
            selectedTimeSlot?.id === slot.id
              ? 'border-blue-600 bg-blue-50 text-blue-600'
              : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
          ]"
        >
          <div class="font-medium">{{ slot.startTime }}</div>
          <div class="text-sm text-gray-500">{{ slot.endTime }}</div>
        </button>
      </div>
      
      <button
        @click="nextStep"
        :disabled="!selectedTimeSlot"
        class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuer
      </button>
    </div>

    <!-- Step 3: Contact Information -->
    <div v-if="currentStep === 2" class="space-y-6">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900">Vos informations</h3>
        <button
          @click="prevStep"
          class="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <ArrowLeftIcon class="w-4 h-4 mr-1" />
          Retour
        </button>
      </div>
      
      <div class="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 class="font-medium text-blue-900 mb-2">Récapitulatif du rendez-vous</h4>
        <p class="text-blue-800">{{ formatSelectedDate(selectedDate) }}</p>
        <p class="text-blue-800">{{ selectedTimeSlot?.startTime }} - {{ selectedTimeSlot?.endTime }}</p>
      </div>
      
      <form @submit.prevent="submitBooking" class="space-y-4">
        <!-- Nom -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nom complet *
          </label>
          <input
            v-model="form.clientName"
            type="text"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Votre nom complet"
          />
        </div>
        
        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            v-model="form.clientEmail"
            type="email"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="votre@email.com"
          />
        </div>
        
        <!-- Téléphone -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Téléphone
          </label>
          <input
            v-model="form.clientPhone"
            type="tel"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="06 12 34 56 78"
          />
        </div>
        
        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Notes (optionnel)
          </label>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Informations supplémentaires..."
          ></textarea>
        </div>
        
        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Confirmation...' : 'Confirmer le rendez-vous' }}
        </button>
      </form>
    </div>

    <!-- Step 4: Confirmation -->
    <div v-if="currentStep === 3" class="text-center space-y-6">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckIcon class="w-8 h-8 text-green-600" />
      </div>
      
      <div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Rendez-vous confirmé !</h3>
        <p class="text-gray-600 mb-4">
          Votre rendez-vous a été pris avec succès. Vous recevrez un email de confirmation.
        </p>
        
        <div class="bg-gray-50 rounded-lg p-4 text-left">
          <h4 class="font-medium text-gray-900 mb-2">Détails du rendez-vous</h4>
          <p class="text-gray-700"><strong>Date :</strong> {{ formatSelectedDate(selectedDate) }}</p>
          <p class="text-gray-700"><strong>Heure :</strong> {{ selectedTimeSlot?.startTime }} - {{ selectedTimeSlot?.endTime }}</p>
          <p class="text-gray-700"><strong>Nom :</strong> {{ form.clientName }}</p>
          <p class="text-gray-700"><strong>Email :</strong> {{ form.clientEmail }}</p>
        </div>
      </div>
      
      <button
        @click="resetBooking"
        class="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
      >
        Prendre un autre rendez-vous
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ChevronRightIcon, 
  ArrowLeftIcon, 
  CalendarIcon, 
  CheckIcon 
} from '@heroicons/vue/24/outline'

// Types
interface TimeSlot {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
  isBooked: boolean
}

interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}

// State
const currentStep = ref(0)
const selectedDate = ref('')
const selectedTimeSlot = ref<TimeSlot | null>(null)
const availableSlots = ref<TimeSlot[]>([])
const loading = ref(false)
const isSubmitting = ref(false)

const form = ref({
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  notes: ''
})

// Steps
const steps = [
  { id: 'date', name: 'Date' },
  { id: 'time', name: 'Créneau' },
  { id: 'info', name: 'Informations' },
  { id: 'confirm', name: 'Confirmation' }
]

// Days of week
const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

// Computed
const calendarDays = computed(() => {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  // First day of current month
  const firstDay = new Date(currentYear, currentMonth, 1)
  const lastDay = new Date(currentYear, currentMonth + 1, 0)
  
  // Start from Sunday of the week containing first day
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days: CalendarDay[] = []
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === currentMonth,
      isToday: date.toDateString() === today.toDateString()
    })
  }
  
  return days
})

// Methods
const selectDate = (date: string) => {
  selectedDate.value = date
}

const selectTimeSlot = (slot: TimeSlot) => {
  selectedTimeSlot.value = slot
}

const nextStep = async () => {
  if (currentStep.value === 1 && selectedDate.value) {
    // Load available slots for selected date
    await loadAvailableSlots(selectedDate.value)
  }
  
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const loadAvailableSlots = async (date: string) => {
  loading.value = true
  try {
    // TODO: Call API to get available slots
    // const response = await api.get(`/calendar/slots?date=${date}`)
    // availableSlots.value = response.data.data
    
    // Mock data for now
    availableSlots.value = [
      { id: '1', date, startTime: '09:00', endTime: '09:30', isAvailable: true, isBooked: false },
      { id: '2', date, startTime: '09:30', endTime: '10:00', isAvailable: true, isBooked: false },
      { id: '3', date, startTime: '10:00', endTime: '10:30', isAvailable: true, isBooked: false },
      { id: '4', date, startTime: '10:30', endTime: '11:00', isAvailable: true, isBooked: false },
      { id: '5', date, startTime: '14:00', endTime: '14:30', isAvailable: true, isBooked: false },
      { id: '6', date, startTime: '14:30', endTime: '15:00', isAvailable: true, isBooked: false },
      { id: '7', date, startTime: '15:00', endTime: '15:30', isAvailable: true, isBooked: false },
      { id: '8', date, startTime: '15:30', endTime: '16:00', isAvailable: true, isBooked: false }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des créneaux:', error)
  } finally {
    loading.value = false
  }
}

const submitBooking = async () => {
  if (!selectedDate.value || !selectedTimeSlot.value) return
  
  isSubmitting.value = true
  try {
    const appointment = {
      date: selectedDate.value,
      startTime: selectedTimeSlot.value.startTime,
      endTime: selectedTimeSlot.value.endTime,
      clientName: form.value.clientName,
      clientEmail: form.value.clientEmail,
      clientPhone: form.value.clientPhone,
      notes: form.value.notes
    }
    
    // TODO: Call API to create appointment
    // await api.post('/calendar/appointments', appointment)
    
    // Mock success
    console.log('Rendez-vous créé:', appointment)
    
    currentStep.value = 3 // Go to confirmation step
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error)
    // TODO: Show error message
  } finally {
    isSubmitting.value = false
  }
}

const resetBooking = () => {
  currentStep.value = 0
  selectedDate.value = ''
  selectedTimeSlot.value = null
  availableSlots.value = []
  form.value = {
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: ''
  }
}

const formatSelectedDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  // Initialize component
})
</script>

<style scoped>
.booking-component {
  font-family: 'Inter', sans-serif;
}
</style>
