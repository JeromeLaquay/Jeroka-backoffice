<template>
  <section id="contact" class="py-24 bg-purple-50 dark:bg-gray-800 transition-colors duration-300">
    <div class="container mx-auto px-4 md:px-8">
      <div class="text-center mb-16">
        <div class="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-1">CONTACT</div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Contactez-nous</h2>
        <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Un projet ? Une question ? N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.</p>
      </div>
      
      <div class="flex flex-col md:flex-row gap-8">
        <div class="md:w-2/3 bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-8">
          <form @submit.prevent="submitForm">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom complet</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="form.name" 
                  class="w-full px-4 py-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white transition-colors duration-300" 
                  placeholder="Votre nom"
                  required
                >
              </div>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="form.email" 
                  class="w-full px-4 py-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white transition-colors duration-300" 
                  placeholder="votre@email.com"
                  required
                >
              </div>
            </div>
            
            <div class="mb-6">
              <label for="subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de message</label>
              <select 
                id="subject" 
                v-model="form.subject" 
                class="w-full px-4 py-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white transition-colors duration-300"
                required
              >
                <option value="">Sélectionnez un type</option>
                <option value="devis">Demande de devis</option>
                <option value="information">Demande d'information</option>
                <option value="partnership">Proposition de partenariat</option>
                <option value="other">Autre</option>
              </select>
            </div>
            
            <div class="mb-6">
              <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea 
                id="message" 
                v-model="form.message" 
                rows="5" 
                class="w-full px-4 py-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white transition-colors duration-300" 
                placeholder="Décrivez votre projet ou votre question..."
                required
              ></textarea>
            </div>
            
            <div class="mb-6">
              <label class="flex items-start">
                <input 
                  type="checkbox" 
                  v-model="form.privacy" 
                  class="mt-1 mr-2 h-4 w-4 text-purple-600 dark:text-purple-500 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                  required
                >
                <span class="text-sm text-gray-600 dark:text-gray-300">
                  J'accepte que mes données soient traitées conformément à la 
                  <router-link to="/politique-confidentialite" class="text-purple-600 dark:text-purple-400 hover:underline">
                    politique de confidentialité
                  </router-link> 
                  de Jeroka.
                </span>
              </label>
            </div>
            
            <div>
              <button 
                type="submit" 
                class="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 text-white py-3 px-6 rounded-md transition-colors duration-300 font-medium"
              >
                Envoyer le message
              </button>
            </div>
          </form>
          
          <!-- Ajout du lien vers la politique de confidentialité -->
          <div class="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Vos informations sont traitées de manière sécurisée. En soumettant ce formulaire, vous acceptez notre 
            <router-link to="/politique-confidentialite" class="text-purple-600 dark:text-purple-400 hover:underline">
              politique de confidentialité
            </router-link>.
          </div>
        </div>
        
        <div class="md:w-1/3">
          <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 mb-8">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Coordonnées</h3>
            
            <div class="space-y-6">
              <div class="flex items-start">
                <div class="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-md flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white mb-1">Adresse</h4>
                  <p class="text-gray-600 dark:text-gray-300">13 rue des Fauvettes<br>59470 Wormhout</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="bg-green-100 dark:bg-green-900/30 w-10 h-10 rounded-md flex items-center justify-center text-green-600 dark:text-green-400 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white mb-1">Téléphone</h4>
                  <p class="text-gray-600 dark:text-gray-300">+33 6 19 57 69 47</p>
                </div>
              </div>
              
              <div class="flex items-start">
                <div class="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-md flex items-center justify-center text-purple-600 dark:text-purple-400 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-white mb-1">Email</h4>
                  <p class="text-gray-600 dark:text-gray-300">contact@jeroka.fr</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Suivez-nous</h3>
            
            <div class="flex items-center space-x-4">
              <a href="https://facebook.com/entreprisexyz" target="_blank" rel="noopener noreferrer" class="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 p-3 rounded-md text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a href="https://linkedin.com/company/entreprisexyz" target="_blank" rel="noopener noreferrer" class="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 p-3 rounded-md text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                </svg>
              </a>
              <a href="https://instagram.com/entreprisexyz" target="_blank" rel="noopener noreferrer" class="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 p-3 rounded-md text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, reactive, inject, ref } from 'vue'

export default defineComponent({
  name: 'ContactPart',
  setup() {
    const darkMode = inject('darkMode', ref(false))
    
    const form = reactive({
      name: '',
      email: '',
      subject: '',
      message: '',
      privacy: false
    })
    
    const submitForm = () => {
      // Here you would typically handle the form submission,
      // like sending data to a backend API or service
      console.log('Form submitted:', form)
      
      // Reset form after submission
      form.name = ''
      form.email = ''
      form.subject = ''
      form.message = ''
      form.privacy = false
      
      // Show success message (in a real app you might use a toast notification)
      alert('Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.')
    }
    
    return {
      darkMode,
      form,
      submitForm
    }
  }
})
</script>