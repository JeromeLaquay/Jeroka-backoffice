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

      <!-- Rendez-vous -->
      <div v-if="activeTab === 'appointments'" class="space-y-6">
        <AppointmentScreen />
      </div>

      <div v-if="activeTab === 'calendar'">
        <DisponibilitiesScreen />  
      </div>
    
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DisponibilitiesScreen from '../../components/calendar/DisponibilitiesScreen.vue'
import AppointmentScreen from '../../components/calendar/AppointmentScreen.vue'


// State
const activeTab = ref('calendar')

// Tabs
const tabs = [
  { id: 'calendar', name: 'Disponibilités' },
  { id: 'appointments', name: 'Rendez-vous' }
]

</script>

<style scoped>

/* Transitions pour les changements de thème */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
</style>
