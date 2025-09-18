<template>
  <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
      Paramètres système
    </h3>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Meta (Facebook / Instagram) -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <CogIcon class="h-5 w-5 text-gray-400" />
            <span class="font-medium text-gray-900 dark:text-gray-100">Meta (Facebook / Instagram)</span>
          </div>
          <span v-if="isConfigured('meta')" class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Configuré</span>
        </div>
        <form @submit.prevent="saveMeta" class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">App ID</label>
              <input v-model="meta.appId" type="text" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">App Secret</label>
              <input v-model="meta.appSecret" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Access Token</label>
              <input v-model="meta.accessToken" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Page ID</label>
              <input v-model="meta.pageId" type="text" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <button type="button" @click="testMeta" :disabled="!canTestMeta" class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">Tester la connexion</button>
            <button type="submit" class="px-3 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700">Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- LinkedIn -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <CogIcon class="h-5 w-5 text-gray-400" />
            <span class="font-medium text-gray-900 dark:text-gray-100">LinkedIn</span>
          </div>
          <span v-if="isConfigured('linkedin')" class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Configuré</span>
        </div>
        <form @submit.prevent="saveLinkedin" class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Client ID</label>
              <input v-model="linkedin.clientId" type="text" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Client Secret</label>
              <input v-model="linkedin.clientSecret" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Access Token</label>
              <input v-model="linkedin.accessToken" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Organization ID</label>
              <input v-model="linkedin.organizationId" type="text" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <button type="button" @click="testLinkedin" :disabled="!canTestLinkedin" class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">Tester la connexion</button>
            <button type="submit" class="px-3 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700">Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Twitter -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <CogIcon class="h-5 w-5 text-gray-400" />
            <span class="font-medium text-gray-900 dark:text-gray-100">Twitter</span>
          </div>
          <span v-if="isConfigured('twitter')" class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Configuré</span>
        </div>
        <form @submit.prevent="saveTwitter" class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">API Key</label>
              <input v-model="twitter.apiKey" type="text" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">API Secret</label>
              <input v-model="twitter.apiSecret" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Access Token</label>
              <input v-model="twitter.accessToken" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Access Token Secret</label>
              <input v-model="twitter.accessTokenSecret" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <button type="button" @click="testTwitter" :disabled="!canTestTwitter" class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">Tester la connexion</button>
            <button type="submit" class="px-3 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700">Enregistrer</button>
          </div>
        </form>
      </div>

      <!-- Google (Mail / Drive / Calendar) -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <CogIcon class="h-5 w-5 text-gray-400" />
            <span class="font-medium text-gray-900 dark:text-gray-100">Google (Mail / Drive / Calendar)</span>
          </div>
          <span v-if="isConfigured('google')" class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Configuré</span>
        </div>
        
        <!-- Section OAuth (connexion utilisateur) -->
        <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Connexion avec votre compte Google</h4>
          <p class="text-xs text-blue-700 dark:text-blue-300 mb-3">
            Connectez-vous avec vos identifiants Google personnels pour accéder à Gmail, Calendar et Drive.
          </p>
          <div class="flex items-center space-x-3">
            <button 
              @click="connectGoogle" 
              class="inline-flex items-center px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Se connecter à Google
            </button>
          </div>
        </div>
        <!-- voyant vert ou rouge selon le statut de la connexion -->
        <div class="flex items-center justify-center">
          <div class="w-4 h-4 rounded-full" :class="googleOAuthStatus.isConnected ? 'bg-green-500' : 'bg-red-500'"></div>
          <div class="text-sm text-gray-500 dark:text-gray-400">
            {{ googleOAuthStatus.isConnected ? 'Connexion réussie' : 'Connexion échouée' }}
          </div>
        </div>

        <!-- Boutons de test -->
        <div class="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
          <div class="space-x-2">
            <button 
              type="button" 
              @click="testGoogleCalendar" 
              :disabled="!isConfigured('google')"
              class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tester Calendar
            </button>
            <button 
              type="button" 
              @click="testGoogleGmail" 
              :disabled="!isConfigured('google')"
              class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tester Gmail
            </button>
            <button 
              type="button" 
              @click="testGoogleDrive" 
              :disabled="!isConfigured('google')"
              class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tester Drive
            </button>
          </div>
          <button 
            @click="refreshGoogleStatus" 
            class="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CogIcon } from '@heroicons/vue/24/outline'
