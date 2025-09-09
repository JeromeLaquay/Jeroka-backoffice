<template>
  <section id="gallery" class="py-24 bg-gray-50 dark:bg-gray-800">
    <div class="container mx-auto px-4 md:px-8">
      <div class="text-center mb-16">
        <div class="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">NOTRE UNIVERS</div>
        <h2 class="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Jeroka en images</h2>
        <p class="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">Découvrez notre univers visuel à travers nos créations.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Logo Jeroka -->
        <div class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <img src="../assets/cspr.png" alt="Logo Jeroka" class="w-full h-72 object-contain bg-white dark:bg-gray-900 p-6">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <a href="https://cspr-chauffage.fr" target="_blank"><h3 class="text-white text-xl font-bold">cspr-chauffage.fr</h3></a>
            <p class="text-gray-200 text-sm">CSPR - Création site vitrine</p>
          </div>
        </div>
        
        <!-- Casque coloré -->
        <div class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <img src="../assets/JerokaDJ.png" alt="Logo oOiKa" class="w-full h-72 object-contain bg-white dark:bg-gray-900 p-6">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <a href="https://dj.jerokaxperience.fr" target="_blank"><h3 class="text-white text-xl font-bold">dj.jerokaxperience.fr</h3></a>
            <p class="text-gray-200 text-sm">Site avec paiements mensuels</p>
          </div>
        </div>
        
        <!-- Astronaute -->
        <div class="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <img src="../assets/JImmo.jpg" alt="Logo oOiKa" class="w-full h-72 object-contain bg-white dark:bg-gray-900 p-6">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
            <h3 class="text-white text-xl font-bold">JImmo</h3>
            <p class="text-gray-200 text-sm">App mobile Android & IOS</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue'

export default defineComponent({
  name: 'ImagesGallery',
  setup() {
    const darkMode = inject('darkMode', ref(false))
    
    return {
      darkMode
    }
  }
})
</script> 