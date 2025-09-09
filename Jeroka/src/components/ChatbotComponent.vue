<template>
    <div class="fixed bottom-6 right-6 z-50">
      <div v-if="chatOpen" class="bg-white dark:bg-gray-800 rounded-product shadow-xl w-80 md:w-96 overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
        <div class="bg-purple-600 dark:bg-purple-700 text-white p-4 flex justify-between items-center">
          <div class="flex items-center">
            <div class="bg-white rounded-full p-1 mr-3">
              <span class="text-purple-600 dark:text-purple-700 font-bold text-lg">J</span>
            </div>
            <h3 class="font-medium">Support Jeroka</h3>
          </div>
          <button @click="closeChatbot" class="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="h-72 overflow-y-auto p-4 bg-purple-50 dark:bg-gray-900">
          <div class="space-y-4">
            <div class="flex items-start">
              <div class="flex-shrink-0 bg-purple-600 dark:bg-purple-700 rounded-full p-2 text-white mr-3">
                <span class="font-bold text-sm">J</span>
              </div>
              <div class="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm max-w-[80%]">
                <p class="text-gray-900 dark:text-white">Bonjour ! Comment puis-je vous aider aujourd'hui ?</p>
                <span class="text-gray-500 dark:text-gray-400 text-xs mt-1 block">14:25</span>
              </div>
            </div>
            
            <div v-for="(message, index) in messages" :key="index" class="flex items-start" :class="{'justify-end': message.sender === 'user'}">
              <template v-if="message.sender === 'bot'">
                <div class="flex-shrink-0 bg-purple-600 dark:bg-purple-700 rounded-full p-2 text-white mr-3">
                  <span class="font-bold text-sm">J</span>
                </div>
                <div class="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm max-w-[80%]">
                  <p class="text-gray-900 dark:text-white">{{ message.text }}</p>
                  <span class="text-gray-500 dark:text-gray-400 text-xs mt-1 block">{{ message.time }}</span>
                </div>
              </template>
              
              <template v-else>
                <div class="bg-purple-600 dark:bg-purple-700 p-3 rounded-2xl shadow-sm max-w-[80%] text-white ml-auto">
                  <p>{{ message.text }}</p>
                  <span class="text-white text-opacity-70 text-xs mt-1 block">{{ message.time }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>
        
        <div class="p-4 border-t border-gray-200 dark:border-gray-700">
          <form @submit.prevent="sendMessage" class="flex">
            <input 
              type="text" 
              v-model="userMessage" 
              placeholder="Écrivez votre message..." 
              class="flex-grow px-4 py-2 rounded-full bg-purple-50 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
            >
            <button 
              type="submit" 
              class="bg-purple-600 dark:bg-purple-700 text-white ml-2 p-2 rounded-full hover:bg-opacity-90 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      <button 
        v-if="!chatOpen" 
        @click="openChatbot"
        class="bg-purple-600 hover:bg-opacity-90 dark:bg-purple-700 dark:hover:bg-opacity-90 text-white p-4 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, reactive, inject } from 'vue'
  
  export default defineComponent({
    name: 'ChatbotComponent',
    setup() {
      const chatOpen = ref(false)
      const userMessage = ref('')
      const messages = reactive<Array<{sender: string, text: string, time: string}>>([])
      const darkMode = inject('darkMode', ref(false))
      
      const openChatbot = () => {
        chatOpen.value = true
      }
      
      const closeChatbot = () => {
        chatOpen.value = false
      }
      
      const formatTime = () => {
        const now = new Date()
        return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
      }
      
      const sendMessage = () => {
        if (userMessage.value.trim() === '') return
        
        const time = formatTime()
        
        // Add user message
        messages.push({
          sender: 'user',
          text: userMessage.value,
          time
        })
        
        // Simulate bot response
        setTimeout(() => {
          const responses = [
            "Merci pour votre message ! Un membre de notre équipe vous contactera bientôt.",
            "Je comprends votre demande. Comment puis-je vous aider davantage ?",
            "N'hésitez pas à consulter nos services pour plus d'informations.",
            "Voulez-vous demander un devis personnalisé ?",
            "Nous sommes spécialisés dans la création de sites web et l'automatisation des processus.",
          ]
          
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]
          
          messages.push({
            sender: 'bot',
            text: randomResponse,
            time: formatTime()
          })
        }, 1000)
        
        // Clear input
        userMessage.value = ''
      }
      
      return {
        chatOpen,
        userMessage,
        messages,
        darkMode,
        openChatbot,
        closeChatbot,
        sendMessage
      }
    }
  })
  </script>