<template>
  <div class="relative">
    <Combobox v-model="selectedClient" @update:model-value="onClientSelected">
      <div class="relative">
        <ComboboxInput
          :value="displayValue"
          @change="query = $event.target.value"
          class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="Rechercher un client..."
        />
        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
        </ComboboxButton>
      </div>

      <TransitionRoot
        leave="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
        @after-leave="query = ''"
      >
        <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <div v-if="loading" class="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
            <div class="flex items-center">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Recherche...
            </div>
          </div>

          <div
            v-else-if="filteredClients.length === 0 && query !== ''"
            class="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300"
          >
            Aucun client trouvé.
          </div>

          <ComboboxOption
            v-for="client in filteredClients"
            :key="client.id"
            :value="client"
            v-slot="{ selected, active }"
          >
            <li :class="[
              'relative cursor-default select-none py-2 pl-10 pr-4',
              active ? 'bg-primary-600 text-white' : 'text-gray-900 dark:text-gray-100'
            ]">
              <div class="flex items-center">
                <img
                  :src="client.avatar_url"
                  :alt="client.name"
                  class="h-6 w-6 flex-shrink-0 rounded-full"
                />
                <div class="ml-3">
                  <span :class="[
                    'block truncate',
                    selected ? 'font-medium' : 'font-normal'
                  ]">
                    {{ client.name }}
                  </span>
                  <span :class="[
                    'block text-sm',
                    active ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'
                  ]">
                    {{ client.email }}
                  </span>
                </div>
              </div>

              <span v-if="selected" :class="[
                'absolute inset-y-0 left-0 flex items-center pl-3',
                active ? 'text-white' : 'text-primary-600'
              ]">
                <CheckIcon class="h-5 w-5" />
              </span>
            </li>
          </ComboboxOption>

          <!-- Option pour créer un nouveau client -->
          <div class="border-t border-gray-200 dark:border-gray-600">
            <router-link
              to="/clients/create"
              class="flex items-center py-2 px-4 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900"
            >
              <PlusIcon class="h-4 w-4 mr-2" />
              Créer un nouveau client
            </router-link>
          </div>
        </ComboboxOptions>
      </TransitionRoot>
    </Combobox>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Combobox,
  ComboboxInput,
  ComboboxButton,
  ComboboxOptions,
  ComboboxOption,
  TransitionRoot,
} from '@headlessui/vue'
import { ChevronUpDownIcon, CheckIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { debounce } from 'lodash-es'

interface Client {
  id: string
  name: string
  email: string
  avatar_url: string
  phone?: string
  address?: any
}

interface Props {
  modelValue?: string
  selectedClient?: Client | null
  required?: boolean 
  clients?: Client[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'client-selected': [client: Client]
}>()

// État
const loading = ref(false)
const query = ref('')
const clients = ref<Client[]>([])
const selectedClient = ref<Client | null>(props.selectedClient || null)



const filteredClients = computed(() => {
  const clientsList = props.clients || clients.value
  return query.value === ''
    ? clientsList
    : clientsList.filter((client) =>
        client.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .includes(query.value.toLowerCase().replace(/\s+/g, '')) ||
        client.email
          .toLowerCase()
          .includes(query.value.toLowerCase())
      )
})

const displayValue = computed(() => {
  return selectedClient.value ? selectedClient.value.name : ''
})

// Recherche avec debounce
const debouncedSearch = debounce(async (searchQuery: string) => {
  if (!searchQuery) {
    return
  }

  loading.value = true
  try {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 300))
    // La recherche se fait maintenant via le computed filteredClients
  } catch (error) {
    console.error('Erreur lors de la recherche de clients:', error)
  } finally {
    loading.value = false
  }
}, 300)

// Watchers
watch(query, debouncedSearch)

// Méthodes
const onClientSelected = (client: Client | null) => {
  if (client) {
    emit('update:modelValue', client.id)
    emit('client-selected', client)
  }
}

// Initialisation - utiliser les clients passés en props ou une liste vide
if (props.clients) {
  clients.value = props.clients
}
</script>
