<template>
  <div class="space-y-6">
    <!-- Informations personnelles -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Informations personnelles
      </h3>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="flex items-center space-x-6">
          <!-- Avatar -->
          <div class="shrink-0">
            <img
              :src="form.avatar || defaultAvatar"
              :alt="form.firstName + ' ' + form.lastName"
              class="h-20 w-20 rounded-full object-cover"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photo de profil
            </label>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              @change="handleAvatarChange"
              class="sr-only"
            />
            <button
              type="button"
              @click="avatarInput?.click()"
              class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <PhotoIcon class="h-4 w-4 mr-2" />
              Changer la photo
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prénom *
            </label>
            <input
              v-model="form.firstName"
              type="text"
              required
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom *
            </label>
            <input
              v-model="form.lastName"
              type="text"
              required
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              :value="profile?.email"
              type="email"
              disabled
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 shadow-sm sm:text-sm"
            />
            <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
              L'email ne peut pas être modifié ici
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Téléphone
            </label>
            <input
              v-model="form.phone"
              type="tel"
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Poste
            </label>
            <input
              v-model="form.position"
              type="text"
              placeholder="Directeur, Développeur, etc."
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Département
            </label>
            <input
              v-model="form.department"
              type="text"
              placeholder="IT, Marketing, etc."
              class="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            :disabled="loading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span v-if="loading" class="mr-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            Mettre à jour le profil
          </button>
        </div>
      </form>
    </div>

    <!-- Informations du compte -->
    <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        Informations du compte
      </h3>
      
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Statut du compte</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ profile?.isActive ? 'Actif' : 'Inactif' }}
            </p>
          </div>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              profile?.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            ]"
          >
            {{ profile?.isActive ? 'Actif' : 'Inactif' }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Email vérifié</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ profile?.emailVerified ? 'Vérifié' : 'Non vérifié' }}
            </p>
          </div>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              profile?.emailVerified 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            ]"
          >
            {{ profile?.emailVerified ? 'Vérifié' : 'En attente' }}
          </span>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Dernière connexion</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ profile?.lastLoginAt ? formatDate(profile.lastLoginAt) : 'Jamais' }}
            </p>
          </div>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">Membre depuis</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(profile?.createdAt) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { PhotoIcon } from '@heroicons/vue/24/outline'
import { settingsService, type UserProfile } from './services/settings'

interface Props {
  profile: UserProfile | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  updated: []
}>()

const loading = ref(false)
const avatarInput = ref<HTMLInputElement>()

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  position: '',
  department: '',
  avatar: ''
})

const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=a855f7&color=fff'

// Watchers
watch(() => props.profile, (profile) => {
  if (profile) {
    Object.assign(form, {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      position: profile.position || '',
      department: profile.department || '',
      avatar: profile.avatar || ''
    })
  }
}, { immediate: true })

// Méthodes
const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    try {
      loading.value = true
      const response = await settingsService.uploadAvatar(file)
      form.avatar = response.data.avatar
      emit('updated')
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'avatar:', error)
    } finally {
      loading.value = false
    }
  }
}

const handleSubmit = async () => {
  loading.value = true
  try {
    await settingsService.updateUserProfile({
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      position: form.position,
      department: form.department
    })
    emit('updated')
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  } finally {
    loading.value = false
  }
}

// Utilitaires
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
