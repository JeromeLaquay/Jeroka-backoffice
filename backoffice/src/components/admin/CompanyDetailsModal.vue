<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Détails de l'entreprise
          </h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <!-- Content -->
        <div class="space-y-6">
          <!-- Informations générales -->
          <div class="card">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <BuildingOfficeIcon class="h-5 w-5 mr-2" />
              Informations générales
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nom</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ company.name }}</p>
              </div>
              <div>
                <label class="form-label">Email</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ company.email }}</p>
              </div>
              <div>
                <label class="form-label">Téléphone</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ company.phone || 'N/A' }}</p>
              </div>
              <div>
                <label class="form-label">ID</label>
                <p class="text-sm text-gray-900 dark:text-white font-mono">{{ company.id }}</p>
              </div>
            </div>
          </div>

          <!-- Adresse -->
          <div v-if="company.address_line1 || company.city" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPinIcon class="h-5 w-5 mr-2" />
              Adresse
            </h4>
            <div class="space-y-2">
              <p v-if="company.address_line1" class="text-sm text-gray-900 dark:text-white">
                {{ company.address_line1 }}
              </p>
              <p v-if="company.address_line2" class="text-sm text-gray-900 dark:text-white">
                {{ company.address_line2 }}
              </p>
              <p v-if="company.city || company.postal_code" class="text-sm text-gray-900 dark:text-white">
                {{ company.postal_code }} {{ company.city }}
              </p>
              <p v-if="company.country" class="text-sm text-gray-900 dark:text-white">
                {{ company.country }}
              </p>
            </div>
          </div>

          <!-- Informations fiscales -->
          <div v-if="company.vat_number || company.siret_number" class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <DocumentTextIcon class="h-5 w-5 mr-2" />
              Informations fiscales
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="company.vat_number">
                <label class="form-label">Numéro TVA</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ company.vat_number }}</p>
              </div>
              <div v-if="company.siret_number">
                <label class="form-label">Numéro SIRET</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ company.siret_number }}</p>
              </div>
              <div v-if="company.vat_rate">
                <label class="form-label">Taux de TVA</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ company.vat_rate }}%</p>
              </div>
              <div v-if="company.tax_regime">
                <label class="form-label">Régime fiscal</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ company.tax_regime }}</p>
              </div>
            </div>
          </div>

          <!-- Abonnement et statut -->
          <div class="card">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCardIcon class="h-5 w-5 mr-2" />
              Abonnement et statut
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="form-label">Plan d'abonnement</label>
                <span
                  :class="getSubscriptionBadgeClass(company.subscription_plan)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getSubscriptionLabel(company.subscription_plan) }}
                </span>
              </div>
              <div>
                <label class="form-label">Statut</label>
                <span
                  :class="company.subscription_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getSubscriptionStatusLabel(company.subscription_status) }}
                </span>
              </div>
              <div>
                <label class="form-label">Entreprise</label>
                <span
                  :class="company.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ company.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>
            <div v-if="company.subscription_expires_at" class="mt-4">
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Expiration de l'abonnement</label>
              <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(company.subscription_expires_at) }}</p>
            </div>
          </div>

          <!-- Statistiques -->
          <div class="card">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ChartBarIcon class="h-5 w-5 mr-2" />
              Statistiques
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nombre d'utilisateurs</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ company.user_count || 0 }}</p>
              </div>
              <div>
                <label class="form-label">Date de création</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(company.created_at) }}</p>
              </div>
              <div>
                <label class="form-label">Dernière mise à jour</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(company.updated_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              @click="closeModal"
              class="btn-secondary"
              data-cy="close-button"
            >
              Fermer
            </button>
            <button
              @click="editCompany"
              class="btn-primary"
              data-cy="edit-button"
            >
              Modifier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type AdminCompany } from '../../services/admin';
import {
  XMarkIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline';

interface Props {
  company: AdminCompany;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  edit: [company: AdminCompany];
}>();

const getSubscriptionLabel = (plan?: string) => {
  const labels = {
    free: 'Gratuit',
    basic: 'Basique',
    premium: 'Premium',
    enterprise: 'Enterprise'
  };
  return labels[plan as keyof typeof labels] || 'N/A';
};

const getSubscriptionBadgeClass = (plan?: string) => {
  const classes = {
    free: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    premium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    enterprise: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  };
  return classes[plan as keyof typeof classes] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
};

const getSubscriptionStatusLabel = (status?: string) => {
  const labels = {
    active: 'Actif',
    suspended: 'Suspendu',
    cancelled: 'Annulé'
  };
  return labels[status as keyof typeof labels] || 'N/A';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const closeModal = () => {
  emit('close');
};

const editCompany = () => {
  emit('edit', props.company);
  emit('close');
};
</script>
