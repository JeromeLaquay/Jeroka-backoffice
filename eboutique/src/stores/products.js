import { defineStore } from 'pinia'
import { productsApi } from '@/api/products.js'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    featuredProducts: [],
    popularProducts: [],
    currentProduct: null,
    loading: false,
    error: null,
    filters: {
      category: null,
      minPrice: null,
      maxPrice: null,
      search: '',
      sort: 'name'
    },
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    }
  }),

  getters: {
    filteredProducts: (state) => {
      let filtered = [...state.products]
      
      // Filtre par catégorie
      if (state.filters.category) {
        filtered = filtered.filter(product => product.category === state.filters.category)
      }
      
      // Filtre par prix
      if (state.filters.minPrice) {
        filtered = filtered.filter(product => product.price >= state.filters.minPrice)
      }
      if (state.filters.maxPrice) {
        filtered = filtered.filter(product => product.price <= state.filters.maxPrice)
      }
      
      // Filtre par recherche
      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search)
        )
      }
      
      // Tri
      switch (state.filters.sort) {
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'name':
        default:
          filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
      }
      
      return filtered
    }
  },

  actions: {
    // Récupérer tous les produits
    async fetchProducts(params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const response = await productsApi.getProducts({
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...params
        })
        
        this.products = response.products || response.data || []
        this.pagination = {
          page: response.page || 1,
          limit: response.limit || 12,
          total: response.total || 0,
          totalPages: response.totalPages || 0
        }
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des produits'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Récupérer un produit par son ID
    async fetchProduct(id) {
      this.loading = true
      this.error = null
      
      try {
        const response = await productsApi.getProduct(id)
        this.currentProduct = response.product || response.data
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement du produit'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Rechercher des produits
    async searchProducts(query, params = {}) {
      this.loading = true
      this.error = null
      
      try {
        const response = await productsApi.searchProducts(query, params)
        this.products = response.products || response.data || []
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors de la recherche'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Récupérer les catégories
    async fetchCategories() {
      try {
        const response = await productsApi.getCategories()
        this.categories = response.categories || response.data || []
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des catégories'
        throw error
      }
    },

    // Récupérer les produits populaires
    async fetchPopularProducts(limit = 8) {
      try {
        const response = await productsApi.getPopularProducts(limit)
        this.popularProducts = response.products || response.data || []
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des produits populaires'
        throw error
      }
    },

    // Récupérer les produits en vedette
    async fetchFeaturedProducts(limit = 8) {
      try {
        const response = await productsApi.getFeaturedProducts(limit)
        this.featuredProducts = response.products || response.data || []
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Erreur lors du chargement des produits en vedette'
        throw error
      }
    },

    // Mettre à jour les filtres
    updateFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters }
      this.pagination.page = 1 // Reset à la première page
    },

    // Mettre à jour la pagination
    updatePagination(newPagination) {
      this.pagination = { ...this.pagination, ...newPagination }
    },

    // Réinitialiser les filtres
    resetFilters() {
      this.filters = {
        category: null,
        minPrice: null,
        maxPrice: null,
        search: '',
        sort: 'name'
      }
      this.pagination.page = 1
    }
  }
})
