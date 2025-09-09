<template>
  <div class="w-full h-full flex items-center justify-center">
    <!-- Placeholder pour le graphique -->
    <div class="text-center">
      <ChartBarIcon class="mx-auto h-16 w-16 text-gray-400 mb-4" />
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Graphique en cours de développement
      </p>
      <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">
        {{ revenueData.length }} mois de données disponibles
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartBarIcon } from '@heroicons/vue/24/outline'

interface Props {
  revenueData: { month: string; amount: number }[]
  expensesData: { month: string; amount: number }[]
}

defineProps<Props>()

// TODO: Intégrer une bibliothèque de graphiques comme Chart.js ou D3.js
// Pour le moment, nous affichons un placeholder
</script>
