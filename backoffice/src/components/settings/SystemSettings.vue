<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
      Paramètres système
    </h3>
    
    <div class="text-center py-8">
      <CogIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Configuration système en cours de développement
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Version {{ settings?.appVersion || '1.0.0' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CogIcon } from '@heroicons/vue/24/outline'
import type { SystemSettings } from '@/services/settings'

interface Props {
  settings: SystemSettings | null
}

defineProps<Props>()

defineEmits<{
  updated: []
}>()
</script>
