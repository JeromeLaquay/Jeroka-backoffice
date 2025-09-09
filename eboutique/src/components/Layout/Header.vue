<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">J</span>
            </div>
            <span class="text-xl font-bold text-gray-900">Jeroka</span>
          </router-link>
        </div>

        <!-- Navigation principale -->
        <nav class="hidden md:flex space-x-8">
          <router-link
            to="/"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-primary-600': $route.name === 'Home' }"
          >
            Accueil
          </router-link>
          <router-link
            to="/products"
            class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-primary-600': $route.name === 'Products' }"
          >
            Produits
          </router-link>
        </nav>

        <!-- Actions utilisateur -->
        <div class="flex items-center space-x-4">
          <!-- Recherche -->
          <div class="hidden sm:block">
            <div class="relative">
              <input
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                type="text"
                placeholder="Rechercher..."
                class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <!-- Panier -->
          <router-link
            to="/cart"
            class="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
          >
            <ShoppingCartIcon class="h-6 w-6" />
            <span
              v-if="cartItemCount > 0"
              class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartItemCount }}
            </span>
          </router-link>

          <!-- Menu utilisateur -->
          <div v-if="isLoggedIn" class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <UserIcon class="h-6 w-6" />
              <span class="hidden sm:block">{{ userInfo?.firstName || 'Mon compte' }}</span>
              <ChevronDownIcon class="h-4 w-4" />
            </button>

            <!-- Menu déroulant -->
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
            >
              <router-link
                to="/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showUserMenu = false"
              >
                Mon profil
              </router-link>
              <router-link
                to="/orders"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                @click="showUserMenu = false"
              >
                Mes commandes
              </router-link>
              <hr class="my-1">
              <button
                @click="handleLogout"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Déconnexion
              </button>
            </div>
          </div>

          <!-- Boutons de connexion/inscription -->
          <div v-else class="flex items-center space-x-2">
            <router-link
              to="/login"
              class="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Connexion
            </router-link>
            <router-link
              to="/register"
              class="btn-primary text-sm"
            >
              Inscription
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu mobile -->
    <div v-if="showMobileMenu" class="md:hidden border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1">
        <router-link
          to="/"
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
          @click="showMobileMenu = false"
        >
          Accueil
        </router-link>
        <router-link
          to="/products"
          class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md"
          @click="showMobileMenu = false"
        >
          Produits
        </router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useCartStore } from '@/stores/cart.js'
import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const searchQuery = ref('')
const showUserMenu = ref(false)
const showMobileMenu = ref(false)

const isLoggedIn = computed(() => authStore.isLoggedIn)
const userInfo = computed(() => authStore.userInfo)
const cartItemCount = computed(() => cartStore.cartItemCount)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'Products',
      query: { search: searchQuery.value.trim() }
    })
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    showUserMenu.value = false
    router.push('/')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}

// Fermer les menus en cliquant à l'extérieur
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showUserMenu.value = false
    showMobileMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  cartStore.initCart()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
