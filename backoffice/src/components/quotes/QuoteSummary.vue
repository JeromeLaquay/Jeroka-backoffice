<template>
  <div class="space-y-4">
    <!-- Résumé des articles -->
    <div class="space-y-2">
      <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
        Résumé des articles
      </h4>
      
      <div v-if="items.length === 0" class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
        Aucun article ajouté
      </div>
      
      <div v-else class="space-y-1">
        <div v-for="(item, index) in items" :key="index" class="flex justify-between text-sm">
          <span class="text-gray-600 dark:text-gray-400">
            {{ item.quantity }}x {{ item.description }}
          </span>
          <span class="text-gray-900 dark:text-gray-100">
            {{ formatCurrency(calculateItemTotal(item)) }}
          </span>
        </div>
      </div>
    </div>

    <hr class="border-gray-200 dark:border-gray-700" />

    <!-- Calculs -->
    <div class="space-y-2">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">Sous-total HT</span>
        <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(subtotalHt) }}</span>
      </div>

      <!-- Remise globale -->
      <div class="flex justify-between items-center text-sm">
        <span class="text-gray-600 dark:text-gray-400">Remise</span>
        <div class="flex items-center space-x-2">
          <input
            :value="localDiscountAmount"
            @input="updateDiscount"
            type="number"
            min="0"
            step="0.01"
            class="w-20 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          />
          <span class="text-gray-500 dark:text-gray-400">€</span>
        </div>
      </div>

      <div class="flex justify-between text-sm">
        <span class="text-gray-600 dark:text-gray-400">TVA</span>
        <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(totalVat) }}</span>
      </div>
    </div>

    <hr class="border-gray-200 dark:border-gray-700" />

    <!-- Total final -->
    <div class="flex justify-between text-base font-medium">
      <span class="text-gray-900 dark:text-gray-100">Total TTC</span>
      <span class="text-gray-900 dark:text-gray-100">{{ formatCurrency(totalTtc) }}</span>
    </div>

    <!-- Détails des taxes -->
    <div class="text-xs text-gray-500 dark:text-gray-400 space-y-1">
      <div class="flex justify-between">
        <span>Total HT après remise</span>
        <span>{{ formatCurrency(totalHtAfterDiscount) }}</span>
      </div>
      <div class="flex justify-between">
        <span>Dont TVA (20%)</span>
        <span>{{ formatCurrency(totalVat) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface QuoteItem {
  description: string
  quantity: number
  unitPrice: number
  discountPercent?: number
  vatRate?: number
}

interface Props {
  items: QuoteItem[]
  discountAmount?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update-discount': [amount: number]
}>()

// État local
const localDiscountAmount = ref(props.discountAmount || 0)

// Calculs
const subtotalHt = computed(() => {
  return props.items.reduce((total, item) => {
    return total + calculateItemTotal(item)
  }, 0)
})

const totalHtAfterDiscount = computed(() => {
  return Math.max(0, subtotalHt.value - localDiscountAmount.value)
})

const totalVat = computed(() => {
  return props.items.reduce((total, item) => {
    const itemTotal = calculateItemTotal(item)
    const vatRate = item.vatRate || 20
    return total + (itemTotal * vatRate / 100)
  }, 0)
})

const totalTtc = computed(() => {
  return totalHtAfterDiscount.value + totalVat.value
})

// Méthodes
const calculateItemTotal = (item: QuoteItem) => {
  const subtotal = item.quantity * item.unitPrice
  const discount = subtotal * (item.discountPercent || 0) / 100
  return subtotal - discount
}

const updateDiscount = (event: Event) => {
  const value = parseFloat((event.target as HTMLInputElement).value) || 0
  localDiscountAmount.value = value
  emit('update-discount', value)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

// Watchers
watch(() => props.discountAmount, (value) => {
  if (value !== undefined) {
    localDiscountAmount.value = value
  }
})
</script>
