import { defineStore } from 'pinia'
import { authApi } from '@/api/auth.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && !!state.token,
    userInfo: (state) => state.user,
    isLoading: (state) => state.loading
  },

  actions: {
    // Initialiser l'état depuis le localStorage
    initAuth() {
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
      }
    },

    // Connexion
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authApi.login(credentials)
        
        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur de connexion'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Inscription
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authApi.register(userData)
        
        this.token = response.token
        this.user = response.user
        this.isAuthenticated = true
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('auth_token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur d\'inscription'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Déconnexion
    async logout() {
      try {
        await authApi.logout()
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error)
      } finally {
        this.clearAuth()
      }
    },

    // Vider l'état d'authentification
    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.error = null
      
      // Supprimer du localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    },

    // Mettre à jour le profil
    async updateProfile(userData) {
      this.loading = true
      this.error = null
      
      try {
        const response = await authApi.updateProfile(userData)
        this.user = response.user
        
        // Mettre à jour le localStorage
        localStorage.setItem('user', JSON.stringify(response.user))
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur de mise à jour'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Vérifier le token
    async verifyToken() {
      if (!this.token) return false
      
      try {
        const response = await authApi.verifyToken()
        return response.valid
      } catch (error) {
        this.clearAuth()
        return false
      }
    }
  }
})
