<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900" data-cy="dashboard-layout">
    <!-- Sidebar -->
    <div 
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      data-cy="sidebar"
    >
      <div class="flex items-center justify-center h-16 px-4 cursor-pointer bg-primary-100 dark:bg-primary-900" @click="router.push('/')">
        <img src="../assets/x-logo.png" alt="Jeroka" class="h-12 w-12" />
        <h1 class="text-xl font-bold bg-gradient-to-r from-purple-400 via-violet-700 to-blue-400 bg-clip-text text-transparent" style="font-family: 'Poppins', 'Inter', system-ui, sans-serif; font-weight: 900; font-size: 26px;">Jeroka</h1>
      </div>
      
      <nav class="mt-8">
        <div class="px-4 space-y-2">
          <router-link
            v-for="item in navigation"
            :key="item.name"
            :to="item.href"
            :data-cy="`nav-${item.name.toLowerCase()}`"
            :class="[
              'sidebar-link',
              $route.name === item.name ? 'sidebar-link-active' : 'sidebar-link-inactive'
            ]"
            @click="closeSidebarOnMobile"
          >
            <component :is="item.icon" class="mr-3 h-5 w-5" />
            {{ item.name }}
          </router-link>
        </div>
      </nav>
    </div>

    <!-- Overlay pour mobile -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Contenu principal -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          <div class="flex items-center">
            <button
              type="button"
              data-cy="mobile-menu-button"
              class="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              @click="sidebarOpen = !sidebarOpen"
            >
              <Bars3Icon class="h-6 w-6" />
            </button>
            
            <div class="ml-4 lg:ml-0">
              <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ pageTitle }}
              </h1>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button
              type="button"
              class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
            >
              <BellIcon class="h-6 w-6" />
            </button>

            <!-- Toggle theme -->
            <button
              type="button"
              class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md"
              @click="toggleTheme"
            >
              <SunIcon v-if="isDark" class="h-6 w-6" />
              <MoonIcon v-else class="h-6 w-6" />
            </button>

            <!-- Profile dropdown -->
            <div class="relative">
              <button
                type="button"
                class="flex items-center p-2 text-sm bg-white dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                @click="showProfileMenu = !showProfileMenu"
              >
                <img
                  :src="authStore.user?.avatar_url|| '/default-avatar.png'"
                  :alt="authStore.user?.name"
                  class="h-8 w-8 rounded-full object-cover"
                />
                <ChevronDownIcon class="ml-2 h-4 w-4 text-gray-400" />
              </button>

              <div
                v-if="showProfileMenu"
                class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700"
                @click="showProfileMenu = false"
              >
                <div class="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  <div class="font-medium">{{ authStore.user?.name }}</div>
                  <div class="text-gray-500 dark:text-gray-400">{{ authStore.user?.email }}</div>
                </div>
                <router-link
                  to="/parametres"
                  class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Paramètres
                </router-link>
                <button
                  @click="logout"
                  data-cy="logout-button"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Contenu de la page -->
      <main class="flex-1 relative overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  Bars3Icon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  CogIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const showProfileMenu = ref(false)
const isDark = ref(false)

const navigation = computed(() => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Messages', href: '/messages', icon: BellIcon },
    { name: 'Calendrier', href: '/calendrier', icon: CalendarIcon },
    { name: 'Publications', href: '/publications', icon: DocumentTextIcon },
    { name: 'Clients', href: '/clients', icon: UsersIcon },
    { name: 'Factures', href: '/factures', icon: DocumentTextIcon },
    { name: 'Devis', href: '/devis', icon: ClipboardDocumentListIcon },
    { name: 'Produits', href: '/produits', icon: CubeIcon },
    { name: 'Commandes', href: '/commandes', icon: ShoppingCartIcon },
    { name: 'Emails', href: '/emails', icon: EnvelopeIcon },
    { name: 'Comptabilite', href: '/comptabilite', icon: CurrencyDollarIcon },
    { name: 'Parametres', href: '/parametres', icon: CogIcon },
    { name: 'Annonces', href: '/annonces', icon: DocumentTextIcon }
  ]

  // Ajouter Admin seulement si l'utilisateur est admin
  if (authStore.isAdmin) {
    baseNavigation.push({ name: 'Admin', href: '/admin', icon: UserIcon })
  }

  return baseNavigation
})

const pageTitle = computed(() => {
  const currentRoute = navigation.value.find(item => item.href === route.path)
  return currentRoute?.name || 'Dashboard'
})

const closeSidebarOnMobile = () => {
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

const logout = () => {
  authStore.logout()
  router.push('/login')
}

const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
