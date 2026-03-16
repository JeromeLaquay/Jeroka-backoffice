import { apiService, type User as ApiUser } from './api'

export type SystemSettings = {
  companySettings: Record<string, any>
  userSettings: Record<string, any>
  systemSettings: {
    version: string
    environment: string
  }
}

/** Données entreprise pour Paramètres > Entreprise (aligné avec le formulaire). */
export type CompanySettings = {
  id?: string
  name?: string
  legalName?: string
  industry?: string
  description?: string
  logo?: string
  website?: string
  email?: string
  phone?: string
  address?: {
    line1?: string
    line2?: string
    city?: string
    postalCode?: string
    country?: string
  }
  taxSettings?: {
    vatNumber?: string
    siretNumber?: string
    vatRate?: number
    taxRegime?: string
  }
}

export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  position?: string
  department?: string
  avatar_url?: string
  isActive: boolean
  emailVerified: boolean
  lastLoginAt?: string
  createdAt: string
}

/** Réponse brute GET /company (API Java). */
interface CompanyApiResponse {
  id?: string
  name?: string
  legalName?: string
  siret?: string
  vatNumber?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postalCode?: string
  country?: string
  phone?: string
  email?: string
  website?: string
  logoUrl?: string
  description?: string
  industry?: string
}

function mapApiToCompanySettings(raw: CompanyApiResponse | null): CompanySettings | null {
  if (!raw) return null
  return {
    id: raw.id,
    name: raw.name,
    legalName: raw.legalName,
    industry: raw.industry,
    description: raw.description,
    logo: raw.logoUrl,
    website: raw.website,
    email: raw.email,
    phone: raw.phone,
    address: {
      line1: raw.addressLine1,
      line2: raw.addressLine2,
      city: raw.city,
      postalCode: raw.postalCode,
      country: raw.country
    },
    taxSettings: {
      vatNumber: raw.vatNumber,
      siretNumber: raw.siret,
      vatRate: 20,
      taxRegime: ''
    }
  }
}

export class SettingsApi {
  async getAll(): Promise<{ success: boolean; data?: SystemSettings }> {
    return apiService.get('/settings')
  }

  async getCompanySettings(): Promise<CompanySettings | null> {
    const data = await apiService.get<CompanyApiResponse | { data?: CompanyApiResponse }>('/company')
    const raw = (data as any)?.data ?? (data as CompanyApiResponse)
    return mapApiToCompanySettings(raw ?? null)
  }

  async updateCompanySettings(payload: CompanySettings): Promise<CompanySettings | null> {
    const body = {
      name: payload.name,
      legalName: payload.legalName,
      siret: payload.taxSettings?.siretNumber,
      vatNumber: payload.taxSettings?.vatNumber,
      addressLine1: payload.address?.line1,
      addressLine2: payload.address?.line2,
      city: payload.address?.city,
      postalCode: payload.address?.postalCode,
      country: payload.address?.country,
      phone: payload.phone,
      email: payload.email,
      website: payload.website,
      description: payload.description,
      industry: payload.industry
    }
    const data = await apiService.put<CompanyApiResponse | { data?: CompanyApiResponse }>('/company', body)
    const raw = (data as any)?.data ?? (data as CompanyApiResponse)
    return mapApiToCompanySettings(raw ?? null)
  }

  async uploadLogo(_file: File): Promise<{ data: { logo: string } }> {
    return Promise.reject(new Error('Upload logo non implémenté'))
  }

  async getUserProfile(): Promise<UserProfile | null> {
    const data = await apiService.getProfile()
    const raw = (data as any)?.data?.user ?? (data as any)?.user ?? (data as ApiUser | null)
    if (!raw) return null
    return {
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      position: '',
      department: '',
      avatar_url: raw.avatar_url,
      isActive: raw.isActive ?? true,
      emailVerified: raw.emailVerified ?? true,
      lastLoginAt: raw.lastLogin,
      createdAt: raw.createdAt ?? new Date().toISOString()
    }
  }

  async updateUserProfile(payload: {
    firstName: string
    lastName: string
    phone?: string
    position?: string
    department?: string
  }): Promise<UserProfile | null> {
    const body = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone
    }
    const data = await apiService.updateProfile(body)
    const raw = (data as any)?.data?.user ?? (data as any)?.user ?? null
    if (!raw) return this.getUserProfile()
    return {
      id: raw.id,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      phone: raw.phone,
      position: payload.position,
      department: payload.department,
      avatar_url: raw.avatar_url,
      isActive: raw.isActive ?? true,
      emailVerified: raw.emailVerified ?? true,
      lastLoginAt: raw.lastLogin,
      createdAt: raw.createdAt ?? new Date().toISOString()
    }
  }
}

// Compat: certains composants importent `settingsService`
export const settingsService = new SettingsApi()
export default settingsService


