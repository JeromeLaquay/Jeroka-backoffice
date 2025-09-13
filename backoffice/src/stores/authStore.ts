import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type User, type LoginRequest, type RegisterRequest } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'admin')

  // Actions
  const login = async (credentials: LoginRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.login(credentials)
      
      if (response.success && response.data) {
        token.value = response.data.accessToken
        user.value = {
          ...response.data.user,
          isActive: true,
          emailVerified: false,
          createdAt: new Date().toISOString()
        }
        
        // Sauvegarder dans localStorage
        localStorage.setItem('auth_token', response.data.accessToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        return response
      } else {
        throw new Error(response.message || 'Erreur lors de la connexion')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterRequest) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.register(userData)
      
      if (response.success && response.data) {
        token.value = response.data.accessToken
        user.value = {
          ...response.data.user,
          isActive: true,
          emailVerified: false,
          createdAt: new Date().toISOString()
        }
        
        // Sauvegarder dans localStorage
        localStorage.setItem('auth_token', response.data.accessToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        return response
      } else {
        throw new Error(response.message || 'Erreur lors de l\'inscription')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      loading.value = true
      
      // Appeler l'API de déconnexion
      await apiService.logout()
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    } finally {
      // Nettoyer l'état local dans tous les cas
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      loading.value = false
    }
  }

  const refreshToken = async () => {
    try {
      const response = await apiService.refreshToken()
      
      if (response.success && response.data) {
        token.value = response.data.accessToken
        localStorage.setItem('auth_token', response.data.accessToken)
        return response
      } else {
        throw new Error('Impossible de rafraîchir le token')
      }
    } catch (err) {
      // Si le refresh échoue, déconnecter l'utilisateur
      await logout()
      throw err
    }
  }

  const getProfile = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.getProfile()
      
      if (response.success && response.data) {
        user.value = {
          ...response.data.user,
          isActive: true,
          emailVerified: false,
          createdAt: new Date().toISOString()
        }
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response
      } else {
        throw new Error(response.message || 'Erreur lors de la récupération du profil')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.updateProfile(data)
      
      if (response.success && response.data) {
        user.value = {
          ...response.data.user,
          isActive: true,
          emailVerified: false,
          createdAt: new Date().toISOString()
        }
        localStorage.setItem('user', JSON.stringify(response.data.user))
        return response
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour du profil')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await apiService.changePassword(data)
      
      if (response.success) {
        return response
      } else {
        throw new Error(response.message || 'Erreur lors du changement de mot de passe')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      throw err
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = () => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (err) {
        console.error('Erreur lors de la récupération des données d\'authentification:', err)
        // Nettoyer les données corrompues
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    isAdmin,
    isManager,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    initializeAuth,
    clearError
  }
})