import type { SystemSettings } from '../../services/settings.ts'
import credentialsService, { type SupportedPlatform } from '../../services/credentials'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  settings: SystemSettings | null
}

defineProps<Props>()

defineEmits<{
  updated: []
}>()

const route = useRoute()

onMounted(() => {
  testGoogleCalendar()
  testGoogleGmail()
  testGoogleDrive()
})

// Etat local minimal pour les formulaires
const meta = ref({ appId: '', appSecret: '', accessToken: '', pageId: '' })
const linkedin = ref({ clientId: '', clientSecret: '', accessToken: '', organizationId: '' })
const twitter = ref({ apiKey: '', apiSecret: '', accessToken: '', accessTokenSecret: '' })
const configured = ref<Record<SupportedPlatform, boolean>>({ meta: false, linkedin: false, twitter: false, 'site web': false, google: false })
const googleOAuthStatus = ref<{ isConnected: boolean; calendarId: string | null | undefined; hasServiceAccount: boolean }>({ isConnected: false, calendarId: null, hasServiceAccount: false })

const isConfigured = (platform: SupportedPlatform) => configured.value[platform]

const loadConfigured = async () => {
  try {
    const res = await credentialsService.listConfigured()
    if (res.success && res.data) {

      console.log('res.data.configuredPlatforms', res.data.configuredPlatforms)
      configured.value = { meta: false, linkedin: false, twitter: false, 'site web': false, google: false }
      for (const p of res.data.configuredPlatforms) {
        configured.value[p.platform] = p.isConfigured
      }
    }
    
    // Charger le statut OAuth Google
    await refreshGoogleStatus()
  } catch (e) {
    // noop UI
  }
}

const saveMeta = async () => {
  await credentialsService.configure('meta', { ...meta.value })
  await loadConfigured()
}

const saveLinkedin = async () => {
  await credentialsService.configure('linkedin', { ...linkedin.value })
  await loadConfigured()
}

const saveTwitter = async () => {
  await credentialsService.configure('twitter', { ...twitter.value })
  await loadConfigured()
}

import settingsSystem from '../../services/settingsSystem'

// Méthodes OAuth Google
const connectGoogle = async () => {
  await settingsSystem.connectGoogle()
}

const refreshGoogleStatus = async () => {
  try {
    console.log('refreshGoogleStatus')
    const res = await settingsSystem.getGoogleStatus()
    if (res.success && res.data) {
      console.log('res.data', res.data)
      googleOAuthStatus.value = res.data
      // Mettre à jour le statut configuré
      configured.value.google = res.data.isConnected || res.data.hasServiceAccount
    }
  } catch (e) {
    console.error('Erreur lors du chargement du statut Google:', e)
  }
}

const testGoogleCalendar = async () => { 
  const res = await settingsSystem.testCalendar()
  if (res.success) {
    console.log('Connexion Calendar réussie !')
  } else {
    console.log('Erreur de connexion Calendar')
  }
}

const testGoogleGmail = async () => { 
  const res = await settingsSystem.testGmail()
  if (res.success) {
    console.log('Connexion Gmail réussie !')
  } else {
    console.log('Erreur de connexion Gmail')
  }
}

const testGoogleDrive = async () => { 
  const res = await settingsSystem.testDrive()
  if (res.success) {
    console.log('Connexion Drive réussie !')
  } else {
    console.log('Erreur de connexion Drive')
  }
}

const canTestMeta = computed(() => !!meta.value.appId && !!meta.value.accessToken)
const canTestLinkedin = computed(() => !!linkedin.value.clientId && !!linkedin.value.accessToken)
const canTestTwitter = computed(() => !!twitter.value.apiKey && !!twitter.value.accessToken && !!twitter.value.accessTokenSecret)

const testMeta = async () => { await credentialsService.test('meta') }
const testLinkedin = async () => { await credentialsService.test('linkedin') }
const testTwitter = async () => { await credentialsService.test('twitter') }

// Surveiller les paramètres URL pour détecter le retour OAuth
watch(() => route.query, (query) => {
  if (query.google === 'connected') {
    alert('Connexion Google réussie !')
    refreshGoogleStatus()
    // Nettoyer l'URL
    window.history.replaceState({}, document.title, window.location.pathname)
  } else if (query.google === 'error') {
    alert('Erreur lors de la connexion Google')
    // Nettoyer l'URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}, { immediate: true });
onMounted(loadConfigured)
</script>
