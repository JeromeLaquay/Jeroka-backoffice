<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      badgeClasses
    ]"
  >
    <span v-if="showIcon" class="mr-1">{{ icon }}</span>
    {{ category?.name || 'Sans catégorie' }}
    <span v-if="showAttachmentIcon && category?.downloadAttachments" class="ml-1" title="Télécharge les pièces jointes">
      📎
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { EmailCategory } from '../../services/emails.ts'

interface Props {
  category?: EmailCategory
  variant?: 'default' | 'light' | 'outline'
  showIcon?: boolean
  showAttachmentIcon?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  showIcon: true,
  showAttachmentIcon: true
})

const icon = computed(() => {
  if (!props.category) return '❓'
  
  const name = props.category.name.toLowerCase()
  if (name.includes('fournisseur')) return '🏭'
  if (name.includes('client')) return '👥'
  if (name.includes('facture')) return '📄'
  if (name.includes('devis')) return '📝'
  if (name.includes('comptabilit')) return '💰'
  return '📂'
})

const badgeClasses = computed(() => {
  if (!props.category) {
    // Pas de catégorie
    return {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      light: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
      outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300'
    }[props.variant]
  }
  
  // Couleurs basées sur le nom de la catégorie
  const name = props.category.name.toLowerCase()
  let colorClass = ''
  
  if (name.includes('fournisseur')) {
    colorClass = {
      default: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      light: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
      outline: 'border border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300'
    }[props.variant]
  } else if (name.includes('client')) {
    colorClass = {
      default: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      light: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-300',
      outline: 'border border-green-300 text-green-700 dark:border-green-600 dark:text-green-300'
    }[props.variant]
  } else if (name.includes('facture')) {
    colorClass = {
      default: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      light: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
      outline: 'border border-red-300 text-red-700 dark:border-red-600 dark:text-red-300'
    }[props.variant]
  } else if (name.includes('devis')) {
    colorClass = {
      default: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      light: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300',
      outline: 'border border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300'
    }[props.variant]
  } else if (name.includes('comptabilit')) {
    colorClass = {
      default: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      light: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300',
      outline: 'border border-purple-300 text-purple-700 dark:border-purple-600 dark:text-purple-300'
    }[props.variant]
  } else {
    // Catégorie générique
    colorClass = {
      default: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      light: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300',
      outline: 'border border-indigo-300 text-indigo-700 dark:border-indigo-600 dark:text-indigo-300'
    }[props.variant]
  }
  
  return colorClass
})
</script>
