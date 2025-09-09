<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ExclamationTriangleIcon class="h-12 w-12 text-gray-400" />
      </div>
      
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Page non trouvée</h2>
      <p class="text-gray-600 mb-8">
        Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      
      <div class="space-y-4">
        <router-link to="/" class="btn-primary block">
          Retour à l'accueil
        </router-link>
        
        <button
          @click="$router.go(-1)"
          class="btn-outline block w-full"
        >
          Page précédente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
</script>
