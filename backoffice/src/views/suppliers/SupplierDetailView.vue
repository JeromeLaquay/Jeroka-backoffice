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
                      :class="supplier.typeClient === 'company' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'">
                  {{ supplier.typeClient === 'company' ? 'Entreprise' : 'Particulier' }}
                </span>
              </div>
            </div>

            <div v-if="supplier.companyName">
              <label class="form-label">Nom de l'entreprise</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.companyName }}</div>
            </div>
            
            <div>
              <label class="form-label">Prénom</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.firstName }}</div>
            </div>

            <div>
              <label class="form-label">Nom</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.lastName }}</div>
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
        <div v-if="supplier.city || supplier.postalCode || supplier.country" class="card">
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            Adresse
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="supplier.postalCode">
              <label class="form-label">Code postal</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ supplier.postalCode }}</div>
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
            <div>
              <label class="form-label">Créé le</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(supplier.createdAt) }}</div>
            </div>

            <div>
              <label class="form-label">Modifié le</label>
              <div class="mt-1 text-sm text-gray-900 dark:text-gray-100">{{ formatDate(supplier.updatedAt) }}</div>
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
  const data = await personsService.getPerson(id)
  supplier.value = data && typeof data === 'object' && 'id' in data ? (data as Person) : null
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


