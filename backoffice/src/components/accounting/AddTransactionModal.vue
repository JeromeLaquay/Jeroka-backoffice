<template>
  <TransitionRoot as="template" :show="show">
    <Dialog as="div" class="relative z-50" @close="$emit('close')">
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
            <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
              <form @submit.prevent="handleSubmit">
                <div>
                  <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <PlusIcon class="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                      Ajouter une transaction
                    </DialogTitle>
                  </div>
                </div>

                <div class="mt-5 space-y-4">
                  <!-- Type -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type *
                    </label>
                    <select
                      v-model="form.type"
                      required
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="income">Recette</option>
                      <option value="expense">Dépense</option>
                    </select>
                  </div>

                  <!-- Description -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description *
                    </label>
                    <input
                      v-model="form.description"
                      type="text"
                      required
                      placeholder="Description de la transaction"
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>

                  <!-- Montant -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Montant (€) *
                    </label>
                    <input
                      v-model.number="form.amount"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>

                  <!-- Catégorie -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Catégorie *
                    </label>
                    <select
                      v-model="form.category"
                      required
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      <optgroup v-if="form.type === 'income'" label="Recettes">
                        <option value="ventes">Ventes</option>
                        <option value="services">Services</option>
                        <option value="autres_revenus">Autres revenus</option>
                      </optgroup>
                      <optgroup v-if="form.type === 'expense'" label="Dépenses">
                        <option value="fournitures">Fournitures</option>
                        <option value="marketing">Marketing</option>
                        <option value="transport">Transport</option>
                        <option value="frais_generaux">Frais généraux</option>
                        <option value="autres_charges">Autres charges</option>
                      </optgroup>
                    </select>
                  </div>

                  <!-- Date -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date *
                    </label>
                    <input
                      v-model="form.date"
                      type="date"
                      required
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>

                  <!-- Méthode de paiement -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Méthode de paiement *
                    </label>
                    <select
                      v-model="form.paymentMethod"
                      required
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="">Sélectionner</option>
                      <option value="cash">Espèces</option>
                      <option value="bank_transfer">Virement</option>
                      <option value="card">Carte bancaire</option>
                      <option value="check">Chèque</option>
                    </select>
                  </div>

                  <!-- TVA -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Taux TVA (%)
                    </label>
                    <select
                      v-model.number="form.vatRate"
                      class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option :value="0">0% (exonéré)</option>
                      <option :value="5.5">5.5% (taux réduit)</option>
                      <option :value="10">10% (taux intermédiaire)</option>
                      <option :value="20">20% (taux normal)</option>
                    </select>
                  </div>
                </div>

                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="submit"
                    :disabled="loading"
                    class="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 sm:col-start-2"
                  >
                    <span v-if="loading" class="mr-2">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </span>
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                    @click="$emit('close')"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { accountingService, type CreateTransactionRequest } from './services/accounting'

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const loading = ref(false)

const form = reactive<CreateTransactionRequest>({
  type: 'expense',
  category: '',
  description: '',
  amount: 0,
  vatRate: 20,
  date: new Date().toISOString().split('T')[0],
  paymentMethod: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await accountingService.createTransaction(form)
    emit('saved')
    // Réinitialiser le formulaire
    Object.assign(form, {
      type: 'expense',
      category: '',
      description: '',
      amount: 0,
      vatRate: 20,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: ''
    })
  } catch (error) {
    console.error('Erreur lors de la création:', error)
  } finally {
    loading.value = false
  }
}
</script>
