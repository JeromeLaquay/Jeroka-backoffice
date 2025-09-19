// backoffice/src/services/admin.ts
import { apiService } from './api';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'user';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  company_name?: string;
}

export interface AdminCompany {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  siret?: string;
  vat_number?: number;
  tax_regime?: string;
  banking_info?: any;
  invoice_settings?: any;
  quote_settings?: any;
  email_settings?: any;
  theme?: string;
  is_active: boolean;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled';
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

export interface AdminStats {
  total_companies: number;
  active_companies: number;
  total_users: number;
  active_users: number;
  new_companies_this_month: number;
  new_users_this_month: number;
  subscription_stats: {
    free: number;
    basic: number;
    premium: number;
    enterprise: number;
  };
}

export interface CreateCompanyData {
  name: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: number;
  siret?: string;
  tax_regime?: string;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
}

export interface UpdateCompanyData {
  name?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  vat_number?: number;
  siret?: string;
  tax_regime?: string;
  is_active?: boolean;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled';
  subscription_expires_at?: string;
}

export interface CreateUserData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role: 'admin' | 'user';
  company_id: string;
  telephone?: string;
}

export interface UpdateUserData {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: 'admin' | 'user';
  is_active?: boolean;
  telephone?: string;
}

export interface AdminFilters {
  search?: string;
  status?: 'active' | 'inactive';
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled';
  created_from?: string;
  created_to?: string;
  page?: number;
  limit?: number;
  sort_by?: 'name' | 'created_at' | 'subscription_plan';
  sort_order?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class AdminService {
  // Statistiques
  async getStats(): Promise<ApiResponse<AdminStats>> {
    const response = await apiService.axiosInstance.get<ApiResponse<AdminStats>>('/admin/stats');
    return response.data;
  }

  // Gestion des entreprises
  async getCompanies(filters?: AdminFilters): Promise<ApiResponse<AdminCompany[]>> {
    const response = await apiService.axiosInstance.get<ApiResponse<AdminCompany[]>>('/admin/companies', {
      params: filters
    });
    return response.data;
  }

  async getCompany(id: string): Promise<ApiResponse<AdminCompany>> {
    const response = await apiService.axiosInstance.get<ApiResponse<AdminCompany>>(`/admin/companies/${id}`);
    return response.data;
  }

  async createCompany(data: CreateCompanyData): Promise<ApiResponse<AdminCompany>> {
    const response = await apiService.axiosInstance.post<ApiResponse<AdminCompany>>('/admin/companies', data);
    return response.data;
  }

  async updateCompany(id: string, data: UpdateCompanyData): Promise<ApiResponse<AdminCompany>> {
    const response = await apiService.axiosInstance.put<ApiResponse<AdminCompany>>(`/admin/companies/${id}`, data);
    return response.data;
  }

  async deleteCompany(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.axiosInstance.delete<ApiResponse<void>>(`/admin/companies/${id}`);
    return response.data;
  }

  async toggleCompanyStatus(id: string): Promise<ApiResponse<AdminCompany>> {
    const response = await apiService.axiosInstance.patch<ApiResponse<AdminCompany>>(`/admin/companies/${id}/toggle-status`);
    return response.data;
  }

  // Gestion des utilisateurs
  async getUsers(filters?: AdminFilters): Promise<ApiResponse<AdminUser[]>> {
    const response = await apiService.axiosInstance.get<ApiResponse<AdminUser[]>>('/admin/users', {
      params: filters
    });
    return response.data;
  }

  async getUser(id: string): Promise<ApiResponse<AdminUser>> {
    const response = await apiService.axiosInstance.get<ApiResponse<AdminUser>>(`/admin/users/${id}`);
    return response.data;
  }

  async createUser(data: CreateUserData): Promise<ApiResponse<AdminUser>> {
    const response = await apiService.axiosInstance.post<ApiResponse<AdminUser>>('/admin/users', data);
    return response.data;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<ApiResponse<AdminUser>> {
    const response = await apiService.axiosInstance.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    const response = await apiService.axiosInstance.delete<ApiResponse<void>>(`/admin/users/${id}`);
    return response.data;
  }

  async toggleUserStatus(id: string): Promise<ApiResponse<AdminUser>> {
    const response = await apiService.axiosInstance.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/toggle-status`);
    return response.data;
  }

  // Gestion des utilisateurs d'une entreprise
  async getCompanyUsers(companyId: string, filters?: AdminFilters): Promise<ApiResponse<AdminUser[]>> {
    const response = await apiService.axiosInstance.get<ApiResponse<AdminUser[]>>(`/admin/companies/${companyId}/users`, {
      params: filters
    });
    return response.data;
  }
}

export const adminService = new AdminService();
export default adminService;
