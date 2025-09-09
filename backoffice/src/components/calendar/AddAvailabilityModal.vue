<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Ajouter une règle de disponibilité</h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Jour de la semaine -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Jour de la semaine
            </label>
            <select
              v-model="form.dayOfWeek"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionner un jour</option>
              <option value="0">Dimanche</option>
              <option value="1">Lundi</option>
              <option value="2">Mardi</option>
              <option value="3">Mercredi</option>
              <option value="4">Jeudi</option>
              <option value="5">Vendredi</option>
              <option value="6">Samedi</option>
            </select>
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

          <!-- Statut actif -->
          <div class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              id="isActive"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="isActive" class="ml-2 block text-sm text-gray-900">
              Règle active
            </label>
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
              {{ isSubmitting ? 'Ajout...' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

// Emits
const emit = defineEmits<{
  close: []
  save: [rule: any]
}>()

// State
const isSubmitting = ref(false)

const form = reactive({
  dayOfWeek: '',
  startTime: '09:00',
  endTime: '17:00',
  isActive: true
})

// Methods
const handleSubmit = async () => {
  isSubmitting.value = true
  
  try {
    const rule = {
      dayOfWeek: parseInt(form.dayOfWeek),
      startTime: form.startTime,
      endTime: form.endTime,
      isActive: form.isActive
    }
    
    emit('save', rule)
  } finally {
    isSubmitting.value = false
  }
}
</script>
