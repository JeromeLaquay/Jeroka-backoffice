<template>
  <div class="space-y-6" data-cy="users-page">
    <!-- Header -->
    <div class="sm:flex sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestion des utilisateurs
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Gérez les utilisateurs de la plateforme
        </p>
      </div>
      <div class="mt-4 sm:mt-0">
        <button
          @click="showCreateModal = true"
          class="btn-primary inline-flex items-center"
          data-cy="create-user-button"
        >
          <PlusIcon class="h-4 w-4 mr-2" />
          Créer un utilisateur
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="form-label">
            Recherche
          </label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nom, email..."
            class="form-input"
            data-cy="search-input"
          />
        </div>
        <div>
          <label class="form-label">
            Statut
          </label>
          <select
            v-model="filters.status"
            class="form-input"
            data-cy="status-filter"
          >
            <option value="">Tous</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
        <div>
          <label class="form-label">
            Rôle
          </label>
          <select
            v-model="filters.role"
            class="form-input"
            data-cy="role-filter"
          >
            <option value="">Tous</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="user">Utilisateur</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="applyFilters"
            class="btn-primary w-full"
            data-cy="apply-filters-button"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>

    <!-- Tableau des utilisateurs -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="table-header">
                Utilisateur
              </th>
              <th class="table-header">
                Email
              </th>
              <th class="table-header">
                Rôle
              </th>
              <th class="table-header">
                Entreprise
              </th>
              <th class="table-header">
                Statut
              </th>
              <th class="table-header">
                Dernière connexion
              </th>
              <th class="table-header text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                Chargement...
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                Aucun utilisateur trouvé
              </td>
            </tr>
            <tr
              v-else
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="table-cell">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <UserIcon class="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      ID: {{ user.id }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="table-cell">
                <div class="text-sm text-gray-900 dark:text-white">{{ user.email }}</div>
              </td>
              <td class="table-cell">
                <span
                  :class="getRoleBadgeClass(user.role)"
                  class="badge"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="table-cell">
                {{ user.company_name || 'N/A' }}
              </td>
              <td class="table-cell">
                <span
                  :class="user.is_active ? 'badge badge-success' : 'badge badge-danger'"
                >
                  {{ user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="table-cell text-gray-500 dark:text-gray-400">
                {{ user.last_login ? formatDate(user.last_login) : 'Jamais' }}
              </td>
              <td class="table-cell text-right">
                <div class="flex justify-end space-x-2">
                  <button
                    @click="viewUser(user)"
                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    data-cy="view-user-button"
                  >
                    Voir
                  </button>
                  <button
                    @click="editUser(user)"
                    class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    data-cy="edit-user-button"
                  >
                    Modifier
                  </button>
                  <button
                    @click="toggleUserStatus(user)"
                    :class="user.is_active ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'"
                    data-cy="toggle-status-button"
                  >
                    {{ user.is_active ? 'Désactiver' : 'Activer' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.totalPages > 1" class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="changePage(pagination.page - 1)"
              :disabled="pagination.page <= 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              @click="changePage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700 dark:text-gray-300">
                Affichage de
                <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span>
                à
                <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                sur
                <span class="font-medium">{{ pagination.total }}</span>
                résultats
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="changePage(pagination.page - 1)"
                  :disabled="pagination.page <= 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  v-for="page in getVisiblePages()"
                  :key="page"
                  @click="changePage(page)"
                  :class="page === pagination.page ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  {{ page }}
                </button>
                <button
                  @click="changePage(pagination.page + 1)"
                  :disabled="pagination.page >= pagination.totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modales -->
    <CreateUserModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="handleUserCreated"
    />
    <EditUserModal
      v-if="showEditModal && selectedUser"
      :user="selectedUser"
      @close="showEditModal = false"
      @updated="handleUserUpdated"
    />
    <UserDetailsModal
      v-if="showViewModal && selectedUser"
      :user="selectedUser"
      @close="showViewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { adminService, type AdminUser, type AdminFilters } from '@/services/admin';
import CreateUserModal from '../../components/admin/CreateUserModal.vue';
import EditUserModal from '../../components/admin/EditUserModal.vue';
import UserDetailsModal from '../../components/admin/UserDetailsModal.vue';
import { UserIcon, PlusIcon } from '@heroicons/vue/24/outline';

const users = ref<AdminUser[]>([]);
const loading = ref(false);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showViewModal = ref(false);
const selectedUser = ref<AdminUser | null>(null);
const pagination = ref<any>(null);

const filters = ref<AdminFilters>({
  search: '',
  status: '',
  role: '',
  page: 1,
  limit: 10,
  sort_by: 'created_at',
  sort_order: 'desc'
});

const loadUsers = async () => {
  try {
    loading.value = true;
    const response = await adminService.getUsers(filters.value);
    if (response.success && response.data) {
      users.value = response.data;
      pagination.value = response.pagination;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  filters.value.page = 1;
  loadUsers();
};

const changePage = (page: number) => {
  filters.value.page = page;
  loadUsers();
};

const getVisiblePages = () => {
  if (!pagination.value) return [];
  const current = pagination.value.page;
  const total = pagination.value.totalPages;
  const pages = [];
  
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i);
  }
  
  return pages;
};

const getRoleLabel = (role: string) => {
  const labels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    user: 'Utilisateur'
  };
  return labels[role as keyof typeof labels] || role;
};

const getRoleBadgeClass = (role: string) => {
  const classes = {
    super_admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  };
  return classes[role as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const viewUser = (user: AdminUser) => {
  selectedUser.value = user;
  showViewModal.value = true;
};

const editUser = (user: AdminUser) => {
  selectedUser.value = user;
  showEditModal.value = true;
};

const toggleUserStatus = async (user: AdminUser) => {
  try {
    const response = await adminService.toggleUserStatus(user.id);
    if (response.success) {
      await loadUsers();
    }
  } catch (error) {
    console.error('Erreur lors du changement de statut:', error);
  }
};

const handleUserCreated = () => {
  showCreateModal.value = false;
  loadUsers();
};

const handleUserUpdated = () => {
  showEditModal.value = false;
  loadUsers();
};

onMounted(() => {
  loadUsers();
});
</script>

