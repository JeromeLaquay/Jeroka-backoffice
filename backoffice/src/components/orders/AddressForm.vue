<template>
  <div class="space-y-4">
    <div v-if="fromClient" class="mb-4">
      <button
        @click="$emit('copy-from-client')"
        type="button"
        class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
      >
        <DocumentDuplicateIcon class="h-4 w-4 mr-2" />
        Copier depuis le client
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Adresse ligne 1 *
        </label>
        <input
          v-model="localAddress.line1"
          type="text"
          placeholder="123 Rue de la Paix"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          @input="updateAddress"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Adresse ligne 2
        </label>
        <input
          v-model="localAddress.line2"
          type="text"
          placeholder="Appartement, étage, etc."
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          @input="updateAddress"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Code postal *
          </label>
          <input
            v-model="localAddress.postalCode"
            type="text"
            placeholder="75001"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            @input="updateAddress"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ville *
          </label>
          <input
            v-model="localAddress.city"
            type="text"
            placeholder="Paris"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            @input="updateAddress"
          />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Pays *
        </label>
        <select
          v-model="localAddress.country"
          class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          @change="updateAddress"
        >
          <option value="France">France</option>
          <option value="Belgique">Belgique</option>
          <option value="Suisse">Suisse</option>
          <option value="Luxembourg">Luxembourg</option>
          <option value="Canada">Canada</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { DocumentDuplicateIcon } from '@heroicons/vue/24/outline'

interface Address {
  line1: string
  line2?: string
  city: string
  postalCode: string
  country: string
}

interface Props {
  modelValue: Address
  fromClient?: Address | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: Address]
  'copy-from-client': []
}>()

// État local
const localAddress = ref<Address>({ ...props.modelValue })

// Méthodes
const updateAddress = () => {
  emit('update:modelValue', { ...localAddress.value })
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  localAddress.value = { ...newValue }
}, { deep: true })
</script>
