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

      <!-- Google (Mail / Drive) -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <CogIcon class="h-5 w-5 text-gray-400" />
            <span class="font-medium text-gray-900 dark:text-gray-100">Google (Mail / Drive)</span>
          </div>
          <span v-if="isConfigured('google')" class="text-xs px-2 py-1 rounded bg-green-100 text-green-700">Configuré</span>
        </div>
        <form @submit.prevent="saveGoogle" class="space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="md:col-span-2">
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">Service Account JSON</label>
              <textarea v-model="google.serviceAccountJson" rows="4" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"></textarea>
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">SMTP Host</label>
              <input v-model="google.smtpHost" type="text" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">SMTP User</label>
              <input v-model="google.smtpUser" type="text" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
            <div>
              <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">SMTP Password</label>
              <input v-model="google.smtpPassword" type="password" class="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm" />
            </div>
          </div>
          <div class="flex justify-end">
            <button type="submit" class="px-3 py-2 text-sm rounded-md bg-primary-600 text-white hover:bg-primary-700">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CogIcon } from '@heroicons/vue/24/outline'
import type { SystemSettings } from '../../services/settings.ts'
import credentialsService, { type SupportedPlatform } from '../../services/credentials'
import { ref, onMounted, computed } from 'vue'

interface Props {
  settings: SystemSettings | null
}

defineProps<Props>()

defineEmits<{
  updated: []
}>()

// Etat local minimal pour les formulaires
const meta = ref({ appId: '', appSecret: '', accessToken: '', pageId: '' })
const linkedin = ref({ clientId: '', clientSecret: '', accessToken: '', organizationId: '' })
const twitter = ref({ apiKey: '', apiSecret: '', accessToken: '', accessTokenSecret: '' })
const google = ref({ serviceAccountJson: '', smtpHost: '', smtpUser: '', smtpPassword: '' })
const configured = ref<Record<SupportedPlatform, boolean>>({ meta: false, linkedin: false, twitter: false, 'site web': false, google: false })

const isConfigured = (platform: SupportedPlatform) => configured.value[platform]

const loadConfigured = async () => {
  try {
    const res = await credentialsService.listConfigured()
    if (res.success && res.data) {
      configured.value = { meta: false, linkedin: false, twitter: false, 'site web': false, google: false }
      for (const p of res.data.configuredPlatforms) {
        configured.value[p.platform] = p.isConfigured
      }
    }
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

const saveGoogle = async () => {
  await credentialsService.configure('google', { ...google.value })
  await loadConfigured()
}

const canTestMeta = computed(() => !!meta.value.appId && !!meta.value.accessToken)
const canTestLinkedin = computed(() => !!linkedin.value.clientId && !!linkedin.value.accessToken)
const canTestTwitter = computed(() => !!twitter.value.apiKey && !!twitter.value.accessToken && !!twitter.value.accessTokenSecret)

const testMeta = async () => { await credentialsService.test('meta') }
const testLinkedin = async () => { await credentialsService.test('linkedin') }
const testTwitter = async () => { await credentialsService.test('twitter') }

onMounted(loadConfigured)
</script>
