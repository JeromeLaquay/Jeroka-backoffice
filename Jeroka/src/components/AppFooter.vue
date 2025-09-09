<template>
  <footer class="bg-purple-800 dark:bg-gray-900 py-16 border-t border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 text-nav">
        <!-- Company Info -->
        <div>
          <h3 class="text-xl font-semibold text-white dark:text-white mb-6">Jeroka</h3>
          <p class="text-purple-200 dark:text-gray-400 mb-6 leading-relaxed">
            Une entreprise dynamique spécialisée dans la création de sites web et l'automatisation des processus de gestion.
          </p>
          <div class="flex space-x-4">
            <a href="https://facebook.com/entreprisexyz" target="_blank" rel="noopener noreferrer" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
              </svg>
            </a>
            <a href="https://linkedin.com/company/entreprisexyz" target="_blank" rel="noopener noreferrer" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
              </svg>
            </a>
            <a href="https://instagram.com/entreprisexyz" target="_blank" rel="noopener noreferrer" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h3 class="text-xl font-semibold text-white dark:text-white mb-6">Liens rapides</h3>
          <ul class="space-y-3">
            <li><a href="#home" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">Accueil</a></li>
            <li><a href="#about" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">À propos</a></li>
            <li><a href="#services" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">Services</a></li>
            <li><a href="#partners" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">Technologies</a></li>
            <li><a href="#pricing" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">Tarifs</a></li>
            <li><a href="#contact" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">Contact</a></li>
            <li><a href="#privacy" class="text-purple-200 hover:text-white dark:text-gray-400 dark:hover:text-purple-400 transition-colors duration-300">Politique de confidentialité</a></li>
          </ul>
        </div>
        
        <!-- Contact Info -->
        <div>
          <h3 class="text-xl font-semibold text-white dark:text-white mb-6">Contact</h3>
          <ul class="space-y-3">
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 mt-0.5 text-purple-200 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-purple-200 dark:text-gray-400">13 rue des Fauvettes<br>59470 Wormhout</span>
            </li>
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 mt-0.5 text-purple-200 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-purple-200 dark:text-gray-400">+33 6 19 57 69 47</span>
            </li>
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 mt-0.5 text-purple-200 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-purple-200 dark:text-gray-400">contact@jeroka.fr</span>
            </li>
            <li class="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 mt-0.5 text-purple-200 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span class="text-purple-200 dark:text-gray-400">SIRET: 12345687652332</span>
            </li>
          </ul>
        </div>
        
        <!-- Newsletter -->
        <!-- <div>
          <h3 class="text-xl font-semibold text-white dark:text-white mb-6">Newsletter</h3>
          <p class="text-purple-200 dark:text-gray-400 mb-4">Abonnez-vous à notre newsletter pour rester informé de nos dernières actualités.</p>
          <form class="mb-4">
            <div class="flex">
              <input 
                type="email" 
                placeholder="Votre email" 
                class="flex-grow px-4 py-2 rounded-l-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
              >
              <button 
                type="submit" 
                class="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-r-full text-white transition-colors duration-300"
              >
                OK
              </button>
            </div>
          </form>
          <p class="text-purple-300 dark:text-gray-500 text-xs">En vous inscrivant, vous acceptez notre politique de confidentialité.</p>
        </div>    
        --> 
      </div>
      
      <!-- Copyright -->
      <div class="border-t border-purple-700 dark:border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
        <p class="text-purple-300 dark:text-gray-500 text-xs">&copy; 2025 Jeroka. Tous droits réservés.</p>
        <div class="mt-4 md:mt-0 flex space-x-4">
          <a href="#privacy" class="text-purple-300 hover:text-white dark:text-gray-500 dark:hover:text-purple-400 text-xs transition-colors duration-300">Politique de confidentialité</a>
          <a href="#" class="text-purple-300 hover:text-white dark:text-gray-500 dark:hover:text-purple-400 text-xs transition-colors duration-300">Mentions légales</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue'

export default defineComponent({
  name: 'AppFooter',
  setup() {
    const darkMode = inject('darkMode', ref(false))
    
    return {
      darkMode
    }
  }
})
</script>