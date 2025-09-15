<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeModal">
    <div class="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800" @click.stop>
      <div class="mt-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">
            Détails de l'utilisateur
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
          <!-- Informations personnelles -->
          <div class="card">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <UserIcon class="h-5 w-5 mr-2" />
              Informations personnelles
            </h4>
            <div class="flex items-center mb-4">
              <div class="flex-shrink-0 h-16 w-16">
                <div class="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
                  <UserIcon class="h-8 w-8 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div class="ml-4">
                <h5 class="text-lg font-medium text-gray-900 dark:text-white">
                  {{ user.first_name }} {{ user.last_name }}
                </h5>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Prénom</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ user.first_name }}</p>
              </div>
              <div>
                <label class="form-label">Nom</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ user.last_name }}</p>
              </div>
              <div>
                <label class="form-label">Email</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ user.email }}</p>
              </div>
              <div>
                <label class="form-label">Téléphone</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ user.telephone || 'N/A' }}</p>
              </div>
              <div>
                <label class="form-label">ID</label>
                <p class="text-sm text-gray-900 dark:text-white font-mono">{{ user.id }}</p>
              </div>
            </div>
          </div>

          <!-- Rôle et permissions -->
          <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ShieldCheckIcon class="h-5 w-5 mr-2" />
              Rôle et permissions
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Rôle</label>
                <span
                  :class="getRoleBadgeClass(user.role)"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </div>
              <div>
                <label class="form-label">Statut</label>
                <span
                  :class="user.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
                  class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ user.is_active ? 'Actif' : 'Inactif' }}
                </span>
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Permissions</label>
              <div class="space-y-1">
                <div v-for="permission in getUserPermissions(user.role)" :key="permission" class="flex items-center">
                  <CheckIcon class="h-4 w-4 text-green-500 mr-2" />
                  <span class="text-sm text-gray-700 dark:text-gray-300">{{ permission }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Informations de connexion -->
          <div class="card">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ClockIcon class="h-5 w-5 mr-2" />
              Informations de connexion
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Dernière connexion</label>
                <p class="text-sm text-gray-900 dark:text-white">
                  {{ user.last_login ? formatDate(user.last_login) : 'Jamais connecté' }}
                </p>
              </div>
              <div>
                <label class="form-label">Date de création</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(user.created_at) }}</p>
              </div>
              <div>
                <label class="form-label">Dernière mise à jour</label>
                <p class="text-sm text-gray-900 dark:text-white">{{ formatDate(user.updated_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Entreprise associée -->
          <div v-if="user.company_name" class="card">
            <h4 class="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <BuildingOfficeIcon class="h-5 w-5 mr-2" />
              Entreprise associée
            </h4>
            <div>
              <label class="block text-sm font-medium text-gray-500 dark:text-gray-400">Nom de l'entreprise</label>
              <p class="text-sm text-gray-900 dark:text-white">{{ user.company_name }}</p>
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
              @click="editUser"
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
import { type AdminUser } from '../../services/admin';
import {
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CheckIcon
} from '@heroicons/vue/24/outline';

interface Props {
  user: AdminUser;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  edit: [user: AdminUser];
}>();

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

const getUserPermissions = (role: string) => {
  const permissions = {
    super_admin: [
      'Gestion complète de la plateforme',
      'Gestion des entreprises',
      'Gestion des utilisateurs',
      'Accès aux statistiques globales',
      'Configuration système'
    ],
    admin: [
      'Gestion de l\'entreprise',
      'Gestion des utilisateurs de l\'entreprise',
      'Accès aux rapports',
      'Configuration des paramètres'
    ],
    user: [
      'Accès aux fonctionnalités de base',
      'Gestion de son profil',
      'Consultation des données'
    ]
  };
  return permissions[role as keyof typeof permissions] || [];
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

const editUser = () => {
  emit('edit', props.user);
  emit('close');
};
</script>
