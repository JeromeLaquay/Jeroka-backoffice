<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
    <div class="flex items-center">
      <div :class="['p-3 rounded-lg', iconBackgroundClass]">
        <span class="text-2xl">{{ icon }}</span>
      </div>
      <div class="ml-4 flex-1">
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ formattedValue }}
        </p>
        <p v-if="subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="showTrend" class="ml-4">
        <div :class="['flex items-center text-sm', trendClass]">
          <span class="mr-1">{{ trendIcon }}</span>
          {{ trendText }}
        </div>
      </div>
    </div>
    
    <!-- Barre de progression optionnelle -->
    <div v-if="showProgress && maxValue > 0" class="mt-4">
      <div class="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
        <span>{{ progressLabel }}</span>
        <span>{{ Math.round((value / maxValue) * 100) }}%</span>
      </div>
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          :class="['h-2 rounded-full transition-all duration-300', progressBarClass]"
          :style="{ width: `${Math.min((value / maxValue) * 100, 100)}%` }"
        ></div>
      </div>
    </div>
    
    <!-- Action rapide optionnelle -->
    <div v-if="actionLabel" class="mt-4">
      <button
        @click="$emit('action')"
        :disabled="actionDisabled"
        class="w-full px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
        :class="actionButtonClass"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number
  icon: string
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'gray'
  subtitle?: string
  formatType?: 'number' | 'currency' | 'percentage' | 'filesize'
  currency?: string
  showTrend?: boolean
  trendValue?: number
  trendLabel?: string
  showProgress?: boolean
  maxValue?: number
  progressLabel?: string
  actionLabel?: string
  actionDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  formatType: 'number',
  currency: 'EUR',
  showTrend: false,
  showProgress: false,
  maxValue: 0,
  actionDisabled: false
})

defineEmits<{
  action: []
}>()

// Formatage de la valeur
const formattedValue = computed(() => {
  switch (props.formatType) {
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: props.currency
      }).format(props.value)
    
    case 'percentage':
      return `${props.value.toFixed(1)}%`
    
    case 'filesize':
      return formatFileSize(props.value)
    
    default:
      return props.value.toLocaleString('fr-FR')
  }
})

// Classes CSS pour les couleurs
const iconBackgroundClass = computed(() => {
  const colorMap = {
    blue: 'bg-blue-100 dark:bg-blue-900',
    green: 'bg-green-100 dark:bg-green-900',
    yellow: 'bg-yellow-100 dark:bg-yellow-900',
    red: 'bg-red-100 dark:bg-red-900',
    purple: 'bg-purple-100 dark:bg-purple-900',
    indigo: 'bg-indigo-100 dark:bg-indigo-900',
    gray: 'bg-gray-100 dark:bg-gray-700'
  }
  return colorMap[props.color]
})

const progressBarClass = computed(() => {
  const colorMap = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    gray: 'bg-gray-500'
  }
  return colorMap[props.color]
})

const actionButtonClass = computed(() => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800',
    green: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800',
    yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800',
    red: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800',
    purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800',
    indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800',
    gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
  }
  return colorMap[props.color]
})

// Tendance
const trendIcon = computed(() => {
  if (!props.showTrend || props.trendValue === undefined) return ''
  return props.trendValue > 0 ? '📈' : props.trendValue < 0 ? '📉' : '➡️'
})

const trendClass = computed(() => {
  if (!props.showTrend || props.trendValue === undefined) return ''
  return props.trendValue > 0 
    ? 'text-green-600 dark:text-green-400' 
    : props.trendValue < 0 
    ? 'text-red-600 dark:text-red-400'
    : 'text-gray-600 dark:text-gray-400'
})

const trendText = computed(() => {
  if (!props.showTrend || props.trendValue === undefined) return ''
  const absValue = Math.abs(props.trendValue)
  return `${absValue.toFixed(1)}% ${props.trendLabel || ''}`
})

// Utilitaire pour formater la taille des fichiers
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
