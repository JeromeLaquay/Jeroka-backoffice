<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Modifier l'utilisateur
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">
                Prénom *
              </label>
              <input
                v-model="form.first_name"
                type="text"
                required
                class="form-input"
                data-cy="first-name-input"
              />
            </div>
            <div>
              <label class="form-label">
                Nom *
              </label>
              <input
                v-model="form.last_name"
                type="text"
                required
                class="form-input"
                data-cy="last-name-input"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">
                Email *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="form-input"
                data-cy="email-input"
              />
            </div>
            <div>
              <label class="form-label">
                Téléphone
              </label>
              <input
                v-model="form.telephone"
                type="tel"
                class="form-input"
                data-cy="telephone-input"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">
                Rôle *
              </label>
              <select
                v-model="form.role"
                required
                class="form-input"
                data-cy="role-select"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
                <option value="super_admin">Super Administrateur</option>
              </select>
            </div>
            <div>
              <label class="form-label">
                Entreprise
              </label>
              <select
                v-model="form.company_id"
                class="form-input"
                data-cy="company-select"
              >
                <option value="">Sélectionner une entreprise</option>
                <option
                  v-for="company in companies"
                  :key="company.id"
                  :value="company.id"
                >
                  {{ company.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="flex items-center">
            <input
              v-model="form.is_active"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              data-cy="is-active-checkbox"
            />
            <label class="ml-2 block text-sm text-gray-900 dark:text-white">
              Utilisateur actif
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="closeModal"
              class="btn-secondary"
              data-cy="cancel-button"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              data-cy="update-button"
            >
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Mise à jour...' : 'Mettre à jour' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { adminService, type UpdateUserData, type AdminUser, type AdminCompany } from '../../services/admin';
import { XMarkIcon } from '@heroicons/vue/24/outline';

interface Props {
  user: AdminUser;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const loading = ref(false);
const companies = ref<AdminCompany[]>([]);

const form = reactive<UpdateUserData>({
  email: '',
  first_name: '',
  last_name: '',
  role: 'user',
  is_active: true,
  telephone: ''
});

const loadCompanies = async () => {
  try {
    const response = await adminService.getCompanies({ limit: 100 });
    if (response.success && response.data) {
      companies.value = response.data;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des entreprises:', error);
  }
};

const initializeForm = () => {
  form.email = props.user.email || '';
  form.first_name = props.user.first_name || '';
  form.last_name = props.user.last_name || '';
  form.role = props.user.role || 'user';
  form.is_active = props.user.is_active;
  form.telephone = props.user.telephone || '';
  // Note: company_id n'est pas dans UpdateUserData, on le gère séparément si nécessaire
};

const closeModal = () => {
  emit('close');
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const response = await adminService.updateUser(props.user.id, form);
    if (response.success) {
      emit('updated');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initializeForm();
  loadCompanies();
});
</script>
