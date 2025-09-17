import { apiService } from './api'

export interface Supplier {
  id: string
  name: string
  contact_name?: string
  email?: string
  phone?: string
  mobile?: string
  website?: string
  address_line1?: string
  address_line2?: string
  city?: string
  postal_code?: string
  country?: string
  siret?: string
  vat_number?: string
  notes?: string
  status: 'active' | 'inactive'
  tags?: string[]
  created_at: string
  updated_at: string
  company_id: string
}

export interface CreateSupplierRequest {
  name: string
  contactName?: string
  email?: string
  phone?: string
  mobile?: string
  website?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    postalCode?: string
    country?: string
  }
  siret?: string
  vatNumber?: string
  notes?: string
  status?: 'active' | 'inactive'
  tags?: string[]
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

export interface SuppliersListParams {
  page?: number
  limit?: number
  search?: string
  status?: 'active' | 'inactive'
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface SupplierStats {
  total: number
  active: number
  inactive: number
}

class SuppliersService {
  async getSuppliers(params: SuppliersListParams = {}) {
    const response = await apiService.axiosInstance.get('/suppliers', { params })
    return response.data
  }

  async getSupplier(id: string) {
    const response = await apiService.axiosInstance.get(`/suppliers/${id}`)
    return response.data
  }

  async createSupplier(data: CreateSupplierRequest) {
    const response = await apiService.axiosInstance.post('/suppliers', data)
    return response.data
  }

  async updateSupplier(id: string, data: UpdateSupplierRequest) {
    const response = await apiService.axiosInstance.put(`/suppliers/${id}`, data)
    return response.data
  }

  async deleteSupplier(id: string) {
    const response = await apiService.axiosInstance.delete(`/suppliers/${id}`)
    return response.data
  }

  async getSupplierStats() {
    const response = await apiService.axiosInstance.get('/suppliers/stats')
    return response.data as SupplierStats
  }
}

export const suppliersService = new SuppliersService()
export default suppliersService


