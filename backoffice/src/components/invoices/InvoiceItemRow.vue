<template>
  <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <div class="grid grid-cols-12 gap-4 items-start">
      <!-- Description -->
      <div class="col-span-12 md:col-span-5">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description *
        </label>
        <input
          v-model="localItem.description"
          type="text"
          placeholder="Description de l'article..."
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          @input="updateItem"
        />
      </div>

      <!-- Quantité -->
      <div class="col-span-6 md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Quantité *
        </label>
        <input
          v-model.number="localItem.quantity"
          type="number"
          min="1"
          step="1"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          @input="updateItem"
        />
      </div>

      <!-- Prix unitaire -->
      <div class="col-span-6 md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Prix unitaire (€)
        </label>
        <input
          v-model.number="localItem.unitPrice"
          type="number"
          min="0"
          step="0.01"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          @input="updateItem"
        />
      </div>

      <!-- Remise -->
      <div class="col-span-6 md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Remise (%)
        </label>
        <input
          v-model.number="localItem.discountPercent"
          type="number"
          min="0"
          max="100"
          step="0.1"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          @input="updateItem"
        />
      </div>

      <!-- Actions -->
      <div class="col-span-6 md:col-span-1 flex justify-end">
        <button
          @click="$emit('remove', index)"
          class="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
          title="Supprimer cet article"
        >
          <TrashIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Calculs automatiques -->
    <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Total HT:</span>
        <span class="font-medium text-gray-900 dark:text-gray-100">{{ formatCurrency(totalHt) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">TVA ({{ localItem.vatRate }}%):</span>
        <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(totalVat) }}</span>
      </div>
      <div class="flex justify-between text-sm font-medium border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
        <span class="text-gray-900 dark:text-gray-100">Total TTC:</span>
        <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(totalTtc) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  discountPercent?: number
  vatRate?: number
}

interface Props {
  item: InvoiceItem
  index: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update': [index: number, item: InvoiceItem]
  'remove': [index: number]
}>()

// État local
const localItem = ref<InvoiceItem>({
  description: props.item.description || '',
  quantity: props.item.quantity || 1,
  unitPrice: props.item.unitPrice || 0,
  discountPercent: props.item.discountPercent || 0,
  vatRate: props.item.vatRate || 20
})

// Calculs
const subtotal = computed(() => {
  return localItem.value.quantity * localItem.value.unitPrice
})

const discountAmount = computed(() => {
  return subtotal.value * (localItem.value.discountPercent || 0) / 100
})

const totalHt = computed(() => {
  return subtotal.value - discountAmount.value
})

const totalVat = computed(() => {
  return totalHt.value * (localItem.value.vatRate || 0) / 100
})

const totalTtc = computed(() => {
  return totalHt.value + totalVat.value
})

// Méthodes
const updateItem = () => {
  emit('update', props.index, { ...localItem.value })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Watchers
watch(() => props.item, (newItem) => {
  localItem.value = { ...newItem }
}, { deep: true })
</script>
