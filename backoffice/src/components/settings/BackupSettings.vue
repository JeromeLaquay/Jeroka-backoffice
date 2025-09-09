<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
        Sauvegardes
      </h3>
      <button
        @click="createBackup"
        :disabled="loading"
        class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
      >
        <CloudArrowUpIcon class="h-4 w-4 mr-2" />
        Créer une sauvegarde
      </button>
    </div>
    
    <div class="text-center py-8">
      <CloudArrowUpIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Gestion des sauvegardes en cours de développement
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
        {{ backups?.length || 0 }} sauvegarde(s) disponible(s)
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CloudArrowUpIcon } from '@heroicons/vue/24/outline'

interface Props {
  backups: any[] | null
}

defineProps<Props>()

const emit = defineEmits<{
  'backup-created': []
  'backup-restored': []
}>()

const loading = ref(false)

const createBackup = async () => {
  loading.value = true
  try {
    // TODO: Implémenter la création de sauvegarde
    console.log('Creating backup...')
    emit('backup-created')
  } catch (error) {
    console.error('Erreur lors de la création de la sauvegarde:', error)
  } finally {
    loading.value = false
  }
}
</script>
