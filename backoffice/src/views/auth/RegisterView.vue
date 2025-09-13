<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Créer un compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Jeroka Xperience - Gestion TPE/PME
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <!-- Prénom et Nom -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prénom
              </label>
              <input
                id="firstName"
                v-model="form.firstName"
                name="firstName"
                type="text"
                autocomplete="given-name"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Jean"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom
              </label>
              <input
                id="lastName"
                v-model="form.lastName"
                name="lastName"
                type="text"
                autocomplete="family-name"
                required
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Dupont"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Adresse email
            </label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="jean.dupont@entreprise.fr"
            />
          </div>

          <!-- Téléphone -->
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Téléphone <span class="text-gray-500">(optionnel)</span>
            </label>
            <input
              id="phone"
              v-model="form.phone"
              name="phone"
              type="tel"
              autocomplete="tel"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="06 12 34 56 78"
            />
          </div>

          <!-- Mot de passe -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <div class="mt-1 relative">
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                class="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700"
                placeholder="Minimum 8 caractères"
                @input="validatePassword"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                @click="showPassword = !showPassword"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div class="mt-2 space-y-1">
              <div class="flex items-center space-x-2">
                <div :class="passwordChecks.length ? 'bg-green-500' : 'bg-gray-300'" class="w-2 h-2 rounded-full"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">Au moins 8 caractères</span>
              </div>
              <div class="flex items-center space-x-2">
                <div :class="passwordChecks.uppercase ? 'bg-green-500' : 'bg-gray-300'" class="w-2 h-2 rounded-full"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">Une majuscule</span>
              </div>
              <div class="flex items-center space-x-2">
                <div :class="passwordChecks.number ? 'bg-green-500' : 'bg-gray-300'" class="w-2 h-2 rounded-full"></div>
                <span class="text-xs text-gray-600 dark:text-gray-400">Un chiffre</span>
              </div>
            </div>
          </div>

          <!-- Confirmation mot de passe -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="Répétez votre mot de passe"
              :class="{'border-red-500': form.confirmPassword && !passwordsMatch}"
            />
            <p v-if="form.confirmPassword && !passwordsMatch" class="mt-1 text-sm text-red-600">
              Les mots de passe ne correspondent pas
            </p>
          </div>
        </div>

        <!-- Conditions d'utilisation -->
        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="terms"
              v-model="form.acceptTerms"
              name="terms"
              type="checkbox"
              required
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
          </div>
          <div class="ml-3 text-sm">
            <label for="terms" class="text-gray-600 dark:text-gray-400">
              J'accepte les
              <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
                conditions d'utilisation
              </a>
              et la
              <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
                politique de confidentialité
              </a>
            </label>
          </div>
        </div>

        <!-- Messages d'erreur/succès -->
        <div v-if="error" class="bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-700 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationCircleIcon class="h-5 w-5 text-danger-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-danger-800 dark:text-danger-200">{{ error }}</p>
            </div>
          </div>
        </div>

        <div v-if="success" class="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <CheckCircleIcon class="h-5 w-5 text-green-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-800 dark:text-green-200">{{ success }}</p>
            </div>
          </div>
        </div>

        <!-- Bouton d'inscription -->
        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            {{ loading ? 'Création du compte...' : 'Créer mon compte' }}
          </button>
        </div>

        <!-- Lien vers la connexion -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Vous avez déjà un compte ?
            <router-link to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
              Se connecter
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { 
  ExclamationCircleIcon, 
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)

const passwordChecks = reactive({
  length: false,
  uppercase: false,
  number: false
})

const validatePassword = () => {
  const password = form.password
  passwordChecks.length = password.length >= 8
  passwordChecks.uppercase = /[A-Z]/.test(password)
  passwordChecks.number = /\d/.test(password)
}

const passwordsMatch = computed(() => {
  return form.password === form.confirmPassword
})

const isPasswordValid = computed(() => {
  return passwordChecks.length && passwordChecks.uppercase && passwordChecks.number
})

const isFormValid = computed(() => {
  return form.firstName.trim() &&
         form.lastName.trim() &&
         form.email.trim() &&
         isPasswordValid.value &&
         passwordsMatch.value &&
         form.acceptTerms
})

const handleRegister = async () => {
  if (!isFormValid.value) {
    error.value = 'Veuillez remplir tous les champs requis'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  try {
    const result = await authStore.register({
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || undefined
    })
    
    if (result.success) {
      success.value = 'Compte créé avec succès ! Redirection en cours...'
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      error.value = result.error || 'Erreur lors de la création du compte'
    }
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la création du compte'
  } finally {
    loading.value = false
  }
}
</script>
