<template>
  <span :class="badgeClasses" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
    <component :is="iconComponent" class="mr-1.5 h-3 w-3" />
    {{ typeText }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/24/outline'

interface Props {
  type: 'income' | 'expense'
}

const props = defineProps<Props>()

const typeConfig = {
  income: {
    text: 'Recette',
    badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: ArrowUpIcon
  },
  expense: {
    text: 'Dépense',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    icon: ArrowDownIcon
  }
}

const typeText = computed(() => {
  return typeConfig[props.type]?.text || 'Inconnu'
})

const badgeClasses = computed(() => {
  return typeConfig[props.type]?.badge || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
})

const iconComponent = computed(() => {
  return typeConfig[props.type]?.icon || ArrowUpIcon
})
</script>
