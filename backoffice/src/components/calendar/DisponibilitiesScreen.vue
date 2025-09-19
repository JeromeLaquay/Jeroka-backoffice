<template>
  <div style="display: flex; flex-direction: column; gap: 10px;">
     <!-- Affichage des créneaux avec style -->
     <button
        @click="showGenerateModal = true"
        class="items-center px-3 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
        style="width: fit-content;"
      >
        Générer des créneaux
      </button>

      

      <iframe 
            ref="iframe"
            src="https://calendar.google.com/calendar/embed?src=c63d2465ed5e47c30e0253bfa96748a438bf315e3d1fe62d730d7738ad4e18aa%40group.calendar.google.com&ctz=Europe%2FParis" 
            class="w-full h-[600px] md:h-[700px] lg:h-[800px] border-0"
            frameborder="0" 
            scrolling="no"
            title="Démonstration Google Calendar"
            allowfullscreen
      ></iframe>
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
import { ref } from 'vue'
import { calendarApi } from '../../services/calendar'

// Modal état
const showGenerateModal = ref(false)
const submitting = ref(false)
const form = ref({
  date: '',
  startTime: '09:00',
  endTime: '18:00',
  slotDurationMinutes: 30
})

const iframe = ref(null)
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
    // Mettre à jour l'iframe Google Calendar
    reloadCalendarIframe()
    showGenerateModal.value = false
  } catch (e) {
    console.error('Erreur génération créneaux', e)
  } finally {
    submitting.value = false
  }
}

// Fonction utilitaire pour recharger l'iframe Google Calendar
const reloadCalendarIframe = () => {
  if (iframe.value) {
    // Forcer le rechargement de l'iframe en ajoutant un timestamp
    const currentSrc = iframe.value.src;
    const separator = currentSrc.includes('?') ? '&' : '?';
    console.log('resultat', currentSrc + separator + 't=' + Date.now());
    iframe.value.src = currentSrc + separator + 't=' + Date.now();
  }
}

</script>

<style scoped>
</style>


