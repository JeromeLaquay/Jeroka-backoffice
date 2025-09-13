<template>
  <div class="space-y-6">
    <!-- Changement de mot de passe -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Changer le mot de passe
      </h3>
      
      <form @submit.prevent="handlePasswordChange" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mot de passe actuel *
          </label>
          <input
            v-model="passwordForm.currentPassword"
            type="password"
            required
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nouveau mot de passe *
          </label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            required
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirmer le nouveau mot de passe *
          </label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            required
            class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          <span v-if="loading" class="mr-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          </span>
          Changer le mot de passe
        </button>
      </form>
    </div>

    <!-- Authentification à deux facteurs -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Authentification à deux facteurs
      </h3>
      
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-900 dark:text-gray-100">
            Activer l'authentification à deux facteurs
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Ajouter une couche de sécurité supplémentaire à votre compte
          </p>
        </div>
        <button
          @click="toggleTwoFactor"
          :disabled="loading"
          :class="[
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50',
            profile?.twoFactorEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
          ]"
        >
          <span
            :class="[
              'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              profile?.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
            ]"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { settingsService, type UserProfile } from '../../services/settings.ts'

interface Props {
  profile: UserProfile | null
}

defineProps<Props>()

const emit = defineEmits<{
  updated: []
}>()

const loading = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handlePasswordChange = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('Les mots de passe ne correspondent pas')
    return
  }

  loading.value = true
  try {
    await settingsService.changePassword(passwordForm)
    // Réinitialiser le formulaire
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    emit('updated')
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
  } finally {
    loading.value = false
  }
}

const toggleTwoFactor = async () => {
  // TODO: Implémenter la logique 2FA
  console.log('Toggle 2FA')
}
</script>
