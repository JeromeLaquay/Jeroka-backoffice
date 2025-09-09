<template>
  <div>
    <!-- Section Hero -->
    <section id="home" class="min-h-screen flex flex-col justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
      <div class="container mx-auto px-4 md:px-8">
        <div class="flex flex-col lg:flex-row items-center gap-12">
          <!-- Text content -->
          <div class="lg:w-1/2 text-center lg:text-left">
            <div class="mb-8">
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text dark:from-purple-400 dark:to-indigo-400">
                Transformez votre vision en réalité numérique
              </h1>
              <p class="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-6">
                Bienvenue chez Jeroka Xperience, une entreprise dynamique basée à Wormhout, spécialisée dans la création de sites vitrines et l'automatisation des processus de gestion. Quel que soit votre projet, notre passion pour l'innovation et notre engagement envers l'excellence nous positionnent comme votre partenaire digital idéal.
              </p>
              
              <div class="flex flex-wrap justify-center lg:justify-start gap-4 mt-8">
                <a href="#services" class="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-md transition-colors duration-300">
                  Découvrir nos services
                </a>
                <a href="#contact" class="bg-white border border-gray-300 hover:border-purple-600 text-gray-800 hover:text-purple-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:border-purple-400 dark:hover:text-purple-400 font-medium px-6 py-3 rounded-md transition-colors duration-300">
                  Nous contacter
                </a>
              </div>
            </div>
            
            <div class="flex items-center justify-center lg:justify-start mt-16">
              <div class="flex items-center border-t dark:border-gray-700 pt-4">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Libérez votre potentiel avec des solutions numériques sur mesure</span>
              </div>
            </div>
          </div>
          
          <!-- Image -->
          <div class="lg:w-1/2 relative">
            <div class="relative z-10 bounce-slow">
              <img src="../assets/hero-image.webp" alt="Logo oOiKa" class="w-full mx-auto max-w-md">
            </div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-100 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 rounded-full blur-3xl opacity-70 dark:opacity-40 -z-10"></div>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue'

export default defineComponent({
  name: 'HomePart',
  setup() {
    const darkMode = inject('darkMode', ref(false))
    
    return {
      darkMode
    }
  }
})
</script>

<style scoped>
.bounce-slow {
  animation: bounce 6s infinite alternate ease-in-out;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-20px);
  }
}

.bg-clip-text {
  -webkit-background-clip: text;
}
</style>