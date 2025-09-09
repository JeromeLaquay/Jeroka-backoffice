<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
      Intégrations
    </h3>
    
    <div class="text-center py-8">
      <PuzzlePieceIcon class="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Intégrations tierces en cours de développement
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
        Stripe, PayPal, MailChimp, etc.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PuzzlePieceIcon } from '@heroicons/vue/24/outline'

interface Props {
  integrations: any
}

defineProps<Props>()

defineEmits<{
  updated: []
}>()
</script>
