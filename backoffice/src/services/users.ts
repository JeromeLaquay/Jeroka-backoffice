import { apiService, ApiResponse } from './api'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  avatar_url?: string
  role: string
  isActive: boolean
  emailVerified: boolean
  lastLogin?: string
  createdAt: string
}

export interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: string
}

export interface UpdateUserRequest {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  role?: string
  isActive?: boolean
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  admins: number
  users: number
  newThisMonth: number
}

export interface UsersListResponse {
  users: User[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class UserService {
  /**
   * Récupère la liste des utilisateurs avec pagination et filtres
   */
  async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
    role?: string
    status?: string
  }): Promise<ApiResponse<UsersListResponse>> {
    return await apiService.getUsers(params)
  }

  /**
   * Récupère un utilisateur par son ID
   */
  async getUser(id: string): Promise<ApiResponse<{ user: User }>> {
    return await apiService.getUser(id)
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(data: CreateUserRequest): Promise<ApiResponse<{ user: User }>> {
    return await apiService.createUser(data)
  }

  /**
   * Met à jour un utilisateur
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<ApiResponse<{ user: User }>> {
    return await apiService.updateUser(id, data)
  }

  /**
   * Supprime un utilisateur
   */
  async deleteUser(id: string): Promise<ApiResponse> {
    return await apiService.deleteUser(id)
  }

  /**
   * Active/désactive un utilisateur
   */
  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<{ user: User }>> {
    return await apiService.updateUserStatus(id, isActive)
  }

  /**
   * Récupère les statistiques des utilisateurs
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return await apiService.getUserStats()
  }

  /**
   * Recherche des utilisateurs
   */
  async searchUsers(query: string): Promise<ApiResponse<UsersListResponse>> {
    return await this.getUsers({ search: query, limit: 20 })
  }

  /**
   * Filtre les utilisateurs par rôle
   */
  async getUsersByRole(role: string): Promise<ApiResponse<UsersListResponse>> {
    return await this.getUsers({ role, limit: 100 })
  }

  /**
   * Filtre les utilisateurs par statut
   */
  async getUsersByStatus(isActive: boolean): Promise<ApiResponse<UsersListResponse>> {
    return await this.getUsers({ status: isActive ? 'active' : 'inactive', limit: 100 })
  }
}

export const userService = new UserService()
export default userService
