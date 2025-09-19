<template>
  <div class="space-y-6" data-cy="suppliers-page">
    <!-- En-tête -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion des Fournisseurs</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Gérez votre base de données fournisseurs et partenaires
        </p>
      </div>
      
      <div class="flex space-x-3">
        <button
          @click="load"
          class="btn-secondary inline-flex items-center"
        >
          <ArrowPathIcon class="h-4 w-4 mr-2" />
          Actualiser
        </button>
        
        <router-link
          to="/fournisseurs/create"
          class="btn-primary inline-flex items-center"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Nouveau Fournisseur
        </router-link>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-4">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UsersIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Fournisseurs
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats.total }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-6 w-6 text-success-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Fournisseurs Actifs
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats.active }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BuildingOfficeIcon class="h-6 w-6 text-secondary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Entreprises
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats.companies }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtres et recherche -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div class="p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recherche
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
              <input
                v-model="search"
                type="text"
                class="form-input pl-10"
                placeholder="Nom, email, entreprise..."
              />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Statut
            </label>
            <select v-model="status" class="form-input">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select v-model="type" class="form-input">
              <option value="">Tous les types</option>
              <option value="Particulier">Particulier</option>
              <option value="Entreprise">Entreprise</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableau des fournisseurs -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Fournisseur
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Contact
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Créé le
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="supplier in suppliers" :key="supplier.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
                        {{ (supplier.first_name?.[0] || '') + (supplier.last_name?.[0] || '') }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {{ supplier.company_name || `${supplier.first_name} ${supplier.last_name}` }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ supplier.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="supplier.type_label === 'Entreprise' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'">
                  {{ supplier.type_label }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {{ supplier.first_name }} {{ supplier.last_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(supplier.status)">
                  {{ getStatusLabel(supplier.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(supplier.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <router-link
                    :to="`/fournisseurs/${supplier.id}`"
                    class="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Voir
                  </router-link>
                  <router-link
                    :to="`/fournisseurs/${supplier.id}/edit`"
                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Éditer
                  </router-link>
                  <button
                    @click="remove(supplier.id)"
                    class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="prev"
            :disabled="page === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <button
            @click="next"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Suivant
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700 dark:text-gray-300">
              Affichage de {{ (page - 1) * limit + 1 }} à {{ Math.min(page * limit, suppliers.length) }} sur {{ suppliers.length }} résultats
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="prev"
                :disabled="page === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                @click="next"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { personsService, type Person, type PersonStats } from '../../services/persons'
import { 
  ArrowPathIcon, 
  PlusIcon, 
  UsersIcon, 
  CheckCircleIcon, 
  BuildingOfficeIcon,
  MagnifyingGlassIcon 
} from '@heroicons/vue/24/outline'

const suppliers = ref<Person[]>([])
const stats = ref<PersonStats>({ total: 0, active: 0, companies: 0 })
const search = ref('')
const status = ref('')
const type = ref('')
const page = ref(1)
const limit = ref(10)

async function load() {
  const response = await personsService.getPersons({ 
    page: page.value, 
    limit: limit.value, 
    type: 'supplier', 
    search: search.value || undefined, 
    status: (status.value as any) || undefined 
  })
  console.log('list', response)
  suppliers.value = response?.data || []
  const s = await personsService.getPersonStats().catch(() => ({ total: 0, active: 0, companies: 0 }))
  stats.value = s
}

function next() { page.value += 1; load() }
function prev() { if (page.value > 1) { page.value -= 1; load() } }

async function remove(id: string) {
  await personsService.deletePerson(id)
  await load()
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
watch([search, status, type], () => { page.value = 1; load() })
</script>


