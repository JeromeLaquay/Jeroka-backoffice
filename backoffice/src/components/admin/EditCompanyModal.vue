<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Modifier l'entreprise
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
          <!-- Informations de l'entreprise -->
          <div class="space-y-4">
            <h4 class="text-md font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Informations de l'entreprise
            </h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">
                  Nom de l'entreprise *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="form-input"
                  data-cy="company-name-input"
                />
              </div>
              <div>
                <label class="form-label">
                  Email *
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="form-input"
                  data-cy="company-email-input"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">
                  Téléphone
                </label>
                <input
                  v-model="form.phone"
                  type="tel"
                  class="form-input"
                  data-cy="company-phone-input"
                />
              </div>
              <div>
                <label class="form-label">
                  Plan d'abonnement
                </label>
                <select
                  v-model="form.subscription_plan"
                  class="form-input"
                  data-cy="subscription-plan-select"
                >
                  <option value="free">Gratuit</option>
                  <option value="basic">Basique</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label class="form-label">
                Adresse
              </label>
              <input
                v-model="form.address_line1"
                type="text"
                placeholder="Adresse ligne 1"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white mb-2"
                data-cy="address-line1-input"
              />
              <input
                v-model="form.address_line2"
                type="text"
                placeholder="Adresse ligne 2"
                class="form-input"
                data-cy="address-line2-input"
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="form-label">
                  Ville
                </label>
                <input
                  v-model="form.city"
                  type="text"
                  class="form-input"
                  data-cy="city-input"
                />
              </div>
              <div>
                <label class="form-label">
                  Code postal
                </label>
                <input
                  v-model="form.postal_code"
                  type="text"
                  class="form-input"
                  data-cy="postal-code-input"
                />
              </div>
              <div>
                <label class="form-label">
                  Pays
                </label>
                <input
                  v-model="form.country"
                  type="text"
                  class="form-input"
                  data-cy="country-input"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">
                  Numéro TVA
                </label>
                <input
                  v-model="form.vat_number"
                  type="text"
                  class="form-input"
                  data-cy="vat-number-input"
                />
              </div>
              <div>
                <label class="form-label">
                  Numéro SIRET
                </label>
                <input
                  v-model="form.siret"
                  type="text"
                  class="form-input"
                  data-cy="siret-number-input"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">
                  Taux de TVA (%)
                </label>
                <input
                  v-model.number="form.vat_number"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  class="form-input"
                  data-cy="vat-rate-input"
                />
              </div>
              <div>
                <label class="form-label">
                  Régime fiscal
                </label>
                <select
                  v-model="form.tax_regime"
                  class="form-input"
                  data-cy="tax-regime-select"
                >
                  <option value="standard">Standard</option>
                  <option value="simplified">Simplifié</option>
                  <option value="micro">Micro-entreprise</option>
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
                Entreprise active
              </label>
            </div>
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
import { adminService, type UpdateCompanyData, type AdminCompany } from '../../services/admin';
import { XMarkIcon } from '@heroicons/vue/24/outline';

interface Props {
  company: AdminCompany;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  updated: [];
}>();

const loading = ref(false);

const form = reactive<UpdateCompanyData>({
  name: '',
  email: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  postal_code: '',
  country: '',
  vat_number: '',
  siret: '',
  vat_number: 20,
  tax_regime: 'standard',
  subscription_plan: 'free',
  is_active: true
});

const initializeForm = () => {
  form.name = props.company.name || '';
  form.email = props.company.email || '';
  form.phone = props.company.phone || '';
  form.address_line1 = props.company.address_line1 || '';
  form.address_line2 = props.company.address_line2 || '';
  form.city = props.company.city || '';
  form.postal_code = props.company.postal_code || '';
  form.country = props.company.country || '';
  form.vat_number = props.company.vat_number || '';
  form.siret = props.company.siret || '';
  form.vat_number = props.company.vat_number || 20;
  form.tax_regime = props.company.tax_regime || 'standard';
  form.subscription_plan = props.company.subscription_plan || 'free';
  form.is_active = props.company.is_active;
};

const closeModal = () => {
  emit('close');
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const response = await adminService.updateCompany(props.company.id, form);
    if (response.success) {
      emit('updated');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'entreprise:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  initializeForm();
});
</script>
