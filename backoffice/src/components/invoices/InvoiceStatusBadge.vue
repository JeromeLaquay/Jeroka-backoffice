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
  draft: {
    text: 'Brouillon',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    dot: 'bg-gray-400'
  },
  sent: {
    text: 'Envoyée',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    dot: 'bg-blue-400'
  },
  paid: {
    text: 'Payée',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    dot: 'bg-green-400'
  },
  overdue: {
    text: 'En retard',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    dot: 'bg-red-400'
  },
  cancelled: {
    text: 'Annulée',
    badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    dot: 'bg-gray-400'
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
