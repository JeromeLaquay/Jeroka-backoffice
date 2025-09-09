<template>
  <div class="dark-transition" :class="{ 'dark': darkMode }">
    <div class="min-h-screen bg-white dark:bg-gray-900">
      <router-view />
    </div>
  </div>
  <ChatbotComponent />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, provide } from 'vue'
import ChatbotComponent from '@/components/ChatbotComponent.vue'
export default defineComponent({
  name: 'App',
  components: {
    ChatbotComponent
  },
  setup() {
    const darkMode = ref(false)
    
    onMounted(() => {
      // Check if the document has a dark class already applied
      darkMode.value = document.documentElement.classList.contains('dark')
      
      // Listen for dark mode changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            darkMode.value = document.documentElement.classList.contains('dark')
          }
        })
      })
      
      observer.observe(document.documentElement, { attributes: true })
      
      // Listen for toggle-dark-mode event
      window.addEventListener('toggle-dark-mode', () => {
        darkMode.value = !darkMode.value
        if (darkMode.value) {
          document.documentElement.classList.add('dark')
          localStorage.setItem('theme', 'dark')
        } else {
          document.documentElement.classList.remove('dark')
          localStorage.setItem('theme', 'light')
        }
      })
    })

    // Provide darkMode to all components
    provide('darkMode', darkMode)
    
    return {
      darkMode
    }
  }
})
</script>

<style>
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Base styles */
html {
  scroll-behavior: smooth;
}

body {
  @apply font-sans text-gray-800 dark:text-gray-200;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Transitions for dark mode */
.dark-transition {
  @apply transition-all duration-300 ease-in-out;
}

/* Add smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
</style>
