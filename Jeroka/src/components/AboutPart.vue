<template>
    <section id="about" class="py-24 bg-purple-50 dark:bg-gray-800">
      <div class="container mx-auto px-4 md:px-8">
        <div class="text-center mb-16">
          <div class="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">À PROPOS</div>
          <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">À propos de Jeroka 2</h2>
          <p class="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Découvrez notre entreprise, notre mission et ce qui nous motive chaque jour.</p>
        </div>
        
        <!-- Cards Section -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <!-- Card 1 -->
          <div class="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px]">
            <div class="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Qui sommes-nous ?</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Jeroka est une entreprise dynamique basée à Wormhout, spécialisée dans la création de sites vitrines et l'automatisation des processus de gestion.
            </p>
          </div>
          
          <!-- Card 2 -->
          <div class="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px]">
            <div class="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notre mission</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Notre passion pour l'innovation et notre engagement envers l'excellence nous positionnent comme votre partenaire idéal pour naviguer dans le monde numérique.
            </p>
          </div>
          
          <!-- Card 3 -->
          <div class="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px]">
            <div class="bg-green-100 dark:bg-green-900/30 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
              <svg class="w-7 h-7 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Notre cible</h3>
            <p class="text-gray-600 dark:text-gray-400">
              Nous travaillons principalement avec les TPEs, PMEs et collectivités de la région Hauts-de-France.
            </p>
          </div>
        </div>
        
        <!-- History Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div class="inline-block bg-purple-100 dark:bg-purple-900/30 px-4 py-1 rounded-full text-sm font-semibold text-purple-600 dark:text-purple-400 mb-4">NOTRE HISTOIRE</div>
            <h3 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Notre parcours</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Bienvenue chez Jeroka, une nouvelle entreprise dynamique basée à Wormhout, spécialisée dans la création de sites vitrines et l'automatisation des processus de gestion. Bien que nous soyons récemment établis, notre passion pour l'innovation et notre engagement envers l'excellence nous positionnent comme votre partenaire idéal pour naviguer dans le monde numérique.
            </p>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Notre équipe est dirigée par Jérôme Jaquay, ingénieur informatique avec 6 ans d'expérience, qui combine expertise technique et compréhension approfondie des besoins du marché.
            </p>
            <p class="text-gray-600 dark:text-gray-400">
              Chaque projet est unique, et nous nous engageons à adapter nos services à vos besoins spécifiques. La satisfaction de nos clients est notre priorité, et nous nous efforçons de dépasser vos attentes à chaque étape du processus.
            </p>
          </div>
          
          <!-- Image de l'explorateur digital -->
          <div class="flex justify-center items-center">
            <div class="relative max-w-sm">
              <img src="../assets/garcon.png" alt="Explorateur digital" class="w-full h-auto rounded-lg shadow-lg z-10 relative">
              <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-400 dark:bg-purple-600 rounded-full opacity-30 z-0"></div>
              <div class="absolute -top-4 -left-4 w-24 h-24 bg-indigo-400 dark:bg-indigo-600 rounded-full opacity-30 z-0"></div>
            </div>
          </div>
        </div>
        
        <!-- Location Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div class="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-start">
              <div class="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-purple-600 dark:text-purple-400 mr-4">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Localisation</h4>
                <p class="text-gray-600 dark:text-gray-400">13 rue des Fauvettes</p>
                <p class="text-gray-600 dark:text-gray-400">59470 Wormhout</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-start">
              <div class="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg text-green-600 dark:text-green-400 mr-4">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Zone d'action</h4>
                <p class="text-gray-600 dark:text-gray-400">Région Hauts-de-France</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-start">
              <div class="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg text-indigo-600 dark:text-indigo-400 mr-4">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact</h4>
                <p class="text-gray-600 dark:text-gray-400">+33 6 19 57 69 47</p>
                <p class="text-gray-600 dark:text-gray-400">contact@jeroka.fr</p>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <div class="flex items-start">
              <div class="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg text-purple-600 dark:text-purple-400 mr-4">
                <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Date de création</h4>
                <p class="text-gray-600 dark:text-gray-400">17/03/2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>
  
  <script lang="ts">
  import { defineComponent, inject, ref } from 'vue'
  
  export default defineComponent({
    name: 'AboutPart',
    setup() {
      const darkMode = inject('darkMode', ref(false))
      
      return {
        darkMode
      }
    }
  })
  </script>