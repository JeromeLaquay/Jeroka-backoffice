<template>
  <div class="space-y-6">
    <!-- Informations générales -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Informations générales
      </h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="flex items-center space-x-6">
          <!-- Logo -->
          <div class="shrink-0">
            <img
              v-if="form.logo"
              :src="form.logo"
              :alt="form.name"
              class="h-20 w-20 rounded object-contain bg-gray-50 dark:bg-gray-700"
            />
            <div v-else class="h-20 w-20 rounded bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <BuildingOfficeIcon class="h-8 w-8 text-gray-400" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Logo de l'entreprise
            </label>
            <input
              ref="logoInput"
              type="file"
              accept="image/*"
              @change="handleLogoChange"
              class="sr-only"
            />
            <button
              type="button"
              @click="logoInput?.click()"
              class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <PhotoIcon class="h-4 w-4 mr-2" />
              Changer le logo
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom commercial *
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Raison sociale
            </label>
            <input
              v-model="form.legalName"
              type="text"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Secteur d'activité
            </label>
            <select
              v-model="form.industry"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Sélectionner</option>
              <option value="technology">Technologie</option>
              <option value="consulting">Conseil</option>
              <option value="retail">Commerce</option>
              <option value="manufacturing">Industrie</option>
              <option value="services">Services</option>
              <option value="healthcare">Santé</option>
              <option value="education">Éducation</option>
              <option value="finance">Finance</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Site web
            </label>
            <input
              v-model="form.website"
              type="url"
              placeholder="https://exemple.com"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email principal *
            </label>
            <input
              v-model="form.email"
              type="email"
              required
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Téléphone
            </label>
            <input
              v-model="form.phone"
              type="tel"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="Décrivez votre entreprise..."
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          ></textarea>
        </div>

        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span v-if="loading" class="mr-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            Mettre à jour
          </button>
        </div>
      </form>
    </div>

    <!-- Adresse -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Adresse
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adresse ligne 1
          </label>
          <input
            v-model="form.address.line1"
            type="text"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adresse ligne 2
          </label>
          <input
            v-model="form.address.line2"
            type="text"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Code postal
          </label>
          <input
            v-model="form.address.postalCode"
            type="text"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ville
          </label>
          <input
            v-model="form.address.city"
            type="text"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pays
          </label>
          <select
            v-model="form.address.country"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
            <option value="Luxembourg">Luxembourg</option>
            <option value="Canada">Canada</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Informations fiscales -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Informations fiscales
      </h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Numéro de TVA
          </label>
          <input
            v-model="form.taxSettings.vatNumber"
            type="text"
            placeholder="FR12345678901"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Numéro SIRET
          </label>
          <input
            v-model="form.taxSettings.siretNumber"
            type="text"
            placeholder="12345678901234"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Taux de TVA par défaut (%)
          </label>
          <select
            v-model.number="form.taxSettings.vatRate"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option :value="0">0% (exonéré)</option>
            <option :value="5.5">5.5% (taux réduit)</option>
            <option :value="10">10% (taux intermédiaire)</option>
            <option :value="20">20% (taux normal)</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Régime fiscal
          </label>
          <select
            v-model="form.taxSettings.taxRegime"
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Sélectionner</option>
            <option value="micro">Micro-entreprise</option>
            <option value="reel_simplifie">Réel simplifié</option>
            <option value="reel_normal">Réel normal</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { BuildingOfficeIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import { settingsService, type CompanySettings } from '../../services/settings.ts'

interface Props {
  settings: CompanySettings | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
}>()

const loading = ref(false)
const logoInput = ref<HTMLInputElement>()

const form = reactive({
  name: '',
  legalName: '',
  industry: '',
  description: '',
  logo: '',
  website: '',
  email: '',
  phone: '',
  address: {
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    country: 'France'
  },
  taxSettings: {
    vatNumber: '',
    siretNumber: '',
    vatRate: 20,
    taxRegime: ''
  }
})

// Watchers
watch(() => props.settings, (settings) => {
  if (settings) {
    Object.assign(form, {
      name: settings.name || '',
      legalName: settings.legalName || '',
      industry: settings.industry || '',
      description: settings.description || '',
      logo: settings.logo || '',
      website: settings.website || '',
      email: settings.email || '',
      phone: settings.phone || '',
      address: {
        line1: settings.address?.line1 || '',
        line2: settings.address?.line2 || '',
        city: settings.address?.city || '',
        postalCode: settings.address?.postalCode || '',
        country: settings.address?.country || 'France'
      },
      taxSettings: {
        vatNumber: settings.taxSettings?.vatNumber || '',
        siretNumber: settings.taxSettings?.siretNumber || '',
        vatRate: settings.taxSettings?.vatRate || 20,
        taxRegime: settings.taxSettings?.taxRegime || ''
      }
    })
  }
}, { immediate: true })

// Méthodes
const handleLogoChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    try {
      loading.value = true
      const response = await settingsService.uploadLogo(file)
      form.logo = response.data.logo
      emit('updated')
    } catch (error) {
      console.error('Erreur lors du téléchargement du logo:', error)
    } finally {
      loading.value = false
    }
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await settingsService.updateCompanySettings(form)
    emit('updated')
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    loading.value = false
  }
}
</script>
