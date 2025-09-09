<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <router-view v-if="!authLoading" />
    <div v-else class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const authLoading = ref(true)

onMounted(async () => {
  // Détection du thème système
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const savedTheme = localStorage.getItem('theme')
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark')
  }

  // Initialiser l'authentification
  try {
    await authStore.initializeAuth()
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
  } finally {
    authLoading.value = false
  }
})
</script>