import apiClient from './client.js'

export const authApi = {
  // Connexion utilisateur
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  // Inscription utilisateur
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  // Déconnexion
  logout: async () => {
    const response = await apiClient.post('/auth/logout')
    return response.data
  },

  // Vérifier le token
  verifyToken: async () => {
    const response = await apiClient.get('/auth/verify')
    return response.data
  },

  // Récupérer le profil utilisateur
  getProfile: async () => {
    const response = await apiClient.get('/auth/profile')
    return response.data
  },

  // Mettre à jour le profil
  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile', userData)
    return response.data
  },

  // Demander une réinitialisation de mot de passe
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email })
    return response.data
  },

  // Réinitialiser le mot de passe
  resetPassword: async (token, newPassword) => {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      password: newPassword
    })
    return response.data
  }
}
