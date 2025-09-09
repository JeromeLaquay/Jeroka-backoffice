<template>
  <header class="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
    <div class="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center">
        <div class="text-2xl font-bold text-purple-600 dark:text-purple-400 mr-2">Jeroka Xperience</div>
        <span class="hidden md:block text-sm text-gray-600 dark:text-gray-400 italic">Transformez votre vision en réalité numérique</span>
      </div>
      
      <!-- Desktop Menu -->
      <nav class="hidden md:flex items-center justify-center">
        <ul class="flex space-x-8">
          <li><a href="#home" class="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors duration-300">Accueil</a></li>
          <li><a href="#about" class="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors duration-300">À propos</a></li>
          <li><a href="#services" class="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors duration-300">Services</a></li>
          <li><a href="#partners" class="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors duration-300">Technologies</a></li>
          <li><a href="#contact" class="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors duration-300">Contact</a></li>
        </ul>
      </nav>
      
      <!-- Contact Info and Dark Mode Toggle -->
      <div class="hidden md:flex items-center space-x-4">
        <a href="tel:33619576947" class="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 text-sm">
          <span>+33 6 19 57 69 47</span>
        </a>
        
        <!-- Dark Mode Toggle -->
        <button 
          @click="toggleDarkMode" 
          class="p-2 rounded-full transition-all duration-300"
          :class="darkMode ? 
            'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 
            'bg-gray-200 hover:bg-gray-300 text-gray-700'"
        >
          <svg 
            v-if="darkMode" 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
            />
          </svg>
          <svg 
            v-else 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
            />
          </svg>
        </button>
      </div>
      
      <!-- Mobile Menu Button and Dark Mode Toggle -->
      <div class="md:hidden flex items-center space-x-3">
        <!-- Mobile Dark Mode Toggle -->
        <button 
          @click="toggleDarkMode" 
          class="p-2 rounded-full transition-all duration-300"
          :class="darkMode ? 
            'bg-gray-700 hover:bg-gray-600 text-yellow-300' : 
            'bg-gray-200 hover:bg-gray-300 text-gray-700'"
        >
          <svg 
            v-if="darkMode" 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg 
            v-else 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
        
        <!-- Mobile Menu Toggle -->
        <button 
          class="text-gray-700 dark:text-white" 
          @click="toggleMobileMenu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Mobile Menu -->
    <div v-if="mobileMenuOpen" class="md:hidden absolute left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md z-50 transition-colors duration-300">
      <ul class="flex flex-col p-4">
        <li class="py-2"><a href="/#home" class="block text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300" @click="closeMobileMenu">Accueil</a></li>
        <li class="py-2"><a href="/#about" class="block text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300" @click="closeMobileMenu">À propos</a></li>
        <li class="py-2"><a href="/#services" class="block text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300" @click="closeMobileMenu">Services</a></li>
        <li class="py-2"><a href="/#partners" class="block text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300" @click="closeMobileMenu">Technologies</a></li>
        <li class="py-2"><a href="/#contact" class="block text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300" @click="closeMobileMenu">Contact</a></li>
        <li class="py-2"><a href="tel:33619576947" class="block text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300" @click="closeMobileMenu">+33 6 19 57 69 47</a></li>
      </ul>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from 'vue'

export default defineComponent({
  name: 'AppHeader',
  setup() {
    const mobileMenuOpen = ref(false)
    const darkMode = inject('darkMode', ref(false))
    
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value
    }
    
    const closeMobileMenu = () => {
      mobileMenuOpen.value = false
    }
    
    const toggleDarkMode = () => {
      const event = new CustomEvent('toggle-dark-mode')
      window.dispatchEvent(event)
    }
    
    return {
      mobileMenuOpen,
      darkMode,
      toggleMobileMenu,
      closeMobileMenu,
      toggleDarkMode
    }
  }
})
</script>