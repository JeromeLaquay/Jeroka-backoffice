<template>
  <div class="space-y-6">
     <!-- Affichage des créneaux avec style -->
     <button
        @click="showGenerateModal = true"
        class="inline-flex items-center px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
      >
        Générer des créneaux
      </button>
     <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
       <div
         v-for="rule in availabilityRules"
         :key="rule.id"
         class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow"
       >
         <!-- En-tête du créneau -->
         <div class="flex items-center justify-between mb-3">
           <div class="flex items-center space-x-2">
             <div class="w-3 h-3 rounded-full" :class="{
               'bg-green-500': rule.status === 'pending',
               'bg-yellow-500': rule.status === 'reserved',
               'bg-red-500': rule.status === 'cancelled'
             }"></div>
             <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
               {{ formatDate(rule.day) }}
             </span>
           </div>
           <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" :class="{
             'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': rule.status === 'pending',
             'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': rule.status === 'reserved',
             'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': rule.status === 'cancelled'
           }">
             {{ getStatusLabel(rule.status) }}
           </span>
         </div>

         <!-- Informations du créneau -->
         <div class="space-y-2">
           <div class="flex items-center justify-between">
             <span class="text-sm text-gray-600 dark:text-gray-400">Heure de début</span>
             <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
               {{ formatTime(rule.start_time) }}
             </span>
           </div>
           
           <div class="flex items-center justify-between">
             <span class="text-sm text-gray-600 dark:text-gray-400">Heure de fin</span>
             <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
               {{ formatTime(rule.end_time) }}
             </span>
           </div>

           <div v-if="rule.google_event_id" class="flex items-center justify-between">
             <span class="text-sm text-gray-600 dark:text-gray-400">Google Calendar</span>
             <span class="text-xs text-green-600 dark:text-green-400">
               ✓ Synchronisé
             </span>
           </div>
         </div>

         <!-- Actions -->
         <div class="mt-4 flex space-x-2">
           <button
             @click="editRule(rule)"
             class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
           >
             <PencilIcon class="h-4 w-4 mr-1" />
             Modifier
           </button>
           <button
             @click="deleteRule(rule.id)"
             class="inline-flex items-center justify-center px-3 py-2 border border-red-300 dark:border-red-600 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-200 bg-white dark:bg-red-50 hover:bg-red-100"
           >
             <TrashIcon class="h-4 w-4" />
           </button>
         </div>
       </div>
     </div>
  </div>


  <!-- Modal de génération de créneaux -->
  <div v-if="showGenerateModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Générer des créneaux</h3>
        <button @click="closeGenerateModal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
      </div>
      <form @submit.prevent="submitGenerateSlots" class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
          <input v-model="form.date" type="date" required class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure de début</label>
            <input v-model="form.startTime" type="time" required class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Heure de fin</label>
            <input v-model="form.endTime" type="time" required class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durée par créneau (minutes)</label>
          <input v-model.number="form.slotDurationMinutes" type="number" min="5" step="5" required class="w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100" />
        </div>

        <div class="flex items-center justify-end space-x-2 pt-2">
          <button type="button" @click="closeGenerateModal" class="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">Annuler</button>
          <button type="submit" :disabled="submitting" class="px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
            {{ submitting ? 'Génération...' : 'Générer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import calendarApi, { AvailabilityRule } from '../../services/calendar'

const availabilityRules = ref(Array<AvailabilityRule>())
// Modal état
const showGenerateModal = ref(false)
const submitting = ref(false)
const form = ref({
  date: '',
  startTime: '09:00',
  endTime: '18:00',
  slotDurationMinutes: 30
})

const closeGenerateModal = () => {
  showGenerateModal.value = false
}

const submitGenerateSlots = async () => {
  try {
    submitting.value = true
    // Appel backend
    await calendarApi.availability.create({
      day: form.value.date,
      startTime: form.value.startTime,
      endTime: form.value.endTime,
      appointmentTime: form.value.slotDurationMinutes
    })
    await getAvailabilityRules()
    showGenerateModal.value = false
  } catch (e) {
    console.error('Erreur génération créneaux', e)
  } finally {
    submitting.value = false
  }
}

const getAvailabilityRules = async () => {
  const res = await calendarApi.availability.getAll()
  console.log(res)
  availabilityRules.value = res
  console.log(availabilityRules.value)
}



// Fonctions utilitaires
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (time: string) => {
  return time.substring(0, 5) // Remove seconds if present
}

const getStatusLabel = (status: string) => {
  const labels = {
    'pending': 'Disponible',
    'reserved': 'Réservé',
    'cancelled': 'Annulé'
  }
  return labels[status as keyof typeof labels] || status
}

const editRule = (rule: AvailabilityRule) => {
  // TODO: Implémenter l'édition
  console.log('Éditer la règle:', rule)
}

const deleteRule = async (ruleId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce créneau ?')) {
    try {
      await calendarApi.availability.delete(ruleId)
      await getAvailabilityRules()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }
}

onMounted(async () => {
    await getAvailabilityRules()
})
</script>

<style scoped>
</style>


