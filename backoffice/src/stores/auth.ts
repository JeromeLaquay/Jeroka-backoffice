import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService, type LoginRequest, type RegisterRequest, type User as ApiUser } from '@/services/api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string // Nom complet pour l'affichage
  role: 'admin' | 'user' | 'manager'
  avatar?: string
  phone?: string
  isActive: boolean
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  
  // Convertir l'utilisateur API vers le format du store
  const transformApiUser = (apiUser: ApiUser): User => ({
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    name: `${apiUser.firstName} ${apiUser.lastName}`,
    role: apiUser.role as 'admin' | 'user' | 'manager',
    avatar: apiUser.avatarUrl || `https://ui-avatars.com/api/?name=${apiUser.firstName}+${apiUser.lastName}&background=a855f7&color=fff`,
    phone: apiUser.phone,
    isActive: apiUser.isActive,
    emailVerified: apiUser.emailVerified,
    lastLogin: apiUser.lastLogin,
    createdAt: apiUser.createdAt
  })

  const login = async (email: string, password: string, rememberMe = false) => {
    loading.value = true
    error.value = null

    try {
      const credentials: LoginRequest = { email, password, rememberMe }
      const response = await apiService.login(credentials)

      if (response.success && response.data) {
        const { user: apiUser, accessToken } = response.data
        
        // Transformer et stocker les données utilisateur
        const transformedUser = transformApiUser({
          ...apiUser,
          phone: '',
          avatarUrl: '',
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString()
        })

        user.value = transformedUser
        token.value = accessToken

        // Stocker dans localStorage
        localStorage.setItem('auth_token', accessToken)
        localStorage.setItem('user', JSON.stringify(transformedUser))

        return { success: true }
      } else {
        throw new Error(response.message || 'Erreur de connexion')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur de connexion'
      error.value = errorMessage
      
      return { 
        success: false, 
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData: RegisterRequest) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.register(userData)

      if (response.success && response.data) {
        const { user: apiUser, accessToken } = response.data
        
        // Transformer et stocker les données utilisateur
        const transformedUser = transformApiUser({
          ...apiUser,
          phone: userData.phone || '',
          avatarUrl: '',
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString()
        })

        user.value = transformedUser
        token.value = accessToken

        // Stocker dans localStorage
        localStorage.setItem('auth_token', accessToken)
        localStorage.setItem('user', JSON.stringify(transformedUser))

        return { success: true }
      } else {
        throw new Error(response.message || 'Erreur lors de la création du compte')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la création du compte'
      error.value = errorMessage
      
      return { 
        success: false, 
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true

    try {
      // Appeler l'API pour invalider le token côté serveur
      await apiService.logout()
    } catch (err) {
      console.warn('Erreur lors de la déconnexion côté serveur:', err)
    }

    // Nettoyer le state local
    user.value = null
    token.value = null
    error.value = null
    
    // Nettoyer localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    
    loading.value = false
  }

  const refreshUserProfile = async () => {
    if (!token.value) return

    try {
      const response = await apiService.getProfile()
      
      if (response.success && response.data) {
        const transformedUser = transformApiUser(response.data.user)
        user.value = transformedUser
        localStorage.setItem('user', JSON.stringify(transformedUser))
      }
    } catch (err) {
      console.error('Erreur lors du rafraîchissement du profil:', err)
      // En cas d'erreur 401, la déconnexion sera gérée par l'intercepteur
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user.value) return { success: false, error: 'Utilisateur non connecté' }

    loading.value = true
    error.value = null

    try {
      const response = await apiService.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone
      })

      if (response.success && response.data) {
        const transformedUser = transformApiUser(response.data.user)
        user.value = transformedUser
        localStorage.setItem('user', JSON.stringify(transformedUser))
        
        return { success: true }
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors de la mise à jour'
      error.value = errorMessage
      
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      })

      if (response.success) {
        // Forcer une déconnexion après changement de mot de passe
        await logout()
        return { success: true, message: 'Mot de passe modifié. Veuillez vous reconnecter.' }
      } else {
        throw new Error(response.message || 'Erreur lors du changement de mot de passe')
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur lors du changement de mot de passe'
      error.value = errorMessage
      
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const initializeAuth = async () => {
    loading.value = true
    
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
        
        // Vérifier que le token est toujours valide en récupérant le profil
        await refreshUserProfile()
      } catch (err) {
        console.error('Token invalide lors de l\'initialisation:', err)
        // Nettoyer si le token est invalide
        await logout()
      }
    }
    
    loading.value = false
  }

  // Fonction utilitaire pour vérifier la connexion API
  const checkApiConnection = async () => {
    try {
      await apiService.healthCheck()
      return true
    } catch (err) {
      console.error('API non accessible:', err)
      return false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUserProfile,
    updateProfile,
    changePassword,
    initializeAuth,
    checkApiConnection
  }
})