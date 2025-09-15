<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Créer une nouvelle entreprise
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
                class="form-input mb-2"
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
                  v-model="form.siret_number"
                  type="text"
                  class="form-input"
                  data-cy="siret-number-input"
                />
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
              class="btn-primary flex items-center"
              data-cy="create-button"
            >
              <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              {{ loading ? 'Création...' : 'Créer l\'entreprise' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { adminService, type CreateCompanyData } from '../../services/admin';
import { XMarkIcon } from '@heroicons/vue/24/outline';

const emit = defineEmits<{
  close: [];
  created: [];
}>();

const loading = ref(false);

const form = reactive<CreateCompanyData>({
  name: '',
  email: '',
  phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  postal_code: '',
  country: '',
  vat_number: '',
  siret_number: '',
  vat_rate: 20,
  tax_regime: 'standard',
  subscription_plan: 'free',
});

const closeModal = () => {
  emit('close');
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const response = await adminService.createCompany(form);
    if (response.success) {
      emit('created');
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'entreprise:', error);
  } finally {
    loading.value = false;
  }
};
</script>
