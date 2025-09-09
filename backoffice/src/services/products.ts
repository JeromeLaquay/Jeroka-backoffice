import { apiService } from './api'

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  category: string
  subcategory?: string
  brand?: string
  unitPrice: number
  costPrice: number
  currency: string
  vatRate: number
  unit: string // unité de mesure (pièce, kg, litre, etc.)
  stock: {
    current: number
    minimum: number
    maximum?: number
    reserved: number
    available: number
  }
  status: 'active' | 'inactive' | 'discontinued'
  dimensions?: {
    weight?: number
    length?: number
    width?: number
    height?: number
  }
  images: string[]
  tags: string[]
  featured: boolean
  isService: boolean // true pour les services, false pour les produits physiques
  supplier?: {
    id: string
    name: string
    reference?: string
  }
  createdAt: string
  updatedAt: string
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  subcategories?: ProductCategory[]
  productsCount: number
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateProductRequest {
  name: string
  description?: string
  sku: string
  barcode?: string
  categoryId: string
  subcategoryId?: string
  brand?: string
  unitPrice: number
  costPrice?: number
  vatRate?: number
  unit: string
  stock?: {
    current?: number
    minimum?: number
    maximum?: number
  }
  status?: string
  dimensions?: {
    weight?: number
    length?: number
    width?: number
    height?: number
  }
  tags?: string[]
  featured?: boolean
  isService?: boolean
  supplierId?: string
  supplierReference?: string
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductsListParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  subcategory?: string
  status?: string
  featured?: boolean
  isService?: boolean
  brand?: string
  lowStock?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProductStats {
  total: number
  active: number
  inactive: number
  lowStock: number
  outOfStock: number
  services: number
  physicalProducts: number
  totalValue: number
  categories: number
}

export interface StockMovement {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment' | 'reserved' | 'released'
  quantity: number
  reason: string
  reference?: string // référence commande/facture/ajustement
  userId: string
  user: {
    id: string
    name: string
  }
  createdAt: string
}

class ProductsService {
  /**
   * Récupérer la liste des produits avec filtres et pagination
   */
  async getProducts(params: ProductsListParams = {}) {
    const response = await apiService.axiosInstance.get('/products', { params })
    return response.data
  }

  /**
   * Récupérer un produit par son ID
   */
  async getProduct(id: string) {
    const response = await apiService.axiosInstance.get(`/products/${id}`)
    return response.data
  }

  /**
   * Créer un nouveau produit
   */
  async createProduct(data: CreateProductRequest) {
    const response = await apiService.axiosInstance.post('/products', data)
    return response.data
  }

  /**
   * Mettre à jour un produit
   */
  async updateProduct(id: string, data: UpdateProductRequest) {
    const response = await apiService.axiosInstance.put(`/products/${id}`, data)
    return response.data
  }

  /**
   * Supprimer un produit
   */
  async deleteProduct(id: string) {
    const response = await apiService.axiosInstance.delete(`/products/${id}`)
    return response.data
  }

  /**
   * Changer le statut d'un produit
   */
  async updateProductStatus(id: string, status: string) {
    const response = await apiService.axiosInstance.patch(`/products/${id}/status`, { status })
    return response.data
  }

  /**
   * Ajuster le stock d'un produit
   */
  async adjustStock(id: string, quantity: number, reason: string) {
    const response = await apiService.axiosInstance.patch(`/products/${id}/stock`, {
      quantity,
      reason
    })
    return response.data
  }

  /**
   * Récupérer l'historique du stock d'un produit
   */
  async getStockHistory(id: string, params?: { page?: number; limit?: number }) {
    const response = await apiService.axiosInstance.get(`/products/${id}/stock/history`, { params })
    return response.data
  }

  /**
   * Dupliquer un produit
   */
  async duplicateProduct(id: string) {
    const response = await apiService.axiosInstance.post(`/products/${id}/duplicate`)
    return response.data
  }

  /**
   * Récupérer les statistiques des produits
   */
  async getProductStats(period?: string) {
    const params = period ? { period } : {}
    const response = await apiService.axiosInstance.get('/products/stats', { params })
    return response.data
  }

  /**
   * Exporter les produits en CSV/Excel
   */
  async exportProducts(params: ProductsListParams & { format: 'csv' | 'excel' }) {
    const response = await apiService.axiosInstance.get('/products/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }

  /**
   * Importer des produits depuis un fichier CSV/Excel
   */
  async importProducts(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiService.axiosInstance.post('/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Générer un nouveau SKU
   */
  async generateSKU(categoryId?: string) {
    const params = categoryId ? { categoryId } : {}
    const response = await apiService.axiosInstance.get('/products/generate-sku', { params })
    return response.data
  }

  /**
   * Rechercher des produits par code-barres
   */
  async searchByBarcode(barcode: string) {
    const response = await apiService.axiosInstance.get(`/products/barcode/${barcode}`)
    return response.data
  }

  /**
   * Récupérer les catégories de produits
   */
  async getCategories() {
    const response = await apiService.axiosInstance.get('/products/categories')
    return response.data
  }

  /**
   * Créer une nouvelle catégorie
   */
  async createCategory(data: {
    name: string
    description?: string
    parentId?: string
    sortOrder?: number
  }) {
    const response = await apiService.axiosInstance.post('/products/categories', data)
    return response.data
  }

  /**
   * Mettre à jour une catégorie
   */
  async updateCategory(id: string, data: {
    name?: string
    description?: string
    parentId?: string
    sortOrder?: number
    isActive?: boolean
  }) {
    const response = await apiService.axiosInstance.put(`/products/categories/${id}`, data)
    return response.data
  }

  /**
   * Supprimer une catégorie
   */
  async deleteCategory(id: string) {
    const response = await apiService.axiosInstance.delete(`/products/categories/${id}`)
    return response.data
  }

  /**
   * Uploader une image de produit
   */
  async uploadProductImage(productId: string, file: File) {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await apiService.axiosInstance.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Supprimer une image de produit
   */
  async deleteProductImage(productId: string, imageId: string) {
    const response = await apiService.axiosInstance.delete(`/products/${productId}/images/${imageId}`)
    return response.data
  }

  /**
   * Récupérer les produits populaires/tendances
   */
  async getTrendingProducts(params?: { period?: string; limit?: number }) {
    const response = await apiService.axiosInstance.get('/products/trending', { params })
    return response.data
  }

  /**
   * Récupérer les produits en rupture de stock
   */
  async getLowStockProducts(params?: { page?: number; limit?: number }) {
    const response = await apiService.axiosInstance.get('/products/low-stock', { params })
    return response.data
  }

  /**
   * Définir un produit comme vedette
   */
  async toggleFeatured(id: string, featured: boolean) {
    const response = await apiService.axiosInstance.patch(`/products/${id}/featured`, { featured })
    return response.data
  }
}

export const productsService = new ProductsService()
export default productsService
