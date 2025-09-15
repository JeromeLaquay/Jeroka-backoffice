// api-dashboard/src/types/admin.ts

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'super_admin' | 'admin' | 'user';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
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
  vat_number?: string;
  siret_number?: string;
  vat_rate?: number;
  tax_regime?: string;
  banking_info?: any;
  invoice_settings?: any;
  quote_settings?: any;
  email_settings?: any;
  theme?: string;
  is_active: boolean;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled';
  subscription_expires_at?: Date;
  created_at: Date;
  updated_at: Date;
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
  vat_number?: string;
  siret_number?: string;
  vat_rate?: number;
  tax_regime?: string;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  admin_user: {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
  };
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
  vat_number?: string;
  siret_number?: string;
  vat_rate?: number;
  tax_regime?: string;
  is_active?: boolean;
  subscription_plan?: 'free' | 'basic' | 'premium' | 'enterprise';
  subscription_status?: 'active' | 'suspended' | 'cancelled';
  subscription_expires_at?: Date;
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
