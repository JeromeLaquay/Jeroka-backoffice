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
              <div>
                <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <ArrowUpTrayIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <DialogTitle as="h3" class="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
                    Importer des transactions
                  </DialogTitle>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Importez vos transactions depuis un fichier CSV ou Excel.
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-5 space-y-4">
                <!-- Sélection du format -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Format de fichier
                  </label>
                  <div class="grid grid-cols-2 gap-3">
                    <label class="flex items-center p-3 border rounded-lg cursor-pointer" :class="selectedFormat === 'csv' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-300 dark:border-gray-600'">
                      <input
                        v-model="selectedFormat"
                        type="radio"
                        value="csv"
                        class="sr-only"
                      />
                      <div class="text-center">
                        <DocumentIcon class="h-8 w-8 mx-auto text-green-500" />
                        <div class="mt-1 text-sm font-medium">CSV</div>
                      </div>
                    </label>
                    <label class="flex items-center p-3 border rounded-lg cursor-pointer" :class="selectedFormat === 'excel' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-300 dark:border-gray-600'">
                      <input
                        v-model="selectedFormat"
                        type="radio"
                        value="excel"
                        class="sr-only"
                      />
                      <div class="text-center">
                        <DocumentIcon class="h-8 w-8 mx-auto text-green-600" />
                        <div class="mt-1 text-sm font-medium">Excel</div>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Zone de drop -->
                <div
                  @dragover.prevent
                  @drop.prevent="handleDrop"
                  @click="fileInput?.click()"
                  class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <ArrowUpTrayIcon class="mx-auto h-12 w-12 text-gray-400" />
                  <div class="mt-4">
                    <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Cliquez ou glissez votre fichier ici
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ selectedFormat === 'csv' ? 'Fichiers CSV acceptés' : 'Fichiers Excel (.xlsx) acceptés' }}
                    </p>
                  </div>
                  <input
                    ref="fileInput"
                    type="file"
                    :accept="selectedFormat === 'csv' ? '.csv' : '.xlsx'"
                    @change="handleFileSelect"
                    class="hidden"
                  />
                </div>

                <!-- Fichier sélectionné -->
                <div v-if="selectedFile" class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <DocumentIcon class="h-8 w-8 text-blue-500" />
                      <div class="ml-3">
                        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ selectedFile.name }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(selectedFile.size) }}</p>
                      </div>
                    </div>
                    <button
                      @click="removeFile"
                      class="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <!-- Format attendu -->
                <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Format attendu :</h4>
                  <div class="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                    <p>• Date (YYYY-MM-DD)</p>
                    <p>• Description</p>
                    <p>• Montant (nombre décimal)</p>
                    <p>• Type (income/expense)</p>
                    <p>• Catégorie</p>
                    <p>• Méthode de paiement</p>
                  </div>
                </div>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="button"
                  :disabled="!selectedFile || loading"
                  @click="handleImport"
                  class="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50 sm:col-start-2"
                >
                  <span v-if="loading" class="mr-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </span>
                  Importer
                </button>
                <button
                  type="button"
                  class="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:col-start-1 sm:mt-0"
                  @click="$emit('close')"
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
import { ArrowUpTrayIcon, DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { accountingService } from '@/services/accounting'

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  imported: []
}>()

const loading = ref(false)
const selectedFormat = ref<'csv' | 'excel'>('csv')
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement>()

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleDrop = (event: DragEvent) => {
  if (event.dataTransfer && event.dataTransfer.files[0]) {
    selectedFile.value = event.dataTransfer.files[0]
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleImport = async () => {
  if (!selectedFile.value) return

  loading.value = true
  try {
    await accountingService.importTransactions(selectedFile.value, selectedFormat.value)
    emit('imported')
    removeFile()
  } catch (error) {
    console.error('Erreur lors de l\'import:', error)
  } finally {
    loading.value = false
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>
