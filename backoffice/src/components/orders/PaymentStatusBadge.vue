<template>
  <span :class="badgeClasses" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
    <span :class="dotClasses" class="mr-1.5 h-2 w-2 rounded-full"></span>
    {{ statusText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: string
}

const props = defineProps<Props>()

const statusConfig = {
  pending: {
    text: 'En attente',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    dot: 'bg-yellow-400'
  },
  paid: {
    text: 'Payé',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    dot: 'bg-green-400'
  },
  failed: {
    text: 'Échec',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    dot: 'bg-red-400'
  },
  refunded: {
    text: 'Remboursé',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    dot: 'bg-purple-400'
  }
}

const statusText = computed(() => {
  return statusConfig[props.status as keyof typeof statusConfig]?.text || 'Inconnu'
})

const badgeClasses = computed(() => {
  return statusConfig[props.status as keyof typeof statusConfig]?.badge || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
})

const dotClasses = computed(() => {
  return statusConfig[props.status as keyof typeof statusConfig]?.dot || 'bg-gray-400'
})
</script>
