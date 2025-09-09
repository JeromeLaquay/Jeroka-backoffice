<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Mon profil</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Navigation du profil -->
      <div class="lg:col-span-1">
        <nav class="space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === tab.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            ]"
          >
            <component :is="tab.icon" class="h-5 w-5 mr-2 inline" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Contenu du profil -->
      <div class="lg:col-span-2">
        <!-- Informations personnelles -->
        <div v-if="activeTab === 'profile'" class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>
          
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  v-model="profileForm.firstName"
                  type="text"
                  required
                  class="input-field"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  v-model="profileForm.lastName"
                  type="text"
                  required
                  class="input-field"
                >
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="profileForm.email"
                type="email"
                required
                class="input-field"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                v-model="profileForm.phone"
                type="tel"
                class="input-field"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input
                v-model="profileForm.birthDate"
                type="date"
                class="input-field"
              >
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="btn-primary disabled:opacity-50"
              >
                <LoadingSpinner v-if="loading" size="sm" />
                <span v-else>Mettre à jour</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Adresses -->
        <div v-if="activeTab === 'addresses'" class="card p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Mes adresses</h2>
            <button class="btn-primary text-sm">
              Ajouter une adresse
            </button>
          </div>
          
          <div class="text-center py-8 text-gray-500">
            <MapPinIcon class="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Aucune adresse enregistrée</p>
          </div>
        </div>

        <!-- Mot de passe -->
        <div v-if="activeTab === 'password'" class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h2>
          
          <form @submit.prevent="updatePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="input-field"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                class="input-field"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="input-field"
              >
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="btn-primary disabled:opacity-50"
              >
                <LoadingSpinner v-if="loading" size="sm" />
                <span v-else>Changer le mot de passe</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Préférences -->
        <div v-if="activeTab === 'preferences'" class="card p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Préférences</h2>
          
          <form @submit.prevent="updatePreferences" class="space-y-4">
            <div class="flex items-center">
              <input
                id="newsletter"
                v-model="preferencesForm.newsletter"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <label for="newsletter" class="ml-2 block text-sm text-gray-900">
                Recevoir la newsletter
              </label>
            </div>

            <div class="flex items-center">
              <input
                id="sms"
                v-model="preferencesForm.sms"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              >
              <label for="sms" class="ml-2 block text-sm text-gray-900">
                Recevoir des SMS promotionnels
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Langue préférée</label>
              <select v-model="preferencesForm.language" class="input-field">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="btn-primary disabled:opacity-50"
              >
                <LoadingSpinner v-if="loading" size="sm" />
                <span v-else>Sauvegarder</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import {
  UserIcon,
  MapPinIcon,
  KeyIcon,
  CogIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const loading = ref(false)
const activeTab = ref('profile')

const tabs = [
  { id: 'profile', name: 'Profil', icon: UserIcon },
  { id: 'addresses', name: 'Adresses', icon: MapPinIcon },
  { id: 'password', name: 'Mot de passe', icon: KeyIcon },
  { id: 'preferences', name: 'Préférences', icon: CogIcon }
]

const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: ''
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const preferencesForm = reactive({
  newsletter: false,
  sms: false,
  language: 'fr'
})

const updateProfile = async () => {
  loading.value = true
  try {
    await authStore.updateProfile(profileForm)
    // TODO: Afficher un message de succès
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
  } finally {
    loading.value = false
  }
}

const updatePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    // TODO: Afficher une erreur
    return
  }
  
  loading.value = true
  try {
    // TODO: Implémenter la mise à jour du mot de passe
    console.log('Mise à jour du mot de passe')
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error)
  } finally {
    loading.value = false
  }
}

const updatePreferences = async () => {
  loading.value = true
  try {
    // TODO: Implémenter la mise à jour des préférences
    console.log('Mise à jour des préférences')
  } catch (error) {
    console.error('Erreur lors de la mise à jour des préférences:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Initialiser le formulaire avec les données utilisateur
  if (authStore.userInfo) {
    const user = authStore.userInfo
    profileForm.firstName = user.firstName || ''
    profileForm.lastName = user.lastName || ''
    profileForm.email = user.email || ''
    profileForm.phone = user.phone || ''
    profileForm.birthDate = user.birthDate || ''
  }
})
</script>
