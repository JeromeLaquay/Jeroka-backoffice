import { apiService, ApiResponse } from './api'

export interface Product {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  featured: boolean
  createdAt: string
}

export interface ProductCategory {
  id: number
  name: string
  productCount: number
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  stock: number
  category: string
  featured?: boolean
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: number
  stock?: number
  category?: string
  featured?: boolean
}

export interface ProductStats {
  total: number
  featured: number
  lowStock: number
  totalValue: number
  categories: number
  averagePrice: number
}

export interface ProductsListResponse {
  products: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class ProductService {
  /**
   * Récupère la liste des produits avec pagination et filtres
   */
  async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    type?: 'featured' | 'low-stock'
  }): Promise<ApiResponse<ProductsListResponse>> {
    return await apiService.getProducts(params)
  }

  /**
   * Récupère un produit par son ID
   */
  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return await apiService.getProduct(id)
  }

  /**
   * Crée un nouveau produit
   */
  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    return await apiService.createProduct(data)
  }

  /**
   * Met à jour un produit
   */
  async updateProduct(id: string, data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    return await apiService.updateProduct(id, data)
  }

  /**
   * Supprime un produit
   */
  async deleteProduct(id: string): Promise<ApiResponse> {
    return await apiService.deleteProduct(id)
  }

  /**
   * Met à jour le stock d'un produit
   */
  async updateProductStock(
    id: string, 
    stock: number, 
    operation: 'add' | 'subtract' | 'set'
  ): Promise<ApiResponse<{ id: number; stock: number }>> {
    return await apiService.updateProductStock(id, stock, operation)
  }

  /**
   * Récupère les catégories de produits
   */
  async getProductCategories(): Promise<ApiResponse<ProductCategory[]>> {
    return await apiService.getProductCategories()
  }

  /**
   * Récupère les statistiques des produits
   */
  async getProductStats(): Promise<ApiResponse<ProductStats>> {
    return await apiService.getProductStats()
  }

  /**
   * Recherche des produits
   */
  async searchProducts(query: string): Promise<ApiResponse<ProductsListResponse>> {
    return await this.getProducts({ search: query, limit: 20 })
  }

  /**
   * Récupère les produits par catégorie
   */
  async getProductsByCategory(category: string): Promise<ApiResponse<ProductsListResponse>> {
    return await this.getProducts({ category, limit: 100 })
  }

  /**
   * Récupère les produits en vedette
   */
  async getFeaturedProducts(): Promise<ApiResponse<ProductsListResponse>> {
    return await this.getProducts({ type: 'featured', limit: 100 })
  }

  /**
   * Récupère les produits en rupture de stock
   */
  async getLowStockProducts(): Promise<ApiResponse<ProductsListResponse>> {
    return await this.getProducts({ type: 'low-stock', limit: 100 })
  }

  /**
   * Ajoute du stock à un produit
   */
  async addStock(id: string, quantity: number): Promise<ApiResponse<{ id: number; stock: number }>> {
    return await this.updateProductStock(id, quantity, 'add')
  }

  /**
   * Retire du stock d'un produit
   */
  async removeStock(id: string, quantity: number): Promise<ApiResponse<{ id: number; stock: number }>> {
    return await this.updateProductStock(id, quantity, 'subtract')
  }

  /**
   * Définit le stock d'un produit
   */
  async setStock(id: string, quantity: number): Promise<ApiResponse<{ id: number; stock: number }>> {
    return await this.updateProductStock(id, quantity, 'set')
  }
}

export const productService = new ProductService()
export default productService