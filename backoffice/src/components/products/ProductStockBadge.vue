<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      badgeClasses
    ]"
  >
    {{ badgeText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  current: number
  minimum: number
  maximum?: number
}

const props = defineProps<Props>()

const stockStatus = computed(() => {
  if (props.current <= 0) return 'out'
  if (props.current <= props.minimum) return 'low'
  if (props.maximum && props.current >= props.maximum) return 'high'
  return 'normal'
})

const badgeClasses = computed(() => {
  switch (stockStatus.value) {
    case 'out':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'low':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'high':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'normal':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
})

const badgeText = computed(() => {
  switch (stockStatus.value) {
    case 'out':
      return 'Rupture'
    case 'low':
      return 'Stock faible'
    case 'high':
      return 'Stock élevé'
    case 'normal':
      return 'En stock'
    default:
      return 'Inconnu'
  }
})
</script>
