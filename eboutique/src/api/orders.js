import apiClient from './client.js'

export const ordersApi = {
  // Créer une nouvelle commande
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData)
    return response.data
  },

  // Récupérer les commandes de l'utilisateur
  getUserOrders: async () => {
    const response = await apiClient.get('/orders')
    return response.data
  },

  // Récupérer une commande par son ID
  getOrder: async (id) => {
    const response = await apiClient.get(`/orders/${id}`)
    return response.data
  },

  // Mettre à jour le statut d'une commande
  updateOrderStatus: async (id, status) => {
    const response = await apiClient.patch(`/orders/${id}/status`, { status })
    return response.data
  },

  // Annuler une commande
  cancelOrder: async (id) => {
    const response = await apiClient.patch(`/orders/${id}/cancel`)
    return response.data
  }
}
