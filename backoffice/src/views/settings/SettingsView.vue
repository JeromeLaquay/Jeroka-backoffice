<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">Paramètres</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Gérez vos paramètres personnels et d'entreprise
      </p>
    </div>

    <!-- Navigation par onglets -->
    <div class="border-b border-gray-200 dark:border-gray-700">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.id
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
          ]"
        >
          <component :is="tab.icon" class="h-5 w-5 mr-2 inline" />
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Contenu des onglets -->
    <div class="mt-6">
      <!-- Profil utilisateur -->
      <div v-if="activeTab === 'profile'" class="space-y-6">
        <UserProfileSettings
          :profile="userProfile"
          @updated="onProfileUpdated"
        />
      </div>

      <!-- Paramètres entreprise -->
      <div v-if="activeTab === 'company'" class="space-y-6">
        <CompanySettings
          :settings="companySettings"
          @updated="onCompanyUpdated"
        />
      </div>

      <!-- Paramètres système -->
      <div v-if="activeTab === 'system'" class="space-y-6">
        <SystemSettings
          :settings="systemSettings"
          @updated="onSystemUpdated"
        />
      </div>

      <!-- Sécurité -->
      <div v-if="activeTab === 'security'" class="space-y-6">
        <SecuritySettings
          :profile="userProfile"
          @updated="onSecurityUpdated"
        />
      </div>

      <!-- Sauvegardes -->
      <div v-if="activeTab === 'backups'" class="space-y-6">
        <BackupSettings
          :backups="backups"
          @backup-created="onBackupCreated"
          @backup-restored="onBackupRestored"
        />
      </div>

      <!-- Intégrations -->
      <div v-if="activeTab === 'integrations'" class="space-y-6">
        <IntegrationsSettings
          :integrations="systemSettings?.integrations"
          @updated="onIntegrationsUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  UserIcon,
  BuildingOfficeIcon,
  CogIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  PuzzlePieceIcon
} from '@heroicons/vue/24/outline'
import UserProfileSettings from '@/components/settings/UserProfileSettings.vue'
import CompanySettings from '@/components/settings/CompanySettings.vue'
import SystemSettings from '@/components/settings/SystemSettings.vue'
import SecuritySettings from '@/components/settings/SecuritySettings.vue'
import BackupSettings from '@/components/settings/BackupSettings.vue'
import IntegrationsSettings from '@/components/settings/IntegrationsSettings.vue'
import { settingsService, type UserProfile, type CompanySettings as CompanySettingsType, type SystemSettings as SystemSettingsType } from '@/services/settings'

// État
const activeTab = ref('profile')
const userProfile = ref<UserProfile | null>(null)
const companySettings = ref<CompanySettingsType | null>(null)
const systemSettings = ref<SystemSettingsType | null>(null)
const backups = ref<any[]>([])

// Configuration des onglets
const tabs = [
  { id: 'profile', name: 'Profil', icon: UserIcon },
  { id: 'company', name: 'Entreprise', icon: BuildingOfficeIcon },
  { id: 'system', name: 'Système', icon: CogIcon },
  { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
  { id: 'backups', name: 'Sauvegardes', icon: CloudArrowUpIcon },
  { id: 'integrations', name: 'Intégrations', icon: PuzzlePieceIcon }
]

// Méthodes
const loadUserProfile = async () => {
  try {
    const response = await settingsService.getUserProfile()
    userProfile.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error)
  }
}

const loadCompanySettings = async () => {
  try {
    const response = await settingsService.getCompanySettings()
    companySettings.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres entreprise:', error)
  }
}

const loadSystemSettings = async () => {
  try {
    const response = await settingsService.getSystemSettings()
    systemSettings.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des paramètres système:', error)
  }
}

const loadBackups = async () => {
  try {
    const response = await settingsService.getBackups()
    backups.value = response.data
  } catch (error) {
    console.error('Erreur lors du chargement des sauvegardes:', error)
  }
}

const onProfileUpdated = () => {
  loadUserProfile()
}

const onCompanyUpdated = () => {
  loadCompanySettings()
}

const onSystemUpdated = () => {
  loadSystemSettings()
}

const onSecurityUpdated = () => {
  loadUserProfile()
}

const onBackupCreated = () => {
  loadBackups()
}

const onBackupRestored = () => {
  // Recharger toutes les données après une restauration
  loadUserProfile()
  loadCompanySettings()
  loadSystemSettings()
  loadBackups()
}

const onIntegrationsUpdated = () => {
  loadSystemSettings()
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadUserProfile(),
    loadCompanySettings(),
    loadSystemSettings(),
    loadBackups()
  ])
})
</script>