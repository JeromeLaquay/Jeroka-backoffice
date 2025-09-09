<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="$emit('cancel')">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                  <ArrowPathIcon class="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                    Changer le statut de la commande
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Sélectionnez le nouveau statut pour cette commande.
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-5">
                <div class="space-y-3">
                  <div
                    v-for="status in statusOptions"
                    :key="status.value"
                    @click="selectedStatus = status.value"
                    :class="[
                      'relative cursor-pointer rounded-lg border p-4 focus:outline-none',
                      selectedStatus === status.value
                        ? 'border-primary-200 bg-primary-50 dark:border-primary-700 dark:bg-primary-900'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                    ]"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center">
                        <component :is="status.icon" class="h-5 w-5 mr-3" :class="status.iconColor" />
                        <div>
                          <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {{ status.label }}
                          </div>
                          <div class="text-sm text-gray-500 dark:text-gray-400">
                            {{ status.description }}
                          </div>
                        </div>
                      </div>
                      <div v-if="selectedStatus === status.value">
                        <CheckCircleIcon class="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  :disabled="!selectedStatus || selectedStatus === currentStatus"
                  class="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 disabled:cursor-not-allowed sm:col-start-2"
                  @click="handleUpdate"
                >
                  Mettre à jour
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                  @click="$emit('cancel')"
                >
                  Annuler
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  CogIcon,
  TruckIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  show: boolean
  currentStatus?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [status: string]
  cancel: []
}>()

const selectedStatus = ref(props.currentStatus || '')

const statusOptions = [
  {
    value: 'pending',
    label: 'En attente',
    description: 'Commande en attente de confirmation',
    icon: ClockIcon,
    iconColor: 'text-yellow-500'
  },
  {
    value: 'confirmed',
    label: 'Confirmée',
    description: 'Commande confirmée et en préparation',
    icon: CheckCircleIcon,
    iconColor: 'text-blue-500'
  },
  {
    value: 'processing',
    label: 'En cours',
    description: 'Commande en cours de traitement',
    icon: CogIcon,
    iconColor: 'text-purple-500'
  },
  {
    value: 'shipped',
    label: 'Expédiée',
    description: 'Commande expédiée et en transit',
    icon: TruckIcon,
    iconColor: 'text-indigo-500'
  },
  {
    value: 'delivered',
    label: 'Livrée',
    description: 'Commande livrée au client',
    icon: CheckIcon,
    iconColor: 'text-green-500'
  },
  {
    value: 'cancelled',
    label: 'Annulée',
    description: 'Commande annulée',
    icon: XMarkIcon,
    iconColor: 'text-red-500'
  }
]

const handleUpdate = () => {
  if (selectedStatus.value && selectedStatus.value !== props.currentStatus) {
    emit('update', selectedStatus.value)
  }
}
</script>
