<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import AppLayout from '@/components/Layout/AppLayout.vue'

const authStore = useAuthStore()

onMounted(() => {
  // Initialiser l'authentification au démarrage de l'app
  authStore.initAuth()
})
</script>

<template>
  <AppLayout />
</template>
