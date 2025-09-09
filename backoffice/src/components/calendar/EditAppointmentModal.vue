<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Modifier le rendez-vous</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              v-model="form.date"
              type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <!-- Heure de début -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Heure de début
            </label>
            <input
              v-model="form.startTime"
              type="time"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <!-- Heure de fin -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Heure de fin
            </label>
            <input
              v-model="form.endTime"
              type="time"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <!-- Nom du client -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nom du client
            </label>
            <input
              v-model="form.clientName"
              type="text"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <!-- Email du client -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Email du client
            </label>
            <input
              v-model="form.clientEmail"
              type="email"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <!-- Téléphone du client -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Téléphone du client
            </label>
            <input
              v-model="form.clientPhone"
              type="tel"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notes optionnelles..."
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Sauvegarde...' : 'Sauvegarder' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

// Props
const props = defineProps<{
  appointment: any
}>()

// Emits
const emit = defineEmits<{
  close: []
  save: [appointment: any]
}>()

// State
const isSubmitting = ref(false)

const form = reactive({
  date: '',
  startTime: '',
  endTime: '',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  notes: ''
})

// Watch for prop changes
watch(() => props.appointment, (newAppointment) => {
  if (newAppointment) {
    form.date = newAppointment.date
    form.startTime = newAppointment.startTime
    form.endTime = newAppointment.endTime
    form.clientName = newAppointment.clientName || ''
    form.clientEmail = newAppointment.clientEmail || ''
    form.clientPhone = newAppointment.clientPhone || ''
    form.notes = newAppointment.notes || ''
  }
}, { immediate: true })

// Methods
const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    const appointment = {
      id: props.appointment.id,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      clientPhone: form.clientPhone,
      notes: form.notes
    }
    
    emit('save', appointment)
  } finally {
    isSubmitting.value = false
  }
}
</script>
