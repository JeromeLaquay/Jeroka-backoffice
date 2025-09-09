import axios, { AxiosInstance, AxiosResponse } from 'axios'

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api/v1'

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
      timeout: 10000,
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
          // Token expiré ou invalide
          try {
            // Tenter de rafraîchir le token
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

  // ===== PRODUITS =====

  async getProducts(params?: any): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/products', { params })
    return response.data
  }

  // ===== FACTURES =====

  async getInvoices(params?: any): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/invoices', { params })
    return response.data
  }

  // ===== DEVIS =====

  async getQuotes(params?: any): Promise<ApiResponse<any[]>> {
    const response = await this.api.get<ApiResponse<any[]>>('/quotes', { params })
    return response.data
  }

  // ===== HEALTH CHECK =====

  async healthCheck(): Promise<any> {
    const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`)
    return response.data
  }
}

// Instance singleton
export const apiService = new ApiService()
export default apiService
