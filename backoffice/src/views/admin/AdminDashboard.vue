<template>
  <div class="space-y-6" data-cy="admin-dashboard">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Tableau de bord administrateur
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les entreprises et les utilisateurs de la plateforme
        </p>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-4" data-cy="admin-stats">
      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BuildingOfficeIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Entreprises
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats?.total_companies || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div class="text-sm">
            <span class="text-green-600 dark:text-green-400">
              +{{ stats?.new_companies_this_month || 0 }} ce mois
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <UserGroupIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Utilisateurs
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats?.total_users || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div class="text-sm">
            <span class="text-green-600 dark:text-green-400">
              +{{ stats?.new_users_this_month || 0 }} ce mois
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Entreprises actives
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ stats?.active_companies || 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div class="text-sm">
            <span class="text-gray-600 dark:text-gray-400">
              {{ Math.round(((stats?.active_companies || 0) / (stats?.total_companies || 1)) * 100) }}% du total
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <CurrencyDollarIcon class="h-6 w-6 text-primary-600" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Abonnements Premium
                </dt>
                <dd class="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {{ (stats?.subscription_stats?.premium || 0) + (stats?.subscription_stats?.enterprise || 0) }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div class="text-sm">
            <span class="text-gray-600 dark:text-gray-400">
              {{ stats?.subscription_stats?.premium || 0 }} Premium, {{ stats?.subscription_stats?.enterprise || 0 }} Enterprise
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actions rapides
        </h3>
        <div class="space-y-3">
          <button
            @click="showCreateCompanyModal = true"
            class="btn-primary w-full flex items-center justify-center"
            data-cy="create-company-button"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Créer une entreprise
          </button>
          <button
            @click="showCreateUserModal = true"
            class="btn-success w-full flex items-center justify-center"
            data-cy="create-user-button"
          >
            <PlusIcon class="h-5 w-5 mr-2" />
            Créer un utilisateur
          </button>
        </div>
      </div>

      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Navigation rapide
        </h3>
        <div class="space-y-3">
          <router-link
            to="/admin/companies"
            class="btn-secondary w-full flex items-center justify-center"
            data-cy="manage-companies-button"
          >
            <BuildingOfficeIcon class="h-5 w-5 mr-2" />
            Gérer les entreprises
          </router-link>
          <router-link
            to="/admin/users"
            class="btn-secondary w-full flex items-center justify-center"
            data-cy="manage-users-button"
          >
            <UserGroupIcon class="h-5 w-5 mr-2" />
            Gérer les utilisateurs
          </router-link>
        </div>
      </div>
    </div>

    <!-- Répartition des abonnements -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Répartition des abonnements
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {{ stats?.subscription_stats?.free || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Gratuit</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ stats?.subscription_stats?.basic || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Basique</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {{ stats?.subscription_stats?.premium || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Premium</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {{ stats?.subscription_stats?.enterprise || 0 }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Enterprise</div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <CreateCompanyModal
      v-if="showCreateCompanyModal"
      @close="showCreateCompanyModal = false"
      @created="handleCompanyCreated"
    />
    <CreateUserModal
      v-if="showCreateUserModal"
      @close="showCreateUserModal = false"
      @created="handleUserCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { adminService, type AdminStats } from '@/services/admin';
import CreateCompanyModal from '../../components/admin/CreateCompanyModal.vue';
import CreateUserModal from '../../components/admin/CreateUserModal.vue';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  PlusIcon
} from '@heroicons/vue/24/outline';

const stats = ref<AdminStats | null>(null);
const loading = ref(false);
const router = useRouter();
const authStore = useAuthStore();

const showCreateCompanyModal = ref(false);
const showCreateUserModal = ref(false);

const loadStats = async () => {
  try {
    loading.value = true;
    const response = await adminService.getStats();
    if (response.success && response.data) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error);
  } finally {
    loading.value = false;
  }
};

const handleCompanyCreated = () => {
  showCreateCompanyModal.value = false;
  loadStats();
};

const handleUserCreated = () => {
  showCreateUserModal.value = false;
  loadStats();
};

onMounted(() => {
  loadStats();
});
</script>

