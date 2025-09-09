<template>
  <div class="visit-card-container bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 py-12 px-4 transition-colors duration-300">
    <div class="max-w-6xl mx-auto">
      <!-- En-tête avec titre -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Carte de Visite Professionnelle</h1>
        <p class="text-gray-600 dark:text-gray-300">Format standard 85 x 55mm - Jeroka Xperience</p>
      </div>

      <!-- Cartes de visite au format réel -->
      <div class="flex flex-col lg:flex-row items-center justify-center gap-12">
        
        <!-- RECTO de la carte -->
        <div class="business-card business-card-front with-hero-bg bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
          <!-- Overlay pour améliorer la lisibilité -->
          <div class="absolute inset-0 bg-white/20 dark:bg-gray-900/80 rounded-lg"></div>
          <!-- En-tête avec logo et nom -->
          <div class="relative flex items-start justify-between h-full z-10">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <img src="../assets/x-logo.png" alt="Jeroka Xperience" class="w-10 h-10">
                <div>
                  <h2 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">Jeroka</h2>
                  <h3 class="text-xs font-medium text-purple-600 dark:text-purple-400">Xperience</h3>
                </div>
              </div>
              
              <p class="font-bold text-purple-600 dark:text-purple-400 italic mb-3 leading-tight" style="margin-top: 30px;">
                Transformez votre vision<br>en réalité numérique
              </p>
              
              <!-- Services compacts -->
              <div class="flex flex-row align-items-center justify-center w-full gap-2" style="margin-top: 40px;">
                <div class="flex items-center text-xxxs text-gray-600 dark:text-gray-300">
                  <div class="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 rounded-sm flex items-center justify-center mr-2">
                    <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <h6 class="text-xxxs font-medium">Sites Web</h6>
                </div>
                <div class="flex items-center text-xs text-gray-600 dark:text-gray-300">
                  <div class="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 rounded-sm flex items-center justify-center mr-2">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <h6 class="text-xxxs font-medium">Automatisation</h6>
                </div>
                <div class="flex items-center text-xs text-gray-600 dark:text-gray-300">
                  <div class="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded-sm flex items-center justify-center mr-2">
                    <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <h6 class="text-xxxs font-medium">Conseil Digital</h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- VERSO de la carte -->
        <div class="business-card business-card-back bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-2xl">
          <div class="h-full flex flex-col justify-between">
            <!-- Contact principal -->
            <div>
              <h3 class="text-sm font-bold mb-3 text-purple-100">CONTACT</h3>
              
              <div class="space-y-2">
                <div class="flex items-center text-xs">
                  <svg class="w-3 h-3 mr-2 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span>+33 6 19 57 69 47</span>
                </div>
                
                <div class="flex items-center text-xs">
                  <svg class="w-3 h-3 mr-2 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span>contact@jeroka.fr</span>
                </div>
                
                <div class="flex items-start text-xs">
                  <svg class="w-3 h-3 mr-2 mt-0.5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="leading-tight">13 rue des Fauvettes<br>59470 Wormhout</span>
                </div>
                
                <div class="flex items-center text-xs">
                  <svg class="w-3 h-3 mr-2 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"/>
                  </svg>
                  <span>www.jeroka.fr</span>
                </div>
              </div>
            </div>

            <!-- Réseaux sociaux -->
            <div>
              <div class="flex items-center space-x-2 mb-2">
                <a href="#" class="bg-white/20 hover:bg-white/30 p-1 rounded transition-colors duration-300" title="LinkedIn">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>
                  </svg>
                </a>
                <a href="#" class="bg-white/20 hover:bg-white/30 p-1 rounded transition-colors duration-300" title="Facebook">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="#" class="bg-white/20 hover:bg-white/30 p-1 rounded transition-colors duration-300" title="Instagram">
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
              <p class="text-xs text-purple-100 font-medium">Votre partenaire digital</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions et informations -->
      <div class="mt-12 text-center space-y-4">
        <div class="flex justify-center space-x-4">
          <button 
            @click="downloadCard" 
            class="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Télécharger la carte
          </button>
          <button 
            @click="printCard" 
            class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
            </svg>
            Imprimer
          </button>
        </div>
        
        <div class="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto border border-gray-200 dark:border-gray-700">
          <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
            <strong>Format professionnel :</strong> 85 × 55 mm
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Dimensions standards compatibles avec tous les porte-cartes et portefeuilles
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref } from 'vue'

export default defineComponent({
  name: 'VisitCard',
  setup() {
    const darkMode = inject('darkMode', ref(false))
    
    const downloadCard = () => {
      // Fonction pour télécharger les informations de la carte
      const element = document.createElement('a')
      const text = `
JEROKA XPERIENCE
Transformez votre vision en réalité numérique

CONTACT:
📞 +33 6 19 57 69 47
📧 contact@jeroka.fr
📍 13 rue des Fauvettes, 59470 Wormhout
🌐 www.jeroka.fr

SERVICES:
• Sites Web - Création sur mesure
• Automatisation - Processus métier
• Conseil Digital - Transformation digitale

Format carte de visite: 85 × 55 mm
      `
      const file = new Blob([text], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = 'jeroka-carte-visite.txt'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }

    const printCard = () => {
      // Fonction pour imprimer la carte de visite
      const printContent = document.querySelector('.business-card')
      if (printContent) {
        const printWindow = window.open('', '', 'height=600,width=800')
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Carte de Visite - Jeroka Xperience</title>
                <style>
                  @media print {
                    body { margin: 0; padding: 10mm; }
                    .business-card { 
                      width: 85mm; 
                      height: 55mm; 
                      page-break-after: always;
                      border: 1px solid #ccc;
                    }
                  }
                </style>
              </head>
              <body>
                ${printContent.outerHTML}
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.print()
        }
      }
    }
    
    return {
      darkMode,
      downloadCard,
      printCard
    }
  }
})
</script>

<style scoped>
.visit-card-container {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Dimensions exactes de la carte de visite 85x55mm */
.business-card {
  width: 320px;  /* 85mm à 96 DPI ≈ 320px */
  height: 207px; /* 55mm à 96 DPI ≈ 207px */
  padding: 16px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.3;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.business-card:hover {
  transform: translateY(-4px) rotateX(5deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.business-card-front {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
}

.business-card-front.with-hero-bg {
  background-image: url('@/assets/hero-image.webp');
  background-size: 50%;
  background-position: top 10% left 118%;
  background-repeat: no-repeat;
  background-blend-mode: overlay;
}

.business-card-back {
  background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
}

/* Responsive pour mobile */
@media (max-width: 768px) {
  .business-card {
    width: 280px;
    height: 182px;
    font-size: 10px;
  }
}

/* Styles d'impression */
@media print {
  .visit-card-container {
    background: white !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  .business-card {
    width: 85mm !important;
    height: 55mm !important;
    padding: 4mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: 1px solid #ccc !important;
    page-break-after: always;
    transform: none !important;
    font-size: 8pt !important;
  }
  
  .business-card-front {
    background: white !important;
    color: black !important;
  }
  
  .business-card-back {
    background: #7c3aed !important;
    color: white !important;
  }
  
  /* Masquer les éléments non nécessaires à l'impression */
  .mt-12, .text-center.space-y-4 {
    display: none !important;
  }
}

/* Animation pour la perspective 3D */
@media (min-width: 1024px) {
  .business-card {
    perspective: 1000px;
  }
}
</style>
