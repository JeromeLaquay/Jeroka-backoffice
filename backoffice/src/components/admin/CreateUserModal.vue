<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Créer un nouvel utilisateur
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
                Mot de passe *
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                minlength="8"
                class="form-input"
                data-cy="password-input"
              />
            </div>
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
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Entreprise *
            </label>
            <select
              v-model="form.company_id"
              required
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
              data-cy="create-button"
            >
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Création...' : 'Créer l\'utilisateur' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { adminService, type CreateUserData, type AdminCompany } from '../../services/admin';
import { XMarkIcon } from '@heroicons/vue/24/outline';

const emit = defineEmits<{
  close: [];
  created: [];
}>();

const loading = ref(false);
const companies = ref<AdminCompany[]>([]);

const form = reactive<CreateUserData>({
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  role: 'user',
  company_id: '',
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

const closeModal = () => {
  emit('close');
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const response = await adminService.createUser(form);
    if (response.success) {
      emit('created');
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCompanies();
});
</script>
