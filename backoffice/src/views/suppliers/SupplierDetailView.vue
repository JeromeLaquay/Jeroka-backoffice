<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Détails du Fournisseur</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Informations complètes du fournisseur
        </p>
      </div>
      
      <div class="flex space-x-3">
        <router-link
          :to="`/fournisseurs/${id}/edit`"
          class="btn-primary inline-flex items-center"
        >
          <PencilIcon class="h-4 w-4 mr-2" />
          Éditer
        </router-link>
        <router-link
          to="/fournisseurs"
          class="btn-secondary inline-flex items-center"
        >
          <ArrowLeftIcon class="h-4 w-4 mr-2" />
          Retour
        </router-link>
      </div>
    </div>

    <div v-if="supplier" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Informations principales -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Informations personnelles -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            Informations personnelles
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Type</label>
              <div class="mt-1">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="supplier.type_label === 'Entreprise' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'">
                  {{ supplier.type_label }}
                </span>
              </div>
            </div>

            <div v-if="supplier.company_name">
              <label class="form-label">Nom de l'entreprise</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.company_name }}</div>
            </div>
            
            <div>
              <label class="form-label">Prénom</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.first_name }}</div>
            </div>

            <div>
              <label class="form-label">Nom</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.last_name }}</div>
            </div>
            
            <div>
              <label class="form-label">Email</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.email }}</div>
            </div>
            
            <div>
              <label class="form-label">Téléphone</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.phone || '-' }}</div>
            </div>

            <div>
              <label class="form-label">Mobile</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.mobile || '-' }}</div>
            </div>
            
            <div>
              <label class="form-label">Site web</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                <a v-if="supplier.website" :href="supplier.website" target="_blank" class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                  {{ supplier.website }}
                </a>
                <span v-else>-</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Adresse -->
        <div v-if="supplier.address_line1 || supplier.city" class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            Adresse
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="supplier.address_line1" class="md:col-span-2">
              <label class="form-label">Adresse</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.address_line1 }}</div>
            </div>

            <div v-if="supplier.address_line2" class="md:col-span-2">
              <label class="form-label">Adresse ligne 2</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.address_line2 }}</div>
            </div>
            
            <div v-if="supplier.postal_code">
              <label class="form-label">Code postal</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.postal_code }}</div>
            </div>
            
            <div v-if="supplier.city">
              <label class="form-label">Ville</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.city }}</div>
            </div>
            
            <div v-if="supplier.country">
              <label class="form-label">Pays</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.country }}</div>
            </div>
          </div>
        </div>

        <!-- Informations entreprise -->
        <div v-if="supplier.type_label === 'Entreprise' && (supplier.siret || supplier.vat_number)" class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            Informations entreprise
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="supplier.siret">
              <label class="form-label">SIRET</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.siret }}</div>
            </div>
            
            <div v-if="supplier.vat_number">
              <label class="form-label">TVA Intracommunautaire</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.vat_number }}</div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="supplier.notes" class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            Notes
          </h3>
          <div class="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{{ supplier.notes }}</div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Statut -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Statut
          </h3>
          <div class="flex items-center">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  :class="getStatusClass(supplier.status)">
              {{ getStatusLabel(supplier.status) }}
            </span>
          </div>
        </div>

        <!-- Informations système -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Informations système
          </h3>
          
          <div class="space-y-4">
            <div v-if="supplier.source">
              <label class="form-label">Source</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.source }}</div>
            </div>

            <div>
              <label class="form-label">Créé le</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(supplier.created_at) }}</div>
            </div>

            <div>
              <label class="form-label">Modifié le</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(supplier.updated_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { personsService, type Person } from '../../services/persons'
import { PencilIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const id = String(route.params.id)
const supplier = ref<Person | null>(null)

async function load() {
  const response = await personsService.getPerson(id)
  supplier.value = response?.data || response
}

function getStatusClass(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'inactive':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    case 'prospect':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'active':
      return 'Actif'
    case 'inactive':
      return 'Inactif'
    case 'prospect':
      return 'Prospect'
    default:
      return status
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

onMounted(load)
</script>


