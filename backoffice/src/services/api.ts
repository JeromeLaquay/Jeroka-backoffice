import axios, { AxiosInstance, AxiosResponse } from 'axios'

// Configuration de base de l'API
// En développement, utilisez localhost pour éviter les problèmes de certificat SSL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 
  ((import.meta as any).env?.DEV ? 'http://localhost:3002/api/v1' : 'https://apibackoffice.jerokaxperience.fr/api/v1')

// URLs disponibles pour basculer entre les environnements
export const API_URLS = {
  LOCAL: 'http://localhost:3002/api/v1',
  PRODUCTION: 'https://apibackoffice.jerokaxperience.fr/api/v1'
} as const

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: {
    message: string
    code: string
    statusCode: number
  }
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
  accessToken: string
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  role: string
  isActive: boolean
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 300000, // 5 minutes pour les appels IA
      withCredentials: true, // Pour les cookies
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Intercepteur de requête - ajouter le token d'auth
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Intercepteur de réponse - gérer les erreurs
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        return response
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Éviter la boucle infinie
          if (error.config?.url?.includes('/auth/refresh')) {
            // Si c'est déjà une requête de refresh qui échoue, déconnecter
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
            return Promise.reject(error)
          }
          
          // Tenter de rafraîchir le token seulement si ce n'est pas déjà une requête de refresh
          try {
            await this.refreshToken()
            // Retry la requête originale
            return this.api.request(error.config)
          } catch (refreshError) {
            // Échec du refresh - déconnecter l'utilisateur
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
        }

        // Standardiser les erreurs
        const apiError = {
          message: error.response?.data?.error?.message || error.message || 'Erreur inconnue',
          code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
          statusCode: error.response?.status || 500
        }

        return Promise.reject(apiError)
      }
    )
  }

  // ===== MÉTHODES GÉNÉRIQUES =====

  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.api.get<ApiResponse<T>>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.api.post<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    const response = await this.api.put<ApiResponse<T>>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.api.delete<ApiResponse<T>>(url, config)
    return response.data
  }

  // ===== AUTHENTIFICATION =====

  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.api.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    return response.data
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.api.post<ApiResponse<LoginResponse>>('/auth/register', userData)
    return response.data
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>('/auth/logout')
    return response.data
  }

  async refreshToken(): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await this.api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh')
    return response.data
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get<ApiResponse<{ user: User }>>('/auth/profile')
    return response.data
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.put<ApiResponse<{ user: User }>>('/auth/profile', data)
    return response.data
  }

  async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<ApiResponse> {
    const response = await this.api.put<ApiResponse>('/auth/change-password', data)
    return response.data
  }

  // ===== DASHBOARD =====

  async getDashboardStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/dashboard/stats')
    return response.data
  }

  async getRecentActivity(): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/dashboard/recent-activity')
    return response.data
  }

  // ===== MESSAGES =====

  async getMessages(params?: any): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/messages', { params })
    return response.data
  }

  async createMessage(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>('/messages', data)
    return response.data
  }

  async updateMessageStatus(id: string, status: string): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/messages/${id}/status`, { status })
    return response.data
  }

  async deleteMessage(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/messages/${id}`)
    return response.data
  }

  // ===== CLIENTS =====

  async getClients(params?: any): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/clients', { params })
    return response.data
  }

  async createClient(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>('/clients', data)
    return response.data
  }

  async updateClient(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/clients/${id}`, data)
    return response.data
  }

  async deleteClient(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/clients/${id}`)
    return response.data
  }

  // ===== PUBLICATIONS =====

  async getPublications(params?: any): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/publications', { params })
    return response.data
  }

  async createPublication(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>('/publications', data)
    return response.data
  }

  async updatePublication(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/publications/${id}`, data)
    return response.data
  }

  async deletePublication(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/publications/${id}`)
    return response.data
  }

  async publishPublication(id: string): Promise<ApiResponse> {
    const response = await this.api.post<ApiResponse>(`/publications/${id}/publish`)
    return response.data
  }

  // Méthode pour accéder à l'instance axios (utilisée par le service publications)
  get axiosInstance() {
    return this.api
  }

  // ===== UTILISATEURS =====

  async getUsers(params?: any): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/users', { params })
    return response.data
  }

  async getUser(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>(`/users/${id}`)
    return response.data
  }

  async createUser(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>('/users', data)
    return response.data
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/users/${id}`)
    return response.data
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/users/${id}/status`, { isActive })
    return response.data
  }

  async getUserStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/users/stats')
    return response.data
  }

  // ===== PRODUITS =====

  async getProducts(params?: any): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/products', { params })
    return response.data
  }

  async getProduct(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>(`/products/${id}`)
    return response.data
  }

  async createProduct(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>('/products', data)
    return response.data
  }

  async updateProduct(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/products/${id}`, data)
    return response.data
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/products/${id}`)
    return response.data
  }

  async updateProductStock(id: string, stock: number, operation: 'add' | 'subtract' | 'set'): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/products/${id}/stock`, { stock, operation })
    return response.data
  }

  async getProductCategories(): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/products/categories')
    return response.data
  }

  async getProductStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/products/stats')
    return response.data
  }

  // ===== FACTURES =====

  async getInvoices(params?: any): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/invoices', { params })
    return response.data
  }

  async getInvoice(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>(`/invoices/${id}`)
    return response.data
  }

  async createInvoice(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>('/invoices', data)
    return response.data
  }

  async updateInvoice(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/invoices/${id}`, data)
    return response.data
  }

  async deleteInvoice(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/invoices/${id}`)
    return response.data
  }

  async updateInvoiceStatus(id: string, status: string): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/invoices/${id}/status`, { status })
    return response.data
  }

  async getInvoiceStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/invoices/stats')
    return response.data
  }

  // ===== DEVIS =====

  async getQuotes(params?: any): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/quotes', { params })
    return response.data
  }

  async getQuote(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>(`/quotes/${id}`)
    return response.data
  }

  async createQuote(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>('/quotes', data)
    return response.data
  }

  async updateQuote(id: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/quotes/${id}`, data)
    return response.data
  }

  async deleteQuote(id: string): Promise<ApiResponse> {
    const response = await this.api.delete<ApiResponse>(`/quotes/${id}`)
    return response.data
  }

  async updateQuoteStatus(id: string, status: string): Promise<ApiResponse<any>> {
    const response = await this.api.put<ApiResponse<any>>(`/quotes/${id}/status`, { status })
    return response.data
  }

  async convertQuoteToInvoice(id: string): Promise<ApiResponse<any>> {
    const response = await this.api.post<ApiResponse<any>>(`/quotes/${id}/convert`)
    return response.data
  }

  async getQuoteStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/quotes/stats')
    return response.data
  }

  // ===== HEALTH CHECK =====

  async healthCheck(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`)
    return response.data
  }

  // ===== CONFIGURATION =====

  /**
   * Change l'URL de base de l'API (utile pour basculer entre local et production)
   */
  setBaseURL(newBaseURL: string): void {
    this.api.defaults.baseURL = newBaseURL
  }

  /**
   * Retourne l'URL de base actuelle
   */
  getBaseURL(): string {
    return this.api.defaults.baseURL || API_BASE_URL
  }

  /**
   * Bascule vers l'environnement local
   */
  switchToLocal(): void {
    this.setBaseURL(API_URLS.LOCAL)
  }

  /**
   * Bascule vers l'environnement de production
   */
  switchToProduction(): void {
    this.setBaseURL(API_URLS.PRODUCTION)
  }
}

// Instance singleton
export const apiService = new ApiService()
export default apiService
