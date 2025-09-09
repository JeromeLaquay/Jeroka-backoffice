import apiClient from './client.js'

export const productsApi = {
  // Récupérer tous les produits avec pagination et filtres
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params })
    return response.data
  },

  // Récupérer un produit par son ID
  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  // Rechercher des produits
  searchProducts: async (query, params = {}) => {
    const response = await apiClient.get('/products/search', {
      params: { q: query, ...params }
    })
    return response.data
  },

  // Récupérer les catégories de produits
  getCategories: async () => {
    const response = await apiClient.get('/products/categories')
    return response.data
  },

  // Récupérer les produits populaires
  getPopularProducts: async (limit = 8) => {
    const response = await apiClient.get('/products/popular', {
      params: { limit }
    })
    return response.data
  },

  // Récupérer les produits en promotion
  getFeaturedProducts: async (limit = 8) => {
    const response = await apiClient.get('/products/featured', {
      params: { limit }
    })
    return response.data
  }
}
