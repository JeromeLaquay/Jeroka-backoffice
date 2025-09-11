<template>
  <div class="environment-switcher">
    <div class="flex items-center space-x-2">
      <label class="text-sm font-medium text-gray-700">Environnement API:</label>
      <select 
        v-model="currentEnvironment" 
        @change="switchEnvironment"
        class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="local">Local (localhost:3002)</option>
        <option value="production">Production (jerokaxperience.fr)</option>
      </select>
    </div>
    <div class="text-xs text-gray-500 mt-1">
      URL actuelle: {{ currentUrl }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiService } from '@/services/api'

const currentEnvironment = ref<'local' | 'production'>('local')
const currentUrl = ref('')

const switchEnvironment = () => {
  if (currentEnvironment.value === 'local') {
    apiService.switchToLocal()
  } else {
    apiService.switchToProduction()
  }
  currentUrl.value = apiService.getBaseURL()
  
  // Sauvegarder le choix dans le localStorage
  localStorage.setItem('api_environment', currentEnvironment.value)
}

onMounted(() => {
  // Récupérer l'environnement sauvegardé
  const savedEnvironment = localStorage.getItem('api_environment') as 'local' | 'production' | null
  if (savedEnvironment) {
    currentEnvironment.value = savedEnvironment
    switchEnvironment()
  } else {
    // Définir l'URL actuelle
    currentUrl.value = apiService.getBaseURL()
  }
})
</script>

<style scoped>
.environment-switcher {
  padding: 0.75rem;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
</style>
