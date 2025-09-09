import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Initialize dark mode from localStorage or system preference
const initDarkMode = () => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme')
  
  if (savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Call the function immediately
initDarkMode()

createApp(App)
  .use(router)
  .mount('#app') 