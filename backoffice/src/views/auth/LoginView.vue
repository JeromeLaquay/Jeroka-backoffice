<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8" data-cy="login-page">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
          <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Connexion au Backoffice
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Jeroka Xperience - Gestion TPE/PME
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              data-cy="email-input"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="Adresse email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              data-cy="password-input"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-700"
              placeholder="Mot de passe"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
              Se souvenir de moi
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-primary-600 hover:text-primary-500">
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        <div v-if="error" data-cy="error-message" class="bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-700 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <ExclamationCircleIcon class="h-5 w-5 text-danger-400" />
            </div>
            <div class="ml-3">
              <p class="text-sm text-danger-800 dark:text-danger-200">{{ error }}</p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            data-cy="login-button"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            </span>
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>
        </div>

        <div class="mt-6 text-center space-y-3">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Pas encore de compte ?
            <router-link to="/register" class="font-medium text-primary-600 hover:text-primary-500">
              Créer un compte
            </router-link>
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-500">
            Identifiants de test : <span class="font-medium">admin@jeroka.com</span> / <span class="font-medium">admin123</span>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { ExclamationCircleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: 'admin@jeroka.com',
  password: 'admin123',
  rememberMe: false
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.email, form.password)
    
    if (result.success) {
      router.push('/')
    } else {
      error.value = result.error || 'Erreur de connexion'
    }
  } catch (err) {
    error.value = 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>


