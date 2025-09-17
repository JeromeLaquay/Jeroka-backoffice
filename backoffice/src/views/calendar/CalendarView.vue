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
        <DisponibilitiesScreen />
      </div>

      <!-- Rendez-vous -->
      <div v-if="activeTab === 'appointments'" class="space-y-6">
        <AppointmentScreen />
      </div>

      <div v-if="activeTab === 'calendar'" class="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
          <iframe 
            src="https://calendar.google.com/calendar/embed?src=c63d2465ed5e47c30e0253bfa96748a438bf315e3d1fe62d730d7738ad4e18aa%40group.calendar.google.com&ctz=Europe%2FParis" 
            class="w-full h-[600px] md:h-[700px] lg:h-[800px] border-0"
            frameborder="0" 
            scrolling="no"
            title="Démonstration Google Calendar"
            allowfullscreen
          ></iframe>
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
  { id: 'calendar', name: 'Calendrier' },
  { id: 'availability', name: 'Disponibilités' },
  { id: 'appointments', name: 'Rendez-vous' }
]

</script>

<style scoped>
.calendar-view {
  @apply  min-h-screen;
}

.tab-content {
  @apply min-h-96;
}

/* Transitions pour les changements de thème */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
</style>
